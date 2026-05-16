const SAVE_KEY = "cat-bead-idle-save-v1";

const bgmTracks = [
  "assets/audio/bodhi-cat-shop.mp3",
  "assets/audio/bodhi-cat-shop-alt.mp3",
];

const BALANCE = {
  version: 3,
  upgradePaceMinutes: [
    0.35, 0.65, 1, 1.5, 2.2, 3.2, 4.8, 7, 10, 14,
    19, 25, 32, 41, 52, 66, 82, 102, 126, 155,
  ],
  latePaceGrowth: 1.16,
  pricingTapRate: 0.16,
  pricingFloor: 0.22,
  duplicateCatBonus: 0.055,
  braceletPassiveGrowth: 1.14,
  braceletTapGrowth: 1.22,
  uniqueCatBonus: 0.05,
  pawBonus: 0.035,
  beadOwnedBonus: 0.12,
  beadArchiveBonus: 0.045,
  activeGrowingBonus: 1.62,
  activeGrowingFinishBonus: 0.52,
  completedBraceletFocus: 0.72,
  patinaSeconds: 3600,
  polishPatinaBoost: 2.5,
};

const cats = [
  {
    id: "tabby",
    name: "橘串师",
    sprite: "tabby",
    baseCost: 24,
    paceWeight: 0.72,
    pps: 0.72,
    unlock: 0,
  },
  {
    id: "sleepy",
    name: "白团守垫",
    sprite: "sleepy",
    baseCost: 150,
    paceWeight: 0.92,
    pps: 3.6,
    unlock: 260,
  },
  {
    id: "monk",
    name: "黑禅猫",
    sprite: "monk",
    baseCost: 1800,
    paceWeight: 1.18,
    pps: 18,
    unlock: 2800,
  },
  {
    id: "vendor",
    name: "三花掌柜",
    sprite: "vendor",
    baseCost: 18000,
    paceWeight: 1.38,
    pps: 90,
    unlock: 30000,
  },
];

const beads = [
  { id: "bodhi-root", name: "菩提根", sprite: "bodhi-root", threshold: 0, multiplier: 1, addBaseCost: 36, paceWeight: 0.54, note: "纯色/渐变/多宝随机" },
  { id: "monkey-head", name: "猴头", sprite: "monkey-head", threshold: 6500, multiplier: 1.65, addBaseCost: 980, paceWeight: 0.82, note: "核纹红润" },
  { id: "xingyue", name: "星月菩提", sprite: "xingyue", threshold: 75000, multiplier: 2.8, addBaseCost: 9800, paceWeight: 1.08, note: "星点月眼" },
  { id: "vajra", name: "小金刚", sprite: "vajra", threshold: 650000, multiplier: 4.6, addBaseCost: 85000, paceWeight: 1.32, note: "深纹金刚" },
];

const bodhiVariants = [
  { id: "pure", name: "纯色" },
  { id: "gradient", name: "渐变" },
  { id: "duobao", name: "多宝" },
];

const defaultVariant = { id: "default", name: "标准" };

const beadIdMigration = {
  wood: "bodhi-root",
  moon: "monkey-head",
  incense: "xingyue",
  paw: "vajra",
};

const decorations = [
  {
    id: "cat-tree",
    name: "猫爬架",
    sprite: "cat-tree",
    baseCost: 22,
    paceWeight: 0.76,
    unlock: 0,
    maxLevel: 12,
    effect: "catMult",
    value: 0.16,
    note: "猫息 +16%/级",
  },
  {
    id: "cat-bed",
    name: "猫窝",
    sprite: "cat-bed",
    baseCost: 90,
    paceWeight: 0.8,
    unlock: 120,
    maxLevel: 12,
    effect: "flatPps",
    value: 0.55,
    note: "安睡猫息 +0.55/s/级",
  },
  {
    id: "scratch-post",
    name: "抓抓柱",
    sprite: "scratch-post",
    baseCost: 480,
    paceWeight: 0.92,
    unlock: 800,
    maxLevel: 10,
    effect: "tapMult",
    value: 0.2,
    note: "盘珠 +20%/级",
  },
  {
    id: "window-perch",
    name: "窗台软垫",
    sprite: "window-perch",
    baseCost: 2500,
    paceWeight: 1.04,
    unlock: 3500,
    maxLevel: 10,
    effect: "catMult",
    value: 0.22,
    note: "猫息 +22%/级",
  },
  {
    id: "toy-basket",
    name: "玩具篮",
    sprite: "toy-basket",
    baseCost: 12000,
    paceWeight: 1.12,
    unlock: 18000,
    maxLevel: 8,
    effect: "tapMult",
    value: 0.28,
    note: "盘珠 +28%/级",
  },
  {
    id: "display-shelf",
    name: "文玩柜",
    sprite: "display-shelf",
    baseCost: 65000,
    paceWeight: 1.22,
    unlock: 80000,
    maxLevel: 8,
    effect: "allMult",
    value: 0.16,
    note: "全产出 +16%/级",
  },
];

const wishes = [
  { id: "tap80", label: "盘动八十次", goal: 80, reward: 1, value: (s) => s.taps },
  { id: "zen10k", label: "累计一万禅意", goal: 10000, reward: 1, value: (s) => s.totalZen },
  { id: "cats8", label: "结缘八只猫", goal: 8, reward: 2, value: (s) => totalCats(s) },
  { id: "decor5", label: "装饰五级", goal: 5, reward: 2, value: (s) => totalDecorationLevels(s) },
  { id: "level15", label: "手法十五级", goal: 15, reward: 2, value: (s) => s.braceletLevel },
  { id: "zen500k", label: "累计五十万禅意", goal: 500000, reward: 4, value: (s) => s.totalZen },
];

const pawTalents = [
  { id: "catBlessing", name: "招财肉垫", description: "猫息永久 +12%/级", cost: 1, costScale: 1.55, maxLevel: 10, effect: "catMult", value: 0.12 },
  { id: "quickPaws", name: "灵爪盘珠", description: "盘珠收益 +15%/级", cost: 1, costScale: 1.65, maxLevel: 8, effect: "tapMult", value: 0.15 },
  { id: "diaryLuck", name: "日记福气", description: "全部收益 +8%/级", cost: 2, costScale: 1.8, maxLevel: 6, effect: "allMult", value: 0.08 },
];

