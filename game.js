const SAVE_KEY = "cat-bead-idle-save-v1";

const BALANCE = {
  version: 2,
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
  { id: "bodhi-root", name: "菩提根", sprite: "bodhi-root", threshold: 0, multiplier: 1, note: "温润白珠" },
  { id: "monkey-head", name: "猴头", sprite: "monkey-head", threshold: 6500, multiplier: 1.65, note: "核纹红润" },
  { id: "xingyue", name: "星月菩提", sprite: "xingyue", threshold: 75000, multiplier: 2.8, note: "星点月眼" },
  { id: "vajra", name: "小金刚", sprite: "vajra", threshold: 650000, multiplier: 4.6, note: "深纹金刚" },
];

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
    note: "盘串 +20%/级",
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
    note: "盘串 +28%/级",
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
  { id: "level15", label: "珠串十五级", goal: 15, reward: 2, value: (s) => s.braceletLevel },
  { id: "zen500k", label: "累计五十万禅意", goal: 500000, reward: 4, value: (s) => s.totalZen },
];

const pawTalents = [
  { id: "catBlessing", name: "招财肉垫", description: "猫息永久 +12%/级", cost: 1, costScale: 1.55, maxLevel: 10, effect: "catMult", value: 0.12 },
  { id: "quickPaws", name: "灵爪盘珠", description: "盘串收益 +15%/级", cost: 1, costScale: 1.65, maxLevel: 8, effect: "tapMult", value: 0.15 },
  { id: "diaryLuck", name: "日记福气", description: "全部收益 +8%/级", cost: 2, costScale: 1.8, maxLevel: 6, effect: "allMult", value: 0.08 },
];

