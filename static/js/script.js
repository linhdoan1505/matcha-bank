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
function initStudio() {
  const list = document.getElementById("ingredientList");
  if (!list) return;
  const tabs = document.getElementById("categoryTabs");
  const cupDrop = document.getElementById("cupDrop");
  const cupEmpty = document.getElementById("cupEmpty");
  const notesBox = document.getElementById("baristaNotes");
  const ingredientCount = document.getElementById("ingredientCount");
  const creationName = document.getElementById("creationName");

  let currentCat = "base";
  let cup = []; // { name, icon, sweet, caff, earth, notes, tags, cat }

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
  }

  function removeFromCup(index) {
    cup.splice(index, 1);
    renderCup();
  }

  function renderCup() {
    cupEmpty.style.display = cup.length ? "none" : "block";
    ingredientCount.textContent = cup.length ? `${cup.length} ingredient${cup.length > 1 ? "s" : ""} added` : "Empty";

    [...cupDrop.querySelectorAll(".cup-layer")].forEach(n => n.remove());
    cup.forEach((ing, i) => {
      const layer = document.createElement("div");
      layer.className = "cup-layer";
      layer.innerHTML = `<span>${ing.icon} ${ing.name}</span><button title="remove">✕</button>`;
      layer.querySelector("button").addEventListener("click", () => removeFromCup(i));
      cupDrop.appendChild(layer);
    });

    const sweet = cup.reduce((s, i) => s + i.sweet, 0);
    const caff = cup.reduce((s, i) => s + i.caff, 0);
    const earth = cup.reduce((s, i) => s + i.earth, 0);

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

  document.getElementById("saveBtn").addEventListener("click", () => {
    if (!cup.length) { alert("Add some ingredients before saving!"); return; }
    const name = creationName.value.trim() || "My Matcha Creation";
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
      <div class="thumb" style="background:linear-gradient(160deg, ${r.color}aa, ${r.color});"><span class="tag">${r.tag}</span></div>
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

document.addEventListener("DOMContentLoaded", () => {
  initStudio();
  initGallery();
});
