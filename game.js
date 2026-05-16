const SAVE_KEY = "cat-bead-idle-save-v1";

const cats = [
  {
    id: "tabby",
    name: "橘串师",
    sprite: "tabby",
    baseCost: 120,
    scale: 1.32,
    pps: 0.05,
    unlock: 0,
  },
  {
    id: "sleepy",
    name: "白团守垫",
    sprite: "sleepy",
    baseCost: 1100,
    scale: 1.34,
    pps: 0.42,
    unlock: 550,
  },
  {
    id: "monk",
    name: "黑禅猫",
    sprite: "monk",
    baseCost: 9600,
    scale: 1.36,
    pps: 3.1,
    unlock: 5200,
  },
  {
    id: "vendor",
    name: "三花掌柜",
    sprite: "vendor",
    baseCost: 82000,
    scale: 1.38,
    pps: 22,
    unlock: 46000,
  },
];

const beads = [
  { id: "bodhi-root", name: "菩提根", sprite: "bodhi-root", threshold: 0, multiplier: 1, note: "温润白珠" },
  { id: "monkey-head", name: "猴头", sprite: "monkey-head", threshold: 15000, multiplier: 1.45, note: "核纹红润" },
  { id: "xingyue", name: "星月菩提", sprite: "xingyue", threshold: 180000, multiplier: 2.1, note: "星点月眼" },
  { id: "vajra", name: "小金刚", sprite: "vajra", threshold: 2500000, multiplier: 3.2, note: "深纹金刚" },
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
    baseCost: 650,
    scale: 2.25,
    unlock: 0,
    maxLevel: 12,
    effect: "catMult",
    value: 0.08,
    note: "猫息 +8%/级",
  },
  {
    id: "cat-bed",
    name: "猫窝",
    sprite: "cat-bed",
    baseCost: 1900,
    scale: 2.3,
    unlock: 900,
    maxLevel: 12,
    effect: "flatPps",
    value: 0.16,
    note: "安睡猫息 +0.16/s/级",
  },
  {
    id: "scratch-post",
    name: "抓抓柱",
    sprite: "scratch-post",
    baseCost: 7200,
    scale: 2.35,
    unlock: 3600,
    maxLevel: 10,
    effect: "tapMult",
    value: 0.12,
    note: "盘串 +12%/级",
  },
  {
    id: "window-perch",
    name: "窗台软垫",
    sprite: "window-perch",
    baseCost: 26000,
    scale: 2.45,
    unlock: 14000,
    maxLevel: 10,
    effect: "catMult",
    value: 0.12,
    note: "猫息 +12%/级",
  },
  {
    id: "toy-basket",
    name: "玩具篮",
    sprite: "toy-basket",
    baseCost: 98000,
    scale: 2.55,
    unlock: 56000,
    maxLevel: 8,
    effect: "tapMult",
    value: 0.16,
    note: "盘串 +16%/级",
  },
  {
    id: "display-shelf",
    name: "文玩柜",
    sprite: "display-shelf",
    baseCost: 420000,
    scale: 2.7,
    unlock: 220000,
    maxLevel: 8,
    effect: "allMult",
    value: 0.1,
    note: "全产出 +10%/级",
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

const defaultState = () => ({
  zen: 0,
  totalZen: 0,
  braceletLevel: 1,
  selectedBead: "bodhi-root",
  catCounts: Object.fromEntries(cats.map((cat) => [cat.id, 0])),
  decorationLevels: Object.fromEntries(decorations.map((decor) => [decor.id, 0])),
  claimedWishes: {},
  paws: 0,
  taps: 0,
  lastSaved: Date.now(),
});

let state = loadState();
let lastTick = performance.now();
let saveTimer = 0;
let panelsReady = false;

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
  tapTarget: $("#tapTarget"),
  mainTapButton: $("#mainTapButton"),
  upgradeBraceletButton: $("#upgradeBraceletButton"),
  toastStack: $("#toastStack"),
  resetButton: $("#resetButton"),
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    const merged = { ...defaultState(), ...saved };
    merged.catCounts = { ...defaultState().catCounts, ...(saved?.catCounts ?? {}) };
    merged.decorationLevels = { ...defaultState().decorationLevels, ...(saved?.decorationLevels ?? {}) };
    merged.claimedWishes = { ...(saved?.claimedWishes ?? {}) };
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

function decorationLevel(decor, current = state) {
  return current.decorationLevels?.[decor.id] ?? 0;
}

function totalDecorationLevels(current = state) {
  return Object.values(current.decorationLevels ?? {}).reduce((sum, level) => sum + level, 0);
}

function decorationMultiplier(effect, current = state) {
  return 1 + decorations.reduce((sum, decor) => {
    const level = decorationLevel(decor, current);
    if (decor.effect !== effect && decor.effect !== "allMult") return sum;
    return sum + level * decor.value;
  }, 0);
}

function decorationFlatPps(current = state) {
  return decorations.reduce((sum, decor) => {
    if (decor.effect !== "flatPps") return sum;
    return sum + decorationLevel(decor, current) * decor.value;
  }, 0);
}

function globalMultiplier(current = state) {
  return activeBead(current).multiplier * (1 + uniqueCats(current) * 0.04) * (1 + current.paws * 0.03);
}

function tapPower(current = state) {
  return (0.8 + current.braceletLevel * 0.32) * globalMultiplier(current) * decorationMultiplier("tapMult", current);
}

function productionPerSecond(current = state) {
  const catBase = cats.reduce((sum, cat) => {
    const count = current.catCounts[cat.id] ?? 0;
    return sum + count * cat.pps * (1 + Math.max(0, count - 1) * 0.018);
  }, 0);

  return (catBase + decorationFlatPps(current)) *
    (1 + Math.max(0, current.braceletLevel - 1) * 0.025) *
    globalMultiplier(current) *
    decorationMultiplier("catMult", current);
}

function catCost(cat) {
  const count = state.catCounts[cat.id] ?? 0;
  return cat.baseCost * Math.pow(cat.scale, count) * Math.pow(1.018, state.braceletLevel - 1);
}

function braceletCost() {
  return 180 * Math.pow(1.62, state.braceletLevel - 1);
}

function decorationCost(decor) {
  return decor.baseCost * Math.pow(decor.scale, decorationLevel(decor));
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
  const cost = catCost(cat);
  if (!spendZen(cost)) return;
  state.catCounts[cat.id] += 1;
  toast(`${cat.name} 来盘串了`);
  render();
}

function upgradeBracelet() {
  const cost = braceletCost();
  if (!spendZen(cost)) return;
  state.braceletLevel += 1;
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

function renderCats() {
  elements.catLayer.innerHTML = cats
    .map((cat) => {
      const count = state.catCounts[cat.id] ?? 0;
      return `
        <span class="sprite ${cat.sprite} stage-cat ${count > 0 ? "show" : ""}" data-cat="${cat.id}">
          ${count > 1 ? `<b class="cat-badge">x${count}</b>` : ""}
        </span>
      `;
    })
    .join("");
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
              <span data-cat-count="${cat.id}">x${count}</span>
            </div>
            <div class="card-meta">
              <span data-cat-pps="${cat.id}">${formatNumber(cat.pps * globalMultiplier())}/s 基础猫息</span>
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
  elements.wishList.innerHTML = wishes
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
    if (countLabel) countLabel.textContent = `x${count}`;
    if (ppsLabel) ppsLabel.textContent = `${formatNumber(cat.pps * globalMultiplier())}/s 基础猫息`;
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
  elements.pawValue.textContent = formatNumber(state.paws);
  elements.catCountValue.textContent = totalCats(state);
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

  document.addEventListener("click", (event) => {
    const catButton = event.target.closest("[data-buy-cat]");
    if (catButton) buyCat(catButton.dataset.buyCat);

    const beadButton = event.target.closest("[data-select-bead]");
    if (beadButton) selectBead(beadButton.dataset.selectBead);

    const decorButton = event.target.closest("[data-upgrade-decor]");
    if (decorButton) upgradeDecoration(decorButton.dataset.upgradeDecor);

    const wishButton = event.target.closest("[data-claim-wish]");
    if (wishButton) claimWish(wishButton.dataset.claimWish);

    const tabButton = event.target.closest("[data-tab]");
    if (tabButton) switchTab(tabButton.dataset.tab);
  });

  elements.resetButton.addEventListener("click", () => {
    if (!confirm("清除当前猫猫盘串铺存档？")) return;
    localStorage.removeItem(SAVE_KEY);
    state = defaultState();
    saveState();
    toast("存档已清除");
    render();
  });

  window.addEventListener("beforeunload", saveState);
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
requestAnimationFrame(tick);
