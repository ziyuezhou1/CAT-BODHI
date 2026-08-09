# Repository Guidelines

## Project Overview

CAT-BODHI is a Chinese pixel-art idle game currently titled **猫猫盘珠日记** in the live UI. The core game is a no-build, framework-free browser application. Players collect cats and bracelets, accumulate zen, develop bracelet patina, decorate a room, and earn prestige currency.

An optional Node/Python service supports custom sprites: users generate a green-screen image externally, upload it, and receive segmented game-ready assets. Static play does not require this service.

## Architecture & Data Flow

### Browser game

- `index.html` is the fixed application shell and loads `game.js` as a classic script, not an ES module.
- `game.js` contains the complete client: content registries, mutable game state, migrations, economy calculations, rendering, event handling, persistence, and the animation loop.
- `styles.css` is the presentation contract. JavaScript depends on its IDs, `data-*` attributes, state classes (`active`, `locked`, `show`, `has-upgrade`), body theme classes, and CSS custom properties.
- Startup is `loadState()` → `bindEvents()` → `render()` → `requestAnimationFrame(tick)`.
- Gameplay actions follow: guard/validate → calculate or spend → mutate `state` → user feedback → `render()` or HUD update → autosave/localStorage.
- Durable state is the module-global `state` stored under `cat-bead-idle-save-v1`. Transient animation and drag state stays outside the save object. New persistent fields must be added to defaults and all load/import normalization paths.
- The hot animation loop updates production, care, patina, cat motion, HUD, and a five-second autosave. Full panel rerenders are reserved for structural mutations.

### Custom sprite path

```text
Browser upload
  -> POST /api/sprite-import (`server.mjs`)
  -> `tools/process_sprite_upload.py`
  -> hybrid chroma/U-Net helpers in `sprite_alpha_seg_pytorch/`
  -> per-job `frame_*.png`
  -> `assets/ai/cats/` or `assets/ai/beads/`
  -> asset paths returned to `game.js`, normalized, saved, and rendered
```

Cat components are positional and must remain ordered `sit` → `jump` → `lie`; beads use the first frame. `GET /api/sprite-status` reports processor prerequisites and LAN URLs. `server.mjs` still exposes `/api/ai-design`, but the current UI does not call it; the supported UI workflow is external generation plus `/api/sprite-import`.

## Key Directories

- `assets/art/v3/`: built-in runtime art. Live code references v3 paths directly; manifests are not runtime selectors.
- `assets/ai/{cats,beads}/`: server-created custom assets. This directory is not gitignored; review generated files before committing.
- `tools/`: sprite upload integration and manual asset/deployment utilities.
- `sprite_alpha_seg_pytorch/`: bundled U-Net model, training/inference CLIs, checkpoint, and Python requirements.
- `sprite_alpha_seg_pytorch/src/`: dataset, BCE/Dice loss, and U-Net modules.
- `tmp/`: retained manual QA inputs and outputs, not an executable test suite.

## Development Commands

Run web commands from the repository root:

```bash
# Static frontend only; sprite API unavailable
npx serve .
# or
python -m http.server 8080

# Node static server plus sprite APIs
npm run dev:ai
# Exact alias
npm run dev

# Honor HTTP(S) proxy environment variables in Node
npm run dev:ai:proxy
```

Open `http://localhost:8080`. On Windows, `start-local-ai.bat` checks for Node and runs `npm run dev:ai`.

Set up the model from `sprite_alpha_seg_pytorch/`:

```bash
python -m venv .venv
# PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux/WSL: source .venv/bin/activate
pip install -r requirements.txt
```

Documented model operations, also from `sprite_alpha_seg_pytorch/`:

```bash
python train.py --images data/train/images --masks data/train/masks --out checkpoints/unet_sprite.pt --epochs 30 --batch-size 8 --size 256
python infer_spritesheet.py --checkpoint checkpoints/unet_sprite.pt --input your_spritesheet.png --out-dir outputs --size 256 --threshold 0.5 --padding 4 --min-area 30 --fixed-canvas 64
```

There is no repository-defined build, lint, format, type-check, or automated test command. Do not invent one or claim `npm test` works.

## Code Conventions & Common Patterns

### JavaScript and browser code

- Use two-space indentation, semicolons, `const`/`let`, lower camel case for functions/values, and `UPPER_SNAKE_CASE` for fixed service constants.
- Preserve the data-first registry pattern in `game.js` (`BALANCE`, `cats`, `beads`, `decorations`, `wishes`, `pawTalents`, `gameThemes`). Content uses stable string IDs; add registry data and matching asset/CSS behavior rather than introducing classes.
- Use `allCats(current)` and `allBeads(current)` so custom entities are included. Do not assume only built-in content exists.
- Calculation helpers commonly accept `current = state`; preserve this lightweight dependency-injection seam for migrations and candidate-state calculations.
- Mutations normally use guard → compute/spend → mutate → toast/status → render. Use `spendZen()` for insufficient-funds handling. Destructive actions require confirmation and must remove all related state.
- Centralize fixed DOM references in `elements`. Use direct listeners for fixed controls and delegated `data-*` actions for generated cards.
- Escape user-controlled values before `innerHTML`; prefer `textContent` for plain labels.
- Client async flows use `async`/`await`, disable the initiating control, check `response.ok`, convert errors to Chinese UI text, and restore controls in `finally`.
- User-visible UI and errors are Chinese; identifiers and most comments are English.

