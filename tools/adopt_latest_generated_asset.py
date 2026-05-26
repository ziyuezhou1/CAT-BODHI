from __future__ import annotations

import argparse
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATED_ROOT = Path("C:/Users/ziyue/.codex/generated_images")
CHROMA_HELPER = Path("C:/Users/ziyue/.codex/skills/.system/imagegen/scripts/remove_chroma_key.py")


def latest_generated_png() -> Path:
    files = sorted(GENERATED_ROOT.rglob("*.png"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not files:
        raise SystemExit("No generated PNG found under Codex generated_images.")
    return files[0]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", required=True, help="Source key filename slug.")
    parser.add_argument("--out", required=True, help="Workspace output PNG path after chroma removal.")
    parser.add_argument("--threshold", default="12")
    parser.add_argument("--opaque", default="220")
    args = parser.parse_args()

    latest = latest_generated_png()
    source_dir = ROOT / "assets" / "art" / "v3" / "source"
    source_dir.mkdir(parents=True, exist_ok=True)
    source_path = source_dir / f"{args.slug}-key.png"
    source_path.write_bytes(latest.read_bytes())

    out = ROOT / args.out
    out.parent.mkdir(parents=True, exist_ok=True)
    out.unlink(missing_ok=True)
    subprocess.run(
        [
            "python",
            str(CHROMA_HELPER),
            "--input",
            str(source_path),
            "--out",
            str(out),
            "--auto-key",
            "border",
            "--soft-matte",
            "--transparent-threshold",
            args.threshold,
            "--opaque-threshold",
            args.opaque,
            "--despill",
            "--edge-contract",
            "1",
        ],
        check=True,
        cwd=ROOT,
    )
    print(f"adopted {latest} -> {source_path} -> {out}")


if __name__ == "__main__":
    main()
