const SAVE_KEY = "cat-bead-idle-save-v1";
const SPRITE_SERVICE_KEY = "cat-bodhi-sprite-service-url-v1";
const DEFAULT_SPRITE_SERVICE_BASE = "https://cat-bodhi.xiteng.site";

const bgmTracks = [
  "assets/audio/bodhi-cat-shop.mp3",
  "assets/audio/bodhi-cat-shop-alt.mp3",
];

const BALANCE = {
  version: 4,
  upgradePaceMinutes: [
    0.35, 0.65, 1, 1.5, 2.2, 3.2, 4.8, 7, 10, 14,
    19, 25, 32, 41, 52, 66, 82, 102, 126, 155,
  ],
  latePaceGrowth: 1.16,
  baseZenPerSecond: 1,
  manualBaseGain: 1,
  manualPatinaGain: 0.002,
  basePatinaRate: 1 / 720,
  mainBraceletBonus: 1.2,
  mainPatinaSpeed: 1.5,
  patinaStageNew: 1,
  patinaStagePlaying: 1.3,
  patinaStageRush: 1.6,
  patinaStageComplete: 0.35,
  typeOwnedBonus: 0.08,
  typeOwnedExponent: 0.7,
  prestigePawBonus: 0.12,
  offlineFullHours: 12,
  offlineReducedHours: 12,
  offlineReducedRate: 0.2,
  maxOfflineHours: 24,
  moodDecayPerHour: 5,
  satietyDecayPerHour: 7,
  pricingTapRate: 0.16,
  pricingFloor: 0.22,
  handcraftGrowth: 1.08,
};

const cats = [
  {
    id: "tabby",
    name: "橘串师",
    sprite: "tabby",
    baseCost: 300,
    costGrowth: 1.18,
    baseZenRate: 0.25,
    basePatinaPower: 1,
    effect: "包浆速度提升",
    unlock: 0,
  },
  {
    id: "sleepy",
    name: "白团守垫",
    sprite: "sleepy",
    baseCost: 1800,
    costGrowth: 1.19,
    baseZenRate: 1,
    basePatinaPower: 2,
    effect: "离线收益提升",
    unlock: 260,
  },
  {
    id: "monk",
    name: "黑禅猫",
    sprite: "monk",
    baseCost: 10800,
    costGrowth: 1.2,
    baseZenRate: 4,
    basePatinaPower: 4,
    effect: "手串收益提升",
    unlock: 2800,
  },
  {
    id: "vendor",
    name: "三花掌柜",
    sprite: "vendor",
    baseCost: 64800,
    costGrowth: 1.21,
    baseZenRate: 16,
    basePatinaPower: 8,
    effect: "自动盘玩速度提升",
    unlock: 30000,
  },
];

