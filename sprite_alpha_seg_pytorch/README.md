# Sprite Alpha Segmentation with PyTorch

这是一个用于学习和实战的最小 PyTorch 项目：训练一个二分类 U-Net，把 sprite / 猫 / 角色从背景中分割出来，并导出透明背景 PNG。

## 1. 环境安装

建议先创建虚拟环境：

```bash
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS/Linux/WSL
source .venv/bin/activate

pip install -r requirements.txt
```

如果你有 NVIDIA GPU，建议到 PyTorch 官网根据你的 CUDA 版本选择安装命令。

## 2. 数据格式

训练需要 image-mask 成对数据：

```text
data/train/images/cat_001.png   # RGB 输入图，有背景
data/train/masks/cat_001.png    # 单通道 mask，白色=前景，黑色=背景
```

文件名 stem 必须一致，例如 `cat_001.png` 对应 `cat_001.png`。

## 3. 从已有透明 PNG 自动生成训练集

如果你已经有一批透明背景 sprite，可以合成随机背景训练图：

```bash
python tools/make_dataset_from_rgba.py \
  --input assets_transparent \
  --out data/train \
  --copies 20 \
  --size 256
```

这样会生成：

```text
data/train/images/*.png
data/train/masks/*.png
```

## 4. 训练模型

```bash
python train.py \
  --images data/train/images \
  --masks data/train/masks \
  --out checkpoints/unet_sprite.pt \
  --epochs 30 \
  --batch-size 8 \
  --size 256
```

训练后会保存验证集 loss 最低的模型。

## 5. 对 spritesheet / 普通图片抠背景并裁剪

```bash
python infer_spritesheet.py \
  --checkpoint checkpoints/unet_sprite.pt \
  --input your_spritesheet.png \
  --out-dir outputs \
  --size 256 \
  --threshold 0.5 \
  --padding 4 \
  --min-area 30 \
  --fixed-canvas 64
```

输出：

```text
outputs/frame_001.png
outputs/frame_002.png
...
outputs/debug_mask.png
```

`--fixed-canvas 64` 会把每个裁剪结果放到 64×64 透明画布中，适合游戏素材保持统一尺寸。

## 6. 使用建议

- 如果你的目标是像素猫 sprite，训练图不要只用白底/绿底，要合成多种背景。
- 如果模型把耳朵、尾巴抠断，降低 `--threshold`，比如 0.35。
- 如果边缘有背景残留，提高 `--threshold`，比如 0.6，并增加训练样本。
- 游戏素材最终不要只裁到最小外接框，最好输出固定画布，例如 64×64 或 128×128。
- spritesheet 如果是规则网格，实际项目里更推荐先按网格切帧，再逐帧抠背景；如果每帧之间有明显空隙，可以直接用当前脚本的连通域切割。

## 7. 推荐学习顺序

1. 先跑通 `make_dataset_from_rgba.py`，理解 mask 是什么。
2. 再看 `src/model_unet.py`，理解 U-Net 输入 RGB，输出 1 通道 logits。
3. 再看 `train.py`，理解 Dataset、DataLoader、loss、optimizer、checkpoint。
4. 最后看 `infer_spritesheet.py`，理解深度学习输出 mask 后，为什么还需要后处理。
