import argparse
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
import torch

CAT_ACTIONS = ("sit", "jump", "lie")


def load_hybrid_tools(seg_root: Path):
    sys.path.insert(0, str(seg_root))
    from infer_spritesheet_hybrid import (  # noqa: PLC0415
        chroma_key_mask,
        chroma_key_mask_rgb,
        clean_mask,
        despill_green,
        edge_feather,
        load_model,
        paste_on_fixed_canvas,
        unet_refine,
    )

    return {
        "chroma_key_mask": chroma_key_mask,
        "chroma_key_mask_rgb": chroma_key_mask_rgb,
        "clean_mask": clean_mask,
        "despill_green": despill_green,
        "edge_feather": edge_feather,
        "load_model": load_model,
        "paste_on_fixed_canvas": paste_on_fixed_canvas,
        "unet_refine": unet_refine,
    }


def detect_background(rgb: np.ndarray) -> tuple[int, int, int]:
    corners = [
        rgb[0:10, 0:10],
        rgb[0:10, -10:],
        rgb[-10:, 0:10],
        rgb[-10:, -10:],
    ]
    pixels = np.concatenate([corner.reshape(-1, 3) for corner in corners])
    return tuple(np.median(pixels, axis=0).astype(int).tolist())


def hue_distance(hue: np.ndarray, target_hue: float) -> np.ndarray:
    distance = np.abs(hue.astype(np.float32) - target_hue)
    return np.minimum(distance, 180.0 - distance)


def bg_is_green_key(bg_color: tuple[int, int, int]) -> bool:
    bgr = np.uint8([[list(bg_color)[::-1]]])
    hue, saturation, value = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)[0, 0]
    return 35 <= int(hue) <= 90 and int(saturation) > 60 and int(value) > 40


def border_connected_mask(mask: np.ndarray) -> np.ndarray:
    labels_count, labels, _, _ = cv2.connectedComponentsWithStats((mask > 0).astype(np.uint8), connectivity=8)
    if labels_count <= 1:
        return np.zeros(mask.shape, dtype=np.uint8)

    border_labels = np.unique(np.concatenate([
        labels[0, :],
        labels[-1, :],
        labels[:, 0],
        labels[:, -1],
    ]))
    border_labels = border_labels[border_labels != 0]
    if not len(border_labels):
        return np.zeros(mask.shape, dtype=np.uint8)

    return np.isin(labels, border_labels).astype(np.uint8) * 255


def large_enclosed_background_mask(foreground_masks: list[np.ndarray], min_area: int) -> np.ndarray:
    """Find large chroma-key holes sealed off from the image border by ring-shaped sprites."""
    if not foreground_masks:
        raise ValueError("at least one foreground mask is required")

    height, width = foreground_masks[0].shape
    result = np.zeros((height, width), dtype=np.uint8)
    min_component_area = max(min_area * 4, int(height * width * 0.02))
    min_component_width = max(8, int(width * 0.16))
    min_component_height = max(8, int(height * 0.16))

    for foreground in foreground_masks:
        if foreground.shape != (height, width):
            raise ValueError("foreground masks must have matching dimensions")

        background = (foreground == 0).astype(np.uint8)
        count, labels, stats, _ = cv2.connectedComponentsWithStats(background, connectivity=8)
        border_labels = set(np.unique(np.concatenate([
            labels[0, :],
            labels[-1, :],
            labels[:, 0],
            labels[:, -1],
        ])).tolist())

        for index in range(1, count):
            if index in border_labels:
                continue
            _, _, component_width, component_height, area = stats[index]
            if (
                int(area) >= min_component_area
                and int(component_width) >= min_component_width
                and int(component_height) >= min_component_height
            ):
                result[labels == index] = 255

    return result