const beads = [
  { id: "bodhi-root", name: "菩提根", sprite: "bodhi-root", threshold: 0, unlockCost: 0, baseCost: 100, costGrowth: 1.18, baseBonus: 0.03, patinaDifficulty: 1, note: "纯色/渐变/多宝随机" },
  { id: "monkey-head", name: "猴头", sprite: "monkey-head", threshold: 1500, unlockCost: 1500, baseCost: 1500, costGrowth: 1.2, baseBonus: 0.08, patinaDifficulty: 3, note: "核纹红润" },
  { id: "xingyue", name: "星月菩提", sprite: "xingyue", threshold: 12000, unlockCost: 12000, baseCost: 12000, costGrowth: 1.22, baseBonus: 0.18, patinaDifficulty: 8, note: "星点月眼" },
  { id: "vajra", name: "小金刚", sprite: "vajra", threshold: 80000, unlockCost: 80000, baseCost: 80000, costGrowth: 1.24, baseBonus: 0.45, patinaDifficulty: 20, note: "深纹金刚" },
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
    costGrowth: 1.23,
    unlock: 0,
    maxLevel: 12,
    effect: "catZen",
    value: 0.06,
    note: "猫息 +6%/级",
  },
  {
    id: "cat-bed",
    name: "猫窝",
    sprite: "cat-bed",
    baseCost: 90,
    costGrowth: 1.24,
    unlock: 120,
    maxLevel: 12,
    effect: "moodCare",
    value: 0.1,
    note: "心情下降 -10%/级",
  },
  {
    id: "scratch-post",
    name: "抓抓柱",
    sprite: "scratch-post",
    baseCost: 480,
    costGrowth: 1.25,
    unlock: 800,
    maxLevel: 10,
    effect: "manual",
    value: 0.05,
    note: "手动盘珠 +5%/级",
  },
  {
    id: "window-perch",
    name: "窗台软垫",
    sprite: "window-perch",
    baseCost: 2500,
    costGrowth: 1.26,
    unlock: 3500,
    maxLevel: 10,
    effect: "patina",
    value: 0.08,
    note: "包浆速度 +8%/级",
  },
  {
    id: "toy-basket",
    name: "玩具篮",
    sprite: "toy-basket",
    baseCost: 12000,
    costGrowth: 1.27,
    unlock: 18000,
    maxLevel: 8,
    effect: "satietyCare",
    value: 0.1,
    note: "饱食下降 -10%/级",
  },
  {
    id: "display-shelf",
    name: "文玩柜",
    sprite: "display-shelf",
    baseCost: 65000,
    costGrowth: 1.28,
    unlock: 80000,
    maxLevel: 8,
    effect: "bracelet",
    value: 0.05,
    note: "手串总加成 +5%/级",
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
  const now = Date.now();
  return {
    id: `${beadId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    type: beadId,
    variant,
    patina,
    isMain: false,
    addedAt: now,
    createdAt: now,
    completedAt: patina >= 1 ? now : null,
  };
}

function starterBeadCollections() {
  return {
    ...Object.fromEntries(beads.map((bead) => [bead.id, []])),
    "bodhi-root": [makeBeadPiece("bodhi-root", "pure", 0)],
  };
}

const defaultState = () => {
  const beadCollections = starterBeadCollections();
  const starterBracelet = beadCollections["bodhi-root"][0];
  starterBracelet.isMain = true;
  return {
    zen: 0,
    totalZen: 0,
    braceletLevel: 1,
    selectedBead: "bodhi-root",
    mainBraceletId: starterBracelet.id,
    beadCollections,
    customCats: [],
    customBeads: [],
    catCounts: { ...Object.fromEntries(cats.map((cat) => [cat.id, 0])), tabby: 1 },
    catMood: Object.fromEntries(cats.map((cat) => [cat.id, 100])),
    catSatiety: Object.fromEntries(cats.map((cat) => [cat.id, 100])),
    catPlacements: {},
    decorationPlacements: {},
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
  };
};

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
  { id: "pad-left", x: 5, minX: 3, maxX: 12, bottom: 2, z: 8, allowed: ["sit", "lie"] },
  { id: "floor-left", x: 17, minX: 10, maxX: 27, bottom: 4, z: 9, allowed: ["sit", "lie", "walk", "play"] },
  { id: "floor-mid", x: 34, minX: 25, maxX: 47, bottom: 3, z: 10, allowed: ["sit", "walk", "play", "jump"] },
  { id: "rug-front", x: 48, minX: 38, maxX: 60, bottom: 0, z: 12, allowed: ["sit", "lie", "walk", "run"] },
  { id: "floor-right", x: 63, minX: 53, maxX: 75, bottom: 5, z: 11, allowed: ["sit", "walk", "play", "jump"] },
  { id: "rack-right", x: 78, minX: 72, maxX: 88, bottom: 8, z: 9, allowed: ["sit", "lie", "play"] },
  { id: "window-back", x: 22, minX: 16, maxX: 30, bottom: 43, z: 5, allowed: ["sit", "lie"] },
  { id: "shelf-back", x: 86, minX: 80, maxX: 92, bottom: 38, z: 5, allowed: ["sit", "lie"] },
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
    hint: "猫咪和装饰都可以拖动摆放；猫咪也会自己走动换动作。出现感叹号时，说明那个养成项已经能升级。",
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
  patinaChanged: false,
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
const decorDragState = {
  active: false,
  pointerId: null,
  element: null,
  decorId: "",
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
  nextGoalText: $("#nextGoalText"),
  saveStatus: $("#saveStatus"),
  catAiForm: $("#catAiForm"),
  catAiName: $("#catAiName"),
  catAiNote: $("#catAiNote"),
  catPromptButton: $("#catPromptButton"),
  catPromptText: $("#catPromptText"),
  catSpriteServiceUrl: $("#catSpriteServiceUrl"),
  catSpriteServiceCheck: $("#catSpriteServiceCheck"),
  catSpriteServiceStatus: $("#catSpriteServiceStatus"),
  catAiPhoto: $("#catAiPhoto"),
  catAiButton: $("#catAiButton"),
  catAiStatus: $("#catAiStatus"),
  beadAiForm: $("#beadAiForm"),
  beadAiName: $("#beadAiName"),
  beadAiNote: $("#beadAiNote"),
  beadPromptButton: $("#beadPromptButton"),
  beadPromptText: $("#beadPromptText"),
  beadSpriteServiceUrl: $("#beadSpriteServiceUrl"),
  beadSpriteServiceCheck: $("#beadSpriteServiceCheck"),
  beadSpriteServiceStatus: $("#beadSpriteServiceStatus"),
  beadAiPhoto: $("#beadAiPhoto"),
  beadAiButton: $("#beadAiButton"),
  beadAiStatus: $("#beadAiStatus"),
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
  exportSaveButton: $("#exportSaveButton"),
  importSaveButton: $("#importSaveButton"),
  importSaveInput: $("#importSaveInput"),
  saveExportLayer: $("#saveExportLayer"),
  saveExportFilename: $("#saveExportFilename"),
  saveExportText: $("#saveExportText"),
  saveExportCloseButton: $("#saveExportCloseButton"),
  saveExportCopyButton: $("#saveExportCopyButton"),
  saveExportSelectButton: $("#saveExportSelectButton"),
  resetButton: $("#resetButton"),
};

const SPRITE_STYLE_PROMPTS = {
  cat: [
    "请参考我附上的现实猫咪照片，保留猫咪最有辨识度的毛色、脸部花纹、眼神印象、耳朵/尾巴轮廓和体型比例。",
    "目标：生成一张可直接用于《猫猫盘珠日记》的三帧猫咪动作 sprite sheet，不是单体单动作。三帧必须都是同一只参考猫，只改变动作，不改变花色和体型。",
    "动作与排列：横向一排 3 个独立 sprite，左边是 sit/idle 坐姿，中间是 jump/play 跳跃姿势，右边是 lie/rest 趴卧姿势。每帧之间留足纯绿色间隔，三只猫不要接触、不要重叠。",
    "风格：温暖复古像素风、文玩小铺氛围、低分辨率游戏精灵、粗像素块、深棕色外轮廓、少量暖金/青绿色点缀、边缘清晰、可爱但仍像参考照片里的猫。",
    "构图：横向长方形画布或宽画布，全身，3/4 视角，每个动作四周留出安全边距，不要裁切耳朵和尾巴。",
    "背景：必须使用纯绿色抠图背景 #04F90E，整张图背景必须是单一纯色、平整、无纹理、无阴影、无地面；不要透明背景。",
    "禁止：文字、签名、边框、UI、相框、复杂场景、玩具/衣服/道具遮挡猫、写实照片质感、3D 渲染、油画、水彩、渐变背景。",
    "输出：一张 PNG 三动作 sprite sheet，主体清晰，适合后续按帧抠背景并裁切成 128x128 游戏 sprite。",
  ].join("\n"),
  bead: [
    "请参考我附上的现实文玩/手串照片，保留珠子的材质、颜色、纹理、孔道、绳结/隔珠关系，以及最有辨识度的包浆或花纹。",
    "目标：生成一张可直接用于《猫猫盘珠日记》的单体文玩手串 sprite。风格必须匹配当前游戏素材：温暖复古像素风、文玩小铺氛围、低分辨率游戏精灵、粗像素块、深棕色外轮廓、暖金与青绿色点缀、边缘清晰、材质特征可读。",
    "构图：正方形画布，完整圆形或椭圆形手串，居中，俯视或轻微 3/4 视角，所有珠子属于同一串，整体轮廓尽量连贯，四周留出安全边距。",
    "背景：必须使用纯绿色抠图背景 #04F90E，整张图背景必须是单一纯色、平整、无纹理、无阴影、无桌面；不要透明背景。",
    "禁止：文字、签名、边框、UI、手、桌面、展示盒、散落珠子、复杂场景、写实照片质感、3D 渲染、油画、水彩、渐变背景。",
    "输出：一张 PNG 风格图，主体清晰，适合后续抠背景和裁切成 128x128 游戏 sprite。",
  ].join("\n"),
};

const bgmAudio = new Audio(bgmTracks[0]);
bgmAudio.preload = "auto";
bgmAudio.volume = 0.38;
let bgmIndex = 0;
let bgmStarted = false;

function slugifyId(value, prefix = "ai") {
  const ascii = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${prefix}-${ascii || Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeStoredImageUrl(value) {
  const url = String(value || "");
  const path = url.replace(/^\.\//, "");
  const pageHost = globalThis.window?.location?.hostname ?? "";
  const remotePage = pageHost && pageHost !== "localhost" && pageHost !== "127.0.0.1";
  if (remotePage && path.startsWith("assets/ai/")) return `${spriteServiceBase()}/${path}`;
  return url;
}

function normalizeCustomCats(items = []) {
  return (Array.isArray(items) ? items : [])
    .filter((cat) => cat && cat.id && (cat.imageUrl || cat.actionImages?.sit || cat.actionImages?.jump || cat.actionImages?.lie))
    .map((cat) => {
      const rawImages = cat.actionImages && typeof cat.actionImages === "object" ? cat.actionImages : {};
      const imageUrl = normalizeStoredImageUrl(cat.imageUrl || rawImages.sit || rawImages.jump || rawImages.lie || "");
      const actionImages = {};
      ["sit", "jump", "lie"].forEach((action) => {
        const value = normalizeStoredImageUrl(rawImages[action] || imageUrl);
        if (value) actionImages[action] = String(value);
      });
      return {
        id: String(cat.id),
        name: String(cat.name || "AI猫猫").slice(0, 18),
        sprite: "custom-cat",
        imageUrl,
        actionImages,
        baseCost: Math.max(1, Number(cat.baseCost ?? 900)),
        costGrowth: Math.max(1.01, Number(cat.costGrowth ?? 1.18)),
        baseZenRate: Math.max(0.1, Number(cat.baseZenRate ?? 1.2)),
        basePatinaPower: Math.max(0.5, Number(cat.basePatinaPower ?? 2)),
        effect: String(cat.effect || "AI专属猫息"),
        unlock: Math.max(0, Number(cat.unlock ?? 0)),
        custom: true,
      };
    });
}

function normalizeCustomBeads(items = []) {
  return (Array.isArray(items) ? items : [])
    .filter((bead) => bead && bead.id && bead.imageUrl)
    .map((bead) => ({
      id: String(bead.id),
      name: String(bead.name || "AI新串").slice(0, 18),
      sprite: "custom-bead",
      imageUrl: normalizeStoredImageUrl(bead.imageUrl),
      threshold: Math.max(0, Number(bead.threshold ?? 0)),
      unlockCost: Math.max(0, Number(bead.unlockCost ?? 0)),
      baseCost: Math.max(1, Number(bead.baseCost ?? 1200)),
      costGrowth: Math.max(1.01, Number(bead.costGrowth ?? 1.2)),
      baseBonus: Math.max(0.01, Number(bead.baseBonus ?? 0.12)),
      patinaDifficulty: Math.max(1, Number(bead.patinaDifficulty ?? 4)),
      note: String(bead.note || "AI设计新串"),
      custom: true,
    }));
}

function allCats(current = state) {
  return [...cats, ...normalizeCustomCats(current?.customCats ?? [])];
}

function allBeads(current = state) {
  return [...beads, ...normalizeCustomBeads(current?.customBeads ?? [])];
}

function spriteInlineStyle(imageUrl) {
  return imageUrl ? ` style="background-image:url('${escapeHtml(imageUrl)}')"` : "";
}

function catActionImage(cat, action = "sit") {
  const actionKey = ["sit", "jump", "lie"].includes(action) ? action : "sit";
  return cat?.actionImages?.[actionKey] || cat?.imageUrl || "";
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    const merged = { ...defaultState(), ...saved };
    merged.customCats = normalizeCustomCats(saved?.customCats ?? []);
    merged.customBeads = normalizeCustomBeads(saved?.customBeads ?? []);
    merged.beadCollections = {
      ...starterBeadCollections(),
      ...(saved?.beadCollections ?? {}),
    };
    merged.catCounts = { ...defaultState().catCounts, ...Object.fromEntries(allCats(merged).map((cat) => [cat.id, 0])), ...(saved?.catCounts ?? {}) };
    merged.catMood = { ...Object.fromEntries(allCats(merged).map((cat) => [cat.id, 100])), ...(saved?.catMood ?? {}) };
    merged.catSatiety = { ...Object.fromEntries(allCats(merged).map((cat) => [cat.id, 100])), ...(saved?.catSatiety ?? {}) };
    merged.catPlacements = { ...(saved?.catPlacements ?? {}) };
    merged.decorationPlacements = { ...(saved?.decorationPlacements ?? {}) };
    merged.decorationLevels = { ...defaultState().decorationLevels, ...(saved?.decorationLevels ?? {}) };
    merged.pawTalentLevels = { ...defaultState().pawTalentLevels, ...(saved?.pawTalentLevels ?? {}) };
    merged.claimedWishes = { ...(saved?.claimedWishes ?? {}) };
    if (saved?.balanceVersion !== BALANCE.version || !Number.isFinite(saved?.upgradePaceStep)) {
      merged.upgradePaceStep = estimateUpgradePaceStep(merged);
      merged.balanceVersion = BALANCE.version;
    }
    merged.selectedBead = beadIdMigration[merged.selectedBead] ?? merged.selectedBead;
    if (!allBeads(merged).some((bead) => bead.id === merged.selectedBead)) merged.selectedBead = "bodhi-root";
    ensureBeadCollections(merged);
    ensureMainBracelet(merged);
    if (!beadCollection(merged.selectedBead, merged).length) merged.selectedBead = firstOwnedBeadId(merged);

    const elapsedSeconds = Math.max(0, Math.min(BALANCE.maxOfflineHours * 3600, (Date.now() - (merged.lastSaved ?? Date.now())) / 1000));
    if (elapsedSeconds > 15) {
      decayCatCare(elapsedSeconds, merged);
      const offlineGain = getOfflineGain(productionPerSecond(merged), elapsedSeconds);
      if (offlineGain > 0) {
        merged.zen += offlineGain;
        merged.totalZen += offlineGain;
        requestAnimationFrame(() => toast(`离线收获 ${formatNumber(offlineGain)} 禅意`));
      }
      advanceActiveBraceletPatina(elapsedSeconds, merged, false);
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

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function isImageDataUrl(value) {
  return /^data:image\//i.test(String(value || ""));
}

function customExportImageUrls(exportState) {
  const urls = new Set();
  const addUrl = (value) => {
    const url = normalizeStoredImageUrl(value).trim();
    if (url && !isImageDataUrl(url)) urls.add(url);
  };

  const customCats = normalizeCustomCats(exportState.customCats ?? []);
  customCats.forEach((cat) => {
    addUrl(cat.imageUrl);
    Object.values(cat.actionImages ?? {}).forEach(addUrl);
  });

  const customBeads = normalizeCustomBeads(exportState.customBeads ?? []);
  const customBeadIds = new Set(customBeads.map((bead) => bead.id));
  customBeads.forEach((bead) => addUrl(bead.imageUrl));
  Object.entries(exportState.beadCollections ?? {}).forEach(([beadId, collection]) => {
    if (!customBeadIds.has(beadId) || !Array.isArray(collection)) return;
    collection.forEach((piece) => addUrl(piece?.imageUrl));
  });

  return [...urls];
}

async function fetchImageAsDataUrl(imageUrl) {
  const response = await fetch(imageUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`读取图片失败：${response.status}`);
  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) throw new Error("读取到的不是图片");
  return readBlobAsDataUrl(blob);
}

async function customImageDataMap(exportState) {
  const urls = customExportImageUrls(exportState);
  const imageMap = new Map();
  const failedUrls = [];
  for (const url of urls) {
    try {
      imageMap.set(url, await fetchImageAsDataUrl(url));
    } catch {
      failedUrls.push(url);
    }
  }
  return { imageMap, failedUrls };
}

function embedImageUrl(value, imageMap) {
  const url = normalizeStoredImageUrl(value);
  return imageMap.get(url) || url;
}

function embedCustomImagesInExportState(exportState, imageMap) {
  exportState.customCats = normalizeCustomCats(exportState.customCats ?? []).map((cat) => ({
    ...cat,
    imageUrl: embedImageUrl(cat.imageUrl, imageMap),
    actionImages: Object.fromEntries(
      Object.entries(cat.actionImages ?? {}).map(([action, imageUrl]) => [action, embedImageUrl(imageUrl, imageMap)])
    ),
  }));

  exportState.customBeads = normalizeCustomBeads(exportState.customBeads ?? []).map((bead) => ({
    ...bead,
    imageUrl: embedImageUrl(bead.imageUrl, imageMap),
  }));

  const customBeadIds = new Set(exportState.customBeads.map((bead) => bead.id));
  exportState.beadCollections = { ...(exportState.beadCollections ?? {}) };
  Object.entries(exportState.beadCollections).forEach(([beadId, collection]) => {
    if (!customBeadIds.has(beadId) || !Array.isArray(collection)) return;
    exportState.beadCollections[beadId] = collection.map((piece) => ({
      ...piece,
      imageUrl: embedImageUrl(piece?.imageUrl, imageMap),
    }));
  });
}

async function saveExportPayload() {
  const exportState = clonePlain(state);
  const { imageMap, failedUrls } = await customImageDataMap(exportState);
  embedCustomImagesInExportState(exportState, imageMap);
  return {
    app: "cat-bodhi",
    saveKey: SAVE_KEY,
    exportedAt: new Date().toISOString(),
    version: BALANCE.version,
    customImageExport: {
      embeddedCount: imageMap.size,
      failedCount: failedUrls.length,
    },
    state: exportState,
  };
}

function exportFilename() {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `cat-bodhi-save-${stamp}.json`;
}

function isWeChatBrowser() {
  return /micromessenger/i.test(navigator.userAgent || "");
}

function selectExportText() {
  const text = elements.saveExportText;
  if (!text) return;
  text.focus();
  text.select();
  text.setSelectionRange?.(0, text.value.length);
}

function openSaveExportPanel(payload, filename, message = "存档文本已生成，可以复制保存。") {
  elements.saveExportFilename.textContent = filename;
  elements.saveExportText.value = payload;
  elements.saveExportLayer.hidden = false;
  selectExportText();
  toast(message);
}

function closeSaveExportPanel() {
  elements.saveExportLayer.hidden = true;
}

async function copySaveExportText() {
  const text = elements.saveExportText?.value || "";
  if (!text) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      selectExportText();
      document.execCommand("copy");
    }
    toast("存档文本已复制");
  } catch {
    selectExportText();
    toast("已全选存档文本，请长按复制");
  }
}

function exportToastMessage(baseMessage, stats) {
  if (stats?.failedCount > 0) {
    return `${baseMessage}，但 ${stats.failedCount} 张自定义图片无法内嵌`;
  }
  if (stats?.embeddedCount > 0) {
    return `${baseMessage}，已包含 ${stats.embeddedCount} 张自定义图片`;
  }
  return baseMessage;
}

async function exportSave() {
  saveState();
  elements.exportSaveButton.disabled = true;
  try {
    toast("正在整理存档图片...");
    const exportData = await saveExportPayload();
    const payload = JSON.stringify(exportData, null, 2);
    const filename = exportFilename();
    if (isWeChatBrowser()) {
      openSaveExportPanel(payload, filename, exportToastMessage("微信内无法稳定下载文件，已生成可复制的存档文本", exportData.customImageExport));
      return;
    }

    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast(exportToastMessage("存档已导出", exportData.customImageExport));
  } catch (error) {
    toast(`导出失败：${error.message || "存档图片无法读取"}`);
  } finally {
    elements.exportSaveButton.disabled = false;
  }
}

function normalizeImportedSave(raw) {
  const imported = raw?.state && typeof raw.state === "object" ? raw.state : raw;
  if (!imported || typeof imported !== "object") {
    throw new Error("存档格式不正确");
  }
  if (!Number.isFinite(Number(imported.zen)) || !Number.isFinite(Number(imported.totalZen))) {
    throw new Error("存档缺少必要资源数据");
  }
  const base = defaultState();
  const merged = {
    ...base,
    ...imported,
    zen: Math.max(0, Number(imported.zen ?? 0)),
    totalZen: Math.max(0, Number(imported.totalZen ?? 0)),
    braceletLevel: Math.max(1, Number(imported.braceletLevel ?? 1)),
    customCats: normalizeCustomCats(imported.customCats ?? []),
    customBeads: normalizeCustomBeads(imported.customBeads ?? []),
    catPlacements: { ...(imported.catPlacements ?? {}) },
    decorationPlacements: { ...(imported.decorationPlacements ?? {}) },
    claimedWishes: { ...(imported.claimedWishes ?? {}) },
    lastSaved: Date.now(),
  };
  merged.catCounts = { ...base.catCounts, ...Object.fromEntries(allCats(merged).map((cat) => [cat.id, 0])), ...(imported.catCounts ?? {}) };
  merged.catMood = { ...Object.fromEntries(allCats(merged).map((cat) => [cat.id, 100])), ...(imported.catMood ?? {}) };
  merged.catSatiety = { ...Object.fromEntries(allCats(merged).map((cat) => [cat.id, 100])), ...(imported.catSatiety ?? {}) };
  merged.decorationLevels = { ...base.decorationLevels, ...(imported.decorationLevels ?? {}) };
  merged.pawTalentLevels = { ...base.pawTalentLevels, ...(imported.pawTalentLevels ?? {}) };
  merged.beadCollections = { ...starterBeadCollections(), ...(imported.beadCollections ?? {}) };
  ensureBeadCollections(merged);
  ensureMainBracelet(merged);
  if (!allBeads(merged).some((bead) => bead.id === merged.selectedBead)) merged.selectedBead = firstOwnedBeadId(merged);
  merged.balanceVersion = BALANCE.version;
  if (!Number.isFinite(merged.upgradePaceStep)) merged.upgradePaceStep = estimateUpgradePaceStep(merged);
  return merged;
}

async function importSaveFile(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const raw = JSON.parse(text);
    const nextState = normalizeImportedSave(raw);
    if (!confirm("导入会覆盖当前猫猫盘珠日记存档，确定继续？")) return;
    state = nextState;
    catVisualState.clear();
    closeCatGroupPanel();
    saveState();
    render();
    syncBgmButton();
    toast("存档已导入");
  } catch (error) {
    toast(`导入失败：${error.message || "文件无法读取"}`);
  } finally {
    elements.importSaveInput.value = "";
  }
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

function normalizeBeadPiece(bead, piece, index) {
  const item = piece && typeof piece === "object" ? piece : {};
  const now = Date.now();
  const bodhiVariant = bodhiVariants.some((variant) => variant.id === item.variant) ? item.variant : "pure";
  item.id = item.id ?? `${bead.id}-migrated-${index}`;
  item.type = bead.id;
  item.variant = bead.id === "bodhi-root" ? bodhiVariant : "default";
  item.patina = Math.max(0, Math.min(1, Number(item.patina ?? 0)));
  item.imageUrl = normalizeStoredImageUrl(item.imageUrl ?? bead.imageUrl);
  item.isMain = Boolean(item.isMain);
  item.addedAt = item.addedAt ?? now;
  item.createdAt = item.createdAt ?? item.addedAt ?? now;
  item.completedAt = item.completedAt ?? (item.patina >= 1 ? now : null);
  return item;
}

function ensureBeadCollections(current = state) {
  if (!current.beadCollections || typeof current.beadCollections !== "object") {
    current.beadCollections = starterBeadCollections();
  }

  allBeads(current).forEach((bead) => {
    const collection = Array.isArray(current.beadCollections[bead.id]) ? current.beadCollections[bead.id] : [];
    current.beadCollections[bead.id] = collection
      .filter(Boolean)
      .map((piece, index) => normalizeBeadPiece(bead, piece, index));
  });

  if (!current.beadCollections["bodhi-root"].length) {
    current.beadCollections["bodhi-root"].push(makeBeadPiece("bodhi-root", "pure", 0));
  }
}

function allBracelets(current = state) {
  ensureBeadCollections(current);
  return allBeads(current).flatMap((bead) => {
    const collection = current.beadCollections[bead.id] ?? [];
    return collection.map((piece) => ({ bead, piece }));
  });
}

function ensureMainBracelet(current = state) {
  ensureBeadCollections(current);
  const owned = allBracelets(current);
  let main = owned.find(({ piece }) => piece.id === current.mainBraceletId);
  if (!main) {
    main = owned.find(({ piece }) => piece.patina < 1) ?? owned[0];
    current.mainBraceletId = main?.piece.id ?? "";
  }
  owned.forEach(({ piece }) => {
    piece.isMain = piece.id === current.mainBraceletId;
  });
  if (main?.bead) current.selectedBead = main.bead.id;
}

function beadCollection(beadId, current = state) {
  ensureBeadCollections(current);
  return current.beadCollections[beadId] ?? [];
}

function firstOwnedBeadId(current = state) {
  ensureBeadCollections(current);
  return allBeads(current).find((bead) => beadCollection(bead.id, current).length > 0)?.id ?? "bodhi-root";
}

function activeBead(current = state) {
  ensureMainBracelet(current);
  return allBracelets(current).find(({ piece }) => piece.id === current.mainBraceletId)?.bead ?? allBeads(current)[0] ?? beads[0];
}

function activeBracelet(current = state) {
  ensureMainBracelet(current);
  const owned = allBracelets(current);
  const main = owned.find(({ piece }) => piece.id === current.mainBraceletId) ?? owned[0];
  const bead = main?.bead ?? allBeads(current)[0] ?? beads[0];
  const collection = current.beadCollections?.[bead.id] ?? [];
  const piece = main?.piece ?? collection[0] ?? makeBeadPiece(bead.id, bead.id === "bodhi-root" ? "pure" : "default", 0);
  return { bead, piece, collection };
}

function beadPatinaStage(piece) {
  return Math.max(0, Math.min(4, Math.floor((piece?.patina ?? 0) * 4.999)));
}

function braceletAssetPath(bead, piece) {
  if (bead?.imageUrl || piece?.imageUrl) return piece?.imageUrl ?? bead.imageUrl;
  const variant = piece?.variant ?? (bead.id === "bodhi-root" ? "pure" : "default");
  return `assets/art/v3/bracelets/${bead.id}-${variant}-${beadPatinaStage(piece)}.png`;
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

function getPatinaStageMultiplier(patina) {
  if (patina >= 1) return BALANCE.patinaStageComplete;
  if (patina >= 0.8) return BALANCE.patinaStageRush;
  if (patina >= 0.3) return BALANCE.patinaStagePlaying;
  return BALANCE.patinaStageNew;
}

function getPatinaStageName(patina) {
  if (patina >= 1) return "成品沉淀期";
  if (patina >= 0.8) return "包浆冲刺期";
  if (patina >= 0.3) return "盘玩期";
  return "新串期";
}

function getTypeOwnedMultiplier(count) {
  if (count <= 1) return 1;
  return 1 + BALANCE.typeOwnedBonus * Math.pow(count - 1, BALANCE.typeOwnedExponent);
}

function beadTypeMultiplier(beadId, current = state) {
  return getTypeOwnedMultiplier(beadOwnedCount(beadId, current));
}

function isMainBracelet(piece, current = state) {
  return Boolean(piece && piece.id === current.mainBraceletId);
}

function getBraceletContribution(bead, piece, current = state) {
  if (!bead || !piece) return 0;
  return bead.baseBonus *
    getPatinaStageMultiplier(piece.patina ?? 0) *
    beadTypeMultiplier(bead.id, current) *
    (isMainBracelet(piece, current) ? BALANCE.mainBraceletBonus : 1);
}

function braceletTotalMultiplier(current = state) {
  const totalBonus = allBracelets(current).reduce((sum, { bead, piece }) => {
    return sum + getBraceletContribution(bead, piece, current);
  }, 0);
  return (1 + totalBonus) * decorationMultiplier("bracelet", current);
}

function activeBraceletFocusMultiplier(current = state) {
  const { bead, piece } = activeBracelet(current);
  return 1 + getBraceletContribution(bead, piece, current);
}

function beadPieceCost(bead, current = state) {
  const count = beadOwnedCount(bead.id, current);
  return Math.floor(bead.baseCost * Math.pow(bead.costGrowth, count));
}

function canAddBead(bead, current = state) {
  return current.totalZen >= bead.threshold && current.zen >= beadPieceCost(bead, current);
}

function activePatinaPercent(current = state) {
  return Math.floor((activeBracelet(current).piece?.patina ?? 0) * 100);
}

function patinaPercentValue(piece) {
  return Math.max(0, Math.min(100, (piece?.patina ?? 0) * 100));
}

function formatPatinaPercent(pieceOrValue) {
  const percent = typeof pieceOrValue === "number"
    ? Math.max(0, Math.min(100, pieceOrValue * 100))
    : patinaPercentValue(pieceOrValue);
  if (percent >= 100) return "100%";
  if (percent < 1) return `${percent.toFixed(2)}%`;
  return percent < 10 ? `${percent.toFixed(1)}%` : `${Math.floor(percent)}%`;
}

function braceletPatinaLabel(bead, piece, active = false) {
  if (!piece) return bead.note;
  if (active && piece.patina >= 1) return "已包浆，换一个盘玩更好哦";
  return `${variantName(bead.id, piece.variant)} · ${getPatinaStageName(piece.patina)} · ${formatPatinaPercent(piece)}`;
}

function uniqueCats(current = state) {
  return allCats(current).filter((cat) => (current.catCounts[cat.id] ?? 0) > 0).length;
}

function totalCats(current = state) {
  return Object.values(current.catCounts).reduce((sum, count) => sum + count, 0);
}

function visibleCatCount(count) {
  return Math.max(0, Math.min(count, 5));
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

function availablePrestigePaws(current = state) {
  return Math.max(0, Math.floor(Math.pow((current.totalZen ?? 0) / 100000, 0.5)) - totalPaws(current));
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

function decorationBonus(effect, current = state) {
  return decorations.reduce((sum, decor) => {
    const level = decorationLevel(decor, current);
    if (decor.effect !== effect) return sum;
    return sum + decor.value * level;
  }, 0);
}

function decorationMultiplier(effect, current = state) {
  return 1 + decorationBonus(effect, current);
}

function prestigeMultiplier(current = state) {
  return (1 + totalPaws(current) * BALANCE.prestigePawBonus) * pawTalentMultiplier("allMult", current);
}

function getCatMilestoneMultiplier(owned) {
  if (owned >= 50) return 8;
  if (owned >= 25) return 5;
  if (owned >= 10) return 3;
  if (owned >= 5) return 2;
  if (owned >= 3) return 1.5;
  if (owned >= 2) return 1.2;
  return 1;
}

function catZenRate(cat, current = state) {
  const owned = current.catCounts[cat.id] ?? 0;
  return cat.baseZenRate * owned * getCatMilestoneMultiplier(owned);
}

function catPatinaPower(cat, current = state) {
  const owned = current.catCounts[cat.id] ?? 0;
  return cat.basePatinaPower * owned * getCatMilestoneMultiplier(owned);
}

function totalCatZenRate(current = state) {
  return allCats(current).reduce((sum, cat) => sum + catZenRate(cat, current), 0);
}

function totalCatPatinaPower(current = state) {
  return Math.max(1, allCats(current).reduce((sum, cat) => sum + catPatinaPower(cat, current), 0));
}

function averageMood(current = state) {
  const ownedCats = allCats(current).filter((cat) => (current.catCounts[cat.id] ?? 0) > 0);
  if (!ownedCats.length) return 100;
  return ownedCats.reduce((sum, cat) => sum + (current.catMood?.[cat.id] ?? 100), 0) / ownedCats.length;
}

function getMoodMultiplier(avgMood = averageMood()) {
  if (avgMood >= 80) return 1.2;
  if (avgMood >= 50) return 1;
  if (avgMood >= 20) return 0.8;
  return 0.6;
}

function productionPerSecond(current = state) {
  const catZenMultiplier = (1 + totalCatZenRate(current)) * decorationMultiplier("catZen", current) * pawTalentMultiplier("catMult", current);
  return BALANCE.baseZenPerSecond *
    catZenMultiplier *
    braceletTotalMultiplier(current) *
    getMoodMultiplier(averageMood(current)) *
    prestigeMultiplier(current);
}

function tapPower(current = state) {
  return BALANCE.manualBaseGain *
    braceletTotalMultiplier(current) *
    getMoodMultiplier(averageMood(current)) *
    prestigeMultiplier(current) *
    decorationMultiplier("manual", current) *
    pawTalentMultiplier("tapMult", current) *
    Math.pow(BALANCE.handcraftGrowth, Math.max(0, current.braceletLevel - 1));
}

function catDisplayPps(cat, current = state) {
  return BALANCE.baseZenPerSecond *
    catZenRate(cat, current) *
    decorationMultiplier("catZen", current) *
    braceletTotalMultiplier(current) *
    getMoodMultiplier(averageMood(current)) *
    prestigeMultiplier(current);
}

function catGroupPps(cat, current = state) {
  return catDisplayPps(cat, current);
}

function catGroupBonus(cat, current = state) {
  const count = current.catCounts[cat.id] ?? 0;
  if (count <= 0) return 0;
  return catPatinaPower(cat, current);
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

function catCost(cat, current = state) {
  const count = current.catCounts[cat.id] ?? 0;
  return Math.floor(cat.baseCost * Math.pow(cat.costGrowth, count));
}

function braceletCost(current = state) {
  return Math.floor(pacedCost(0.28, 80, current) * Math.pow(1.08, Math.max(0, current.braceletLevel - 1)));
}

function decorationCost(decor, current = state) {
  return Math.floor(decor.baseCost * Math.pow(decor.costGrowth, decorationLevel(decor, current)));
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

function nextGoalText(current = state) {
  const { bead, piece } = activeBracelet(current);
  if (piece?.patina >= 1) return "下一步：这串已包浆，去珠阶添一串 0% 新串收益更高";

  const addableBead = allBeads(current).find((item) => canAddBead(item, current));
  if (addableBead) return `下一步：珠阶可添新串「${addableBead.name}」`;

  const buyableCat = allCats(current).find((cat) => current.totalZen >= cat.unlock && current.zen >= catCost(cat, current));
  if (buyableCat) return `下一步：猫缘可结缘「${buyableCat.name}」`;

  const upgradableDecor = decorations.find((decor) => {
    const level = decorationLevel(decor, current);
    return current.totalZen >= decor.unlock && level < decor.maxLevel && current.zen >= decorationCost(decor, current);
  });
  if (upgradableDecor) return `下一步：装饰可升级「${upgradableDecor.name}」`;

  const candidates = [
    ...allBeads(current).filter((item) => current.totalZen >= item.threshold).map((item) => ({ label: `添新串「${item.name}」`, cost: beadPieceCost(item, current) })),
    ...allCats(current).filter((cat) => current.totalZen >= cat.unlock).map((cat) => ({ label: `结缘「${cat.name}」`, cost: catCost(cat, current) })),
    { label: "升级手法", cost: braceletCost(current) },
  ].filter((item) => item.cost > current.zen);
  candidates.sort((a, b) => a.cost - b.cost);
  const next = candidates[0];
  if (!next) return `当前主盘：${bead.name}，${getPatinaStageName(piece?.patina ?? 0)}`;
  return `下一步：${next.label}，还差 ${formatNumber(next.cost - current.zen)} 禅意`;
}

function getOfflineGain(zenPerSecond, offlineSeconds) {
  const fullRateSeconds = Math.min(offlineSeconds, BALANCE.offlineFullHours * 3600);
  const reducedRateSeconds = Math.max(
    0,
    Math.min(offlineSeconds - fullRateSeconds, BALANCE.offlineReducedHours * 3600),
  );
  return zenPerSecond * fullRateSeconds + zenPerSecond * reducedRateSeconds * BALANCE.offlineReducedRate;
}

function careDecayMultiplier(effect, current = state) {
  return Math.max(0.25, 1 - decorationBonus(effect, current));
}

function decayCatCare(seconds, current = state) {
  if (!Number.isFinite(seconds) || seconds <= 0) return;
  const moodLoss = BALANCE.moodDecayPerHour * (seconds / 3600) * careDecayMultiplier("moodCare", current);
  const satietyLoss = BALANCE.satietyDecayPerHour * (seconds / 3600) * careDecayMultiplier("satietyCare", current);
  allCats(current).forEach((cat) => {
    if ((current.catCounts?.[cat.id] ?? 0) <= 0) return;
    current.catMood[cat.id] = Math.max(0, (current.catMood?.[cat.id] ?? 100) - moodLoss);
    current.catSatiety[cat.id] = Math.max(0, (current.catSatiety?.[cat.id] ?? 100) - satietyLoss);
    if (current.catSatiety[cat.id] < 25) {
      current.catMood[cat.id] = Math.max(0, current.catMood[cat.id] - moodLoss * 0.5);
    }
  });
}

function comfortCat(catId, current = state) {
  if ((current.catCounts?.[catId] ?? 0) <= 0) return;
  current.catMood[catId] = Math.min(100, (current.catMood?.[catId] ?? 80) + 8);
  current.catSatiety[catId] = Math.min(100, (current.catSatiety?.[catId] ?? 80) + 5);
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

function getPatinaGainPerSecond(piece, bead, current = state) {
  if (!piece || piece.patina >= 1) return 0;
  return BALANCE.basePatinaRate *
    totalCatPatinaPower(current) *
    getMoodMultiplier(averageMood(current)) *
    (isMainBracelet(piece, current) ? BALANCE.mainPatinaSpeed : 1) *
    decorationMultiplier("patina", current) /
    bead.patinaDifficulty;
}

function advanceActiveBraceletPatina(seconds, current = state, notify = true) {
  if (!Number.isFinite(seconds) || seconds <= 0) return false;
  const { bead, piece } = activeBracelet(current);
  if (!piece || piece.patina >= 1) return false;
  const previous = piece.patina;
  piece.patina = Math.min(1, previous + seconds * getPatinaGainPerSecond(piece, bead, current));
  const completed = previous < 1 && piece.patina >= 1;
  if (completed && notify) {
    piece.completedAt = Date.now();
    toast("已包浆，换一个盘玩更好哦");
  }
  return completed;
}

function advanceActiveBraceletPatinaManual(steps, current = state) {
  if (!Number.isFinite(steps) || steps <= 0) return 0;
  const { bead, piece } = activeBracelet(current);
  if (!piece || piece.patina >= 1) return 0;
  const previous = piece.patina;
  piece.patina = Math.min(1, previous + steps * BALANCE.manualPatinaGain / bead.patinaDifficulty);
  const completed = previous < 1 && piece.patina >= 1;
  if (completed) {
    piece.completedAt = Date.now();
    toast("已包浆，换一个盘玩更好哦");
  }
  return piece.patina - previous;
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

function grantPolish(steps, event, patinaGain = 0) {
  if (steps <= 0) return;
  const amount = tapPower() * steps;
  gainZen(amount);
  state.taps += steps;
  const patinaText = patinaGain > 0 ? ` · 包浆 +${(patinaGain * 100).toFixed(2)}%` : "";
  popText(event, `+${formatNumber(amount)}${patinaText}`);
  elements.tapTarget.classList.remove("pulse");
  void elements.tapTarget.offsetWidth;
  elements.tapTarget.classList.add("pulse");
  saveTimer = 0;
  saveState();
  renderHud();
  if (panelsReady) updatePanelState();
}

function startPolishing(event) {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  polishingState.active = true;
  polishingState.pointerId = event.pointerId;
  polishingState.lastAngle = pointerAngle(event);
  polishingState.progressDegrees = 0;
  polishingState.moved = false;
  polishingState.patinaChanged = false;
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
  const degrees = Math.abs(delta);
  const patinaGain = advanceActiveBraceletPatinaManual(degrees / POLISH_STEP_DEGREES);
  if (patinaGain > 0) polishingState.patinaChanged = true;
  setBraceletRotation(braceletRotation + delta);
  polishingState.progressDegrees += degrees;
  const steps = Math.floor(polishingState.progressDegrees / POLISH_STEP_DEGREES);
  if (steps > 0) {
    polishingState.progressDegrees -= steps * POLISH_STEP_DEGREES;
    grantPolish(steps, event, patinaGain);
  } else if (patinaGain > 0) {
    renderHud();
    if (panelsReady) updatePanelState();
  }
}

function stopPolishing(event) {
  if (!polishingState.active || polishingState.pointerId !== event.pointerId) return;
  polishingState.active = false;
  polishingState.pointerId = null;
  elements.tapTarget.classList.remove("polishing");
  elements.tapTarget.releasePointerCapture?.(event.pointerId);
  if (polishingState.moved || polishingState.patinaChanged) {
    saveTimer = 0;
    saveState();
    renderHud();
    if (panelsReady) updatePanelState();
  }
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
  const cat = allCats().find((item) => item.id === catId);
  if (!cat || state.totalZen < cat.unlock) return;
  const previousCount = state.catCounts[cat.id] ?? 0;
  const cost = catCost(cat);
  if (!spendZen(cost)) return;
  state.catCounts[cat.id] = previousCount + 1;
  state.catMood[cat.id] = Math.min(100, (state.catMood?.[cat.id] ?? 90) + 10);
  state.catSatiety[cat.id] = Math.min(100, (state.catSatiety?.[cat.id] ?? 90) + 10);
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
  const bead = allBeads().find((item) => item.id === beadId);
  if (!bead || state.totalZen < bead.threshold || !beadCollection(bead.id).length) return;
  const collection = beadCollection(bead.id);
  const piece = [...collection].reverse().find((item) => item.patina < 1) ?? collection.at(-1);
  if (!piece) return;
  state.selectedBead = bead.id;
  state.mainBraceletId = piece.id;
  ensureMainBracelet(state);
  toast(`开始盘玩${bead.name}${variantName(bead.id, piece.variant)}`);
  render();
}

function addBead(beadId) {
  const bead = allBeads().find((item) => item.id === beadId);
  if (!bead || state.totalZen < bead.threshold) return;
  const cost = beadPieceCost(bead);
  if (!spendZen(cost)) return;
  const variant = variantForNewBead(bead.id);
  const piece = makeBeadPiece(bead.id, variant, 0);
  beadCollection(bead.id).push(piece);
  state.selectedBead = bead.id;
  state.mainBraceletId = piece.id;
  ensureMainBracelet(state);
  advanceUpgradePace();
  toast(`添了一串${bead.name}${variantName(bead.id, variant)}，开始养包浆`);
  render();
}

function aiFormElements(kind) {
  return kind === "cat"
    ? {
      form: elements.catAiForm,
      name: elements.catAiName,
      note: elements.catAiNote,
      promptButton: elements.catPromptButton,
      promptText: elements.catPromptText,
      serviceUrl: elements.catSpriteServiceUrl,
      serviceCheck: elements.catSpriteServiceCheck,
      serviceStatus: elements.catSpriteServiceStatus,
      photo: elements.catAiPhoto,
      button: elements.catAiButton,
      status: elements.catAiStatus,
    }
    : {
      form: elements.beadAiForm,
      name: elements.beadAiName,
      note: elements.beadAiNote,
      promptButton: elements.beadPromptButton,
      promptText: elements.beadPromptText,
      serviceUrl: elements.beadSpriteServiceUrl,
      serviceCheck: elements.beadSpriteServiceCheck,
      serviceStatus: elements.beadSpriteServiceStatus,
      photo: elements.beadAiPhoto,
      button: elements.beadAiButton,
      status: elements.beadAiStatus,
    };
}

function syncSpritePromptTexts() {
  ["cat", "bead"].forEach((kind) => {
    const form = aiFormElements(kind);
    if (form.promptText) form.promptText.value = SPRITE_STYLE_PROMPTS[kind];
  });
}

function setAiStatus(kind, message, isError = false) {
  const { status } = aiFormElements(kind);
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? "#9d2f22" : "#684421";
}

function setSpriteServiceStatus(message, isError = false) {
  ["cat", "bead"].forEach((kind) => {
    const { serviceStatus } = aiFormElements(kind);
    if (!serviceStatus) return;
    serviceStatus.textContent = message;
    serviceStatus.style.color = isError ? "#9d2f22" : "#684421";
  });
}

function normalizeSpriteServiceBase(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
  try {
    const url = new URL(withProtocol);
    url.pathname = url.pathname.replace(/\/api\/(?:sprite-import|sprite-status)\/?$/i, "");
    url.search = "";
    url.hash = "";
    return url.href.replace(/\/$/, "");
  } catch {
    return "";
  }
}

function sameOriginSpriteServiceBase() {
  return /^https?:$/.test(window.location.protocol) && window.location.port === "8080"
    ? window.location.origin
    : "";
}

function savedSpriteServiceBase() {
  const base = normalizeSpriteServiceBase(localStorage.getItem(SPRITE_SERVICE_KEY));
  if (!base || sameOriginSpriteServiceBase()) return base;
  try {
    const url = new URL(base);
    if ((url.hostname === "localhost" || url.hostname === "127.0.0.1") && url.port === "8080") return "";
  } catch {
    return "";
  }
  return base;
}

function spriteServiceBase() {
  return sameOriginSpriteServiceBase() || savedSpriteServiceBase() || DEFAULT_SPRITE_SERVICE_BASE;
}

function spriteServiceEndpoint(pathname) {
  const sameOriginBase = sameOriginSpriteServiceBase();
  if (sameOriginBase) return pathname;
  return `${spriteServiceBase()}${pathname}`;
}

function syncSpriteServiceControls() {
  const base = savedSpriteServiceBase() || sameOriginSpriteServiceBase() || DEFAULT_SPRITE_SERVICE_BASE;
  ["cat", "bead"].forEach((kind) => {
    const { serviceUrl } = aiFormElements(kind);
    if (serviceUrl) serviceUrl.value = base;
  });
}

function saveSpriteServiceFromInput(kind) {
  const value = normalizeSpriteServiceBase(aiFormElements(kind).serviceUrl?.value);
  if (value) {
    localStorage.setItem(SPRITE_SERVICE_KEY, value);
  } else {
    localStorage.removeItem(SPRITE_SERVICE_KEY);
  }
  syncSpriteServiceControls();
  return value;
}

function spriteStatusMessage(status) {
  if (!status || typeof status !== "object") return "服务响应格式不正确";
  if (status.ready) return "深度学习服务已连接";
  const missing = Array.isArray(status.missing) ? status.missing.join("、") : "";
  return missing ? `服务已启动，但缺少 ${missing}` : "服务已启动，但模型未就绪";
}

async function checkSpriteService(kind = "cat", announce = true) {
  const form = aiFormElements(kind);
  form.serviceCheck.disabled = true;
  const base = saveSpriteServiceFromInput(kind);
  try {
    const response = await fetch(spriteServiceEndpoint("/api/sprite-status"), { cache: "no-store" });
    const status = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(status.error || "服务不可用");
    const message = spriteStatusMessage(status);
    setSpriteServiceStatus(base ? `${message}：${base}` : message, !status.ready);
    if (announce) toast(message);
    return status.ready;
  } catch {
    const target = base || spriteServiceBase();
    setSpriteServiceStatus(`无法连接深度学习服务：${target}`, true);
    if (announce) toast("深度学习服务未连接");
    return false;
  } finally {
    form.serviceCheck.disabled = false;
  }
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const value = bytes / (1024 * 1024);
  return `${value.toFixed(value < 10 ? 1 : 0)} MB`;
}

function syncAiPhotoUploadStatus(kind) {
  const form = aiFormElements(kind);
  const file = form.photo?.files?.[0];
  const label = kind === "cat" ? "猫猫 sprite" : "手串 sprite";
  if (!file) {
    setAiStatus(kind, `还没有上传${label}。`);
    return;
  }
  if (!file.type.startsWith("image/")) {
    setAiStatus(kind, "请上传 PNG、JPG 或 WebP 图片。", true);
    return;
  }
  if (file.size > 12 * 1024 * 1024) {
    setAiStatus(kind, "图片太大了，请压到 12MB 以内。", true);
    return;
  }
  setAiStatus(kind, `已上传${label}：${file.name}（${formatFileSize(file.size)}），可以开始处理。`);
}

async function copySpritePrompt(kind) {
  const form = aiFormElements(kind);
  const prompt = SPRITE_STYLE_PROMPTS[kind];
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(prompt);
    } else {
      form.promptText?.focus();
      form.promptText?.select();
      document.execCommand("copy");
    }
    setAiStatus(kind, "提示词已复制。去外部模型粘贴它，并附上现实照片生成 sprite。");
  } catch {
    form.promptText?.focus();
    form.promptText?.select();
    setAiStatus(kind, "浏览器没有允许自动复制，已选中提示词，可以手动复制。", true);
  }
}

function spriteImportErrorMessage(error) {
  const message = error?.message || "生成失败";
  if (error?.localServiceUnavailable || message === "LOCAL_AI_SERVICE_UNREACHABLE") {
    if (window.location.port === "8080") {
      return "无法连接本地 sprite 处理服务。请确认电脑上的 npm run dev:ai 仍在运行，手机和电脑在同一 Wi-Fi，且防火墙允许 Node.js 访问。";
    }
    const configured = savedSpriteServiceBase();
    if (configured) return `无法连接深度学习服务：${configured}。请确认服务已启动、地址可访问；GitHub Pages 调用 HTTP 局域网地址可能会被浏览器拦截。`;
    return `无法连接深度学习服务：${DEFAULT_SPRITE_SERVICE_BASE}。也可以在电脑端运行 npm run dev:ai 后打开 http://localhost:8080，或在手机端填写服务启动日志里的 http://电脑局域网IP:8080。`;
  }
  return `${message}。请确认已用本地服务打开页面，并且 D:\\sprite_alpha_seg_pytorch 的模型环境可用。`;
}