const defaultState = () => ({
  zen: 0,
  totalZen: 0,
  braceletLevel: 1,
  selectedBead: "bodhi-root",
  catCounts: { ...Object.fromEntries(cats.map((cat) => [cat.id, 0])), tabby: 1 },
  decorationLevels: Object.fromEntries(decorations.map((decor) => [decor.id, 0])),
  pawTalentLevels: Object.fromEntries(pawTalents.map((talent) => [talent.id, 0])),
  claimedWishes: {},
  paws: 0,
  taps: 0,
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
    text: "目标很简单：盘手串攒禅意，结缘猫咪自动产出，再用装饰把房间一点点布置起来。",
    hint: "新开局已经有一只橘串师在帮你慢慢产出。",
    target: ".stage",
  },
  {
    title: "先盘一下手串",
    text: "点击桌上的手串，或点桌子下方的盘串按钮，都能立刻获得禅意。",
    hint: "禅意是主要资源，顶部第一格会显示当前数量。",
    target: "#tapTarget",
  },
  {
    title: "攒够就升级珠串",
    text: "升级珠串会提高盘串收益，也会带动自动产出变强。前期会很快给你连续升级反馈，后面再逐步拉长等待时间。",
    hint: "绿色按钮亮起来时，就可以升级当前珠串；手动盘串能明显加快开局。",
    target: "#upgradeBraceletButton",
  },
  {
    title: "右侧是主要养成",
    text: "猫缘能结缘更多猫咪，珠阶可以换现实文玩手串，装饰能升级房间里的摆件。",
    hint: "猫咪越多，房间越热闹，自动猫息也会越高。",
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
    title: "看灵光和心愿",
    text: "灵光进度会推动新手串解锁；心愿完成后给福爪，福爪能在心愿页兑换永久加成。",
    hint: "底部福爪显示可用/累计，伙伴显示已结缘猫咪数；没事时让猫咪自己产出，回来再升级。",
    target: ".progress-wrap",
    tab: "wishes",
  },
];
let catActionTimer = 0;
let catActionDelay = randomCatActionDelay();
let guideIndex = 0;
let guideOpen = false;

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
  mainTapButton: $("#mainTapButton"),
  upgradeBraceletButton: $("#upgradeBraceletButton"),
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

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    const merged = { ...defaultState(), ...saved };
    merged.catCounts = { ...defaultState().catCounts, ...(saved?.catCounts ?? {}) };
    merged.decorationLevels = { ...defaultState().decorationLevels, ...(saved?.decorationLevels ?? {}) };
    merged.pawTalentLevels = { ...defaultState().pawTalentLevels, ...(saved?.pawTalentLevels ?? {}) };
    merged.claimedWishes = { ...(saved?.claimedWishes ?? {}) };
    if (saved?.balanceVersion !== BALANCE.version || !Number.isFinite(saved?.upgradePaceStep)) {
      merged.upgradePaceStep = estimateUpgradePaceStep(merged);
      merged.balanceVersion = BALANCE.version;
    }
    merged.selectedBead = beadIdMigration[merged.selectedBead] ?? merged.selectedBead;
    if (!beads.some((bead) => bead.id === merged.selectedBead)) merged.selectedBead = "bodhi-root";

    const elapsedSeconds = Math.max(0, Math.min(8 * 3600, (Date.now() - (merged.lastSaved ?? Date.now())) / 1000));
    if (elapsedSeconds > 15) {
      const offlineGain = productionPerSecond(merged) * elapsedSeconds * 0.65;
      if (offlineGain > 0) {
        merged.zen += offlineGain;
        merged.totalZen += offlineGain;
        requestAnimationFrame(() => toast(`离线收获 ${formatNumber(offlineGain)} 禅意`));
      }
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

function activeBead(current = state) {
  const available = beads.filter((bead) => current.totalZen >= bead.threshold);
  return available.find((bead) => bead.id === current.selectedBead) ?? available.at(-1) ?? beads[0];
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
  return activeBead(current).multiplier *
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

function advanceUpgradePace() {
  state.upgradePaceStep = upgradePaceStep(state) + 1;
}

function handleTap(event) {
  const amount = tapPower();
  gainZen(amount);
  state.taps += 1;
  popText(event, `+${formatNumber(amount)}`);
  elements.tapTarget.classList.remove("pulse");
  void elements.tapTarget.offsetWidth;
  elements.tapTarget.classList.add("pulse");
  renderHud();
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
  toast(`珠串升到 Lv.${state.braceletLevel}`);
  render();
}

function selectBead(beadId) {
  const bead = beads.find((item) => item.id === beadId);
  if (!bead || state.totalZen < bead.threshold) return;
  state.selectedBead = bead.id;
  toast(`换上${bead.name}`);
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
  elements.guideNextButton.textContent = guideIndex === guideSteps.length - 1 ? "开始盘串" : "下一步";
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
    toast("新手指南完成，开始盘串吧");
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
    catVisualState.set(key, {
      zoneId: zone.id,
      activity: activity.activity,
      spriteAction: activity.spriteAction,
      mood: activity.mood,
      x: Math.max(2, Math.min(92, zone.x + offset)),
      targetX: Math.max(zone.minX, Math.min(zone.maxX, zone.x + offset)),
      minX: zone.minX,
      maxX: zone.maxX,
      bottom: zone.bottom + (instanceIndex % 2) * 1.2,
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
        <article class="shop-card ${unlocked ? "" : "locked"}" data-cat-card="${cat.id}">
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
            <button class="shop-button" type="button" data-buy-cat="${cat.id}" ${canBuy ? "" : "disabled"}>
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
      return `
        <article class="bead-card ${unlocked ? "" : "locked"} ${active ? "active-bead" : ""}" data-bead-card="${bead.id}">
          <span class="bracelet-sprite ${bead.sprite}" aria-hidden="true"></span>
          <div class="card-copy">
            <div class="card-title">
              <span>${bead.name}</span>
              <span>x${bead.multiplier.toFixed(1)}</span>
            </div>
            <div class="card-meta">
              <span data-bead-state="${bead.id}">${unlocked ? "已点亮" : `累计 ${formatNumber(bead.threshold)}`}</span>
              <span data-bead-label="${bead.id}">${active ? "当前手串" : bead.note}</span>
            </div>
            <button class="shop-button secondary" type="button" data-select-bead="${bead.id}" ${unlocked && !active ? "" : "disabled"}>
              ${active ? "佩戴中" : unlocked ? "换上" : "未解锁"}
            </button>
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
        <article class="decor-card ${unlocked ? "" : "locked"}" data-decor-card="${decor.id}">
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
            <button class="shop-button secondary" type="button" data-upgrade-decor="${decor.id}" ${canBuy ? "" : "disabled"}>
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
        <article class="paw-talent-card">
          <div class="card-title">
            <span>${talent.name}</span>
            <span data-paw-talent-level="${talent.id}">Lv.${level}/${talent.maxLevel}</span>
          </div>
          <div class="card-meta">
            <span>${talent.description}</span>
            <span data-paw-talent-cost="${talent.id}">${capped ? "已满级" : `消耗 ${cost} 福爪`}</span>
          </div>
          <button class="shop-button secondary" type="button" data-upgrade-paw-talent="${talent.id}" ${canBuy ? "" : "disabled"}>
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
        <article class="wish-card ${claimed ? "claimed" : ""}" data-wish-card="${wish.id}">
          <div class="card-title">
            <span>${wish.label}</span>
            <span>福爪 +${wish.reward}</span>
          </div>
          <div class="card-meta">
            <span data-wish-value="${wish.id}">${formatNumber(value)} / ${formatNumber(wish.goal)}</span>
          </div>
          <div class="wish-progress" aria-hidden="true"><span data-wish-progress="${wish.id}" style="width:${progress * 100}%"></span></div>
          <button class="shop-button ${ready ? "" : "secondary"}" type="button" data-claim-wish="${wish.id}" ${ready ? "" : "disabled"}>
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
    if (countLabel) countLabel.textContent = `Lv.${count}`;
    if (ppsLabel) ppsLabel.textContent = `${formatNumber(catGroupPps(cat))}/s 猫群猫息`;
    if (costLabel) costLabel.textContent = unlocked ? `花费 ${formatNumber(cost)} 禅意` : `累计 ${formatNumber(cat.unlock)} 解锁`;
    if (button) {
      button.disabled = !canBuy;
      button.textContent = unlocked ? "结缘" : "未解锁";
    }
  });

  const currentBeadId = activeBead().id;
  beads.forEach((bead) => {
    const unlocked = state.totalZen >= bead.threshold;
    const active = currentBeadId === bead.id;
    const card = elements.beadBoard.querySelector(`[data-bead-card="${bead.id}"]`);
    const stateLabel = elements.beadBoard.querySelector(`[data-bead-state="${bead.id}"]`);
    const beadLabel = elements.beadBoard.querySelector(`[data-bead-label="${bead.id}"]`);
    const button = elements.beadBoard.querySelector(`[data-select-bead="${bead.id}"]`);

    card?.classList.toggle("locked", !unlocked);
    card?.classList.toggle("active-bead", active);
    if (stateLabel) stateLabel.textContent = unlocked ? "已点亮" : `累计 ${formatNumber(bead.threshold)}`;
    if (beadLabel) beadLabel.textContent = active ? "当前手串" : bead.note;
    if (button) {
      button.disabled = !unlocked || active;
      button.textContent = active ? "佩戴中" : unlocked ? "换上" : "未解锁";
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
    if (levelLabel) levelLabel.textContent = `Lv.${level}/${decor.maxLevel}`;
    if (costLabel) costLabel.textContent = unlocked ? `花费 ${formatNumber(cost)} 禅意` : `累计 ${formatNumber(decor.unlock)} 解锁`;
    if (wait) wait.textContent = unlocked && !capped ? waitLabel(cost) : capped ? "已满级" : "未解锁";
    if (button) {
      button.disabled = !canBuy;
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
    if (valueLabel) valueLabel.textContent = `${formatNumber(value)} / ${formatNumber(wish.goal)}`;
    if (progressBar) progressBar.style.width = `${progress * 100}%`;
    if (button) {
      button.disabled = !ready;
      button.classList.toggle("secondary", !ready);
      button.textContent = claimed ? "已达成" : ready ? "领取" : "进行中";
    }
  });

  pawTalents.forEach((talent) => {
    const level = pawTalentLevel(talent);
    const capped = level >= talent.maxLevel;
    const cost = pawTalentCost(talent);
    const canBuy = !capped && state.paws >= cost;
    const levelLabel = elements.wishList.querySelector(`[data-paw-talent-level="${talent.id}"]`);
    const costLabel = elements.wishList.querySelector(`[data-paw-talent-cost="${talent.id}"]`);
    const button = elements.wishList.querySelector(`[data-upgrade-paw-talent="${talent.id}"]`);

    if (levelLabel) levelLabel.textContent = `Lv.${level}/${talent.maxLevel}`;
    if (costLabel) costLabel.textContent = capped ? "已满级" : `消耗 ${cost} 福爪`;
    if (button) {
      button.disabled = !canBuy;
      button.textContent = capped ? "已满级" : "使用福爪";
    }
  });

  const pawSummary = elements.wishList.querySelector("[data-paw-summary]");
  if (pawSummary) pawSummary.textContent = `${formatNumber(state.paws)} 可用 / ${formatNumber(totalPaws(state))} 累计`;
}

function renderHud() {
  const pps = productionPerSecond();
  const tap = tapPower();
  const nextBraceletCost = braceletCost();
  const currentBead = activeBead();
  const nextBead = beads.find((bead) => bead.threshold > state.totalZen);
  const aura = nextBead ? Math.min(1, state.totalZen / nextBead.threshold) : 1;

  elements.zenValue.textContent = formatNumber(state.zen);
  elements.ppsValue.textContent = `${formatNumber(pps)}/s`;
  elements.tapValue.textContent = `+${formatNumber(tap)}`;
  elements.lifetimeValue.textContent = formatNumber(state.totalZen);
  elements.pawValue.textContent = `${formatNumber(state.paws)} / ${formatNumber(totalPaws(state))}`;
  elements.catCountValue.textContent = `${totalCats(state)} / ${cats.length}`;
  elements.braceletName.textContent = currentBead.name;
  elements.braceletLevel.textContent = `Lv. ${state.braceletLevel}`;
  elements.braceletCost.textContent = `升级 ${formatNumber(nextBraceletCost)}`;
  elements.altarBracelet.className = `bracelet-sprite ${currentBead.sprite} altar-bracelet`;
  elements.upgradeBraceletButton.disabled = state.zen < nextBraceletCost;
  elements.auraLabel.textContent = nextBead ? `${Math.floor(aura * 100)}%` : "满";
  elements.auraFill.style.width = `${aura * 100}%`;
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
  elements.tapTarget.addEventListener("click", handleTap);
  elements.mainTapButton.addEventListener("click", handleTap);
  elements.upgradeBraceletButton.addEventListener("click", upgradeBracelet);
  elements.guideButton.addEventListener("click", () => openGuide(0));
  elements.guideSkipButton.addEventListener("click", () => closeGuide(true));
  elements.guideCloseButton.addEventListener("click", () => closeGuide(true));
  elements.guidePrevButton.addEventListener("click", prevGuideStep);
  elements.guideNextButton.addEventListener("click", nextGuideStep);
  elements.catGroupCloseButton.addEventListener("click", closeCatGroupPanel);

  document.addEventListener("click", (event) => {
    const stageCat = event.target.closest("[data-stage-cat]");
    if (stageCat) {
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
saveState();
if (!state.tutorialSeen) {
  requestAnimationFrame(() => openGuide(0));
}
requestAnimationFrame(tick);