def enclosed_center_background_mask(
    rgb: np.ndarray,
    alpha: np.ndarray,
    min_area: int,
) -> tuple[np.ndarray, tuple[int, int, int] | None]:
    """Find a large center region matching an imported bracelet's own background color."""
    height, width = alpha.shape
    result = np.zeros((height, width), dtype=np.uint8)
    half_sample = max(3, int(min(height, width) * 0.04))
    center_y, center_x = height // 2, width // 2
    y0, y1 = max(0, center_y - half_sample), min(height, center_y + half_sample + 1)
    x0, x1 = max(0, center_x - half_sample), min(width, center_x + half_sample + 1)
    sample_mask = alpha[y0:y1, x0:x1] > 8
    if int(sample_mask.sum()) < max(9, min_area // 8):
        return result, None

    center_color = tuple(np.median(rgb[y0:y1, x0:x1][sample_mask], axis=0).astype(int).tolist())
    center_bgr = np.uint8([[list(center_color)[::-1]]])
    target_hsv = cv2.cvtColor(center_bgr, cv2.COLOR_BGR2HSV)[0, 0].astype(np.float32)
    target_lab = cv2.cvtColor(center_bgr, cv2.COLOR_BGR2LAB)[0, 0].astype(np.float32)

    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV).astype(np.float32)
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    rgb_delta = np.abs(rgb.astype(np.int16) - np.array(center_color, dtype=np.int16))
    rgb_close = np.all(rgb_delta <= 42, axis=2)
    hue_close = np.zeros(alpha.shape, dtype=bool)
    if target_hsv[1] > 25:
        hue_close = (
            (hue_distance(hsv[:, :, 0], float(target_hsv[0])) <= 22)
            & (hsv[:, :, 1] >= max(20.0, float(target_hsv[1]) * 0.25))
            & (hsv[:, :, 2] >= 20)
        )
    chroma_distance = np.hypot(lab[:, :, 1] - target_lab[1], lab[:, :, 2] - target_lab[2])
    matching_shadow = (
        (chroma_distance <= 14)
        & (lab[:, :, 0] <= target_lab[0] + 25)
        & (lab[:, :, 0] >= max(0.0, float(target_lab[0]) - 115))
    )
    candidate = ((alpha > 8) & (rgb_close | hue_close | matching_shadow)).astype(np.uint8)
    candidate = cv2.morphologyEx(
        candidate,
        cv2.MORPH_CLOSE,
        np.ones((3, 3), np.uint8),
        iterations=2,
    )

    count, labels, stats, _ = cv2.connectedComponentsWithStats(candidate, connectivity=8)
    border_labels = set(np.unique(np.concatenate([
        labels[0, :],
        labels[-1, :],
        labels[:, 0],
        labels[:, -1],
    ])).tolist())
    center_labels = set(np.unique(labels[y0:y1, x0:x1]).tolist())
    min_component_area = max(min_area * 4, int(height * width * 0.02))
    min_component_width = max(8, int(width * 0.16))
    min_component_height = max(8, int(height * 0.16))

    for index in center_labels:
        if index == 0 or index in border_labels or index >= count:
            continue
        _, _, component_width, component_height, area = stats[index]
        if (
            int(area) >= min_component_area
            and int(component_width) >= min_component_width
            and int(component_height) >= min_component_height
        ):
            result[labels == index] = 255

    return result, center_color