function makeBeadPiece(beadId, variant = "default", patina = 0) {
  return {
    id: `${beadId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    variant,
    patina,
    addedAt: Date.now(),
  };
}

function starterBeadCollections() {
  return {
    ...Object.fromEntries(beads.map((bead) => [bead.id, []])),
    "bodhi-root": [makeBeadPiece("bodhi-root", "pure", 0)],
  };
}

const defaultState = () => ({
  zen: 0,
  totalZen: 0,
  braceletLevel: 1,
  selectedBead: "bodhi-root",
  beadCollections: starterBeadCollections(),
  catCounts: { ...Object.fromEntries(cats.map((cat) => [cat.id, 0])), tabby: 1 },
  catPlacements: {},
  decorationLevels: Object.fromEntries(decorations.map((decor) => [decor.id, 0])),
  pawTalentLevels: Object.fromEntries(pawTalents.map((talent) => [talent.id, 0])),
  claimedWishes: {},
  paws: 0,
  taps: 0,
  bgmEnabled: true,
  tutorialSeen: false,
  balanceVersion: BALANCE.version,
  upgradePaceStep: 0,
  lastSaved: Date.now(),
});

let state = loadState();
let lastTick = performance.now();
let saveTimer = 0;
let panelsReady = false;
const catVisualState = new Map();
const catActivityCycle = ["sit", "lie", "walk", "play", "jump", "run"];
const catActivityWeights = [
  { activity: "sit", spriteAction: "sit", weight: 24, mood: "发呆" },
  { activity: "lie", spriteAction: "lie", weight: 21, mood: "趴着" },
  { activity: "walk", spriteAction: "sit", weight: 25, mood: "慢走" },
  { activity: "play", spriteAction: "jump", weight: 15, mood: "玩珠子" },
  { activity: "jump", spriteAction: "jump", weight: 10, mood: "开心跳" },
  { activity: "run", spriteAction: "sit", weight: 5, mood: "短跑" },
];
const catActivityZones = [
  { id: "pad-left", x: 5, minX: 3, maxX: 12, bottom: 2, scale: 1.08, z: 8, allowed: ["sit", "lie"] },
  { id: "floor-left", x: 17, minX: 10, maxX: 27, bottom: 4, scale: 0.98, z: 9, allowed: ["sit", "lie", "walk", "play"] },
  { id: "floor-mid", x: 34, minX: 25, maxX: 47, bottom: 3, scale: 1, z: 10, allowed: ["sit", "walk", "play", "jump"] },
  { id: "rug-front", x: 48, minX: 38, maxX: 60, bottom: 0, scale: 1.12, z: 12, allowed: ["sit", "lie", "walk", "run"] },
  { id: "floor-right", x: 63, minX: 53, maxX: 75, bottom: 5, scale: 0.98, z: 11, allowed: ["sit", "walk", "play", "jump"] },
  { id: "rack-right", x: 78, minX: 72, maxX: 88, bottom: 8, scale: 0.92, z: 9, allowed: ["sit", "lie", "play"] },
  { id: "window-back", x: 22, minX: 16, maxX: 30, bottom: 43, scale: 0.78, z: 5, allowed: ["sit", "lie"] },
  { id: "shelf-back", x: 86, minX: 80, maxX: 92, bottom: 38, scale: 0.8, z: 5, allowed: ["sit", "lie"] },
];
const guideSteps = [
  {
    title: "欢迎来到猫猫盘珠日记",
    text: "这是一款放置类游戏：核心不是一直盘串，而是把手串、猫咪和装饰养起来，让它们自己慢慢产出禅意。",
    hint: "新开局已经有一只橘串师在帮你产出；离开一会儿再回来升级，也是在玩。",
    target: ".stage",
  },
  {
    title: "手动盘串是加速",
    text: "按住桌上的手串，围着中心拖动旋转。手串转过一小段，会获得少量禅意并推进一点包浆。",
    hint: "手动盘串适合开局和差一点升级时补资源，长期收益主要来自放置产出。",
    target: "#altarBracelet",
  },
  {
    title: "攒够就升级手法",
    text: "升级手法会提高盘珠收益，也会带动自动产出变强。前期会很快给你连续升级反馈，后面再逐步拉长等待时间。",
    hint: "绿色按钮亮起来时，就可以升级手法；右侧感叹号代表也有养成项可以点。",
    target: "#upgradeBraceletButton",
  },
  {
    title: "右侧是主要养成",
    text: "猫缘能结缘更多猫咪，珠阶能添加现实文玩手串，装饰能升级房间里的摆件。",
    hint: "珠阶里新串 0-100% 包浆期间加成最高；满包浆后会变慢，适合继续添新串。",
    target: ".tabbar",
    tab: "cats",
  },
  {
    title: "装饰会进房间",
    text: "猫爬架、猫窝、抓抓柱等装饰升级后，会真的出现在房间场景里，同时提供不同类型的加成。",
    hint: "装饰页里灰色项目需要累计禅意达到门槛后才会解锁。",
    target: "[data-tab='decor']",
    tab: "decor",
  },
  {
    title: "看包浆和心愿",
    text: "包浆条显示当前手串养到哪里；心愿完成后给福爪，福爪能在心愿页兑换永久加成。",
    hint: "猫咪可以拖动摆放，也会自己走动换动作。出现感叹号时，说明那个养成项已经能升级。",
    target: ".progress-wrap",
    tab: "wishes",
  },
];
let catActionTimer = 0;
let catActionDelay = randomCatActionDelay();
let guideIndex = 0;
let guideOpen = false;
let braceletRotation = 0;
const polishingState = {
  active: false,
  pointerId: null,
  lastAngle: 0,
  progressDegrees: 0,
  moved: false,
};
const POLISH_STEP_DEGREES = 38;
const catDragState = {
  active: false,
  pointerId: null,
  element: null,
  key: "",
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetBottom: 0,
  moved: false,
};
let suppressNextCatClick = false;

const $ = (selector) => document.querySelector(selector);
const elements = {
  zenValue: $("#zenValue"),
  ppsValue: $("#ppsValue"),
  tapValue: $("#tapValue"),
  lifetimeValue: $("#lifetimeValue"),
  pawValue: $("#pawValue"),
  catCountValue: $("#catCountValue"),
  braceletName: $("#braceletName"),
  braceletLevel: $("#braceletLevel"),
  braceletStatus: $("#braceletStatus"),
  braceletCost: $("#braceletCost"),
  altarBracelet: $("#altarBracelet"),
  auraLabel: $("#auraLabel"),
  auraFill: $("#auraFill"),
  saveStatus: $("#saveStatus"),
  catShop: $("#catShop"),
  beadBoard: $("#beadBoard"),
  decorShop: $("#decorShop"),
  wishList: $("#wishList"),
  decorLayer: $("#decorLayer"),
  catLayer: $("#catLayer"),
  catGroupPanel: $("#catGroupPanel"),
  catGroupCloseButton: $("#catGroupCloseButton"),
  catGroupTitle: $("#catGroupTitle"),
  catGroupCount: $("#catGroupCount"),
  catGroupVisible: $("#catGroupVisible"),
  catGroupBonus: $("#catGroupBonus"),
  catGroupStatus: $("#catGroupStatus"),
  tapTarget: $("#tapTarget"),
  upgradeBraceletButton: $("#upgradeBraceletButton"),
  bgmButton: $("#bgmButton"),
  bgmLabel: $("#bgmLabel"),
  guideButton: $("#guideButton"),
  guideLayer: $("#guideLayer"),
  guideSpotlight: $("#guideSpotlight"),
  guideStepLabel: $("#guideStepLabel"),
  guideTitle: $("#guideTitle"),
  guideText: $("#guideText"),
  guideHint: $("#guideHint"),
  guideDots: $("#guideDots"),
  guideSkipButton: $("#guideSkipButton"),
  guidePrevButton: $("#guidePrevButton"),
  guideNextButton: $("#guideNextButton"),
  guideCloseButton: $("#guideCloseButton"),
  toastStack: $("#toastStack"),
  resetButton: $("#resetButton"),
};

const bgmAudio = new Audio(bgmTracks[0]);
bgmAudio.preload = "auto";
bgmAudio.volume = 0.38;
let bgmIndex = 0;
let bgmStarted = false;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    const merged = { ...defaultState(), ...saved };
    merged.beadCollections = {
      ...starterBeadCollections(),
      ...(saved?.beadCollections ?? {}),
    };
    merged.catCounts = { ...defaultState().catCounts, ...(saved?.catCounts ?? {}) };
    merged.catPlacements = { ...(saved?.catPlacements ?? {}) };
    merged.decorationLevels = { ...defaultState().decorationLevels, ...(saved?.decorationLevels ?? {}) };
    merged.pawTalentLevels = { ...defaultState().pawTalentLevels, ...(saved?.pawTalentLevels ?? {}) };
    merged.claimedWishes = { ...(saved?.claimedWishes ?? {}) };
    if (saved?.balanceVersion !== BALANCE.version || !Number.isFinite(saved?.upgradePaceStep)) {
      merged.upgradePaceStep = estimateUpgradePaceStep(merged);
      merged.balanceVersion = BALANCE.version;
    }
    merged.selectedBead = beadIdMigration[merged.selectedBead] ?? merged.selectedBead;
    if (!beads.some((bead) => bead.id === merged.selectedBead)) merged.selectedBead = "bodhi-root";
    ensureBeadCollections(merged);
    if (!beadCollection(merged.selectedBead, merged).length) merged.selectedBead = firstOwnedBeadId(merged);

    const elapsedSeconds = Math.max(0, Math.min(8 * 3600, (Date.now() - (merged.lastSaved ?? Date.now())) / 1000));
    if (elapsedSeconds > 15) {
      const offlineGain = productionPerSecond(merged) * elapsedSeconds * 0.65;
      if (offlineGain > 0) {
        merged.zen += offlineGain;
        merged.totalZen += offlineGain;
        requestAnimationFrame(() => toast(`离线收获 ${formatNumber(offlineGain)} 禅意`));
      }
      advanceActiveBraceletPatina(elapsedSeconds * 0.65, merged, false);
    }

    return merged;
  } catch {
    return defaultState();
  }
}

function saveState() {
  state.lastSaved = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  elements.saveStatus.textContent = `已存档 ${new Date().toLocaleTimeString("zh-Hans", { hour: "2-digit", minute: "2-digit" })}`;
}

function syncBgmButton() {
  elements.bgmButton.classList.toggle("off", !state.bgmEnabled);
  elements.bgmButton.setAttribute("aria-pressed", String(state.bgmEnabled));
  elements.bgmLabel.textContent = state.bgmEnabled ? (bgmStarted ? "音乐开" : "音乐待启") : "音乐关";
}

function loadBgmTrack(index) {
  bgmIndex = index % bgmTracks.length;
  bgmAudio.src = bgmTracks[bgmIndex];
  bgmAudio.load();
}

function playBgm() {
  if (!state.bgmEnabled) return;
  if (!bgmAudio.src) loadBgmTrack(bgmIndex);
  bgmAudio.play()
    .then(() => {
      bgmStarted = true;
      syncBgmButton();
    })
    .catch(() => {
      bgmStarted = false;
      syncBgmButton();
    });
}

function playNextBgm() {
  loadBgmTrack((bgmIndex + 1) % bgmTracks.length);
  playBgm();
}

function toggleBgm() {
  if (state.bgmEnabled && !bgmStarted) {
    playBgm();
    return;
  }

  state.bgmEnabled = !state.bgmEnabled;
  if (state.bgmEnabled) {
    playBgm();
  } else {
    bgmAudio.pause();
    bgmStarted = false;
  }
  saveState();
  syncBgmButton();
}

function startBgmAfterGesture(event) {
  if (event?.target?.closest?.("#bgmButton")) return;
  playBgm();
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "0";
  if (value < 1000) return value.toFixed(value < 100 ? 1 : 0).replace(/\.0$/, "");

  const units = ["", "万", "亿", "兆", "京", "垓"];
  let scaled = value;
  let index = 0;
  while (scaled >= 10000 && index < units.length - 1) {
    scaled /= 10000;
    index += 1;
  }

  if (index === 0) return Math.floor(value).toLocaleString("zh-Hans");
  const digits = scaled < 10 ? 2 : scaled < 100 ? 1 : 0;
  return `${scaled.toFixed(digits).replace(/\.0+$/, "")}${units[index]}`;
}

function randomBodhiVariant() {
  return bodhiVariants[Math.floor(Math.random() * bodhiVariants.length)]?.id ?? "pure";
}

function variantForNewBead(beadId) {
  return beadId === "bodhi-root" ? randomBodhiVariant() : "default";
}

function variantName(beadId, variantId = "default") {
  if (beadId === "bodhi-root") {
    return bodhiVariants.find((variant) => variant.id === variantId)?.name ?? "纯色";
  }
  return defaultVariant.name;
}

function ensureBeadCollections(current = state) {
  if (!current.beadCollections || typeof current.beadCollections !== "object") {
    current.beadCollections = starterBeadCollections();
  }

  beads.forEach((bead) => {
    const collection = Array.isArray(current.beadCollections[bead.id]) ? current.beadCollections[bead.id] : [];
    current.beadCollections[bead.id] = collection
      .filter(Boolean)
      .map((piece, index) => {
        const bodhiVariant = bodhiVariants.some((variant) => variant.id === piece.variant) ? piece.variant : "pure";
        return {
          id: piece.id ?? `${bead.id}-migrated-${index}`,
          variant: bead.id === "bodhi-root" ? bodhiVariant : "default",
          patina: Math.max(0, Math.min(1, Number(piece.patina ?? 0))),
          addedAt: piece.addedAt ?? Date.now(),
        };
      });
  });

  if (!current.beadCollections["bodhi-root"].length) {
    current.beadCollections["bodhi-root"].push(makeBeadPiece("bodhi-root", "pure", 0));
  }
}

function beadCollection(beadId, current = state) {
  ensureBeadCollections(current);
  return current.beadCollections[beadId] ?? [];
}

function firstOwnedBeadId(current = state) {
  ensureBeadCollections(current);
  return beads.find((bead) => beadCollection(bead.id, current).length > 0)?.id ?? "bodhi-root";
}

function activeBead(current = state) {
  ensureBeadCollections(current);
  const unlockedOwned = beads.filter((bead) => current.totalZen >= bead.threshold && beadCollection(bead.id, current).length > 0);
  return unlockedOwned.find((bead) => bead.id === current.selectedBead) ?? unlockedOwned[0] ?? beads[0];
}

function activeBracelet(current = state) {
  const bead = activeBead(current);
  const collection = beadCollection(bead.id, current);
  const piece = [...collection].reverse().find((item) => item.patina < 1) ?? collection.at(-1) ?? makeBeadPiece(bead.id, bead.id === "bodhi-root" ? "pure" : "default", 0);
  return { bead, piece, collection };
}

function beadPatinaStage(piece) {
  return Math.max(0, Math.min(4, Math.floor((piece?.patina ?? 0) * 4.999)));
}

function braceletAssetPath(bead, piece) {
  const variant = piece?.variant ?? (bead.id === "bodhi-root" ? "pure" : "default");
  return `assets/art/bracelets/${bead.id}-${variant}-${beadPatinaStage(piece)}.png`;
}

function braceletImageStyle(bead, piece) {
  return `--bracelet-image:url('${braceletAssetPath(bead, piece)}')`;
}

function beadOwnedCount(beadId, current = state) {
  return beadCollection(beadId, current).length;
}

function beadCompletedCount(beadId, current = state) {
  return beadCollection(beadId, current).filter((piece) => piece.patina >= 1).length;
}

function beadTypeMultiplier(beadId, current = state) {
  return Math.pow(1 + BALANCE.beadOwnedBonus, Math.max(0, beadOwnedCount(beadId, current) - 1));
}

function beadArchiveMultiplier(current = state) {
  return beads.reduce((multiplier, bead) => {
    return multiplier * Math.pow(1 + BALANCE.beadArchiveBonus, beadCompletedCount(bead.id, current));
  }, 1);
}

function activeBraceletFocusMultiplier(current = state) {
  const { bead, piece } = activeBracelet(current);
  const patina = piece?.patina ?? 0;
  const focus = patina >= 1
    ? BALANCE.completedBraceletFocus
    : BALANCE.activeGrowingBonus + patina * BALANCE.activeGrowingFinishBonus;
  return bead.multiplier * beadTypeMultiplier(bead.id, current) * focus;
}

function beadPieceCost(bead, current = state) {
  const count = beadOwnedCount(bead.id, current);
  return pacedCost(bead.paceWeight, bead.addBaseCost, current) * Math.pow(1.18, count);
}

function canAddBead(bead, current = state) {
  return current.totalZen >= bead.threshold && current.zen >= beadPieceCost(bead, current);
}

function activePatinaPercent(current = state) {
  return Math.floor((activeBracelet(current).piece?.patina ?? 0) * 100);
}

function braceletPatinaLabel(bead, piece, active = false) {
  if (!piece) return bead.note;
  if (active && piece.patina >= 1) return "已包浆，换一个盘玩更好哦";
  return `${variantName(bead.id, piece.variant)} · 包浆 ${Math.floor(piece.patina * 100)}%`;
}

function uniqueCats(current = state) {
  return cats.filter((cat) => (current.catCounts[cat.id] ?? 0) > 0).length;
}

function totalCats(current = state) {
  return Object.values(current.catCounts).reduce((sum, count) => sum + count, 0);
}

function visibleCatCount(count) {
  if (count <= 0) return 0;
  if (count <= 3) return count;
  if (count <= 5) return 4;
  return 5;
}

function decorationLevel(decor, current = state) {
  return current.decorationLevels?.[decor.id] ?? 0;
}

function totalDecorationLevels(current = state) {
  return Object.values(current.decorationLevels ?? {}).reduce((sum, level) => sum + level, 0);
}

function pawTalentLevel(talent, current = state) {
  return current.pawTalentLevels?.[talent.id] ?? 0;
}

function pawTalentCost(talent, current = state) {
  return Math.ceil(talent.cost * Math.pow(talent.costScale, pawTalentLevel(talent, current)));
}

function pawTalentMultiplier(effect, current = state) {
  return pawTalents.reduce((multiplier, talent) => {
    const level = pawTalentLevel(talent, current);
    if (talent.effect !== effect && talent.effect !== "allMult") return multiplier;
    return multiplier * Math.pow(1 + talent.value, level);
  }, 1);
}

function spentPaws(current = state) {
  return pawTalents.reduce((sum, talent) => {
    const level = pawTalentLevel(talent, current);
    let cost = 0;
    for (let index = 0; index < level; index += 1) {
      cost += Math.ceil(talent.cost * Math.pow(talent.costScale, index));
    }
    return sum + cost;
  }, 0);
}

function totalPaws(current = state) {
  return current.paws + spentPaws(current);
}

function estimateUpgradePaceStep(current = state) {
  const earnedBracelets = Math.max(0, (current.braceletLevel ?? 1) - 1);
  const earnedCats = Math.max(0, totalCats(current) - 1);
  const earnedDecor = totalDecorationLevels(current);
  return Math.min(BALANCE.upgradePaceMinutes.length - 1, Math.floor((earnedBracelets + earnedDecor + earnedCats / 2) / 3));
}

function upgradePaceStep(current = state) {
  return Math.max(0, current.upgradePaceStep ?? estimateUpgradePaceStep(current));
}

function targetUpgradeSeconds(current = state) {
  const step = upgradePaceStep(current);
  const paceTable = BALANCE.upgradePaceMinutes;
  const tableMinutes = paceTable[Math.min(step, paceTable.length - 1)];
  if (step < paceTable.length) return tableMinutes * 60;
  return tableMinutes * 60 * Math.pow(BALANCE.latePaceGrowth, step - paceTable.length + 1);
}

function decorationMultiplier(effect, current = state) {
  return decorations.reduce((multiplier, decor) => {
    const level = decorationLevel(decor, current);
    if (decor.effect !== effect && decor.effect !== "allMult") return multiplier;
    return multiplier * Math.pow(1 + decor.value, level);
  }, 1);
}

function decorationFlatPps(current = state) {
  return decorations.reduce((sum, decor) => {
    if (decor.effect !== "flatPps") return sum;
    return sum + decorationLevel(decor, current) * decor.value;
  }, 0);
}

function globalMultiplier(current = state) {
  return activeBraceletFocusMultiplier(current) *
    beadArchiveMultiplier(current) *
    (1 + uniqueCats(current) * BALANCE.uniqueCatBonus) *
    (1 + totalPaws(current) * BALANCE.pawBonus) *
    pawTalentMultiplier("allMult", current);
}

function tapPower(current = state) {
  return (1 + Math.pow(BALANCE.braceletTapGrowth, current.braceletLevel - 1) * 0.45) *
    globalMultiplier(current) *
    decorationMultiplier("tapMult", current) *
    pawTalentMultiplier("tapMult", current);
}

function productionPerSecond(current = state) {
  const catBase = cats.reduce((sum, cat) => {
    const count = current.catCounts[cat.id] ?? 0;
    const duplicateBoost = Math.pow(1 + BALANCE.duplicateCatBonus, Math.max(0, count - 1));
    return sum + count * cat.pps * duplicateBoost;
  }, 0);

  return (catBase + decorationFlatPps(current)) *
    Math.pow(BALANCE.braceletPassiveGrowth, Math.max(0, current.braceletLevel - 1)) *
    globalMultiplier(current) *
    decorationMultiplier("catMult", current) *
    pawTalentMultiplier("catMult", current);
}

function catDisplayPps(cat, current = state) {
  return cat.pps *
    Math.pow(BALANCE.braceletPassiveGrowth, Math.max(0, current.braceletLevel - 1)) *
    globalMultiplier(current) *
    decorationMultiplier("catMult", current) *
    pawTalentMultiplier("catMult", current);
}

function catGroupPps(cat, current = state) {
  const count = current.catCounts[cat.id] ?? 0;
  const duplicateBoost = Math.pow(1 + BALANCE.duplicateCatBonus, Math.max(0, count - 1));
  return count * catDisplayPps(cat, current) * duplicateBoost;
}

function catGroupBonus(cat, current = state) {
  const count = current.catCounts[cat.id] ?? 0;
  if (count <= 0) return 0;
  return count * Math.pow(1 + BALANCE.duplicateCatBonus, Math.max(0, count - 1));
}

function pricingIncomePerSecond(current = state) {
  return Math.max(
    productionPerSecond(current),
    tapPower(current) * BALANCE.pricingTapRate,
    BALANCE.pricingFloor,
  );
}

function pacedCost(weight, minimum, current = state) {
  return Math.max(minimum, pricingIncomePerSecond(current) * targetUpgradeSeconds(current) * weight);
}

function catCost(cat) {
  const count = state.catCounts[cat.id] ?? 0;
  return pacedCost(cat.paceWeight, cat.baseCost) * Math.pow(1.08, count);
}

function braceletCost() {
  return pacedCost(0.78, 16) * Math.pow(1.035, Math.max(0, state.braceletLevel - 1));
}

function decorationCost(decor) {
  return pacedCost(decor.paceWeight, decor.baseCost) * Math.pow(1.06, decorationLevel(decor));
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "现在";
  if (seconds < 60) return `${Math.ceil(seconds)}秒`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}分钟`;
  return `${(seconds / 3600).toFixed(seconds < 7200 ? 1 : 0)}小时`;
}

function waitLabel(cost) {
  if (state.zen >= cost) return "可升级";
  const pps = productionPerSecond();
  if (pps <= 0) return "先结缘猫猫";
  return `约 ${formatDuration((cost - state.zen) / pps)}`;
}

function gainZen(amount) {
  state.zen += amount;
  state.totalZen += amount;
}

function spendZen(amount) {
  if (state.zen < amount) return false;
  state.zen -= amount;
  return true;
}

function advanceActiveBraceletPatina(seconds, current = state, notify = true) {
  if (!Number.isFinite(seconds) || seconds <= 0) return false;
  const { bead, piece } = activeBracelet(current);
  if (!piece || piece.patina >= 1) return false;
  const previous = piece.patina;
  const handcraftBonus = 1 + Math.max(0, (current.braceletLevel ?? 1) - 1) * 0.018;
  piece.patina = Math.min(1, previous + (seconds * handcraftBonus) / BALANCE.patinaSeconds);
  const completed = previous < 1 && piece.patina >= 1;
  if (completed && notify) {
    toast("已包浆，换一个盘玩更好哦");
  }
  return completed;
}

function advanceUpgradePace() {
  state.upgradePaceStep = upgradePaceStep(state) + 1;
}

function pointerAngle(event) {
  const rect = elements.altarBracelet.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180 / Math.PI;
}

function normalizeAngleDelta(delta) {
  if (delta > 180) return delta - 360;
  if (delta < -180) return delta + 360;
  return delta;
}

function setBraceletRotation(angle) {
  braceletRotation = angle;
  elements.altarBracelet.style.setProperty("--bracelet-rotation", `${braceletRotation}deg`);
}

function grantPolish(steps, event) {
  if (steps <= 0) return;
  const amount = tapPower() * steps;
  gainZen(amount);
  advanceActiveBraceletPatina(steps * BALANCE.polishPatinaBoost);
  state.taps += steps;
  popText(event, `+${formatNumber(amount)}`);
  elements.tapTarget.classList.remove("pulse");
  void elements.tapTarget.offsetWidth;
  elements.tapTarget.classList.add("pulse");
  renderHud();
}

function startPolishing(event) {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  polishingState.active = true;
  polishingState.pointerId = event.pointerId;
  polishingState.lastAngle = pointerAngle(event);
  polishingState.progressDegrees = 0;
  polishingState.moved = false;
  elements.tapTarget.classList.add("polishing");
  elements.tapTarget.setPointerCapture?.(event.pointerId);
}

function rotatePolishing(event) {
  if (!polishingState.active || polishingState.pointerId !== event.pointerId) return;
  event.preventDefault();
  const angle = pointerAngle(event);
  const delta = normalizeAngleDelta(angle - polishingState.lastAngle);
  polishingState.lastAngle = angle;
  if (Math.abs(delta) < 0.25) return;

  polishingState.moved = true;
  setBraceletRotation(braceletRotation + delta);
  polishingState.progressDegrees += Math.abs(delta);
  const steps = Math.floor(polishingState.progressDegrees / POLISH_STEP_DEGREES);
  if (steps > 0) {
    polishingState.progressDegrees -= steps * POLISH_STEP_DEGREES;
    grantPolish(steps, event);
  }
}

function stopPolishing(event) {
  if (!polishingState.active || polishingState.pointerId !== event.pointerId) return;
  polishingState.active = false;
  polishingState.pointerId = null;
  elements.tapTarget.classList.remove("polishing");
  elements.tapTarget.releasePointerCapture?.(event.pointerId);
}

function showPolishHint() {
  elements.tapTarget.classList.remove("pulse");
  void elements.tapTarget.offsetWidth;
  elements.tapTarget.classList.add("pulse");
  toast("按住桌上的手串，绕着中心拖动旋转");
}

function popText(event, text) {
  const rect = elements.tapTarget.getBoundingClientRect();
  const x = event?.clientX ?? rect.left + rect.width / 2;
  const y = event?.clientY ?? rect.top + rect.height / 2;
  const pop = document.createElement("div");
  pop.className = "float-pop";
  pop.textContent = text;
  pop.style.left = `${x}px`;
  pop.style.top = `${y}px`;
  document.body.append(pop);
  pop.addEventListener("animationend", () => pop.remove());
}

function buyCat(catId) {
  const cat = cats.find((item) => item.id === catId);
  if (!cat || state.totalZen < cat.unlock) return;
  const previousCount = state.catCounts[cat.id] ?? 0;
  const cost = catCost(cat);
  if (!spendZen(cost)) return;
  state.catCounts[cat.id] = previousCount + 1;
  advanceUpgradePace();
  toast(`新的${cat.name}加入了盘珠铺`);
  render();
  celebrateCatGroup(cat.id, previousCount);
}

function upgradeBracelet() {
  const cost = braceletCost();
  if (!spendZen(cost)) return;
  state.braceletLevel += 1;
  advanceUpgradePace();
  toast(`盘串手法升到 Lv.${state.braceletLevel}`);
  render();
}

function selectBead(beadId) {
  const bead = beads.find((item) => item.id === beadId);
  if (!bead || state.totalZen < bead.threshold || !beadCollection(bead.id).length) return;
  state.selectedBead = bead.id;
  const { piece } = activeBracelet();
  toast(`开始盘玩${bead.name}${variantName(bead.id, piece.variant)}`);
  render();
}

function addBead(beadId) {
  const bead = beads.find((item) => item.id === beadId);
  if (!bead || state.totalZen < bead.threshold) return;
  const cost = beadPieceCost(bead);
  if (!spendZen(cost)) return;
  const variant = variantForNewBead(bead.id);
  beadCollection(bead.id).push(makeBeadPiece(bead.id, variant, 0));
  state.selectedBead = bead.id;
  advanceUpgradePace();
  toast(`添了一串${bead.name}${variantName(bead.id, variant)}，开始养包浆`);
  render();
}

function upgradeDecoration(decorId) {
  const decor = decorations.find((item) => item.id === decorId);
  if (!decor || state.totalZen < decor.unlock) return;
  const level = decorationLevel(decor);
  if (level >= decor.maxLevel) return;
  const cost = decorationCost(decor);
  if (!spendZen(cost)) return;
  state.decorationLevels[decor.id] = level + 1;
  advanceUpgradePace();
  toast(`${decor.name} 升到 Lv.${level + 1}`);
  render();
}

function claimWish(wishId) {
  const wish = wishes.find((item) => item.id === wishId);
  if (!wish || state.claimedWishes[wish.id]) return;
  if (wish.value(state) < wish.goal) return;
  state.claimedWishes[wish.id] = true;
  state.paws += wish.reward;
  toast(`心愿达成，福爪 +${wish.reward}`);
  render();
}

function upgradePawTalent(talentId) {
  const talent = pawTalents.find((item) => item.id === talentId);
  if (!talent) return;
  const level = pawTalentLevel(talent);
  if (level >= talent.maxLevel) return;
  const cost = pawTalentCost(talent);
  if (state.paws < cost) return;
  state.paws -= cost;
  state.pawTalentLevels[talent.id] = level + 1;
  toast(`${talent.name} 升到 Lv.${level + 1}`);
  render();
}

function clearGuideFocus() {
  document.querySelectorAll(".guide-focus").forEach((item) => item.classList.remove("guide-focus"));
  elements.guideSpotlight.classList.remove("show");
}

function renderGuideDots() {
  elements.guideDots.innerHTML = guideSteps
    .map((_, index) => `<span class="${index === guideIndex ? "active" : ""}"></span>`)
    .join("");
}

function syncGuide() {
  const step = guideSteps[guideIndex];
  if (!step) return;
  if (step.tab) switchTab(step.tab);

  clearGuideFocus();
  const target = document.querySelector(step.target);
  target?.classList.add("guide-focus");
  positionGuideSpotlight(target);
  requestAnimationFrame(() => positionGuideSpotlight(document.querySelector(step.target)));

  elements.guideStepLabel.textContent = `${guideIndex + 1}/${guideSteps.length}`;
  elements.guideTitle.textContent = step.title;
  elements.guideText.textContent = step.text;
  elements.guideHint.textContent = step.hint;
  elements.guidePrevButton.disabled = guideIndex === 0;
  elements.guideNextButton.textContent = guideIndex === guideSteps.length - 1 ? "开始放置" : "下一步";
  renderGuideDots();
}

function positionGuideSpotlight(target) {
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const padding = 8;
  elements.guideSpotlight.style.left = `${Math.max(6, rect.left - padding)}px`;
  elements.guideSpotlight.style.top = `${Math.max(6, rect.top - padding)}px`;
  elements.guideSpotlight.style.width = `${Math.min(window.innerWidth - 12, rect.width + padding * 2)}px`;
  elements.guideSpotlight.style.height = `${Math.min(window.innerHeight - 12, rect.height + padding * 2)}px`;
  elements.guideSpotlight.classList.add("show");
}

function openGuide(startIndex = 0) {
  guideIndex = Math.max(0, Math.min(guideSteps.length - 1, startIndex));
  guideOpen = true;
  elements.guideLayer.hidden = false;
  syncGuide();
}

function closeGuide(markSeen = true) {
  guideOpen = false;
  elements.guideLayer.hidden = true;
  clearGuideFocus();
  if (markSeen && !state.tutorialSeen) {
    state.tutorialSeen = true;
    saveState();
  }
}

function nextGuideStep() {
  if (guideIndex >= guideSteps.length - 1) {
    closeGuide(true);
    toast("新手指南完成，放心放置，回来再升级");
    return;
  }
  guideIndex += 1;
  syncGuide();
}

function prevGuideStep() {
  guideIndex = Math.max(0, guideIndex - 1);
  syncGuide();
}

function renderCats() {
  elements.catLayer.innerHTML = cats
    .flatMap((cat, catIndex) => {
      const count = state.catCounts[cat.id] ?? 0;
      const visibleCount = visibleCatCount(count);
      return Array.from({ length: visibleCount }, (_, instanceIndex) => {
        const visual = ensureCatVisual(cat, catIndex, instanceIndex);
        const isMain = instanceIndex === 0;
        const groupLabel = count > visibleCount ? `Lv.${count} · 显示${visibleCount}/${count}` : `Lv.${count}`;
        return `
          <span
            class="cat-action-sprite ${cat.sprite} action-${visual.spriteAction} activity-${visual.activity} stage-cat show ${isMain ? "main-cat" : "clone-cat"}"
            data-stage-cat
            data-cat="${cat.id}"
            data-cat-instance="${instanceIndex}"
            data-action="${visual.activity}"
            data-zone="${visual.zoneId}"
            role="button"
            tabindex="0"
            aria-label="查看${cat.name}群"
            style="--cat-left:${visual.x}%; --cat-bottom:${visual.bottom}%; --cat-scale:${visual.scale}; --cat-z:${visual.z}; --cat-delay:${visual.delay}ms; --cat-face:${visual.face};"
          >
            ${isMain ? `<b class="cat-group-chip">${groupLabel}</b>` : ""}
          </span>
        `;
      });
    })
    .join("");
}

function randomCatActionDelay() {
  return 2.4 + Math.random() * 2.8;
}

function catInstanceKey(catId, instanceIndex) {
  return `${catId}:${instanceIndex}`;
}

function pickWeightedActivity(allowed = catActivityCycle, excludeActivity = "") {
  const pool = catActivityWeights.filter((item) => allowed.includes(item.activity) && item.activity !== excludeActivity);
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return pool[0] ?? catActivityWeights[0];
}

function assignCatZone(catIndex, instanceIndex) {
  const zoneIndex = (catIndex * 3 + instanceIndex * 2) % catActivityZones.length;
  return catActivityZones[zoneIndex];
}

function ensureCatVisual(cat, catIndex, instanceIndex) {
  const key = catInstanceKey(cat.id, instanceIndex);
  if (!catVisualState.has(key)) {
    const zone = assignCatZone(catIndex, instanceIndex);
    const activity = pickWeightedActivity(zone.allowed);
    const offset = ((catIndex + 1) * 11 + instanceIndex * 17) % 9 - 4;
    const placement = state.catPlacements?.[key];
    const placedX = Number.isFinite(placement?.x) ? placement.x : Math.max(2, Math.min(92, zone.x + offset));
    const placedBottom = Number.isFinite(placement?.bottom) ? placement.bottom : zone.bottom + (instanceIndex % 2) * 1.2;
    catVisualState.set(key, {
      zoneId: zone.id,
      activity: activity.activity,
      spriteAction: activity.spriteAction,
      mood: activity.mood,
      x: placedX,
      targetX: placedX,
      minX: placement ? Math.max(2, placedX - 10) : zone.minX,
      maxX: placement ? Math.min(92, placedX + 10) : zone.maxX,
      bottom: placedBottom,
      scale: zone.scale,
      face: instanceIndex % 2 === 0 ? 1 : -1,
      z: zone.z + instanceIndex,
      delay: -((catIndex * 360 + instanceIndex * 520) % 1800),
      speed: 0.75 + ((catIndex + instanceIndex) % 4) * 0.22,
    });
  }
  return catVisualState.get(key);
}

function setCatAction(catId, instanceIndex, nextActivity) {
  if ((state.catCounts[catId] ?? 0) <= 0) return;
  const cat = cats.find((item) => item.id === catId);
  const catIndex = cats.findIndex((item) => item.id === catId);
  if (!cat || catIndex < 0) return;

  const visual = ensureCatVisual(cat, catIndex, instanceIndex);
  const zone = catActivityZones.find((item) => item.id === visual.zoneId) ?? catActivityZones[0];
  const activity = catActivityWeights.find((item) => item.activity === nextActivity && zone.allowed.includes(item.activity)) ??
    pickWeightedActivity(zone.allowed, visual.activity);
  visual.activity = activity.activity;
  visual.spriteAction = activity.spriteAction;
  visual.mood = activity.mood;
  if (visual.activity === "walk" || visual.activity === "run") {
    visual.targetX = pickCatMoveTarget(visual);
    visual.face = visual.targetX >= visual.x ? 1 : -1;
  }

  const el = elements.catLayer.querySelector(`[data-stage-cat][data-cat="${catId}"][data-cat-instance="${instanceIndex}"]`);
  if (!el) return;
  catActivityCycle.forEach((action) => el.classList.remove(`activity-${action}`));
  ["sit", "jump", "lie"].forEach((action) => el.classList.remove(`action-${action}`));
  el.classList.add(`activity-${visual.activity}`, `action-${visual.spriteAction}`);
  el.dataset.action = visual.activity;
  el.style.setProperty("--cat-face", visual.face);

  el.animate?.(
    [
      { transform: "translateY(0)" },
      { transform: "translateY(-5px)" },
      { transform: "translateY(0)" },
    ],
    { duration: 220, easing: "ease-out" },
  );
}

function pickCatMoveTarget(visual) {
  const span = Math.max(1, visual.maxX - visual.minX);
  const roll = visual.minX + Math.random() * span;
  if (Math.abs(roll - visual.x) < span * 0.25) {
    return visual.x < (visual.minX + visual.maxX) / 2 ? visual.maxX : visual.minX;
  }
  return roll;
}

function updateCatPositions(delta) {
  catVisualState.forEach((visual, key) => {
    if (catDragState.active && catDragState.key === key) return;
    if (visual.activity !== "walk" && visual.activity !== "run") return;
    const speed = visual.speed * (visual.activity === "run" ? 2.2 : 1);
    if (!Number.isFinite(visual.targetX)) visual.targetX = pickCatMoveTarget(visual);
    const distance = visual.targetX - visual.x;
    if (Math.abs(distance) < 0.3) {
      visual.targetX = pickCatMoveTarget(visual);
      visual.face = visual.targetX >= visual.x ? 1 : -1;
      return;
    }

    visual.face = distance >= 0 ? 1 : -1;
    visual.x += Math.sign(distance) * Math.min(Math.abs(distance), speed * delta);
    const [catId, instanceIndex] = key.split(":");
    const el = elements.catLayer.querySelector(`[data-stage-cat][data-cat="${catId}"][data-cat-instance="${instanceIndex}"]`);
    if (!el) return;
    el.style.setProperty("--cat-left", `${visual.x}%`);
    el.style.setProperty("--cat-face", visual.face);
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function beginCatDrag(event) {
  const stageCat = event.target.closest("[data-stage-cat]");
  if (!stageCat || (event.button !== undefined && event.button !== 0)) return;
  const layerRect = elements.catLayer.getBoundingClientRect();
  const catRect = stageCat.getBoundingClientRect();
  const instanceIndex = Number(stageCat.dataset.catInstance ?? 0);
  const key = catInstanceKey(stageCat.dataset.cat, instanceIndex);

  catDragState.active = true;
  catDragState.pointerId = event.pointerId;
  catDragState.element = stageCat;
  catDragState.key = key;
  catDragState.startX = event.clientX;
  catDragState.startY = event.clientY;
  catDragState.offsetX = event.clientX - catRect.left;
  catDragState.offsetBottom = catRect.bottom - event.clientY;
  catDragState.moved = false;

  stageCat.classList.add("dragging-cat");
  stageCat.setPointerCapture?.(event.pointerId);
}

function moveCatDrag(event) {
  if (!catDragState.active || catDragState.pointerId !== event.pointerId || !catDragState.element) return;
  const distance = Math.hypot(event.clientX - catDragState.startX, event.clientY - catDragState.startY);
  if (distance > 4) catDragState.moved = true;
  if (!catDragState.moved) return;

  event.preventDefault();
  const layerRect = elements.catLayer.getBoundingClientRect();
  const leftPx = event.clientX - layerRect.left - catDragState.offsetX;
  const bottomPx = layerRect.bottom - event.clientY - catDragState.offsetBottom;
  const x = clamp((leftPx / layerRect.width) * 100, 0, 92);
  const bottom = clamp((bottomPx / layerRect.height) * 100, 0, 48);
  const visual = catVisualState.get(catDragState.key);
  if (!visual) return;

  visual.x = x;
  visual.bottom = bottom;
  visual.targetX = x;
  visual.minX = clamp(x - 10, 0, 92);
  visual.maxX = clamp(x + 10, 0, 92);
  visual.face = visual.face || 1;

  catDragState.element.style.setProperty("--cat-left", `${visual.x}%`);
  catDragState.element.style.setProperty("--cat-bottom", `${visual.bottom}%`);
}

function finishCatDrag(event) {
  if (!catDragState.active || catDragState.pointerId !== event.pointerId) return;
  const stageCat = catDragState.element;
  const visual = catVisualState.get(catDragState.key);
  stageCat?.classList.remove("dragging-cat");
  stageCat?.releasePointerCapture?.(event.pointerId);

  if (catDragState.moved && visual) {
    state.catPlacements[catDragState.key] = {
      x: Number(visual.x.toFixed(2)),
      bottom: Number(visual.bottom.toFixed(2)),
    };
    suppressNextCatClick = true;
    saveState();
  }

  catDragState.active = false;
  catDragState.pointerId = null;
  catDragState.element = null;
  catDragState.key = "";
}

function nextCatAction(catId, instanceIndex, mode = "random") {
  const visual = catVisualState.get(catInstanceKey(catId, instanceIndex));
  const current = visual?.activity ?? "sit";
  if (mode === "cycle") {
    const index = catActivityCycle.indexOf(current);
    return catActivityCycle[(index + 1) % catActivityCycle.length] ?? catActivityCycle[0];
  }
  const zone = catActivityZones.find((item) => item.id === visual?.zoneId);
  return pickWeightedActivity(zone?.allowed, current).activity;
}

function changeCatAction(catId, mode = "random", instanceIndex = 0) {
  setCatAction(catId, instanceIndex, nextCatAction(catId, instanceIndex, mode));
}

function updateCatActions() {
  const visibleInstances = cats.flatMap((cat) => {
    const count = visibleCatCount(state.catCounts[cat.id] ?? 0);
    return Array.from({ length: count }, (_, instanceIndex) => ({ cat, instanceIndex }));
  });
  const picked = visibleInstances[Math.floor(Math.random() * visibleInstances.length)];
  if (!picked) return;
  changeCatAction(picked.cat.id, "random", picked.instanceIndex);
}

function openCatGroupPanel(catId) {
  const cat = cats.find((item) => item.id === catId);
  if (!cat) return;
  const count = state.catCounts[cat.id] ?? 0;
  const visibleCount = visibleCatCount(count);
  const mainVisual = catVisualState.get(catInstanceKey(cat.id, 0));

  elements.catGroupTitle.textContent = `${cat.name}群 Lv.${count}`;
  elements.catGroupCount.textContent = `当前数量：${count}`;
  elements.catGroupVisible.textContent = `场景显示：${visibleCount}${count > visibleCount ? ` / 实际 ${count}` : ""}`;
  elements.catGroupBonus.textContent = `总包浆加成：x${catGroupBonus(cat).toFixed(2)}，猫息 ${formatNumber(catGroupPps(cat))}/s`;
  elements.catGroupStatus.textContent = `状态：${mainVisual?.mood ?? "开心"}`;
  elements.catGroupPanel.hidden = false;
}

function closeCatGroupPanel() {
  elements.catGroupPanel.hidden = true;
}

function celebrateCatGroup(catId, previousCount) {
  const previousVisible = visibleCatCount(previousCount);
  const nextVisible = visibleCatCount(state.catCounts[catId] ?? 0);
  requestAnimationFrame(() => {
    elements.catLayer.querySelectorAll(`[data-stage-cat][data-cat="${catId}"]`).forEach((el) => {
      if (Number(el.dataset.catInstance ?? 0) === nextVisible - 1 && nextVisible > previousVisible) return;
      el.classList.add("happy-cat");
      el.addEventListener("animationend", () => el.classList.remove("happy-cat"), { once: true });
    });

    if (nextVisible > previousVisible) {
      const newcomer = elements.catLayer.querySelector(`[data-stage-cat][data-cat="${catId}"][data-cat-instance="${nextVisible - 1}"]`);
      newcomer?.classList.add("newcomer-cat");
      newcomer?.addEventListener("animationend", () => newcomer.classList.remove("newcomer-cat"), { once: true });
    }
  });
}

function renderDecorLayer() {
  elements.decorLayer.innerHTML = decorations
    .map((decor) => {
      const level = decorationLevel(decor);
      return `<span class="decor-sprite ${decor.sprite} stage-decor ${level > 0 ? "show" : ""}" data-decor="${decor.id}"></span>`;
    })
    .join("");
}

function renderShop() {
  elements.catShop.innerHTML = cats
    .map((cat) => {
      const count = state.catCounts[cat.id] ?? 0;
      const unlocked = state.totalZen >= cat.unlock;
      const cost = catCost(cat);
      const canBuy = unlocked && state.zen >= cost;
      return `
        <article class="shop-card ${unlocked ? "" : "locked"} ${canBuy ? "has-upgrade" : ""}" data-cat-card="${cat.id}">
          <span class="sprite ${cat.sprite}" aria-hidden="true"></span>
          <div class="card-copy">
            <div class="card-title">
              <span>${cat.name}</span>
              <span data-cat-count="${cat.id}">Lv.${count}</span>
            </div>
            <div class="card-meta">
              <span data-cat-pps="${cat.id}">${formatNumber(catGroupPps(cat))}/s 猫群猫息</span>
              <span data-cat-cost="${cat.id}">${unlocked ? `花费 ${formatNumber(cost)} 禅意` : `累计 ${formatNumber(cat.unlock)} 解锁`}</span>
            </div>
            <button class="shop-button ${canBuy ? "has-upgrade" : ""}" type="button" data-buy-cat="${cat.id}" ${canBuy ? "" : "disabled"}>
              ${unlocked ? "结缘" : "未解锁"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderBeads() {
  elements.beadBoard.innerHTML = beads
    .map((bead) => {
      const unlocked = state.totalZen >= bead.threshold;
      const active = activeBead().id === bead.id;
      const collection = beadCollection(bead.id);
      const piece = active ? activeBracelet().piece : ([...collection].reverse().find((item) => item.patina < 1) ?? collection.at(-1));
      const count = collection.length;
      const completed = beadCompletedCount(bead.id);
      const patina = Math.floor((piece?.patina ?? 0) * 100);
      const cost = beadPieceCost(bead);
      const canAdd = canAddBead(bead);
      const imagePiece = piece ?? { variant: bead.id === "bodhi-root" ? "pure" : "default", patina: 0 };
      return `
        <article class="bead-card ${unlocked ? "" : "locked"} ${active ? "active-bead" : ""} ${canAdd ? "has-upgrade" : ""}" data-bead-card="${bead.id}">
          <span class="bracelet-sprite ${bead.sprite}" style="${braceletImageStyle(bead, imagePiece)}" aria-hidden="true"></span>
          <div class="card-copy">
            <div class="card-title">
              <span>${bead.name}</span>
              <span data-bead-count="${bead.id}">持有 ${count}</span>
            </div>
            <div class="card-meta">
              <span data-bead-state="${bead.id}">${unlocked ? `${completed} 串满包浆` : `累计 ${formatNumber(bead.threshold)} 解锁`}</span>
              <span data-bead-label="${bead.id}">${braceletPatinaLabel(bead, piece, active)}</span>
              <span data-bead-bonus="${bead.id}">${active ? `当前主加成 x${activeBraceletFocusMultiplier().toFixed(2)}` : `同类加成 x${beadTypeMultiplier(bead.id).toFixed(2)}`}</span>
            </div>
            <div class="bead-progress" aria-hidden="true"><span data-bead-progress="${bead.id}" style="width:${patina}%"></span></div>
            <div class="bead-actions">
              <button class="shop-button secondary" type="button" data-select-bead="${bead.id}" ${unlocked && count > 0 && !active ? "" : "disabled"}>
                ${active ? "盘玩中" : count > 0 ? "盘这类" : "先添加"}
              </button>
              <button class="shop-button ${canAdd ? "has-upgrade" : "secondary"}" type="button" data-add-bead="${bead.id}" ${canAdd ? "" : "disabled"}>
                ${unlocked ? `添新串 ${formatNumber(cost)}` : "未解锁"}
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderDecorations() {
  elements.decorShop.innerHTML = decorations
    .map((decor) => {
      const level = decorationLevel(decor);
      const unlocked = state.totalZen >= decor.unlock;
      const capped = level >= decor.maxLevel;
      const cost = decorationCost(decor);
      const canBuy = unlocked && !capped && state.zen >= cost;
      return `
        <article class="decor-card ${unlocked ? "" : "locked"} ${canBuy ? "has-upgrade" : ""}" data-decor-card="${decor.id}">
          <span class="decor-sprite ${decor.sprite}" aria-hidden="true"></span>
          <div class="card-copy">
            <div class="card-title">
              <span>${decor.name}</span>
              <span data-decor-level="${decor.id}">Lv.${level}/${decor.maxLevel}</span>
            </div>
            <div class="card-meta">
              <span>${decor.note}</span>
              <span data-decor-cost="${decor.id}">${unlocked ? `花费 ${formatNumber(cost)} 禅意` : `累计 ${formatNumber(decor.unlock)} 解锁`}</span>
              <span data-decor-wait="${decor.id}">${unlocked && !capped ? waitLabel(cost) : capped ? "已满级" : "未解锁"}</span>
            </div>
            <button class="shop-button secondary ${canBuy ? "has-upgrade" : ""}" type="button" data-upgrade-decor="${decor.id}" ${canBuy ? "" : "disabled"}>
              ${capped ? "已满级" : unlocked ? "升级装饰" : "未解锁"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderWishes() {
  const talentCards = pawTalents
    .map((talent) => {
      const level = pawTalentLevel(talent);
      const capped = level >= talent.maxLevel;
      const cost = pawTalentCost(talent);
      const canBuy = !capped && state.paws >= cost;
      return `
        <article class="paw-talent-card ${canBuy ? "has-upgrade" : ""}" data-paw-talent-card="${talent.id}">
          <div class="card-title">
            <span>${talent.name}</span>
            <span data-paw-talent-level="${talent.id}">Lv.${level}/${talent.maxLevel}</span>
          </div>
          <div class="card-meta">
            <span>${talent.description}</span>
            <span data-paw-talent-cost="${talent.id}">${capped ? "已满级" : `消耗 ${cost} 福爪`}</span>
          </div>
          <button class="shop-button secondary ${canBuy ? "has-upgrade" : ""}" type="button" data-upgrade-paw-talent="${talent.id}" ${canBuy ? "" : "disabled"}>
            ${capped ? "已满级" : "使用福爪"}
          </button>
        </article>
      `;
    })
    .join("");

  const wishCards = wishes
    .map((wish) => {
      const value = wish.value(state);
      const progress = Math.min(1, value / wish.goal);
      const claimed = Boolean(state.claimedWishes[wish.id]);
      const ready = progress >= 1 && !claimed;
      return `
        <article class="wish-card ${claimed ? "claimed" : ""} ${ready ? "has-upgrade" : ""}" data-wish-card="${wish.id}">
          <div class="card-title">
            <span>${wish.label}</span>
            <span>福爪 +${wish.reward}</span>
          </div>
          <div class="card-meta">
            <span data-wish-value="${wish.id}">${formatNumber(value)} / ${formatNumber(wish.goal)}</span>
          </div>
          <div class="wish-progress" aria-hidden="true"><span data-wish-progress="${wish.id}" style="width:${progress * 100}%"></span></div>
          <button class="shop-button ${ready ? "has-upgrade" : "secondary"}" type="button" data-claim-wish="${wish.id}" ${ready ? "" : "disabled"}>
            ${claimed ? "已达成" : ready ? "领取" : "进行中"}
          </button>
        </article>
      `;
    })
    .join("");

  elements.wishList.innerHTML = `
    <section class="paw-panel">
      <div class="card-title">
        <span>福爪修行</span>
        <span data-paw-summary>${state.paws} 可用 / ${totalPaws(state)} 累计</span>
      </div>
      <div class="card-meta">
        <span>完成心愿获得福爪；福爪可升级永久加成，累计福爪也会提供少量全局收益。</span>
      </div>
      <div class="paw-talent-grid">${talentCards}</div>
    </section>
    ${wishCards}
  `;
}

function hasCatUpgrade(current = state) {
  return cats.some((cat) => current.totalZen >= cat.unlock && current.zen >= catCost(cat));
}

function hasBeadUpgrade(current = state) {
  return beads.some((bead) => current.totalZen >= bead.threshold && current.zen >= beadPieceCost(bead, current));
}

function hasDecorUpgrade(current = state) {
  return decorations.some((decor) => {
    const level = decorationLevel(decor, current);
    return current.totalZen >= decor.unlock && level < decor.maxLevel && current.zen >= decorationCost(decor);
  });
}

function hasWishUpgrade(current = state) {
  return wishes.some((wish) => !current.claimedWishes[wish.id] && wish.value(current) >= wish.goal) ||
    pawTalents.some((talent) => pawTalentLevel(talent, current) < talent.maxLevel && current.paws >= pawTalentCost(talent, current));
}

function updateUpgradeBadges() {
  const tabState = {
    cats: hasCatUpgrade(),
    beads: hasBeadUpgrade(),
    decor: hasDecorUpgrade(),
    wishes: hasWishUpgrade(),
  };
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle("has-upgrade", Boolean(tabState[button.dataset.tab]));
  });
}

function updatePanelState() {
  cats.forEach((cat) => {
    const count = state.catCounts[cat.id] ?? 0;
    const unlocked = state.totalZen >= cat.unlock;
    const cost = catCost(cat);
    const canBuy = unlocked && state.zen >= cost;
    const card = elements.catShop.querySelector(`[data-cat-card="${cat.id}"]`);
    const countLabel = elements.catShop.querySelector(`[data-cat-count="${cat.id}"]`);
    const ppsLabel = elements.catShop.querySelector(`[data-cat-pps="${cat.id}"]`);
    const costLabel = elements.catShop.querySelector(`[data-cat-cost="${cat.id}"]`);
    const button = elements.catShop.querySelector(`[data-buy-cat="${cat.id}"]`);

    card?.classList.toggle("locked", !unlocked);
    card?.classList.toggle("has-upgrade", canBuy);
    if (countLabel) countLabel.textContent = `Lv.${count}`;
    if (ppsLabel) ppsLabel.textContent = `${formatNumber(catGroupPps(cat))}/s 猫群猫息`;
    if (costLabel) costLabel.textContent = unlocked ? `花费 ${formatNumber(cost)} 禅意` : `累计 ${formatNumber(cat.unlock)} 解锁`;
    if (button) {
      button.disabled = !canBuy;
      button.classList.toggle("has-upgrade", canBuy);
      button.textContent = unlocked ? "结缘" : "未解锁";
    }
  });

  const currentBeadId = activeBead().id;
  beads.forEach((bead) => {
    const unlocked = state.totalZen >= bead.threshold;
    const active = currentBeadId === bead.id;
    const collection = beadCollection(bead.id);
    const count = collection.length;
    const piece = active ? activeBracelet().piece : ([...collection].reverse().find((item) => item.patina < 1) ?? collection.at(-1));
    const completed = beadCompletedCount(bead.id);
    const patina = Math.floor((piece?.patina ?? 0) * 100);
    const cost = beadPieceCost(bead);
    const canAdd = canAddBead(bead);
    const card = elements.beadBoard.querySelector(`[data-bead-card="${bead.id}"]`);
    const countLabel = elements.beadBoard.querySelector(`[data-bead-count="${bead.id}"]`);
    const stateLabel = elements.beadBoard.querySelector(`[data-bead-state="${bead.id}"]`);
    const beadLabel = elements.beadBoard.querySelector(`[data-bead-label="${bead.id}"]`);
    const bonusLabel = elements.beadBoard.querySelector(`[data-bead-bonus="${bead.id}"]`);
    const progressBar = elements.beadBoard.querySelector(`[data-bead-progress="${bead.id}"]`);
    const selectButton = elements.beadBoard.querySelector(`[data-select-bead="${bead.id}"]`);
    const addButton = elements.beadBoard.querySelector(`[data-add-bead="${bead.id}"]`);
    const image = card?.querySelector(".bracelet-sprite");

    card?.classList.toggle("locked", !unlocked);
    card?.classList.toggle("active-bead", active);
    card?.classList.toggle("has-upgrade", canAdd);
    if (image && piece) image.style.setProperty("--bracelet-image", `url("${braceletAssetPath(bead, piece)}")`);
    if (countLabel) countLabel.textContent = `持有 ${count}`;
    if (stateLabel) stateLabel.textContent = unlocked ? `${completed} 串满包浆` : `累计 ${formatNumber(bead.threshold)} 解锁`;
    if (beadLabel) beadLabel.textContent = braceletPatinaLabel(bead, piece, active);
    if (bonusLabel) bonusLabel.textContent = active ? `当前主加成 x${activeBraceletFocusMultiplier().toFixed(2)}` : `同类加成 x${beadTypeMultiplier(bead.id).toFixed(2)}`;
    if (progressBar) progressBar.style.width = `${patina}%`;
    if (selectButton) {
      selectButton.disabled = !unlocked || count <= 0 || active;
      selectButton.textContent = active ? "盘玩中" : count > 0 ? "盘这类" : "先添加";
    }
    if (addButton) {
      addButton.disabled = !canAdd;
      addButton.classList.toggle("secondary", !canAdd);
      addButton.classList.toggle("has-upgrade", canAdd);
      addButton.textContent = unlocked ? `添新串 ${formatNumber(cost)}` : "未解锁";
    }
  });

  decorations.forEach((decor) => {
    const level = decorationLevel(decor);
    const unlocked = state.totalZen >= decor.unlock;
    const capped = level >= decor.maxLevel;
    const cost = decorationCost(decor);
    const canBuy = unlocked && !capped && state.zen >= cost;
    const card = elements.decorShop.querySelector(`[data-decor-card="${decor.id}"]`);
    const levelLabel = elements.decorShop.querySelector(`[data-decor-level="${decor.id}"]`);
    const costLabel = elements.decorShop.querySelector(`[data-decor-cost="${decor.id}"]`);
    const wait = elements.decorShop.querySelector(`[data-decor-wait="${decor.id}"]`);
    const button = elements.decorShop.querySelector(`[data-upgrade-decor="${decor.id}"]`);

    card?.classList.toggle("locked", !unlocked);
    card?.classList.toggle("has-upgrade", canBuy);
    if (levelLabel) levelLabel.textContent = `Lv.${level}/${decor.maxLevel}`;
    if (costLabel) costLabel.textContent = unlocked ? `花费 ${formatNumber(cost)} 禅意` : `累计 ${formatNumber(decor.unlock)} 解锁`;
    if (wait) wait.textContent = unlocked && !capped ? waitLabel(cost) : capped ? "已满级" : "未解锁";
    if (button) {
      button.disabled = !canBuy;
      button.classList.toggle("has-upgrade", canBuy);
      button.textContent = capped ? "已满级" : unlocked ? "升级装饰" : "未解锁";
    }
  });

  wishes.forEach((wish) => {
    const value = wish.value(state);
    const progress = Math.min(1, value / wish.goal);
    const claimed = Boolean(state.claimedWishes[wish.id]);
    const ready = progress >= 1 && !claimed;
    const card = elements.wishList.querySelector(`[data-wish-card="${wish.id}"]`);
    const valueLabel = elements.wishList.querySelector(`[data-wish-value="${wish.id}"]`);
    const progressBar = elements.wishList.querySelector(`[data-wish-progress="${wish.id}"]`);
    const button = elements.wishList.querySelector(`[data-claim-wish="${wish.id}"]`);

    card?.classList.toggle("claimed", claimed);
    card?.classList.toggle("has-upgrade", ready);
    if (valueLabel) valueLabel.textContent = `${formatNumber(value)} / ${formatNumber(wish.goal)}`;
    if (progressBar) progressBar.style.width = `${progress * 100}%`;
    if (button) {
      button.disabled = !ready;
      button.classList.toggle("secondary", !ready);
      button.classList.toggle("has-upgrade", ready);
      button.textContent = claimed ? "已达成" : ready ? "领取" : "进行中";
    }
  });

  pawTalents.forEach((talent) => {
    const level = pawTalentLevel(talent);
    const capped = level >= talent.maxLevel;
    const cost = pawTalentCost(talent);
    const canBuy = !capped && state.paws >= cost;
    const card = elements.wishList.querySelector(`[data-paw-talent-card="${talent.id}"]`);
    const levelLabel = elements.wishList.querySelector(`[data-paw-talent-level="${talent.id}"]`);
    const costLabel = elements.wishList.querySelector(`[data-paw-talent-cost="${talent.id}"]`);
    const button = elements.wishList.querySelector(`[data-upgrade-paw-talent="${talent.id}"]`);

    card?.classList.toggle("has-upgrade", canBuy);
    if (levelLabel) levelLabel.textContent = `Lv.${level}/${talent.maxLevel}`;
    if (costLabel) costLabel.textContent = capped ? "已满级" : `消耗 ${cost} 福爪`;
    if (button) {
      button.disabled = !canBuy;
      button.classList.toggle("has-upgrade", canBuy);
      button.textContent = capped ? "已满级" : "使用福爪";
    }
  });

  const pawSummary = elements.wishList.querySelector("[data-paw-summary]");
  if (pawSummary) pawSummary.textContent = `${formatNumber(state.paws)} 可用 / ${formatNumber(totalPaws(state))} 累计`;
  updateUpgradeBadges();
}

function renderHud() {
  const pps = productionPerSecond();
  const tap = tapPower();
  const nextBraceletCost = braceletCost();
  const { bead: currentBead, piece: currentPiece } = activeBracelet();
  const patina = currentPiece?.patina ?? 0;
  const patinaComplete = patina >= 1;

  elements.zenValue.textContent = formatNumber(state.zen);
  elements.ppsValue.textContent = `${formatNumber(pps)}/s`;
  elements.tapValue.textContent = `+${formatNumber(tap)}`;
  elements.lifetimeValue.textContent = formatNumber(state.totalZen);
  elements.pawValue.textContent = `${formatNumber(state.paws)} / ${formatNumber(totalPaws(state))}`;
  elements.catCountValue.textContent = `${totalCats(state)} / ${cats.length}`;
  elements.braceletName.textContent = currentBead.name;
  elements.braceletLevel.textContent = `${variantName(currentBead.id, currentPiece?.variant)} · ${Math.floor(patina * 100)}%`;
  elements.braceletStatus.textContent = patinaComplete ? "已包浆，换一个盘玩更好哦" : "放置中，会慢慢养包浆";
  elements.braceletStatus.title = elements.braceletStatus.textContent;
  elements.braceletCost.textContent = `手法 ${formatNumber(nextBraceletCost)}`;
  elements.altarBracelet.className = `bracelet-sprite ${currentBead.sprite} altar-bracelet`;
  elements.altarBracelet.style.setProperty("--bracelet-image", `url("${braceletAssetPath(currentBead, currentPiece)}")`);
  elements.upgradeBraceletButton.disabled = state.zen < nextBraceletCost;
  elements.upgradeBraceletButton.classList.toggle("has-upgrade", state.zen >= nextBraceletCost);
  elements.auraLabel.textContent = patinaComplete ? "已包浆" : `${Math.floor(patina * 100)}%`;
  elements.auraFill.style.width = `${patina * 100}%`;
}

function render() {
  renderDecorLayer();
  renderCats();
  renderShop();
  renderBeads();
  renderDecorations();
  renderWishes();
  panelsReady = true;
  renderHud();
  updatePanelState();
}

function tick(now) {
  const delta = Math.min(0.25, (now - lastTick) / 1000);
  lastTick = now;

  const pps = productionPerSecond();
  if (pps > 0) {
    gainZen(pps * delta);
  }
  advanceActiveBraceletPatina(delta);

  saveTimer += delta;
  if (saveTimer >= 5) {
    saveTimer = 0;
    saveState();
  }

  catActionTimer += delta;
  if (catActionTimer >= catActionDelay) {
    catActionTimer = 0;
    catActionDelay = randomCatActionDelay();
    updateCatActions();
  }

  updateCatPositions(delta);

  renderHud();
  if (panelsReady) updatePanelState();
  requestAnimationFrame(tick);
}

function toast(message) {
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  elements.toastStack.append(item);
  setTimeout(() => item.remove(), 2600);
}

function bindEvents() {
  bgmAudio.addEventListener("ended", playNextBgm);
  elements.bgmButton.addEventListener("click", toggleBgm);
  document.addEventListener("pointerdown", startBgmAfterGesture, { once: true });
  document.addEventListener("keydown", startBgmAfterGesture, { once: true });

  elements.tapTarget.addEventListener("pointerdown", startPolishing);
  elements.tapTarget.addEventListener("pointermove", rotatePolishing);
  elements.tapTarget.addEventListener("pointerup", stopPolishing);
  elements.tapTarget.addEventListener("pointercancel", stopPolishing);
  elements.tapTarget.addEventListener("click", (event) => {
    if (polishingState.moved) {
      event.preventDefault();
      polishingState.moved = false;
      return;
    }
    event.preventDefault();
    showPolishHint();
  });
  elements.upgradeBraceletButton.addEventListener("click", upgradeBracelet);
  elements.guideButton.addEventListener("click", () => openGuide(0));
  elements.guideSkipButton.addEventListener("click", () => closeGuide(true));
  elements.guideCloseButton.addEventListener("click", () => closeGuide(true));
  elements.guidePrevButton.addEventListener("click", prevGuideStep);
  elements.guideNextButton.addEventListener("click", nextGuideStep);
  elements.catGroupCloseButton.addEventListener("click", closeCatGroupPanel);
  elements.catLayer.addEventListener("pointerdown", beginCatDrag);
  elements.catLayer.addEventListener("pointermove", moveCatDrag);
  elements.catLayer.addEventListener("pointerup", finishCatDrag);
  elements.catLayer.addEventListener("pointercancel", finishCatDrag);

  document.addEventListener("click", (event) => {
    const stageCat = event.target.closest("[data-stage-cat]");
    if (stageCat) {
      if (suppressNextCatClick) {
        suppressNextCatClick = false;
        event.preventDefault();
        return;
      }
      const instanceIndex = Number(stageCat.dataset.catInstance ?? 0);
      changeCatAction(stageCat.dataset.cat, "cycle", instanceIndex);
      openCatGroupPanel(stageCat.dataset.cat);
      catActionTimer = 0;
      catActionDelay = randomCatActionDelay();
      return;
    }

    const catButton = event.target.closest("[data-buy-cat]");
    if (catButton) buyCat(catButton.dataset.buyCat);

    const beadButton = event.target.closest("[data-select-bead]");
    if (beadButton) selectBead(beadButton.dataset.selectBead);

    const addBeadButton = event.target.closest("[data-add-bead]");
    if (addBeadButton) addBead(addBeadButton.dataset.addBead);

    const decorButton = event.target.closest("[data-upgrade-decor]");
    if (decorButton) upgradeDecoration(decorButton.dataset.upgradeDecor);

    const wishButton = event.target.closest("[data-claim-wish]");
    if (wishButton) claimWish(wishButton.dataset.claimWish);

    const pawTalentButton = event.target.closest("[data-upgrade-paw-talent]");
    if (pawTalentButton) upgradePawTalent(pawTalentButton.dataset.upgradePawTalent);

    const tabButton = event.target.closest("[data-tab]");
    if (tabButton) switchTab(tabButton.dataset.tab);
  });

  document.addEventListener("keydown", (event) => {
    if (guideOpen && event.key === "Escape") {
      closeGuide(true);
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") return;
    const stageCat = event.target.closest("[data-stage-cat]");
    if (!stageCat) return;
    event.preventDefault();
    const instanceIndex = Number(stageCat.dataset.catInstance ?? 0);
    changeCatAction(stageCat.dataset.cat, "cycle", instanceIndex);
    openCatGroupPanel(stageCat.dataset.cat);
    catActionTimer = 0;
    catActionDelay = randomCatActionDelay();
  });

  elements.resetButton.addEventListener("click", () => {
    if (!confirm("清除当前猫猫盘珠日记存档？")) return;
    localStorage.removeItem(SAVE_KEY);
    state = defaultState();
    saveState();
    toast("存档已清除");
    render();
    openGuide(0);
  });

  window.addEventListener("beforeunload", saveState);
  window.addEventListener("resize", () => {
    if (!guideOpen) return;
    const step = guideSteps[guideIndex];
    positionGuideSpotlight(document.querySelector(step?.target));
  });
}

function switchTab(tab) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });
  document.querySelectorAll(".panel-view").forEach((view) => {
    view.classList.toggle("active", view.id === `${tab}View`);
  });
}

bindEvents();
render();
syncBgmButton();
saveState();
if (!state.tutorialSeen) {
  requestAnimationFrame(() => openGuide(0));
}
requestAnimationFrame(tick);