### Server and Python code

- `server.mjs` uses native `node:http` and Node built-ins—no Express, router, dotenv, or DI container. Route handlers catch their own errors and return JSON with an appropriate status.
- Shell environment variables override root `.env`; optional files fail soft, while required model paths are reported by `/api/sprite-status`.
- Python uses four-space indentation, snake_case functions, PascalCase classes, `pathlib.Path`, `argparse` entry points, and modern type hints.
- Keep the Node/Python API boundary stable: input image data URL, per-job output directory, numbered frames, and returned `assetPath`/`actionImages` fields.

## Important Files

- `index.html`: browser entry point and stable DOM shell.
- `game.js`: client state schema, migrations, calculations, UI, sprite integration, and RAF loop.
- `styles.css`: global visual system, responsive layout, animation states, and themes.
- `server.mjs`: static server; `/api/sprite-status`, `/api/sprite-import`, and retained `/api/ai-design` routes.
- `package.json`: only the three Node run scripts; no dependencies or QA scripts.
- `tools/process_sprite_upload.py`: production upload adapter invoked by Node.
- `sprite_alpha_seg_pytorch/infer_spritesheet_hybrid.py`: production chroma/U-Net segmentation helpers.
- `sprite_alpha_seg_pytorch/src/model_unet.py`: model definition shared by training and inference.
- `sprite_alpha_seg_pytorch/checkpoints/unet_sprite_ft.pt`: default runtime checkpoint.
- `sprite_alpha_seg_pytorch/requirements.txt`: unpinned Python dependencies.
- `README.md` and `sprite_alpha_seg_pytorch/README.md`: operator guidance; see caveats below.

## Runtime/Tooling Preferences

- Use npm scripts and Node for the server. Do not substitute Bun: the manifest calls `node`, and proxy mode depends on Node's `--use-env-proxy` flag.
- No Node version, package-manager version, dependencies, or lockfile is pinned. The server requires a Node runtime with global `fetch`, `FormData`, and `Blob`; no `npm install` is needed for its built-in imports.
- Python dependencies are `torch`, `torchvision`, `pillow`, `numpy`, `opencv-python`, and `tqdm`. The upload processor uses Python 3.10-style union annotations. CUDA is optional; scripts fall back to CPU.
- Root `.env` is optional and ignored. Key sprite overrides are `PORT`, `SPRITE_SEG_ROOT`, `SPRITE_SEG_PYTHON`/`PYTHON`, `SPRITE_SEG_CHECKPOINT`, `SPRITE_SEG_OUT_DIR`, and `SPRITE_UPLOAD_PROCESSOR`.
- If `D:\sprite_alpha_seg_pytorch` exists, it takes precedence over the bundled model root; otherwise `./sprite_alpha_seg_pytorch` is used. Prefer explicit environment overrides in portable work.
- `tools/process_v3_assets.py` is a manual current-art processor, not a build step. `tools/generate_v2_assets.py` targets legacy, unused v2 art. `tools/adopt_latest_generated_asset.py` and the SeaweedFS PowerShell uploader contain machine-specific defaults; inspect them before use.
- Generated model outputs, training data, virtual environments, `.env`, and logs are ignored. Checkpoints and `assets/ai/` are not generally ignored.

## Testing & QA

- No automated test framework, CI workflow, coverage tool, or coverage threshold exists. `tmp/` contains historical manual artifacts only.
- Frontend changes: run a local server, exercise the changed path in a browser, verify persistence/reload behavior when state changes, and check responsive/pointer behavior when relevant.
- Integrated sprite changes: run `npm run dev:ai`, confirm `GET /api/sprite-status`, upload a representative green-screen image to `/api/sprite-import`, and verify returned assets plus `sit`/`jump`/`lie` ordering.
- Static-only servers cannot validate sprite APIs. Mobile/LAN checks require opening the printed LAN URL on the same Wi-Fi; GitHub Pages cannot call a phone/PC-local HTTP service reliably.
- Training's validation-loss loop is model training QA, not a repository test suite.
- Known documentation traps: `sprite_alpha_seg_pytorch/README.md` references missing `tools/make_dataset_from_rgba.py`; runtime uses `unet_sprite_ft.pt`, while training examples output `unet_sprite.pt`; root README product naming lags the live UI.
