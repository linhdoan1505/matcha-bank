// ---- Ingredient data ----
const INGREDIENTS = {
  base: [
    { name: "Ceremonial Matcha", icon: "🍵", sweet: 0, caff: 4, earth: 3, notes: "Smooth, vegetal, and rich in umami. The classic choice.", tags: ["Umami", "Grassy"] },
    { name: "Culinary Matcha", icon: "🍵", sweet: 0, caff: 3, earth: 2, notes: "Bolder and slightly bitter, great with sweet mix-ins.", tags: ["Bold", "Bitter"] },
    { name: "Houjicha", icon: "🍂", sweet: 0, caff: 1, earth: 2, notes: "Roasted and nutty with low caffeine, a cozy alternative.", tags: ["Roasted", "Nutty"] },
  ],
  milk: [
    { name: "Whole Milk", icon: "🥛", sweet: 1, caff: 0, earth: 0, notes: "Classic richness, creates beautiful latte art and cold foam.", tags: ["Rich", "Neutral"] },
    { name: "Oat Milk", icon: "🌾", sweet: 1, caff: 0, earth: 0, notes: "Creamy and naturally sweet with a light oat flavor.", tags: ["Creamy", "Sweet"] },
    { name: "Coconut Milk", icon: "🥥", sweet: 2, caff: 0, earth: 0, notes: "Tropical and silky, pairs beautifully with fruit.", tags: ["Tropical", "Silky"] },
  ],
  sweet: [
    { name: "Brown Sugar", icon: "🍯", sweet: 4, caff: 0, earth: 1, notes: "Deep caramel sweetness with a hint of molasses.", tags: ["Caramel", "Warm"] },
    { name: "Honey", icon: "🍯", sweet: 3, caff: 0, earth: 0, notes: "Floral sweetness that pairs well with ceremonial grade.", tags: ["Floral", "Light"] },
    { name: "Vanilla Sugar", icon: "🧁", sweet: 3, caff: 0, earth: 0, notes: "Warm and aromatic, rounds out sharper flavors.", tags: ["Aromatic", "Sweet"] },
  ],
  syrup: [
    { name: "Vanilla Syrup", icon: "💧", sweet: 3, caff: 0, earth: 0, notes: "Smooth and classic, a crowd-pleasing base sweetener.", tags: ["Classic", "Smooth"] },
    { name: "Toffee Syrup", icon: "💧", sweet: 4, caff: 0, earth: 1, notes: "Buttery and rich, best with houjicha.", tags: ["Buttery", "Rich"] },
  ],
  topping: [
    { name: "Cold Foam", icon: "☁️", sweet: 1, caff: 0, earth: 0, notes: "Light and airy, adds a creamy top layer.", tags: ["Airy", "Creamy"] },
    { name: "Boba Pearls", icon: "⚫", sweet: 2, caff: 0, earth: 0, notes: "Chewy and fun, adds texture to every sip.", tags: ["Chewy", "Fun"] },
  ],
  ice: [
    { name: "Classic Ice", icon: "🧊", sweet: 0, caff: 0, earth: 0, notes: "Keeps it cool and refreshing.", tags: ["Refreshing"] },
    { name: "Crushed Ice", icon: "🧊", sweet: 0, caff: 0, earth: 0, notes: "Blends faster for a slushier texture.", tags: ["Slushy"] },
  ],
  fruit: [
    { name: "Strawberry", icon: "🍓", sweet: 3, caff: 0, earth: 0, notes: "Bright and juicy, a Gen Z favorite pairing.", tags: ["Juicy", "Bright"] },
    { name: "Mango", icon: "🥭", sweet: 4, caff: 0, earth: 0, notes: "Luscious tropical sweetness. Pairs brilliantly with coconut.", tags: ["Tropical", "Rich"] },
    { name: "Lychee", icon: "🍈", sweet: 3, caff: 0, earth: 0, notes: "Delicate floral sweetness with a light finish.", tags: ["Floral", "Delicate"] },
  ],
};