function spriteImportEndpoint() {
  return spriteServiceEndpoint("/api/sprite-import");
}

function resolveSpriteAssetUrl(assetPath) {
  const value = String(assetPath || "");
  if (!value || isImageDataUrl(value)) return value;
  const endpoint = new URL(spriteImportEndpoint(), window.location.href);
  return new URL(value, `${endpoint.origin}/`).href;
}

function resolveSpriteActionImages(actionImages = {}) {
  return Object.fromEntries(
    Object.entries(actionImages ?? {}).map(([action, imageUrl]) => [action, resolveSpriteAssetUrl(imageUrl)])
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
    reader.addEventListener("error", () => reject(reader.error ?? new Error("图片读取失败")));
    reader.readAsDataURL(file);
  });
}

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
    reader.addEventListener("error", () => reject(reader.error ?? new Error("图片读取失败")));
    reader.readAsDataURL(blob);
  });
}

async function submitAiDesign(kind, event) {
  event.preventDefault();
  const form = aiFormElements(kind);
  const name = form.name.value.trim();
  const note = form.note.value.trim();
  const file = form.photo.files?.[0];
  if (!name || !file) {
    setAiStatus(kind, "请先填写名字并上传外部模型生成的 sprite。", true);
    return;
  }
  if (!file.type.startsWith("image/")) {
    setAiStatus(kind, "请上传 PNG、JPG 或 WebP 图片。", true);
    return;
  }
  if (file.size > 12 * 1024 * 1024) {
    setAiStatus(kind, "图片太大了，请压到 12MB 以内。", true);
    return;
  }

  form.button.disabled = true;
  saveSpriteServiceFromInput(kind);
  setAiStatus(kind, "正在调用本地深度学习模型抠背景、裁切并整理为游戏 sprite...");
  try {
    const imageDataUrl = await readFileAsDataUrl(file);
    let response;
    try {
      response = await fetch(spriteImportEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name,
          note,
          imageDataUrl,
          imageName: file.name,
          mimeType: file.type,
        }),
      });
    } catch (networkError) {
      const localError = new Error("LOCAL_AI_SERVICE_UNREACHABLE");
      localError.localServiceUnavailable = true;
      localError.cause = networkError;
      throw localError;
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Sprite 处理服务暂时不可用");
    if (!result.assetPath) throw new Error("Sprite 处理服务没有返回图片");

    const assetPath = resolveSpriteAssetUrl(result.assetPath);
    if (kind === "cat") {
      addAiCatDesign(name, note, assetPath, resolveSpriteActionImages(result.actionImages));
    } else {
      addAiBeadDesign(name, note, assetPath);
    }
    form.form.reset();
    syncSpritePromptTexts();
    setAiStatus(kind, "处理完成，已经加入存档。");
  } catch (error) {
    setAiStatus(kind, spriteImportErrorMessage(error), true);
  } finally {
    form.button.disabled = false;
  }
}

