from pathlib import Path
from typing import Callable, Optional
import random

import numpy as np
from PIL import Image
import torch
from torch.utils.data import Dataset


class SpriteSegDataset(Dataset):
    def __init__(
        self,
        images_dir: str,
        masks_dir: str,
        size: int = 256,
        augment: bool = False,
    ):
        self.images_dir = Path(images_dir)
        self.masks_dir = Path(masks_dir)
        self.size = size
        self.augment = augment

        self.image_paths = sorted([p for p in self.images_dir.iterdir() if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}])
        if not self.image_paths:
            raise FileNotFoundError(f"No images found in {self.images_dir}")

        missing = []
        for p in self.image_paths:
            mask_path = self._mask_path_for(p)
            if not mask_path.exists():
                missing.append(mask_path.name)
        if missing:
            raise FileNotFoundError(f"Missing masks: {missing[:5]} ... total={len(missing)}")

    def _mask_path_for(self, image_path: Path) -> Path:
        # Prefer same extension; fall back to .png
        same_ext = self.masks_dir / image_path.name
        if same_ext.exists():
            return same_ext
        return self.masks_dir / f"{image_path.stem}.png"

    def __len__(self) -> int:
        return len(self.image_paths)

    def __getitem__(self, idx: int):
        img_path = self.image_paths[idx]
        mask_path = self._mask_path_for(img_path)

        image = Image.open(img_path).convert("RGB").resize((self.size, self.size), Image.Resampling.BILINEAR)
        mask = Image.open(mask_path).convert("L").resize((self.size, self.size), Image.Resampling.NEAREST)

        if self.augment:
            if random.random() < 0.5:
                image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
                mask = mask.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            if random.random() < 0.5:
                image = image.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
                mask = mask.transpose(Image.Transpose.FLIP_TOP_BOTTOM)

        image_arr = np.asarray(image, dtype=np.float32) / 255.0
        mask_arr = (np.asarray(mask, dtype=np.float32) > 127).astype(np.float32)

        # HWC -> CHW
        image_tensor = torch.from_numpy(image_arr).permute(2, 0, 1)
        mask_tensor = torch.from_numpy(mask_arr).unsqueeze(0)
        return image_tensor, mask_tensor