// ---- Studio page logic ----
const BASE_LIQUID_COLORS = {
  "Ceremonial Matcha": [91, 127, 58],
  "Culinary Matcha": [79, 122, 46],
  "Houjicha": [138, 90, 52],
};
const FRUIT_TINTS = {
  "Strawberry": [214, 60, 90],
  "Mango": [255, 170, 40],
  "Lychee": [255, 200, 210],
};
const DEFAULT_LIQUID_COLOR = [206, 222, 190];

function computeLiquidColor(cup) {
  const base = [...cup].reverse().find(i => i.cat === "base");
  let rgb = base ? (BASE_LIQUID_COLORS[base.name] || [122, 166, 90]) : DEFAULT_LIQUID_COLOR;
  rgb = [...rgb];
  const milkCount = cup.filter(i => i.cat === "milk").length;
  for (let n = 0; n < milkCount; n++) rgb = rgb.map(c => c + (255 - c) * 0.22);
  cup.filter(i => i.cat === "fruit").forEach(f => {
    const fc = FRUIT_TINTS[f.name];
    if (fc) rgb = rgb.map((c, idx) => c * 0.85 + fc[idx] * 0.15);
  });
  return rgb.map(c => Math.round(Math.min(255, c)));
}

function shade(rgb, factor) {
  return rgb.map(c => Math.round(Math.max(0, Math.min(255, c * factor))));
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Renders a small illustrated matcha cup used as a recipe thumbnail,
// matching the Studio's game-cup look so every recipe gets its own "photo".
function cupThumbSVG(color, opts = {}) {
  const { foam = false, boba = false, ice = false, fruitEmoji = null } = opts;
  const rgb = typeof color === "string" ? hexToRgb(color) : color;
  const top = shade(rgb, 1.18);
  const bottom = shade(rgb, 0.82);
  const uid = Math.random().toString(36).slice(2, 8);
  return `
    <svg viewBox="0 0 140 140" class="thumb-cup" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id="liq-${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgb(${top.join(",")})"/>
          <stop offset="100%" stop-color="rgb(${bottom.join(",")})"/>
        </linearGradient>
      </defs>
      <rect x="88" y="2" width="9" height="30" rx="4" fill="#e85c7a" transform="rotate(12 92 17)"/>
      <polygon points="26,18 114,18 102,128 38,128" fill="url(#liq-${uid})"/>
      <polygon points="26,18 114,18 102,128 38,128" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
      ${ice ? `<rect x="52" y="36" width="13" height="13" rx="3" fill="rgba(255,255,255,0.85)" transform="rotate(12 58 42)"/><rect x="74" y="52" width="11" height="11" rx="3" fill="rgba(255,255,255,0.8)" transform="rotate(-10 80 57)"/>` : ""}
      ${boba ? `<circle cx="50" cy="114" r="5" fill="#2a1a12"/><circle cx="65" cy="120" r="5" fill="#2a1a12"/><circle cx="80" cy="113" r="5" fill="#2a1a12"/><circle cx="92" cy="119" r="5" fill="#2a1a12"/>` : ""}
      ${fruitEmoji ? `<text x="70" y="82" font-size="26" text-anchor="middle">${fruitEmoji}</text>` : ""}
      ${foam ? `<ellipse cx="70" cy="20" rx="45" ry="11" fill="#fbf7ee"/>` : ""}
      <rect x="20" y="8" width="100" height="14" rx="6" fill="#ffffff" opacity="0.95"/>
    </svg>
  `;
}

function cupOptsFromChips(chips) {
  const text = chips.join(" ").toLowerCase();
  const fruitMap = { strawberry: "🍓", mango: "🥭", lychee: "🍈", yuzu: "🍋", coconut: "🥥" };
  let fruitEmoji = null;
  for (const [key, emoji] of Object.entries(fruitMap)) {
    if (text.includes(key)) { fruitEmoji = emoji; break; }
  }
  return {
    foam: text.includes("foam"),
    boba: text.includes("boba"),
    ice: text.includes("ice"),
    fruitEmoji,
  };
}

function initStudio() {
  const list = document.getElementById("ingredientList");
  if (!list) return;
  const tabs = document.getElementById("categoryTabs");
  const cupDrop = document.getElementById("cupDrop");
  const cupLiquid = document.getElementById("cupLiquid");
  const foamCap = document.getElementById("foamCap");
  const mixIns = document.getElementById("mixIns");
  const cupEmpty = document.getElementById("cupEmpty");
  const notesBox = document.getElementById("baristaNotes");
  const ingredientCount = document.getElementById("ingredientCount");
  const creationName = document.getElementById("creationName");
  const recipeList = document.getElementById("cupRecipeList");

  let currentCat = "base";
  let cup = []; // { name, icon, sweet, caff, earth, notes, tags, cat }
  let lastStats = { sweet: 0, caff: 0, earth: 0 };

  function renderIngredients(cat) {
    list.innerHTML = "";
    INGREDIENTS[cat].forEach(ing => {
      const el = document.createElement("div");
      el.className = "ingredient-item";
      el.draggable = true;
      el.textContent = `${ing.icon} ${ing.name}`;
      el.addEventListener("dragstart", e => {
        el.classList.add("dragging");
        e.dataTransfer.setData("text/plain", JSON.stringify({ ...ing, cat }));
      });
      el.addEventListener("dragend", () => el.classList.remove("dragging"));
      el.addEventListener("mouseenter", () => showNotes(ing));
      el.addEventListener("click", () => addToCup({ ...ing, cat }));
      list.appendChild(el);
    });
  }

  function showNotes(ing) {
    notesBox.innerHTML = `
      <strong style="font-size:0.85rem;">${ing.icon} ${ing.name}</strong>
      <p style="color:var(--text-muted); margin:6px 0 0;">${ing.notes}</p>
      <div>${ing.tags.map(t => `<span class="chip">${t}</span>`).join("")}</div>
    `;
  }

  function addToCup(ing) {
    cup.push(ing);
    renderCup();
    playPourAnimation(ing);
  }

  function removeFromCup(index) {
    cup.splice(index, 1);
    renderCup();
  }

  function playPourAnimation(ing) {
    const drop = document.createElement("div");
    drop.className = "pour-drop";
    drop.textContent = ing.icon;
    cupDrop.appendChild(drop);
    drop.addEventListener("animationend", () => drop.remove());
    cupDrop.classList.add("splash");
    setTimeout(() => cupDrop.classList.remove("splash"), 400);
  }

  function renderMixIns(cup) {
    mixIns.innerHTML = "";
    const iceCount = cup.filter(i => i.cat === "ice").length;
    const bobaCount = cup.filter(i => i.name === "Boba Pearls").length;
    const fruitItems = cup.filter(i => i.cat === "fruit");

    for (let n = 0; n < iceCount * 4; n++) {
      const cube = document.createElement("div");
      cube.className = "ice-cube";
      cube.style.left = `${10 + Math.random() * 70}%`;
      cube.style.top = `${8 + Math.random() * 45}%`;
      cube.style.animationDelay = `${(Math.random() * 2).toFixed(2)}s`;
      mixIns.appendChild(cube);
    }
    for (let n = 0; n < bobaCount * 8; n++) {
      const pearl = document.createElement("div");
      pearl.className = "boba-pearl";
      pearl.style.left = `${8 + Math.random() * 80}%`;
      pearl.style.bottom = `${2 + Math.random() * 12}%`;
      mixIns.appendChild(pearl);
    }
    fruitItems.forEach(f => {
      for (let n = 0; n < 3; n++) {
        const chunk = document.createElement("div");
        chunk.className = "fruit-chunk";
        chunk.textContent = f.icon;
        chunk.style.left = `${10 + Math.random() * 75}%`;
        chunk.style.top = `${15 + Math.random() * 55}%`;
        chunk.style.animationDelay = `${(Math.random() * 3).toFixed(2)}s`;
        mixIns.appendChild(chunk);
      }
    });
  }

  function renderCup() {
    cupEmpty.style.display = cup.length ? "none" : "block";
    ingredientCount.textContent = cup.length ? `${cup.length} ingredient${cup.length > 1 ? "s" : ""} added` : "Empty";

    const liquidHeight = cup.length ? Math.min(92, 18 + cup.length * 11) : 0;
    const rgb = computeLiquidColor(cup);
    cupLiquid.style.height = `${liquidHeight}%`;
    cupLiquid.style.background = cup.length
      ? `linear-gradient(180deg, rgb(${shade(rgb, 1.12).join(",")}), rgb(${shade(rgb, 0.85).join(",")}))`
      : "transparent";

    const foamHeight = cup.some(i => i.name === "Cold Foam") ? 20 : 0;
    foamCap.style.height = `${foamHeight}px`;

    renderMixIns(cup);

    recipeList.innerHTML = "";
    cup.forEach((ing, i) => {
      const chip = document.createElement("span");
      chip.className = "cup-recipe-chip";
      chip.innerHTML = `${ing.icon} ${ing.name} <button title="remove">✕</button>`;
      chip.querySelector("button").addEventListener("click", () => removeFromCup(i));
      recipeList.appendChild(chip);
    });

    const sweet = cup.reduce((s, i) => s + i.sweet, 0);
    const caff = cup.reduce((s, i) => s + i.caff, 0);
    const earth = cup.reduce((s, i) => s + i.earth, 0);
    lastStats = { sweet, caff, earth };

    setStat("sweet", sweet, 20);
    setStat("caff", caff, 20);
    setStat("earth", earth, 10);

    const tags = [...new Set(cup.flatMap(i => i.tags))];
    document.getElementById("flavorChips").innerHTML = tags.map(t => `<span class="chip">${t}</span>`).join("");

    if (cup.length) showNotes(cup[cup.length - 1]);
  }

  function setStat(key, value, max) {
    const fill = document.getElementById(`${key}Fill`);
    const val = document.getElementById(`${key}Val`);
    val.textContent = `${value.toFixed(1)} / ${max}`;
    const pct = Math.min(100, (value / max) * 100);
    fill.style.width = `${pct}%`;
    fill.classList.toggle("over", value > max);
  }

  tabs.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCat = btn.dataset.cat;
      renderIngredients(currentCat);
    });
  });

  cupDrop.addEventListener("dragover", e => {
    e.preventDefault();
    cupDrop.classList.add("drag-over");
  });
  cupDrop.addEventListener("dragleave", () => cupDrop.classList.remove("drag-over"));
  cupDrop.addEventListener("drop", e => {
    e.preventDefault();
    cupDrop.classList.remove("drag-over");
    const data = e.dataTransfer.getData("text/plain");
    if (data) addToCup(JSON.parse(data));
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    cup = [];
    creationName.value = "";
    renderCup();
  });

  document.getElementById("saveBtn").addEventListener("click", async () => {
    if (!cup.length) { alert("Add some ingredients before saving!"); return; }
    const name = creationName.value.trim() || "My Matcha Creation";

    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        ingredients: cup,
        sweetness: lastStats.sweet,
        caffeine: lastStats.caff,
        earthiness: lastStats.earth,
      }),
    });

    if (res.status === 401) {
      if (confirm(`Log in to save "${name}" to your profile?`)) {
        window.location.href = "/login";
      }
      return;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Couldn't save that recipe, try again.");
      return;
    }

    alert(`Saved "${name}" with ${cup.length} ingredients to your profile!`);
  });

  document.getElementById("shareBtn").addEventListener("click", () => {
    if (!cup.length) { alert("Add some ingredients before sharing!"); return; }
    alert("Share link copied to clipboard! (demo)");
  });

  renderIngredients(currentCat);
  renderCup();
}

