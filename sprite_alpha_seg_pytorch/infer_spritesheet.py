import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
import torch

from src.model_unet import UNet


def load_model(checkpoint_path: str, device: torch.device):
    ckpt = torch.load(checkpoint_path, map_location=device)
    base_channels = ckpt.get("base_channels", 32)
    model = UNet(base_channels=base_channels).to(device)
    model.load_state_dict(ckpt["model_state"])
    model.eval()
    return model, ckpt.get("size", 256)


def predict_mask(model, image: Image.Image, size: int, threshold: float, device: torch.device) -> np.ndarray:
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
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    return mask


def paste_on_fixed_canvas(rgba: Image.Image, canvas_size: int) -> Image.Image:
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    w, h = rgba.size
    scale = min(canvas_size / max(w, 1), canvas_size / max(h, 1), 1.0)
    new_w = max(1, int(round(w * scale)))
    new_h = max(1, int(round(h * scale)))
    if (new_w, new_h) != (w, h):
        rgba = rgba.resize((new_w, new_h), Image.Resampling.NEAREST)
    x = (canvas_size - rgba.size[0]) // 2
    y = (canvas_size - rgba.size[1]) // 2
    canvas.alpha_composite(rgba, dest=(x, y))
    return canvas


def export_components(image: Image.Image, mask: np.ndarray, out_dir: Path, padding: int, min_area: int, fixed_canvas: int | None):
    rgba_full = image.convert("RGBA")
    rgba_arr = np.array(rgba_full)
    rgba_arr[:, :, 3] = mask
    rgba_full = Image.fromarray(rgba_arr, mode="RGBA")

    n, labels, stats, _ = cv2.connectedComponentsWithStats((mask > 0).astype(np.uint8), connectivity=8)
    saved = 0
    H, W = mask.shape

    for i in range(1, n):
        x, y, w, h, area = stats[i]
        if area < min_area:
            continue
        x0 = max(0, x - padding)
        y0 = max(0, y - padding)
        x1 = min(W, x + w + padding)
        y1 = min(H, y + h + padding)
        crop = rgba_full.crop((x0, y0, x1, y1))
        if fixed_canvas is not None:
            crop = paste_on_fixed_canvas(crop, fixed_canvas)
        saved += 1
        crop.save(out_dir / f"frame_{saved:03d}.png")

    return saved


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--input", required=True)
    parser.add_argument("--out-dir", default="outputs")
    parser.add_argument("--size", type=int, default=None, help="model input size; default reads from checkpoint")
    parser.add_argument("--threshold", type=float, default=0.5)
    parser.add_argument("--padding", type=int, default=4)
    parser.add_argument("--min-area", type=int, default=30)
    parser.add_argument("--fixed-canvas", type=int, default=None, help="e.g. 64 or 128")
    parser.add_argument("--device", default="cuda" if torch.cuda.is_available() else "cpu")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    device = torch.device(args.device)
    model, ckpt_size = load_model(args.checkpoint, device)
    size = args.size or ckpt_size

    image = Image.open(args.input).convert("RGB")
    mask = predict_mask(model, image, size=size, threshold=args.threshold, device=device)
    mask = clean_mask(mask)
    Image.fromarray(mask).save(out_dir / "debug_mask.png")

    saved = export_components(
        image=image,
        mask=mask,
        out_dir=out_dir,
        padding=args.padding,
        min_area=args.min_area,
        fixed_canvas=args.fixed_canvas,
    )
    print(f"saved {saved} frame(s) to {out_dir}")


if __name__ == "__main__":
    main()
