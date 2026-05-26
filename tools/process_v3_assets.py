from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "assets" / "art" / "v3"

SIZES = {
    "cats": (256, 256),
    "bracelets": (256, 256),
    "decor": (256, 192),
    "ui": (96, 96),
    "station": (640, 360),
}


def alpha_bbox(im: Image.Image) -> tuple[int, int, int, int] | None:
    return im.convert("RGBA").split()[-1].getbbox()


def fit_alpha(src: Path, dst: Path, size: tuple[int, int], margin: int = 10, anchor: str = "center") -> None:
    im = Image.open(src).convert("RGBA")
    bbox = alpha_bbox(im)
    if not bbox:
        return

    cropped = im.crop(bbox)
    max_w = max(1, size[0] - margin * 2)
    max_h = max(1, size[1] - margin * 2)
    scale = min(max_w / cropped.width, max_h / cropped.height)
    new_size = (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale)))
    resample = Image.Resampling.NEAREST if max(cropped.size) <= 512 else Image.Resampling.LANCZOS
    cropped = cropped.resize(new_size, resample)

    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    if anchor == "bottom":
        x = (size[0] - cropped.width) // 2
        y = size[1] - cropped.height - margin
    elif anchor == "left":
        x = margin
        y = (size[1] - cropped.height) // 2
    else:
        x = (size[0] - cropped.width) // 2
        y = (size[1] - cropped.height) // 2
    canvas.alpha_composite(cropped, (x, y))
    dst.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dst)


def recolor_bracelet(src: Path, dst: Path, stage: int) -> None:
    im = Image.open(src).convert("RGBA")
    bbox = alpha_bbox(im)
    if bbox:
        im = im.crop(bbox)

    # Stage grows warmer, denser, and glossier as patina reaches 100%.
    warmth = [0.98, 1.08, 1.18, 1.32, 1.48][stage]
    contrast = [0.95, 1.02, 1.12, 1.22, 1.34][stage]
    brightness = [1.08, 1.04, 1.0, 0.94, 0.88][stage]

    rgba = im.copy()
    rgb = rgba.convert("RGB")
    rgb = ImageEnhance.Color(rgb).enhance(warmth)
    rgb = ImageEnhance.Contrast(rgb).enhance(contrast)
    rgb = ImageEnhance.Brightness(rgb).enhance(brightness)

    overlay = Image.new("RGBA", rgba.size, (120 + stage * 20, 52 + stage * 9, 18, 0))
    overlay_alpha = int([0, 18, 32, 46, 62][stage])
    overlay.putalpha(Image.new("L", rgba.size, overlay_alpha))
    staged = Image.alpha_composite(Image.merge("RGBA", (*rgb.split(), rgba.split()[-1])), overlay)

    if stage >= 2:
        shine = Image.new("RGBA", staged.size, (255, 230, 160, 0))
        draw = ImageDraw.Draw(shine)
        for i in range(8 + stage * 4):
            x = (i * 37 + stage * 17) % max(1, staged.width)
            y = (i * 23 + stage * 11) % max(1, staged.height)
            r = 2 + (stage // 2)
            draw.ellipse((x - r, y - r, x + r, y + r), fill=(255, 238, 180, 55 + stage * 14))
        shine = shine.filter(ImageFilter.GaussianBlur(0.35))
        staged = Image.alpha_composite(staged, shine)

    tmp_path = dst.with_suffix(".tmp.png")
    tmp_path.parent.mkdir(parents=True, exist_ok=True)
    staged.save(tmp_path)
    fit_alpha(tmp_path, dst, SIZES["bracelets"], margin=18)
    tmp_path.unlink(missing_ok=True)


def make_logo(mark_path: Path, dst: Path) -> None:
    mark = Image.open(mark_path).convert("RGBA") if mark_path.exists() else Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    fit_tmp = ART / "ui" / "_logo-mark-fit.png"
    fit_alpha(mark_path, fit_tmp, (96, 96), margin=4) if mark_path.exists() else None
    if fit_tmp.exists():
        mark = Image.open(fit_tmp).convert("RGBA")
        fit_tmp.unlink()

    w, h = 512, 128
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    panel = Image.new("RGBA", (w - 8, h - 12), (255, 239, 188, 235))
    pd = ImageDraw.Draw(panel)
    pd.rounded_rectangle((0, 0, panel.width - 1, panel.height - 1), radius=14, fill=(255, 239, 188, 235), outline=(92, 45, 18, 255), width=5)
    pd.rectangle((12, panel.height - 18, panel.width - 12, panel.height - 12), fill=(214, 166, 89, 120))
    canvas.alpha_composite(panel, (4, 6))
    canvas.alpha_composite(mark, (18, 14))

    font_paths = [
        Path("C:/Windows/Fonts/msyhbd.ttc"),
        Path("C:/Windows/Fonts/simhei.ttf"),
        Path("C:/Windows/Fonts/msyh.ttc"),
    ]
    title_font = None
    sub_font = None
    for fp in font_paths:
        if fp.exists():
            title_font = ImageFont.truetype(str(fp), 42)
            sub_font = ImageFont.truetype(str(fp), 18)
            break
    title_font = title_font or ImageFont.load_default()
    sub_font = sub_font or ImageFont.load_default()

    text = "猫猫盘珠日记"
    x, y = 120, 28
    for ox, oy in [(3, 3), (2, 0), (0, 2)]:
        draw.text((x + ox, y + oy), text, font=title_font, fill=(122, 63, 24, 255))
    draw.text((x, y), text, font=title_font, fill=(45, 28, 19, 255))
    draw.text((x + 4, 84), "放置盘玩 · 猫群相伴", font=sub_font, fill=(91, 66, 37, 255))
    dst.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dst)