def green_screen_foreground_mask(rgb: np.ndarray, bg_color: tuple[int, int, int], threshold: int) -> np.ndarray:
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV).astype(np.float32)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    r, g, b = rgb[:, :, 0].astype(np.float32), rgb[:, :, 1].astype(np.float32), rgb[:, :, 2].astype(np.float32)

    bg_bgr = np.uint8([[list(bg_color)[::-1]]])
    target_hue = float(cv2.cvtColor(bg_bgr, cv2.COLOR_BGR2HSV)[0, 0, 0])
    hue_band = max(24.0, min(46.0, threshold * 1.35))
    hue_close = hue_distance(h, target_hue) <= hue_band

    diff = np.abs(rgb.astype(np.int16) - np.array(bg_color, dtype=np.int16))
    rgb_close = np.all(diff <= max(18, threshold), axis=2)

    green_or_cyan = (g >= r * 0.92) & (g >= b * 0.82)
    saturated_bg = (s >= 28) & (v >= 45)
    bg_candidate = ((hue_close & saturated_bg & green_or_cyan) | rgb_close).astype(np.uint8) * 255

    kernel = np.ones((3, 3), np.uint8)
    bg_candidate = cv2.morphologyEx(bg_candidate, cv2.MORPH_CLOSE, kernel, iterations=1)
    bg_connected = border_connected_mask(bg_candidate)
    bg_connected = cv2.dilate(bg_connected, kernel, iterations=1)
    foreground = (bg_connected == 0).astype(np.uint8) * 255
    return foreground


def has_useful_alpha(alpha: np.ndarray, min_area: int) -> bool:
    return alpha.min() < 250 and int((alpha > 8).sum()) >= min_area


def crop_with_padding(rgba: np.ndarray, mask: np.ndarray, padding: int) -> Image.Image:
    ys, xs = np.where(mask > 0)
    if len(xs) == 0 or len(ys) == 0:
        raise RuntimeError("no foreground pixels found")

    h, w = mask.shape[:2]
    x0 = max(0, int(xs.min()) - padding)
    y0 = max(0, int(ys.min()) - padding)
    x1 = min(w, int(xs.max()) + padding + 1)
    y1 = min(h, int(ys.max()) + padding + 1)
    return Image.fromarray(rgba[y0:y1, x0:x1], "RGBA")


def connected_components(mask: np.ndarray, min_area: int) -> list[dict]:
    count, labels, stats, _ = cv2.connectedComponentsWithStats((mask > 0).astype(np.uint8), connectivity=8)
    components = []
    for index in range(1, count):
        x, y, w, h, area = stats[index]
        if int(area) < min_area:
            continue
        components.append({
            "index": index,
            "bbox": (int(x), int(y), int(x + w), int(y + h)),
            "area": int(area),
            "mask": (labels == index).astype(np.uint8) * 255,
        })
    return components


def ordered_sprite_components(mask: np.ndarray, min_area: int, limit: int | None) -> list[dict]:
    components = connected_components(mask, min_area)
    if not components:
        return []
    if limit:
        components = sorted(components, key=lambda item: item["area"], reverse=True)[:limit]
        if limit > 1:
            return sorted(components, key=lambda item: item["bbox"][0])
    return sorted(components, key=lambda item: (item["bbox"][1], item["bbox"][0]))


