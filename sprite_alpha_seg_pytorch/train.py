import argparse
from pathlib import Path

import torch
from torch.utils.data import DataLoader, random_split
from tqdm import tqdm

from src.dataset import SpriteSegDataset
from src.losses import bce_dice_loss
from src.model_unet import UNet


def train_one_epoch(model, loader, optimizer, device):
    model.train()
    total = 0.0
    for images, masks in tqdm(loader, desc="train", leave=False):
        images = images.to(device)
        masks = masks.to(device)

        optimizer.zero_grad(set_to_none=True)
        logits = model(images)
        loss = bce_dice_loss(logits, masks)
        loss.backward()
        optimizer.step()
        total += loss.item() * images.size(0)
    return total / len(loader.dataset)


@torch.no_grad()
def validate(model, loader, device):
    model.eval()
    total = 0.0
    for images, masks in tqdm(loader, desc="val", leave=False):
        images = images.to(device)
        masks = masks.to(device)
        logits = model(images)
        loss = bce_dice_loss(logits, masks)
        total += loss.item() * images.size(0)
    return total / len(loader.dataset)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--images", required=True, help="training images directory")
    parser.add_argument("--masks", required=True, help="training masks directory")
    parser.add_argument("--out", default="checkpoints/unet_sprite.pt")
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--size", type=int, default=256)
    parser.add_argument("--val-split", type=float, default=0.2)
    parser.add_argument("--base-channels", type=int, default=32)
    parser.add_argument("--device", default="cuda" if torch.cuda.is_available() else "cpu")
    parser.add_argument("--resume", default=None, help="Resume from checkpoint for fine-tuning")
    args = parser.parse_args()

    device = torch.device(args.device)
    dataset = SpriteSegDataset(args.images, args.masks, size=args.size, augment=True)

    val_len = max(1, int(len(dataset) * args.val_split))
    train_len = len(dataset) - val_len
    train_ds, val_ds = random_split(dataset, [train_len, val_len], generator=torch.Generator().manual_seed(42))

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=0)

    model = UNet(base_channels=args.base_channels).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr)

    start_epoch = 1
    if args.resume:
        ckpt = torch.load(args.resume, map_location=device)
        model.load_state_dict(ckpt["model_state"])
        print(f"Loaded checkpoint from {args.resume} (val_loss={ckpt.get('val_loss', 'N/A')})")

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    best_val = float("inf")
    for epoch in range(1, args.epochs + 1):
        train_loss = train_one_epoch(model, train_loader, optimizer, device)
        val_loss = validate(model, val_loader, device)
        print(f"epoch {epoch:03d} | train_loss={train_loss:.4f} | val_loss={val_loss:.4f}")

        if val_loss < best_val:
            best_val = val_loss
            torch.save(
                {
                    "model_state": model.state_dict(),
                    "size": args.size,
                    "base_channels": args.base_channels,
                    "val_loss": val_loss,
                },
                out_path,
            )
            print(f"saved best checkpoint to {out_path}")


if __name__ == "__main__":
    main()
