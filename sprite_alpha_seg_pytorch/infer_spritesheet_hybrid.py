"""
Sprite sheet extraction combining chroma key + U-Net for best results.
Handles grid-based sprite sheets with solid background colors.
"""
import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
import torch
# ndimage.label replaced with cv2.connectedComponentsWithStats below

from src.model_unet import UNet


def load_model(checkpoint_path: str, device: torch.device):
    ckpt = torch.load(checkpoint_path, map_location=device)
    base_channels = ckpt.get("base_channels", 32)
    model = UNet(base_channels=base_channels).to(device)
    model.load_state_dict(ckpt["model_state"])
    model.eval()
    return model, ckpt.get("size", 256)


def chroma_key_mask_rgb(image: np.ndarray, bg_color: tuple, threshold: int = 30) -> np.ndarray:
    """RGB-distance chroma key. Best for grid separation — clean boundaries between sprites."""
    diff = np.abs(image.astype(int) - np.array(bg_color, dtype=int))
    is_bg = np.all(diff < threshold, axis=2)
    mask = (~is_bg).astype(np.uint8) * 255
    return mask


def chroma_key_mask(image: np.ndarray, bg_color: tuple, threshold: int = 30) -> np.ndarray:
    """HSV-based chroma key mask. Handles brightness variations of green screen.

    Uses hue + saturation to detect green pixels regardless of brightness.
    Dark green edges (e.g. 20,49,0) share the same hue as bright green (4,249,14),
    so HSV catches them while RGB distance misses them.
    """
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV).astype(np.float32)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

    # Convert bg_color to HSV to get target hue
    bg_bgr = np.uint8([[list(bg_color)[::-1]]])
    target_hue = float(cv2.cvtColor(bg_bgr, cv2.COLOR_BGR2HSV)[0, 0, 0])

    # Hue distance (circular — wrap at 180)
    hue_dist = np.abs(h - target_hue)
    hue_dist = np.minimum(hue_dist, 180.0 - hue_dist)

    # Green key: close hue AND sufficient saturation (排除灰色/白色像素)
    # threshold maps to hue band half-width (default 30 → ±30° hue)
    is_green = (hue_dist < threshold) & (s > 25)

    # Low-value (dark) pixels: much tighter — only remove if CLEARLY green.
    # These are often transition pixels at sprite edges. Let U-Net decide.
    dark = v < 40
    is_green[dark] = (hue_dist[dark] < threshold * 0.25) & (s[dark] > 120)

    mask = (~is_green).astype(np.uint8) * 255
    return mask


def chroma_key_soft(image: np.ndarray, bg_color: tuple, hue_half: int = 30) -> np.ndarray:
    """Soft alpha from HSV chroma key — 1.0 = sprite, 0.0 = background.

    Unlike the binary mask, this produces a smooth transition at edges
    for natural compositing. Used as input to edge feathering and despill.
    """
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV).astype(np.float32)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

    bg_bgr = np.uint8([[list(bg_color)[::-1]]])
    target_hue = float(cv2.cvtColor(bg_bgr, cv2.COLOR_BGR2HSV)[0, 0, 0])

    hue_dist = np.abs(h - target_hue)
    hue_dist = np.minimum(hue_dist, 180.0 - hue_dist)

    # Green score: 1.0 = pure green bg, 0.0 = not green
    green_score = np.clip(1.0 - hue_dist / hue_half, 0.0, 1.0)
    # Modulate by saturation: desaturated pixels are less green
    green_score = green_score * np.clip(s / 50.0, 0.0, 1.0)
    # Low-value pixels: unreliable hue, clamp green_score
    green_score[v < 30] *= 0.3

    alpha = 1.0 - green_score  # sprite=1, bg=0
    return np.clip(alpha, 0.0, 1.0)


def despill_green(rgba: np.ndarray, bg_color: tuple, strength: float = 1.0) -> np.ndarray:
    """Remove green spill from sprite pixels near green-screen edges.

    For each pixel, if it has a green tint (green channel dominates),
    reduce the green channel proportionally. The alpha channel is unchanged.
    """
    result = rgba.copy()
    rgb = result[:, :, :3].astype(np.float32)
    alpha = result[:, :, 3].astype(np.float32) / 255.0

    # Only process pixels with some opacity
    opaque = alpha > 0.01
    if not opaque.any():
        return result

    r, g, b = rgb[opaque, 0], rgb[opaque, 1], rgb[opaque, 2]

    # Green spill: green channel exceeds both red and blue
    # Amount to remove = how much green exceeds the average of red+blue
    # But only if the pixel actually has a green tint
    green_excess = g - np.maximum(r, b)
    green_excess = np.maximum(green_excess, 0)

    # Don't despill if the pixel is actually supposed to be green/yellow
    # (e.g. grass, yellow sprite parts) — only despill near green-screen hue
    # Check if the pixel's green is from the green screen or the sprite's own color
    # Simple heuristic: only despill if red AND blue are low (true green tint)
    is_green_tint = (r < g * 0.8) & (b < g * 0.8)

    # Apply despill
    reduction = green_excess * strength * is_green_tint.astype(np.float32)
    rgb[opaque, 1] = np.clip(g - reduction, 0, 255)

    result[:, :, :3] = rgb.astype(np.uint8)
    return result