def main() -> None:
    manifest: dict[str, list[str]] = {"cats": [], "bracelets": [], "decor": [], "ui": [], "station": []}

    for src in sorted((ART / "cats").glob("*-raw.png")):
        dst = src.with_name(src.name.replace("-raw.png", ".png"))
        fit_alpha(src, dst, SIZES["cats"], margin=8, anchor="bottom")
        manifest["cats"].append(str(dst.relative_to(ROOT)).replace("\\", "/"))

    for src in sorted((ART / "decor").glob("*-raw.png")):
        dst = src.with_name(src.name.replace("-raw.png", ".png"))
        fit_alpha(src, dst, SIZES["decor"], margin=8, anchor="bottom")
        manifest["decor"].append(str(dst.relative_to(ROOT)).replace("\\", "/"))

    for src in sorted((ART / "ui").glob("*-raw.png")):
        dst = src.with_name(src.name.replace("-raw.png", ".png"))
        fit_alpha(src, dst, SIZES["ui"], margin=8)
        manifest["ui"].append(str(dst.relative_to(ROOT)).replace("\\", "/"))

    for src in sorted((ART / "station").glob("*-raw.png")):
        dst = src.with_name(src.name.replace("-raw.png", ".png"))
        fit_alpha(src, dst, SIZES["station"], margin=8, anchor="bottom")
        manifest["station"].append(str(dst.relative_to(ROOT)).replace("\\", "/"))

    for src in sorted((ART / "bracelets").glob("*-base.png")):
        stem = src.stem.replace("-base", "")
        for stage in range(5):
            dst = src.with_name(f"{stem}-{stage}.png")
            recolor_bracelet(src, dst, stage)
            manifest["bracelets"].append(str(dst.relative_to(ROOT)).replace("\\", "/"))

    root_logo = ROOT / "assets" / "art" / "game-logo.png"
    logo_out = ART / "ui" / "game-logo.png"
    if root_logo.exists():
        logo_out.parent.mkdir(parents=True, exist_ok=True)
        Image.open(root_logo).convert("RGBA").save(logo_out)
    else:
        logo_mark = ART / "ui" / "logo-mark.png"
        make_logo(logo_mark, logo_out)
    manifest["ui"].append("assets/art/v3/ui/game-logo.png")

    (ART / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: len(v) for k, v in manifest.items()}, ensure_ascii=False))


if __name__ == "__main__":
    main()