function addAiCatDesign(name, note, imageUrl, actionImages = null) {
  const id = slugifyId(name, "cat");
  const cat = {
    id,
    name,
    sprite: "custom-cat",
    imageUrl,
    actionImages,
    baseCost: 900,
    costGrowth: 1.18,
    baseZenRate: 1.2,
    basePatinaPower: 2,
    effect: note ? `AI形象：${note.slice(0, 22)}` : "AI专属猫息",
    unlock: 0,
    custom: true,
  };
  state.customCats = normalizeCustomCats([...(state.customCats ?? []), cat]);
  state.catCounts[id] = 1;
  state.catMood[id] = 100;
  state.catSatiety[id] = 100;
  saveState();
  render();
  toast(`${name}加入了盘珠铺`);
}

function addAiBeadDesign(name, note, imageUrl) {
  const id = slugifyId(name, "bead");
  const bead = {
    id,
    name,
    sprite: "custom-bead",
    imageUrl,
    threshold: 0,
    unlockCost: 0,
    baseCost: 1200,
    costGrowth: 1.2,
    baseBonus: 0.12,
    patinaDifficulty: 4,
    note: note || "AI设计新串",
    custom: true,
  };
  state.customBeads = normalizeCustomBeads([...(state.customBeads ?? []), bead]);
  ensureBeadCollections(state);
  const piece = makeBeadPiece(id, "default", 0);
  piece.imageUrl = imageUrl;
  state.beadCollections[id] = [piece];
  state.selectedBead = id;
  state.mainBraceletId = piece.id;
  ensureMainBracelet(state);
  saveState();
  render();
  toast(`新串「${name}」开始养包浆`);
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

function customCatPlacementEntries(current, customCats) {
  const ids = new Set(customCats.map((cat) => cat.id));
  return Object.fromEntries(
    Object.entries(current.catPlacements ?? {}).filter(([key]) => ids.has(key.split(":")[0]))
  );
}

function clampCatCare(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 100;
}

function collectCustomPrestigeState(current = state) {
  const customCats = normalizeCustomCats(current.customCats ?? []);
  const customBeads = normalizeCustomBeads(current.customBeads ?? []);
  const customBeadIds = new Set(customBeads.map((bead) => bead.id));
  const mainCustomBracelet = allBracelets(current).find(({ bead, piece }) => {
    return customBeadIds.has(bead.id) && piece.id === current.mainBraceletId;
  });

  return {
    customCats,
    customBeads,
    catCounts: Object.fromEntries(customCats.map((cat) => {
      const count = Number(current.catCounts?.[cat.id] ?? 1);
      return [cat.id, Math.max(1, Number.isFinite(count) ? count : 1)];
    })),
    catMood: Object.fromEntries(customCats.map((cat) => [cat.id, clampCatCare(current.catMood?.[cat.id])])),
    catSatiety: Object.fromEntries(customCats.map((cat) => [cat.id, clampCatCare(current.catSatiety?.[cat.id])])),
    catPlacements: customCatPlacementEntries(current, customCats),
    beadCollections: Object.fromEntries(customBeads.map((bead) => {
      const collection = Array.isArray(current.beadCollections?.[bead.id])
        ? current.beadCollections[bead.id].map((piece) => ({ ...piece }))
        : [];
      return [bead.id, collection.length ? collection : [makeBeadPiece(bead.id, "default", 0)]];
    })),
    mainBraceletId: mainCustomBracelet?.piece.id ?? "",
  };
}

function restoreCustomPrestigeState(nextState, kept) {
  nextState.customCats = kept.customCats;
  nextState.customBeads = kept.customBeads;
  nextState.catCounts = { ...nextState.catCounts, ...kept.catCounts };
  nextState.catMood = { ...nextState.catMood, ...kept.catMood };
  nextState.catSatiety = { ...nextState.catSatiety, ...kept.catSatiety };
  nextState.catPlacements = { ...nextState.catPlacements, ...kept.catPlacements };
  nextState.beadCollections = { ...nextState.beadCollections, ...kept.beadCollections };
  if (kept.mainBraceletId) nextState.mainBraceletId = kept.mainBraceletId;
  ensureBeadCollections(nextState);
  ensureMainBracelet(nextState);
}

function prestigeForPaws() {
  const reward = availablePrestigePaws();
  if (reward <= 0) {
    toast("福爪还在酝酿，继续积累禅意");
    return;
  }
  if (!confirm(`领悟 ${reward} 枚福爪并重新开铺？会重置当前禅意、普通手串、普通猫群和装饰，但保留福爪、自定义猫猫/珠串与图鉴成长。`)) return;
  const keepCustom = collectCustomPrestigeState();
  const keepTotalZen = state.totalZen;
  const keepPaws = state.paws + reward;
  const keepClaimedWishes = { ...state.claimedWishes };
  const keepTalents = { ...state.pawTalentLevels };
  const keepTutorial = state.tutorialSeen;
  const keepBgm = state.bgmEnabled;
  state = defaultState();
  state.totalZen = keepTotalZen;
  state.paws = keepPaws;
  state.claimedWishes = keepClaimedWishes;
  state.pawTalentLevels = keepTalents;
  state.tutorialSeen = keepTutorial;
  state.bgmEnabled = keepBgm;
  restoreCustomPrestigeState(state, keepCustom);
  saveState();
  toast(`福爪 +${reward}，新的盘珠日记开始了`);
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
  elements.catLayer.innerHTML = allCats()
    .flatMap((cat, catIndex) => {
      const count = state.catCounts[cat.id] ?? 0;
      const visibleCount = visibleCatCount(count);
      return Array.from({ length: visibleCount }, (_, instanceIndex) => {
        const visual = ensureCatVisual(cat, catIndex, instanceIndex);
        const isMain = instanceIndex === 0;
        const groupLabel = count > visibleCount ? `Lv.${count} · 显示${visibleCount}/${count}` : `Lv.${count}`;
        const imageUrl = catActionImage(cat, visual.spriteAction);
        const imageStyle = imageUrl ? ` --cat-image:url('${escapeHtml(imageUrl)}');` : "";
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
            aria-label="查看${escapeHtml(cat.name)}群"
            style="--cat-left:${visual.x}%; --cat-bottom:${visual.bottom}%; --cat-z:${visual.z}; --cat-delay:${visual.delay}ms; --cat-face:${visual.face};${imageStyle}"
          >
            <i class="cat-art" aria-hidden="true"></i>
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
  const catList = allCats();
  const cat = catList.find((item) => item.id === catId);
  const catIndex = catList.findIndex((item) => item.id === catId);
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

function stageElementDragLimits(element, layerRect) {
  const rect = element.getBoundingClientRect();
  const layerWidth = Math.max(1, layerRect.width);
  const layerHeight = Math.max(1, layerRect.height);
  return {
    x: Math.max(0, 100 - (rect.width / layerWidth) * 100),
    bottom: Math.max(0, 100 - (rect.height / layerHeight) * 100),
  };
}

function beginCatDrag(event) {
  const stageCat = event.target.closest("[data-stage-cat]");
  if (!stageCat || (event.button !== undefined && event.button !== 0)) return;
  event.preventDefault();
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
}

function moveCatDrag(event) {
  if (!catDragState.active || catDragState.pointerId !== event.pointerId || !catDragState.element) return;
  const distance = Math.hypot(event.clientX - catDragState.startX, event.clientY - catDragState.startY);
  if (distance > 4) catDragState.moved = true;
  if (!catDragState.moved) return;

  event.preventDefault();
  const layerRect = elements.catLayer.getBoundingClientRect();
  const limits = stageElementDragLimits(catDragState.element, layerRect);
  const leftPx = event.clientX - layerRect.left - catDragState.offsetX;
  const bottomPx = layerRect.bottom - event.clientY - catDragState.offsetBottom;
  const x = clamp((leftPx / Math.max(1, layerRect.width)) * 100, 0, limits.x);
  const bottom = clamp((bottomPx / Math.max(1, layerRect.height)) * 100, 0, limits.bottom);
  const visual = catVisualState.get(catDragState.key);
  if (!visual) return;

  visual.x = x;
  visual.bottom = bottom;
  visual.targetX = x;
  visual.minX = clamp(x - 10, 0, limits.x);
  visual.maxX = clamp(x + 10, 0, limits.x);
  visual.face = visual.face || 1;

  catDragState.element.style.setProperty("--cat-left", `${visual.x}%`);
  catDragState.element.style.setProperty("--cat-bottom", `${visual.bottom}%`);
}

function finishCatDrag(event) {
  if (!catDragState.active || catDragState.pointerId !== event.pointerId) return;
  const stageCat = catDragState.element;
  const visual = catVisualState.get(catDragState.key);
  stageCat?.classList.remove("dragging-cat");

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

function setDecorPlacementStyle(element, x, bottom) {
  element.style.left = `${x}%`;
  element.style.bottom = `${bottom}%`;
  element.style.right = "auto";
  element.style.top = "auto";
}

function beginDecorDrag(event) {
  const stageDecor = event.target.closest("[data-stage-decor]");
  if (!stageDecor || !stageDecor.classList.contains("show") || (event.button !== undefined && event.button !== 0)) return;
  event.preventDefault();

  const layerRect = elements.decorLayer.getBoundingClientRect();
  const decorRect = stageDecor.getBoundingClientRect();
  const currentX = clamp(((decorRect.left - layerRect.left) / Math.max(1, layerRect.width)) * 100, 0, 100);
  const currentBottom = clamp(((layerRect.bottom - decorRect.bottom) / Math.max(1, layerRect.height)) * 100, 0, 100);
  setDecorPlacementStyle(stageDecor, currentX, currentBottom);

  decorDragState.active = true;
  decorDragState.pointerId = event.pointerId;
  decorDragState.element = stageDecor;
  decorDragState.decorId = stageDecor.dataset.decor;
  decorDragState.startX = event.clientX;
  decorDragState.startY = event.clientY;
  decorDragState.offsetX = event.clientX - decorRect.left;
  decorDragState.offsetBottom = decorRect.bottom - event.clientY;
  decorDragState.moved = false;

  stageDecor.classList.add("dragging-decor");
  elements.decorLayer.classList.add("dragging-decor-layer");
}

function moveDecorDrag(event) {
  if (!decorDragState.active || decorDragState.pointerId !== event.pointerId || !decorDragState.element) return;
  const distance = Math.hypot(event.clientX - decorDragState.startX, event.clientY - decorDragState.startY);
  if (distance > 4) decorDragState.moved = true;
  if (!decorDragState.moved) return;

  event.preventDefault();
  const layerRect = elements.decorLayer.getBoundingClientRect();
  const limits = stageElementDragLimits(decorDragState.element, layerRect);
  const leftPx = event.clientX - layerRect.left - decorDragState.offsetX;
  const bottomPx = layerRect.bottom - event.clientY - decorDragState.offsetBottom;
  const x = clamp((leftPx / Math.max(1, layerRect.width)) * 100, 0, limits.x);
  const bottom = clamp((bottomPx / Math.max(1, layerRect.height)) * 100, 0, limits.bottom);

  setDecorPlacementStyle(decorDragState.element, x, bottom);
}

function finishDecorDrag(event) {
  if (!decorDragState.active || decorDragState.pointerId !== event.pointerId) return;
  const stageDecor = decorDragState.element;
  stageDecor?.classList.remove("dragging-decor");
  elements.decorLayer.classList.remove("dragging-decor-layer");

  if (decorDragState.moved && stageDecor && decorDragState.decorId) {
    state.decorationPlacements[decorDragState.decorId] = {
      x: Number(parseFloat(stageDecor.style.left).toFixed(2)),
      bottom: Number(parseFloat(stageDecor.style.bottom).toFixed(2)),
    };
    saveState();
  }

  decorDragState.active = false;
  decorDragState.pointerId = null;
  decorDragState.element = null;
  decorDragState.decorId = "";
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
  const visibleInstances = allCats().flatMap((cat) => {
    const count = visibleCatCount(state.catCounts[cat.id] ?? 0);
    return Array.from({ length: count }, (_, instanceIndex) => ({ cat, instanceIndex }));
  });
  const picked = visibleInstances[Math.floor(Math.random() * visibleInstances.length)];
  if (!picked) return;
  changeCatAction(picked.cat.id, "random", picked.instanceIndex);
}

function openCatGroupPanel(catId) {
  const cat = allCats().find((item) => item.id === catId);
  if (!cat) return;
  const count = state.catCounts[cat.id] ?? 0;
  const visibleCount = visibleCatCount(count);
  const mainVisual = catVisualState.get(catInstanceKey(cat.id, 0));

  elements.catGroupTitle.textContent = `${cat.name}群 Lv.${count}`;
  elements.catGroupCount.textContent = `当前数量：${count}`;
  elements.catGroupVisible.textContent = `场景显示：${visibleCount}${count > visibleCount ? ` / 实际 ${count}` : ""}`;
  elements.catGroupBonus.textContent = `猫息 ${formatNumber(catGroupPps(cat))}/s，包浆力 x${catGroupBonus(cat).toFixed(1)}`;
  elements.catGroupStatus.textContent = `状态：${mainVisual?.mood ?? "开心"} · 心情 ${Math.floor(state.catMood?.[cat.id] ?? 100)} · 饱食 ${Math.floor(state.catSatiety?.[cat.id] ?? 100)}`;
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
      const placement = state.decorationPlacements?.[decor.id];
      const placementStyle = Number.isFinite(placement?.x) && Number.isFinite(placement?.bottom)
        ? ` style="left:${placement.x}%; bottom:${placement.bottom}%; right:auto; top:auto;"`
        : "";
      return `<span class="decor-sprite ${decor.sprite} stage-decor ${level > 0 ? "show" : ""}" data-stage-decor data-decor="${decor.id}"${placementStyle}></span>`;
    })
    .join("");
}

function renderShop() {
  elements.catShop.innerHTML = allCats()
    .map((cat) => {
      const count = state.catCounts[cat.id] ?? 0;
      const unlocked = state.totalZen >= cat.unlock;
      const cost = catCost(cat);
      const canBuy = unlocked && state.zen >= cost;
      return `
        <article class="shop-card ${unlocked ? "" : "locked"} ${canBuy ? "has-upgrade" : ""}" data-cat-card="${cat.id}">
          <span class="sprite ${cat.sprite}"${spriteInlineStyle(catActionImage(cat, "sit"))} aria-hidden="true"></span>
          <div class="card-copy">
            <div class="card-title">
              <span>${escapeHtml(cat.name)}</span>
              <span data-cat-count="${cat.id}">数量 ${count}</span>
            </div>
            <div class="card-meta">
              <span data-cat-pps="${cat.id}">${formatNumber(catGroupPps(cat))}/s 猫息 · 包浆力 x${catPatinaPower(cat).toFixed(1)}</span>
              <span>${escapeHtml(cat.effect)}</span>
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
  elements.beadBoard.innerHTML = allBeads()
    .map((bead) => {
      const unlocked = state.totalZen >= bead.threshold;
      const active = activeBead().id === bead.id;
      const collection = beadCollection(bead.id);
      const piece = active ? activeBracelet().piece : ([...collection].reverse().find((item) => item.patina < 1) ?? collection.at(-1));
      const count = collection.length;
      const completed = beadCompletedCount(bead.id);
      const patina = patinaPercentValue(piece);
      const cost = beadPieceCost(bead);
      const canAdd = canAddBead(bead);
      const imagePiece = piece ?? { variant: bead.id === "bodhi-root" ? "pure" : "default", patina: 0 };
      return `
        <article class="bead-card ${unlocked ? "" : "locked"} ${active ? "active-bead" : ""} ${canAdd ? "has-upgrade" : ""}" data-bead-card="${bead.id}">
          <span class="bracelet-sprite ${bead.sprite}" style="${braceletImageStyle(bead, imagePiece)}" aria-hidden="true"></span>
          <div class="card-copy">
            <div class="card-title">
              <span>${escapeHtml(bead.name)}</span>
              <span data-bead-count="${bead.id}">持有 ${count}</span>
            </div>
            <div class="card-meta">
              <span data-bead-state="${bead.id}">${unlocked ? `正在 ${Math.max(0, count - completed)} · 已包浆 ${completed}` : `累计 ${formatNumber(bead.threshold)} 解锁`}</span>
              <span data-bead-label="${bead.id}">${escapeHtml(braceletPatinaLabel(bead, piece, active))}</span>
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
        <span>累计禅意可领悟福爪；每枚福爪提供全局收益 +12%，也可升级永久加成。</span>
        <span data-prestige-paws>当前可领悟 ${availablePrestigePaws()} 枚福爪</span>
      </div>
      <button class="shop-button ${availablePrestigePaws() > 0 ? "has-upgrade" : "secondary"}" type="button" data-prestige-paws ${availablePrestigePaws() > 0 ? "" : "disabled"}>领悟福爪</button>
      <div class="paw-talent-grid">${talentCards}</div>
    </section>
    ${wishCards}
  `;
}

function hasCatUpgrade(current = state) {
  return allCats(current).some((cat) => current.totalZen >= cat.unlock && current.zen >= catCost(cat, current));
}

function hasBeadUpgrade(current = state) {
  return allBeads(current).some((bead) => current.totalZen >= bead.threshold && current.zen >= beadPieceCost(bead, current));
}

function hasDecorUpgrade(current = state) {
  return decorations.some((decor) => {
    const level = decorationLevel(decor, current);
    return current.totalZen >= decor.unlock && level < decor.maxLevel && current.zen >= decorationCost(decor, current);
  });
}

function hasWishUpgrade(current = state) {
  return wishes.some((wish) => !current.claimedWishes[wish.id] && wish.value(current) >= wish.goal) ||
    availablePrestigePaws(current) > 0 ||
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
  allCats().forEach((cat) => {
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
    if (countLabel) countLabel.textContent = `数量 ${count}`;
    if (ppsLabel) ppsLabel.textContent = `${formatNumber(catGroupPps(cat))}/s 猫息 · 包浆力 x${catPatinaPower(cat).toFixed(1)}`;
    if (costLabel) costLabel.textContent = unlocked ? `花费 ${formatNumber(cost)} 禅意` : `累计 ${formatNumber(cat.unlock)} 解锁`;
    if (button) {
      button.disabled = !canBuy;
      button.classList.toggle("has-upgrade", canBuy);
      button.textContent = unlocked ? "结缘" : "未解锁";
    }
  });

  const currentBeadId = activeBead().id;
  allBeads().forEach((bead) => {
    const unlocked = state.totalZen >= bead.threshold;
    const active = currentBeadId === bead.id;
    const collection = beadCollection(bead.id);
    const count = collection.length;
    const piece = active ? activeBracelet().piece : ([...collection].reverse().find((item) => item.patina < 1) ?? collection.at(-1));
    const completed = beadCompletedCount(bead.id);
    const patina = patinaPercentValue(piece);
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
    if (stateLabel) stateLabel.textContent = unlocked ? `正在 ${Math.max(0, count - completed)} · 已包浆 ${completed}` : `累计 ${formatNumber(bead.threshold)} 解锁`;
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
  const prestigePaws = availablePrestigePaws();
  const prestigeLabel = elements.wishList.querySelector("[data-prestige-paws]:not(button)");
  const prestigeButton = elements.wishList.querySelector("button[data-prestige-paws]");
  if (prestigeLabel) prestigeLabel.textContent = `当前可领悟 ${prestigePaws} 枚福爪`;
  if (prestigeButton) {
    prestigeButton.disabled = prestigePaws <= 0;
    prestigeButton.classList.toggle("secondary", prestigePaws <= 0);
    prestigeButton.classList.toggle("has-upgrade", prestigePaws > 0);
  }
  updateUpgradeBadges();
}

function renderHud() {
  const pps = productionPerSecond();
  const tap = tapPower();
  const nextBraceletCost = braceletCost();
  const { bead: currentBead, piece: currentPiece } = activeBracelet();
  const patina = currentPiece?.patina ?? 0;
  const patinaComplete = patina >= 1;
  const patinaSpeed = getPatinaGainPerSecond(currentPiece, currentBead);
  const activeBonus = getBraceletContribution(currentBead, currentPiece);

  elements.zenValue.textContent = formatNumber(state.zen);
  elements.ppsValue.textContent = `${formatNumber(pps)}/s`;
  elements.tapValue.textContent = `+${formatNumber(tap)}`;
  elements.lifetimeValue.textContent = formatNumber(state.totalZen);
  elements.pawValue.textContent = `${formatNumber(state.paws)} / ${formatNumber(totalPaws(state))}`;
  elements.catCountValue.textContent = `${totalCats(state)} 只 / ${uniqueCats(state)} 种`;
  elements.braceletName.textContent = currentBead.name;
  elements.braceletLevel.textContent = `${variantName(currentBead.id, currentPiece?.variant)} · ${formatPatinaPercent(currentPiece)}`;
  elements.braceletStatus.textContent = patinaComplete
    ? "已包浆，换一个盘玩更好哦"
    : `${getPatinaStageName(patina)} · 当前加成 +${(activeBonus * 100).toFixed(1)}% · 预计 ${formatDuration((1 - patina) / Math.max(0.000001, patinaSpeed))}`;
  elements.braceletStatus.title = elements.braceletStatus.textContent;
  elements.braceletCost.textContent = `手法 ${formatNumber(nextBraceletCost)}`;
  elements.altarBracelet.className = `bracelet-sprite ${currentBead.sprite} altar-bracelet`;
  elements.altarBracelet.style.setProperty("--bracelet-image", `url("${braceletAssetPath(currentBead, currentPiece)}")`);
  elements.upgradeBraceletButton.disabled = state.zen < nextBraceletCost;
  elements.upgradeBraceletButton.classList.toggle("has-upgrade", state.zen >= nextBraceletCost);
  elements.auraLabel.textContent = patinaComplete ? "已包浆" : formatPatinaPercent(currentPiece);
  elements.auraFill.style.width = `${patina * 100}%`;
  elements.nextGoalText.textContent = nextGoalText();
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

  decayCatCare(delta);
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
  document.addEventListener("pointermove", rotatePolishing);
  document.addEventListener("pointerup", stopPolishing);
  document.addEventListener("pointercancel", stopPolishing);
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
  elements.catAiForm?.addEventListener("submit", (event) => submitAiDesign("cat", event));
  elements.beadAiForm?.addEventListener("submit", (event) => submitAiDesign("bead", event));
  elements.catPromptButton?.addEventListener("click", () => copySpritePrompt("cat"));
  elements.beadPromptButton?.addEventListener("click", () => copySpritePrompt("bead"));
  elements.catSpriteServiceCheck?.addEventListener("click", () => checkSpriteService("cat"));
  elements.beadSpriteServiceCheck?.addEventListener("click", () => checkSpriteService("bead"));
  elements.catSpriteServiceUrl?.addEventListener("change", () => saveSpriteServiceFromInput("cat"));
  elements.beadSpriteServiceUrl?.addEventListener("change", () => saveSpriteServiceFromInput("bead"));
  elements.catAiPhoto?.addEventListener("change", () => syncAiPhotoUploadStatus("cat"));
  elements.beadAiPhoto?.addEventListener("change", () => syncAiPhotoUploadStatus("bead"));
  elements.catGroupCloseButton.addEventListener("click", closeCatGroupPanel);
  elements.exportSaveButton.addEventListener("click", exportSave);
  elements.saveExportCloseButton.addEventListener("click", closeSaveExportPanel);
  elements.saveExportCopyButton.addEventListener("click", copySaveExportText);
  elements.saveExportSelectButton.addEventListener("click", selectExportText);
  elements.importSaveButton.addEventListener("click", () => elements.importSaveInput.click());
  elements.importSaveInput.addEventListener("change", () => importSaveFile(elements.importSaveInput.files?.[0]));
  elements.catLayer.addEventListener("pointerdown", beginCatDrag);
  elements.decorLayer.addEventListener("pointerdown", beginDecorDrag);
  document.addEventListener("pointermove", moveCatDrag);
  document.addEventListener("pointermove", moveDecorDrag);
  document.addEventListener("pointerup", finishCatDrag);
  document.addEventListener("pointerup", finishDecorDrag);
  document.addEventListener("pointercancel", finishCatDrag);
  document.addEventListener("pointercancel", finishDecorDrag);

  document.addEventListener("click", (event) => {
    const stageCat = event.target.closest("[data-stage-cat]");
    if (stageCat) {
      if (suppressNextCatClick) {
        suppressNextCatClick = false;
        event.preventDefault();
        return;
      }
      const instanceIndex = Number(stageCat.dataset.catInstance ?? 0);
      comfortCat(stageCat.dataset.cat);
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

    const prestigeButton = event.target.closest("button[data-prestige-paws]");
    if (prestigeButton) prestigeForPaws();

    const tabButton = event.target.closest("[data-tab]");
    if (tabButton) switchTab(tabButton.dataset.tab);
  });

  document.addEventListener("keydown", (event) => {
    if (!elements.saveExportLayer.hidden && event.key === "Escape") {
      closeSaveExportPanel();
      return;
    }

    if (guideOpen && event.key === "Escape") {
      closeGuide(true);
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") return;
    const stageCat = event.target.closest("[data-stage-cat]");
    if (!stageCat) return;
    event.preventDefault();
    const instanceIndex = Number(stageCat.dataset.catInstance ?? 0);
    comfortCat(stageCat.dataset.cat);
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
syncSpritePromptTexts();
syncSpriteServiceControls();
render();
syncBgmButton();
saveState();
if (!state.tutorialSeen) {
  requestAnimationFrame(() => openGuide(0));
}
requestAnimationFrame(tick);