def edge_feather(mask: np.ndarray, radius: int = 3) -> np.ndarray:
    """Feather mask edges for smoother compositing.

    Applies Gaussian blur around the mask boundary and re-thresholds.
    This eliminates hard pixelated edges from binary masks.
    """
    if radius < 1:
        return mask
    blurred = cv2.GaussianBlur(mask.astype(np.float32), (radius * 2 + 1, radius * 2 + 1), 0)
    return (blurred > 127).astype(np.uint8) * 255


def unet_refine(model, image: Image.Image, size: int, threshold: float, device: torch.device) -> np.ndarray:
    """Refine mask using U-Net prediction."""
    original_w, original_h = image.size
    resized = image.convert("RGB").resize((size, size), Image.Resampling.BILINEAR)
    arr = np.asarray(resized, dtype=np.float32) / 255.0
    tensor = torch.from_numpy(arr).permute(2, 0, 1).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(tensor)
        prob = torch.sigmoid(logits)[0, 0].cpu().numpy()

    prob_img = Image.fromarray((prob * 255).astype(np.uint8)).resize((original_w, original_h), Image.Resampling.BILINEAR)
    mask = (np.asarray(prob_img) / 255.0 >= threshold).astype(np.uint8) * 255
    return mask


def clean_mask(mask: np.ndarray) -> np.ndarray:
    """Morphological cleanup."""
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    return mask


def detect_grid(image: np.ndarray, bg_color: tuple, threshold: int = 30) -> tuple:
    """Detect grid layout of a sprite sheet by finding rows/columns of bg pixels."""
    diff = np.abs(image.astype(int) - np.array(bg_color, dtype=int))
    is_bg = np.all(diff < threshold, axis=2)
    
    # Find rows that are mostly background (separators between sprite rows)
    bg_row_ratio = is_bg.mean(axis=1)
    # Find columns that are mostly background (separators between sprite cols)
    bg_col_ratio = is_bg.mean(axis=0)
    
    return bg_row_ratio, bg_col_ratio


