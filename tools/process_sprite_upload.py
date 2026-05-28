import argparse
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
import torch


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


def bg_is_green_key(bg_color: tuple[int, int, int]) -> bool:
    bgr = np.uint8([[list(bg_color)[::-1]]])
    hue, saturation, value = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)[0, 0]
    return 35 <= int(hue) <= 90 and int(saturation) > 60 and int(value) > 40


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
    if has_useful_alpha(raw_alpha, args.min_area):
        final_mask = raw_alpha
        source = "input-alpha"
    else:
        bg_color = detect_background(rgb)
        green_key = bg_is_green_key(bg_color)
        rgb_mask = tools["chroma_key_mask_rgb"](rgb, bg_color, args.chroma_threshold)
        hsv_mask = tools["chroma_key_mask"](rgb, bg_color, args.chroma_threshold)
        Image.fromarray(rgb_mask).save(out_dir / "debug_chroma_rgb_mask.png")
        Image.fromarray(hsv_mask).save(out_dir / "debug_chroma_hsv_mask.png")

        final_mask = hsv_mask if green_key else rgb_mask
        source = f"background-rgb{bg_color}"

        if green_key and not args.no_unet:
            device = torch.device(args.device)
            model, model_size = tools["load_model"](args.checkpoint, device)
            unet_mask = tools["unet_refine"](model, image.convert("RGB"), model_size, args.unet_threshold, device)
            Image.fromarray(unet_mask).save(out_dir / "debug_unet_mask.png")
            final_mask = final_mask.copy()
            final_mask[final_mask == 0] = unet_mask[final_mask == 0]

    if args.feather > 0:
        final_mask = tools["edge_feather"](final_mask, args.feather)
    final_mask = tools["clean_mask"](final_mask)
    Image.fromarray(final_mask).save(out_dir / "debug_clean_mask.png")

    if int((final_mask > 0).sum()) < args.min_area:
        raise RuntimeError("foreground too small after segmentation")

    final_rgba = rgba.copy()
    final_rgba[:, :, 3] = final_mask

    if green_key:
        final_rgba = tools["despill_green"](final_rgba, (4, 249, 14), 0.9)

    crop = crop_with_padding(final_rgba, final_mask, args.padding)
    result = tools["paste_on_fixed_canvas"](crop, args.canvas)
    output = out_dir / "frame_001.png"
    result.save(output, "PNG")
    print(f"Processed {args.kind} sprite from {source}")
    print(f"RESULT {output}")


if __name__ == "__main__":
    main()