def component_limited_rgba(rgba: np.ndarray, alpha: np.ndarray, component_mask: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    frame_mask = np.minimum(alpha, component_mask)
    frame_rgba = rgba.copy()
    frame_rgba[:, :, 3] = frame_mask
    return frame_rgba, frame_mask


def main():
    parser = argparse.ArgumentParser(description="Process one uploaded external sprite into a game-ready PNG.")
    parser.add_argument("--input", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--seg-root", default=r"D:\sprite_alpha_seg_pytorch")
    parser.add_argument("--kind", choices=["cat", "bead"], default="cat")
    parser.add_argument("--canvas", type=int, default=128)
    parser.add_argument("--padding", type=int, default=8)
    parser.add_argument("--min-area", type=int, default=80)
    parser.add_argument("--chroma-threshold", type=int, default=32)
    parser.add_argument("--unet-threshold", type=float, default=0.45)
    parser.add_argument("--feather", type=int, default=2)
    parser.add_argument("--device", default="cuda" if torch.cuda.is_available() else "cpu")
    parser.add_argument("--no-unet", action="store_true")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    tools = load_hybrid_tools(Path(args.seg_root))

    image = Image.open(args.input).convert("RGBA")
    rgba = np.array(image)
    rgb = rgba[:, :, :3]
    raw_alpha = rgba[:, :, 3]

    green_key = False
    background_color = None
    component_mask = None
    enclosed_background = None
    if has_useful_alpha(raw_alpha, args.min_area):
        final_mask = raw_alpha.copy()
        component_mask = raw_alpha
        source = "input-alpha"
        if args.kind == "bead":
            enclosed_background, background_color = enclosed_center_background_mask(
                rgb,
                raw_alpha,
                args.min_area,
            )
            Image.fromarray(enclosed_background).save(out_dir / "debug_enclosed_background_mask.png")
            if np.any(enclosed_background > 0):
                final_mask[enclosed_background > 0] = 0
                green_key = bg_is_green_key(background_color)
                source = f"input-alpha-background-rgb{background_color}"
    else:
        bg_color = detect_background(rgb)
        background_color = bg_color
        green_key = bg_is_green_key(bg_color)
        rgb_mask = tools["chroma_key_mask_rgb"](rgb, bg_color, args.chroma_threshold)
        hsv_mask = tools["chroma_key_mask"](rgb, bg_color, args.chroma_threshold)
        green_mask = green_screen_foreground_mask(rgb, bg_color, args.chroma_threshold)
        Image.fromarray(rgb_mask).save(out_dir / "debug_chroma_rgb_mask.png")
        Image.fromarray(hsv_mask).save(out_dir / "debug_chroma_hsv_mask.png")
        Image.fromarray(green_mask).save(out_dir / "debug_green_connected_mask.png")
        if args.kind == "bead":
            enclosed_background = large_enclosed_background_mask([rgb_mask, hsv_mask], args.min_area)
            Image.fromarray(enclosed_background).save(out_dir / "debug_enclosed_background_mask.png")

        final_mask = green_mask if green_key else rgb_mask
        component_mask = green_mask if green_key else final_mask
        source = f"background-rgb{bg_color}"

        if green_key and not args.no_unet:
            device = torch.device(args.device)
            model, model_size = tools["load_model"](args.checkpoint, device)
            unet_mask = tools["unet_refine"](model, image.convert("RGB"), model_size, args.unet_threshold, device)
            Image.fromarray(unet_mask).save(out_dir / "debug_unet_mask.png")
            final_mask = final_mask.copy()
            final_mask[final_mask == 0] = unet_mask[final_mask == 0]

        if enclosed_background is not None:
            # Preserve the connected ring for component selection, but never let U-Net refill its background hole.
            final_mask[enclosed_background > 0] = 0

    if args.feather > 0:
        final_mask = tools["edge_feather"](final_mask, args.feather)
    final_mask = tools["clean_mask"](final_mask)
    component_mask = tools["clean_mask"](component_mask)
    Image.fromarray(final_mask).save(out_dir / "debug_clean_mask.png")
    Image.fromarray(component_mask).save(out_dir / "debug_component_mask.png")

    if int((final_mask > 0).sum()) < args.min_area:
        raise RuntimeError("foreground too small after segmentation")

    final_rgba = rgba.copy()
    final_rgba[:, :, 3] = final_mask

    if green_key:
        final_rgba = tools["despill_green"](final_rgba, background_color or (4, 249, 14), 0.9)

    if component_mask is None:
        component_mask = final_mask

    frame_limit = len(CAT_ACTIONS) if args.kind == "cat" else 1
    components = ordered_sprite_components(component_mask, args.min_area, frame_limit)
    if not components:
        components = [{"mask": final_mask}]

    for index, component in enumerate(components, start=1):
        frame_rgba, frame_mask = component_limited_rgba(final_rgba, final_mask, component["mask"])
        crop = crop_with_padding(frame_rgba, frame_mask, args.padding)
        result = tools["paste_on_fixed_canvas"](crop, args.canvas)
        output = out_dir / f"frame_{index:03d}.png"
        result.save(output, "PNG")

    print(f"Processed {args.kind} sprite from {source}")
    print(f"Saved {len(components)} frame(s) to {out_dir}")


if __name__ == "__main__":
    main()