def slice_grid(image: np.ndarray, mask: np.ndarray, min_area: int = 100) -> list:
    """Slice sprites by finding connected components in mask."""
    retval, labeled, stats, centroids = cv2.connectedComponentsWithStats((mask > 0).astype(np.uint8), connectivity=8)
    n = int(retval)
    components = []
    
    for i in range(1, n + 1):
        ys, xs = np.where(labeled == i)
        if len(ys) < min_area:
            continue
        
        x0, y0 = xs.min(), ys.min()
        x1, y1 = xs.max(), ys.max()
        components.append({
            "bbox": (x0, y0, x1, y1),
            "area": len(ys),
            "center": ((x0 + x1) // 2, (y0 + y1) // 2),
        })
    
    # Sort by position: top-to-bottom, left-to-right
    components.sort(key=lambda c: (c["bbox"][1], c["bbox"][0]))
    return components


def paste_on_fixed_canvas(rgba: Image.Image, canvas_size: int) -> Image.Image:
    """Place sprite on fixed-size canvas for game use."""
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    w, h = rgba.size
    scale = min(canvas_size / max(w, 1), canvas_size / max(h, 1), 1.0)
    new_w = max(1, int(round(w * scale)))
    new_h = max(1, int(round(h * scale)))
    if (new_w, new_h) != (w, h):
        rgba = rgba.resize((new_w, new_h), Image.Resampling.NEAREST)
    x = (canvas_size - rgba.size[0]) // 2
    y = (canvas_size - rgba.size[1]) // 2
    canvas.paste(rgba, (x, y), rgba)
    return canvas


def main():
    parser = argparse.ArgumentParser(description="Sprite sheet extraction with chroma key + U-Net")
    parser.add_argument("--checkpoint", required=True, help="Path to trained U-Net checkpoint")
    parser.add_argument("--input", required=True, help="Input sprite sheet PNG")
    parser.add_argument("--out-dir", default="outputs", help="Output directory")
    parser.add_argument("--bg-color", default=None, help="Background RGB, e.g. '4,249,14'. Auto-detect if not set.")
    parser.add_argument("--chroma-threshold", type=int, default=30, help="Chroma key color distance threshold")
    parser.add_argument("--unet-threshold", type=float, default=0.5, help="U-Net probability threshold")
    parser.add_argument("--padding", type=int, default=2, help="Padding around bbox when cropping")
    parser.add_argument("--min-area", type=int, default=200, help="Minimum sprite area in pixels")
    parser.add_argument("--fixed-canvas", type=int, default=None, help="Output fixed canvas size (e.g. 128)")
    parser.add_argument("--device", default="cuda" if torch.cuda.is_available() else "cpu")
    parser.add_argument("--use-unet", action="store_true", default=True, help="Use U-Net refinement (default True)")
    parser.add_argument("--no-unet", action="store_true", help="Skip U-Net, use chroma key only")
    parser.add_argument("--despill", type=float, default=1.0, help="Green spill removal strength (0-1, 0=off, default 1.0)")
    parser.add_argument("--feather", type=int, default=2, help="Edge feather radius in pixels (0=off, default 2)")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    device = torch.device(args.device)
    print(f"Device: {device}")

    # Load image
    image_pil = Image.open(args.input)
    image = np.array(image_pil.convert("RGB"))
    h, w = image.shape[:2]
    print(f"Image: {w}x{h}")

    # Auto-detect background color from 4 corners
    if args.bg_color:
        bg_color = tuple(int(x) for x in args.bg_color.split(","))
    else:
        corners = [
            image[0:10, 0:10], image[0:10, -10:],
            image[-10:, 0:10], image[-10:, -10:]
        ]
        corner_pixels = np.concatenate([c.reshape(-1, 3) for c in corners])
        bg_color = tuple(np.median(corner_pixels, axis=0).astype(int).tolist())
    print(f"Background color: RGB{bg_color}")

    # Step 1: Generate TWO chroma masks
    #   a) RGB chroma — best for grid separation (clean boundaries between sprites)
    #   b) HSV chroma — best for background removal (catches dark green edges)
    chroma_mask_rgb = chroma_key_mask_rgb(image, bg_color, args.chroma_threshold)
    chroma_mask = chroma_key_mask(image, bg_color, args.chroma_threshold)
    Image.fromarray(chroma_mask_rgb).save(out_dir / "debug_chroma_rgb_mask.png")
    Image.fromarray(chroma_mask).save(out_dir / "debug_chroma_hsv_mask.png")

    # Step 2: U-Net refinement (applied to each crop later, or combined globally)
    if args.no_unet:
        print("Skipping U-Net refinement")
        final_mask = chroma_mask
    elif args.use_unet:
        print("Loading U-Net model...")
        model, model_size = load_model(args.checkpoint, device)
        print("Running U-Net refinement...")
        unet_mask = unet_refine(model, image_pil, model_size, args.unet_threshold, device)
        Image.fromarray(unet_mask).save(out_dir / "debug_unet_mask.png")

        # Merge: chroma provides the foundation (HSV-accurate for green detection),
        # U-Net only adds edge detail — never overrides chroma's sprite decisions.
        # This prevents U-Net from eating into cat pixels due to training data mismatch.
        final_mask = chroma_mask.copy()
        # U-Net fills in sprite pixels that chroma missed (edges, fine details)
        final_mask[chroma_mask == 0] = unet_mask[chroma_mask == 0]
        final_mask = np.minimum(final_mask, 255)

    # Step 3: Edge feathering for smooth alpha transition
    if args.feather > 0:
        final_mask = edge_feather(final_mask, args.feather)

    # Step 4: Morphological cleanup (gentler after feathering)
    final_mask = clean_mask(final_mask)
    Image.fromarray(final_mask).save(out_dir / "debug_clean_mask.png")

    # Step 5: Find connected components from RGB chroma mask (best for separation)
    components = slice_grid(image, chroma_mask_rgb, args.min_area)
    print(f"Found {len(components)} sprites")

    # Step 5: Extract each sprite
    rgba_full = image_pil.convert("RGBA")
    rgba_arr = np.array(rgba_full)
    rgba_arr[:, :, 3] = final_mask
    rgba_full = Image.fromarray(rgba_arr, mode="RGBA")

    saved = 0
    for i, comp in enumerate(components):
        x0, y0, x1, y1 = comp["bbox"]
        pad = args.padding
        x0 = max(0, x0 - pad)
        y0 = max(0, y0 - pad)
        x1 = min(w, x1 + pad)
        y1 = min(h, y1 + pad)

        crop = rgba_full.crop((x0, y0, x1, y1))

        # Step 6: Green spill removal on cropped sprite
        if args.despill > 0:
            crop_arr = np.array(crop)
            crop_arr = despill_green(crop_arr, bg_color, args.despill)
            crop = Image.fromarray(crop_arr, mode="RGBA")

        if args.fixed_canvas:
            crop = paste_on_fixed_canvas(crop, args.fixed_canvas)

        saved += 1
        crop.save(out_dir / f"frame_{saved:03d}.png")

    print(f"Saved {saved} frames to {out_dir}")


if __name__ == "__main__":
    main()
