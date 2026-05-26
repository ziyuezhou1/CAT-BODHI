from __future__ import annotations

import json
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "art" / "v2"
random.seed(7)


def ensure_dirs() -> None:
    for folder in ["cats", "bracelets", "decor", "ui", "station"]:
        (OUT / folder).mkdir(parents=True, exist_ok=True)


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def mix(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(round(a[i] * (1 - t) + b[i] * t) for i in range(3))


def scale_pixel(img: Image.Image, scale: int, target: tuple[int, int] | None = None) -> Image.Image:
    size = target or (img.width * scale, img.height * scale)
    return img.resize(size, Image.Resampling.NEAREST)


def save(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)


def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        Path("C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc"),
        Path("C:/Windows/Fonts/simhei.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def ellipse(draw: ImageDraw.ImageDraw, box, fill, outline="#5a2a14", width=1) -> None:
    draw.ellipse(box, fill=fill, outline=rgba(outline), width=width)


def poly(draw: ImageDraw.ImageDraw, points, fill, outline="#5a2a14") -> None:
    draw.polygon(points, fill=fill, outline=rgba(outline))


CAT_STYLE = {
    "tabby": {"body": "#f39a2b", "belly": "#ffe2a6", "ear": "#ff8a79", "accent": "#9c541c"},
    "sleepy": {"body": "#fff4e6", "belly": "#ffffff", "ear": "#ff9a8d", "accent": "#d6b28e"},
    "monk": {"body": "#303035", "belly": "#25252a", "ear": "#ff7867", "accent": "#111115"},
    "vendor": {"body": "#f0a34a", "belly": "#fff1d1", "ear": "#ff8a79", "accent": "#303035"},
}


def draw_cat_face(draw, cx: int, cy: int, style: dict, action: str, vendor: bool = False) -> None:
    eye = rgba("#2b1b12")
    if action == "jump" or vendor:
        draw.ellipse((cx - 18, cy - 3, cx - 12, cy + 4), fill=eye)
        draw.ellipse((cx + 12, cy - 3, cx + 18, cy + 4), fill=eye)
    else:
        draw.arc((cx - 20, cy - 4, cx - 10, cy + 8), 0, 180, fill=eye, width=2)
        draw.arc((cx + 10, cy - 4, cx + 20, cy + 8), 0, 180, fill=eye, width=2)
    draw.polygon([(cx, cy + 7), (cx - 4, cy + 3), (cx + 4, cy + 3)], fill=rgba("#ff6f65"))
    draw.arc((cx - 11, cy + 6, cx + 1, cy + 17), 0, 160, fill=eye, width=1)
    draw.arc((cx - 1, cy + 6, cx + 11, cy + 17), 20, 180, fill=eye, width=1)
    for side in [-1, 1]:
        for yy in [4, 9]:
            draw.line((cx + side * 8, cy + yy, cx + side * 29, cy + yy - side), fill=rgba("#5b321e"), width=1)


def draw_bead_loop(draw, cx: int, cy: int, radius: int = 17, bead="#9b5622") -> None:
    for i in range(14):
        a = math.tau * i / 14
        x = cx + math.cos(a) * radius
        y = cy + math.sin(a) * radius
        ellipse(draw, (x - 3, y - 3, x + 3, y + 3), rgba(bead), "#6a3317")
    draw.line((cx, cy + radius + 1, cx, cy + radius + 15), fill=rgba("#8b251c"), width=2)
    draw.rectangle((cx - 4, cy + radius + 13, cx + 4, cy + radius + 18), fill=rgba("#c43a25"))


def draw_cat(cat: str, action: str) -> Image.Image:
    img = Image.new("RGBA", (128, 114), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    s = CAT_STYLE[cat]
    body = rgba(s["body"])
    belly = rgba(s["belly"])
    accent = rgba(s["accent"])

    if action == "lie":
        ellipse(draw, (20, 56, 98, 92), body, width=2)
        ellipse(draw, (55, 38, 104, 77), body, width=2)
        draw.arc((8, 47, 44, 92), 90, 260, fill=accent, width=6)
        for pts in [[(67, 41), (74, 20), (82, 43)], [(89, 42), (101, 25), (101, 52)]]:
            poly(draw, pts, body)
        ellipse(draw, (76, 82, 100, 94), belly, width=1)
        face_c = (80, 57)
    elif action == "jump":
        ellipse(draw, (28, 51, 92, 100), body, width=2)
        ellipse(draw, (41, 25, 91, 68), body, width=2)
        for pts in [[(51, 29), (57, 9), (66, 31)], [(75, 29), (88, 12), (88, 40)]]:
            poly(draw, pts, body)
        ellipse(draw, (45, 62, 79, 93), belly, width=1)
        ellipse(draw, (19, 59, 40, 78), body, width=2)
        ellipse(draw, (82, 43, 103, 62), body, width=2)
        draw.arc((14, 40, 49, 103), 90, 260, fill=accent, width=6)
        face_c = (66, 47)
    else:
        ellipse(draw, (30, 45, 92, 104), body, width=2)
        ellipse(draw, (36, 18, 92, 66), body, width=2)
        for pts in [[(47, 23), (55, 4), (64, 25)], [(75, 23), (88, 7), (88, 34)]]:
            poly(draw, pts, body)
        ellipse(draw, (47, 57, 76, 93), belly, width=1)
        ellipse(draw, (27, 85, 47, 105), body, width=2)
        ellipse(draw, (76, 85, 98, 105), body, width=2)
        draw.arc((13, 56, 45, 106), 90, 260, fill=accent, width=6)
        face_c = (64, 40)

    if cat == "tabby":
        for x in [48, 58, 70, 80]:
            draw.arc((x - 8, 17, x + 8, 42), 210, 330, fill=accent, width=2)
        for y in [48, 55, 63]:
            draw.line((34, y, 47, y + 2), fill=accent, width=2)
            draw.line((82, y + 1, 94, y - 1), fill=accent, width=2)
    if cat == "vendor":
        draw.rectangle((58, 70, 104, 96), fill=rgba("#315f39"), outline=rgba("#5a2a14"))
        draw.rectangle((58, 24, 83, 31), fill=rgba("#b82c22"), outline=rgba("#5a2a14"))
        draw.rectangle((101, 53, 111, 91), fill=rgba("#8d4f24"), outline=rgba("#5a2a14"))
        for y in [59, 70, 81]:
            ellipse(draw, (105, y, 111, y + 6), rgba("#b56a25"), "#5a2a14")
    if cat == "monk":
        draw_bead_loop(draw, 64, 62, 20, "#a65b18")
    else:
        if action != "lie":
            draw_bead_loop(draw, 62, 68, 18, "#9b5622")

    draw_cat_face(draw, face_c[0], face_c[1], s, action, cat == "vendor")
    return scale_pixel(img, 3, (384, 341))


def bead_color(bead: str, variant: str, stage: int, index: int) -> tuple[int, int, int]:
    t = stage / 4
    if bead == "bodhi-root":
        if variant == "duobao":
            palette = [(239, 220, 181), (184, 106, 54), (99, 142, 99), (169, 83, 76), (79, 121, 145)]
            base = palette[index % len(palette)]
            return mix(base, (142, 82, 40), t * 0.35)
        if variant == "gradient":
            base = mix((246, 226, 189), (190, 118, 58), index / 23)
            return mix(base, (150, 84, 38), t * 0.45)
        return mix((246, 229, 196), (181, 103, 51), t)
    if bead == "monkey-head":
        return mix((177, 92, 43), (124, 55, 32), t)
    if bead == "xingyue":
        return mix((236, 219, 175), (196, 156, 96), t)
    return mix((134, 92, 52), (82, 48, 32), t)


def draw_bracelet(bead: str, variant: str, stage: int) -> Image.Image:
    img = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = 128, 118
    rx, ry = 70, 61
    for i in range(24):
        a = math.tau * i / 24 - math.pi / 2
        x = cx + math.cos(a) * rx
        y = cy + math.sin(a) * ry
        r = 11 if i % 3 else 12
        color = bead_color(bead, variant, stage, i)
        ellipse(draw, (x - r, y - r, x + r, y + r), (*color, 255), "#5a2a14", 2)
        draw.ellipse((x - r + 4, y - r + 4, x - r + 8, y - r + 8), fill=rgba("#fff1a5", 180))
        if bead == "xingyue":
            draw.point((round(x + 2), round(y - 3)), fill=rgba("#4c3222"))
        if bead == "vajra":
            draw.line((x - 5, y, x + 5, y), fill=rgba("#5b321c"), width=1)
            draw.line((x, y - 5, x, y + 5), fill=rgba("#5b321c"), width=1)
    draw.rectangle((116, 178, 140, 190), fill=rgba("#ba8a42"), outline=rgba("#5a2a14"))
    draw.line((128, 188, 128, 224), fill=rgba("#8c1d18"), width=5)
    draw.rectangle((120, 218, 136, 232), fill=rgba("#cf3c26"), outline=rgba("#5a2a14"))
    return scale_pixel(img, 2, (512, 512))


def draw_station() -> Image.Image:
    img = Image.new("RGBA", (384, 220), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((21, 65, 363, 178), radius=15, fill=rgba("#8d5427"), outline=rgba("#4f2812"), width=3)
    draw.rounded_rectangle((48, 74, 336, 148), radius=8, fill=rgba("#587c59"), outline=rgba("#c6a95a"), width=2)
    draw.ellipse((130, 78, 244, 152), fill=rgba("#c29458"), outline=rgba("#563018"), width=3)
    draw.ellipse((149, 91, 225, 139), fill=rgba("#7e4b2b"), outline=rgba("#563018"), width=2)
    draw.ellipse((40, 97, 84, 132), fill=rgba("#94721e"), outline=rgba("#4f2812"), width=2)
    draw.line((62, 55, 62, 108), fill=rgba("#663514"), width=2)
    for x, y in [(24, 156), (340, 156), (62, 154), (302, 154)]:
        draw.rounded_rectangle((x, y, x + 27, y + 48), radius=9, fill=rgba("#6e3b1f"), outline=rgba("#3e1f0f"), width=2)
    for x in [93, 108, 291, 309, 326]:
        ellipse(draw, (x, 129, x + 16, 145), rgba("#b56a26"), "#4f2812")
    draw.rounded_rectangle((279, 75, 342, 123), radius=4, fill=rgba("#e6d4a0"), outline=rgba("#6c3a1c"), width=2)
    draw.line((287, 87, 331, 84), fill=rgba("#9a7c4a"), width=1)
    draw.line((287, 99, 327, 104), fill=rgba("#9a7c4a"), width=1)
    return scale_pixel(img, 2, (768, 440))


def draw_decor(kind: str) -> Image.Image:
    img = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    wood = rgba("#9a5b2c")
    dark = rgba("#5a2a14")
    if kind == "cat-tree":
        for x in [52, 95]:
            draw.rounded_rectangle((x, 50, x + 14, 137), radius=5, fill=wood, outline=dark, width=2)
        draw.rounded_rectangle((35, 121, 122, 143), radius=5, fill=wood, outline=dark, width=2)
        for box in [(28, 45, 88, 70), (76, 25, 137, 52), (45, 82, 120, 108)]:
            draw.rounded_rectangle(box, radius=8, fill=rgba("#c18348"), outline=dark, width=2)
    elif kind == "cat-bed":
        draw.ellipse((31, 65, 132, 128), fill=rgba("#b62f2d"), outline=dark, width=3)
        draw.ellipse((43, 55, 120, 106), fill=rgba("#f3dfb0"), outline=rgba("#8d6c3b"), width=2)
    elif kind == "scratch-post":
        draw.rounded_rectangle((70, 30, 91, 132), radius=7, fill=rgba("#c8a062"), outline=dark, width=2)
        for y in range(40, 124, 12):
            draw.line((70, y, 91, y + 5), fill=rgba("#80512c"), width=2)
        draw.rounded_rectangle((43, 128, 118, 146), radius=5, fill=wood, outline=dark, width=2)
    elif kind == "window-perch":
        draw.rectangle((31, 25, 126, 88), fill=rgba("#c08449"), outline=dark, width=3)
        draw.rectangle((39, 33, 118, 80), fill=rgba("#d8f1dd"), outline=rgba("#80512c"), width=2)
        draw.line((78, 33, 78, 80), fill=rgba("#80512c"), width=2)
        draw.rounded_rectangle((27, 82, 132, 123), radius=7, fill=rgba("#f1d7a3"), outline=dark, width=2)
        draw.ellipse((104, 54, 142, 94), fill=rgba("#6fa864"), outline=dark, width=2)
    elif kind == "toy-basket":
        draw.rounded_rectangle((36, 80, 125, 135), radius=9, fill=rgba("#b76a31"), outline=dark, width=3)
        for x in [52, 75, 99]:
            draw.line((x, 82, x + 6, 132), fill=rgba("#70411f"), width=2)
        for x, y, c in [(49, 64, "#e66b4f"), (79, 57, "#f0c24c"), (105, 66, "#63aa76")]:
            ellipse(draw, (x, y, x + 26, y + 26), rgba(c), "#5a2a14")
    else:
        draw.rounded_rectangle((32, 37, 130, 135), radius=6, fill=wood, outline=dark, width=3)
        for y in [68, 101]:
            draw.line((34, y, 128, y), fill=dark, width=2)
        for x in [64, 98]:
            draw.line((x, 39, x, 134), fill=dark, width=2)
        for x, y in [(43, 47), (78, 77), (111, 111)]:
            ellipse(draw, (x, y, x + 18, y + 18), rgba("#c67a2f"), "#5a2a14")
    return scale_pixel(img, 2, (320, 320))


def draw_icon(kind: str) -> Image.Image:
    img = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    if kind == "token":
        ellipse(draw, (16, 16, 80, 80), rgba("#df9d2f"), "#5a2a14", 4)
        ellipse(draw, (30, 30, 66, 66), rgba("#ffd76b"), "#9a5b2c", 2)
        draw.text((42, 31), "禅", font=font(22), fill=rgba("#7a3d18"))
    elif kind == "incense":
        draw.rounded_rectangle((23, 63, 73, 79), radius=8, fill=rgba("#9a5b2c"), outline=rgba("#5a2a14"), width=3)
        for x in [36, 48, 60]:
            draw.line((x, 20, x, 65), fill=rgba("#7b3818"), width=4)
            draw.arc((x - 10, 5, x + 10, 35), 250, 80, fill=rgba("#f1e3b2"), width=3)
    elif kind == "jade":
        ellipse(draw, (20, 19, 76, 75), rgba("#729190"), "#31444a", 4)
        draw.arc((32, 31, 63, 63), 30, 300, fill=rgba("#d6f0e7"), width=3)
        draw.ellipse((30, 29, 43, 42), fill=rgba("#fff8d9"))
    elif kind == "arrow":
        poly(draw, [(48, 11), (77, 46), (61, 46), (61, 78), (35, 78), (35, 46), (19, 46)], rgba("#57c982"), "#166a55")
    elif kind == "sparkle":
        poly(draw, [(48, 7), (58, 37), (89, 48), (58, 58), (48, 89), (38, 58), (7, 48), (38, 37)], rgba("#ffe36f"), "#8d4f24")
    elif kind == "lock":
        draw.rounded_rectangle((23, 40, 74, 82), radius=7, fill=rgba("#e2a236"), outline=rgba("#5a2a14"), width=4)
        draw.arc((32, 16, 66, 54), 180, 360, fill=rgba("#5a2a14"), width=7)
        ellipse(draw, (43, 56, 53, 67), rgba("#5a2a14"), "#5a2a14")
    else:
        draw.rounded_rectangle((8, 8, 88, 88), radius=8, fill=rgba("#b46b32"), outline=rgba("#5a2a14"), width=4)
        draw.ellipse((58, 12, 82, 36), fill=rgba("#54b879"), outline=rgba("#176a55"), width=2)
    return img


def draw_logo() -> Image.Image:
    img = Image.new("RGBA", (640, 140), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((8, 18, 620, 122), radius=18, fill=rgba("#fff0b9"), outline=rgba("#5a2a14"), width=5)
    ellipse(draw, (24, 40, 94, 110), rgba("#f39a2b"), "#5a2a14", 3)
    draw_bead_loop(draw, 60, 79, 20, "#9b5622")
    draw.text((120, 34), "猫猫盘珠日记", font=font(46), fill=rgba("#4d2512"))
    draw.text((125, 91), "放置养串 · 猫咪作伴", font=font(22, False), fill=rgba("#176a55"))
    return img


def main() -> None:
    ensure_dirs()
    manifest: dict[str, list[str]] = {}

    for cat in CAT_STYLE:
        for action in ["sit", "jump", "lie"]:
            path = OUT / "cats" / f"{cat}-{action}.png"
            save(draw_cat(cat, action), path)
            manifest.setdefault("cats", []).append(path.relative_to(ROOT).as_posix())

    variants = {"bodhi-root": ["pure", "gradient", "duobao"], "monkey-head": ["default"], "xingyue": ["default"], "vajra": ["default"]}
    for bead, bead_variants in variants.items():
        for variant in bead_variants:
            for stage in range(5):
                path = OUT / "bracelets" / f"{bead}-{variant}-{stage}.png"
                save(draw_bracelet(bead, variant, stage), path)
                manifest.setdefault("bracelets", []).append(path.relative_to(ROOT).as_posix())

    for decor in ["cat-tree", "cat-bed", "scratch-post", "window-perch", "toy-basket", "display-shelf"]:
        path = OUT / "decor" / f"{decor}.png"
        save(draw_decor(decor), path)
        manifest.setdefault("decor", []).append(path.relative_to(ROOT).as_posix())

    for icon in ["token", "incense", "jade", "arrow", "sparkle", "lock", "panel-corner"]:
        path = OUT / "ui" / f"{icon}.png"
        save(draw_icon(icon), path)
        manifest.setdefault("ui", []).append(path.relative_to(ROOT).as_posix())

    save(draw_station(), OUT / "station" / "bead-station.png")
    save(draw_logo(), OUT / "ui" / "game-logo.png")
    manifest.setdefault("station", []).append("assets/art/v2/station/bead-station.png")
    manifest.setdefault("ui", []).append("assets/art/v2/ui/game-logo.png")

    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generated {sum(len(v) for v in manifest.values())} standalone assets under {OUT}")


if __name__ == "__main__":
    main()