// ---- Gallery page logic ----
function initGallery() {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  const recipes = [
    { tag: "Trending", handle: "@cloudcafe.jp", name: "Brown Sugar Tiger", chips: ["Culinary Matcha", "Oat Milk", "Brown Sugar"], caff: 70, sweet: 60, color: "#3d5c2e" },
    { tag: "Citrus", handle: "@matchamuse", name: "Yuzu Cloud Float", chips: ["Ceremonial Matcha", "Coconut Milk", "Yuzu"], caff: 55, sweet: 40, color: "#c9a227" },
    { tag: "Roasted", handle: "@brewsbysakura", name: "Houjicha Toffee Hug", chips: ["Houjicha", "Whole Milk", "Brown Sugar"], caff: 30, sweet: 50, color: "#5a3f27" },
    { tag: "Tropical", handle: "@yuki_brews", name: "Mango Matchachacha", chips: ["Ceremonial Matcha", "Coconut Milk", "Mango"], caff: 65, sweet: 75, color: "#8fae4d" },
    { tag: "Citrus", handle: "@matchamaestro", name: "Yuzu Citrus Matcha", chips: ["Culinary Matcha", "Oat Milk", "Yuzu"], caff: 60, sweet: 35, color: "#c9a227" },
    { tag: "Sweet", handle: "@cloudcafe.jp", name: "Vanilla Bean Latte", chips: ["Ceremonial Matcha", "Whole Milk", "Vanilla"], caff: 50, sweet: 55, color: "#6f8f4f" },
    { tag: "Fruity", handle: "@yuki_brews", name: "Strawberry Cold Foam", chips: ["Culinary Matcha", "Cold Foam", "Strawberry"], caff: 45, sweet: 65, color: "#c2617a" },
    { tag: "Classic", handle: "@tokyocafegirl", name: "Kyoto Classic", chips: ["Ceremonial Matcha", "Oat Milk", "Honey"], caff: 68, sweet: 30, color: "#3f6b47" },
  ];

  grid.innerHTML = recipes.map(r => `
    <article class="recipe-card">
      <div class="thumb">${cupThumbSVG(r.color, cupOptsFromChips(r.chips))}<span class="tag">${r.tag}</span></div>
      <div class="body">
        <div class="handle">${r.handle}</div>
        <h4>${r.name}</h4>
        <div style="margin-bottom:6px;">${r.chips.map(c => `<span class="chip" style="display:inline-block;background:var(--cream);border-radius:999px;padding:2px 8px;font-size:0.7rem;margin:2px 3px 0 0;">${c}</span>`).join("")}</div>
        <div class="meter-row">Caffeine <div class="meter-track"><div class="meter-fill" style="width:${r.caff}%"></div></div></div>
        <div class="meter-row">Sweetness <div class="meter-track"><div class="meter-fill" style="width:${r.sweet}%"></div></div></div>
      </div>
    </article>
  `).join("");
}

// ---- Homepage trending cards ----
function initTrending() {
  document.querySelectorAll(".thumb[data-cup-color]").forEach(el => {
    const opts = {
      foam: el.dataset.cupFoam === "1",
      boba: el.dataset.cupBoba === "1",
      ice: el.dataset.cupIce === "1",
      fruitEmoji: el.dataset.cupFruit || null,
    };
    el.insertAdjacentHTML("afterbegin", cupThumbSVG(el.dataset.cupColor, opts));
  });
}

// ---- Profile page logic ----
function initProfile() {
  document.querySelectorAll(".my-recipe-card .delete-recipe").forEach(btn => {
    btn.addEventListener("click", async () => {
      const card = btn.closest(".my-recipe-card");
      const id = card.dataset.recipeId;
      if (!confirm("Delete this recipe?")) return;
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (res.ok) card.remove();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initStudio();
  initGallery();
  initTrending();
  initProfile();
});
