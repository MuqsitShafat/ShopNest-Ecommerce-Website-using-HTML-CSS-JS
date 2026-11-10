/* ============================================================
   ShopNest — shared template helpers, icons, layout & components
   ============================================================ */
const C = require("./config");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
// Cache-busting: ?v=<content hash> so visitors get fresh CSS/JS right after a deploy
const ver = (rel) => { try { return "?v=" + crypto.createHash("md5").update(fs.readFileSync(path.join(__dirname, "..", rel))).digest("hex").slice(0, 8); } catch { return ""; } };

/* ---------- helpers ---------- */
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const rs = (n) => "Rs " + Number(n).toLocaleString("en-US");
const discountPct = (p) => (p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
const encPath = (p) => p.split("/").map(encodeURIComponent).join("/");
// Main categories (C.categories) each have subcategories (subs). Products reference a SUB slug.
const PARENTS = C.categories;
const SUBS = PARENTS.flatMap((p) => p.subs.map((s) => ({ ...s, short: s.name, icon: p.icon, parent: p })));
const catBySlug = (slug) => SUBS.find((c) => c.slug === slug);          // subcategory (has .parent)
const parentBySlug = (slug) => PARENTS.find((c) => c.slug === slug);    // main category
const collectionUrl = (c) => `collections/${c.slug}/`;
const productUrl = (p) => `products/${p.slug}/`;
const waLink = (text) => `https://wa.me/${C.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;
const absUrl = (path) => (C.siteUrl ? C.siteUrl : "") + "/" + path;

const COLOR_HEX = {
  "Black": "#1f1f24", "White": "#ffffff", "Grey": "#a3a7b0", "Red": "#d43c3c", "Crimson": "#e2483a",
  "Pink": "#f5a9c0", "Hot Pink": "#ec4899", "Light Pink": "#fbcfe0", "Peach": "#f8c4a2", "Yellow": "#f5d34f",
  "Cream": "#efe4cc", "Light Brown": "#c9a27a", "Brown": "#7b4a2b", "Mint Green": "#9fe0c9",
  "Green": "#2f8f5b", "Dark Green": "#1f5a3d", "Light Green": "#a8ecc8", "Sky Blue": "#7cc4f0",
  "Light Blue": "#a9d7f3", "Blue": "#5b9cf2", "Dark Blue": "#1f3a8a", "Purple": "#a283db",
};

/* ---------- icons (inline SVG, Lucide-style) ---------- */
const P = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  refresh: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  cash: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/>',
  pin: '<path d="M20 10c0 5-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  headset: '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  battery: '<path d="M15 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2M6 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1"/><path d="m11 7-3 5h4l-3 5"/><path d="M22 11v2"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  fan: '<path d="M10.83 16.38a6.08 6.08 0 0 1-8.62-7l5.41 1.45a6.08 6.08 0 0 1 7-8.62l-1.45 5.41a6.08 6.08 0 0 1 8.62 7l-5.41-1.45a6.08 6.08 0 0 1-7 8.62l1.45-5.41Z"/><path d="M12 12v.01"/>',
  utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  sparkles: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  /* category icons */
  "cooking-pot": '<path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/>',
  comb: '<rect x="2.5" y="5" width="19" height="5" rx="2"/><path d="M5.5 10v8M9 10v9M12.5 10v9M16 10v9M19.5 10v8"/>',
  "moon-star": '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="m17 4 .76 1.95 2.09.12-1.61 1.33.52 2.03L17 8.3l-1.76 1.13.52-2.03-1.61-1.33 2.09-.12Z"/>',
  tag: '<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
};
const FILLED = {
  star: '<path d="M11.53 2.3a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.91l5.16-.75a2.12 2.12 0 0 0 1.6-1.16z"/>',
  whatsapp: '<path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.37l-.36-.22-3.74.99 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.17-1.24-6.16-3.48-8.41Z"/>',
  instagram: '<path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85 0-3.2.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>',
  facebook: '<path d="M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.03 24 18.06 24 12.07z"/>',
  tiktok: '<path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',
};
function icon(name, cls = "") {
  if (FILLED[name]) return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${FILLED[name]}</svg>`;
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;
}

/* ---------- small components ---------- */
function stars(p, withCount = true) {
  return `<span class="stars" aria-label="Rated ${p.rating} out of 5">${icon("star")}<b>${Number(p.rating).toFixed(1)}</b>${withCount ? `<span>(${p.ratingCount})</span>` : ""}</span>`;
}
function priceBlock(p, big = false) {
  const pct = discountPct(p);
  return `<div class="price${big ? " price--lg" : ""}"><span class="price-now">${rs(p.price)}</span>${
    p.oldPrice && p.oldPrice > p.price ? `<s class="price-was">${rs(p.oldPrice)}</s>` : ""
  }${big && pct ? `<span class="price-save">Save ${rs(p.oldPrice - p.price)} (${pct}%)</span>` : ""}</div>`;
}
/* Small WebP thumbnails (generated by tools/make-thumbs.py) — falls back to the original image */
const pathMod = require("path");
const ROOT_DIR = pathMod.resolve(__dirname, "..");
function thumb(img) {
  const t = "images/thumbs/" + img.replace(/^images\//, "").replace(/\.(jpe?g|png)$/i, ".webp");
  return fs.existsSync(pathMod.join(ROOT_DIR, t)) ? t : img;
}
function cartPayload(p, { full = false } = {}) {
  const payload = { id: p.id, name: p.name, price: p.price, img: p.images[0], cat: catBySlug(p.category).name, slug: p.slug };
  if (p.locationPricing) payload.lp = p.locationPricing;
  if (full) {
    payload.oldPrice = p.oldPrice || 0;
    payload.images = p.images;
    payload.colors = (p.colors || []).map((c) => ({ name: c.name, img: c.img, hex: COLOR_HEX[c.name] || "#ccc" }));
    payload.colorLabel = p.colorLabel || "Colour";
    payload.tagline = p.tagline;
  }
  return esc(JSON.stringify(payload));
}
function productCard(p, base) {
  const pct = discountPct(p);
  const url = base + productUrl(p);
  const img2 = p.images[1];
  const needsChoice = p.colors && p.colors.length > 1;
  const data = cartPayload(p, { full: needsChoice });
  const actions = p.soldOut
    ? `<button class="btn btn-block btn-muted" disabled>Sold out</button>`
    : `<div class="pcard-actions">
        <button class="btn btn-cta js-buy" data-product="${data}"${needsChoice ? " data-choose" : ""}>Buy Now</button>
        <button class="btn btn-outline pcard-cart js-add" data-product="${data}"${needsChoice ? " data-choose" : ""} aria-label="${needsChoice ? "Choose colour and add to cart" : "Add to cart"}">${icon("bag")}<span class="pcard-cart-label">${needsChoice ? "Options" : "Add"}</span></button>
      </div>`;
  return `<article class="pcard">
  <a class="pcard-media" href="${url}" aria-label="${esc(p.name)}">
    <img src="${base}${encPath(thumb(p.images[0]))}" alt="${esc(p.name)}" loading="lazy" width="480" height="640">
    ${img2 ? `<img class="pcard-alt" src="${base}${encPath(thumb(img2))}" alt="" loading="lazy" width="480" height="640">` : ""}
    ${p.bestseller ? `<span class="pcard-badges"><span class="badge badge-hot">Bestseller</span></span>` : ""}
    ${pct ? `<span class="pcard-off"><b>${pct}%</b> OFF</span>` : ""}
  </a>
  <div class="pcard-body">
    <a class="pcard-title" href="${url}">${esc(p.name)}</a>
    ${stars(p)}
    ${priceBlock(p)}
    ${needsChoice ? `<div class="pcard-swatches" aria-label="${p.colors.length} colours">${p.colors.slice(0, 6).map((c) => `<i style="background:${COLOR_HEX[c.name] || "#ccc"}" title="${esc(c.name)}"></i>`).join("")}${p.colors.length > 6 ? `<em>+${p.colors.length - 6}</em>` : ""}</div>` : ""}
    ${actions}
  </div>
</article>`;
}

/* ---------- layout ---------- */
/* SEO <head>: title, description, canonical, Open Graph, Twitter, robots, geo, product meta */
// Trim to n chars, preferring a full sentence, otherwise a word boundary
const clip = (str, n) => {
  if (str.length <= n) return str;
  const cut = str.slice(0, n);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (end >= n * 0.6) return cut.slice(0, end + 1);
  return cut.slice(0, n - 1).replace(/[\s,;:–—-]+\S*$/, "") + "…";
};
function head({ title, description, base, canonical, image, extraHead = "", noindex = false, ogType = "website", product = null }) {
  // Keep titles ≤ ~60 chars: add the brand suffix only when it fits
  const fullTitle = title.includes(C.name) || title.length + C.name.length + 3 > 62 ? title : `${title} | ${C.name}`;
  const desc = clip(description, 158);
  const ogImg = image ? absUrl(encPath(image)) : absUrl("images/logo.png");
  // canonical: absolute when siteUrl is set, otherwise root-relative (still valid for Google)
  const canon = canonical === undefined ? null : C.siteUrl ? `${C.siteUrl}/${canonical}` : `/${canonical}`;
  return `<!doctype html>
<html lang="en-PK" data-base="${base}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
${canon ? `<link rel="canonical" href="${esc(canon)}">` : ""}
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1"}">
<meta name="theme-color" content="#53248e">
<meta name="geo.region" content="PK">
<meta name="geo.placename" content="${esc(C.city)}, Pakistan">
<meta property="og:locale" content="en_PK">
<meta property="og:site_name" content="${C.name}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(ogImg)}">
<meta property="og:image:alt" content="${esc(title)}">
<meta property="og:type" content="${ogType}">
${canon && C.siteUrl ? `<meta property="og:url" content="${esc(canon)}">` : ""}
${product ? `<meta property="product:price:amount" content="${product.price}"><meta property="product:price:currency" content="PKR"><meta property="product:availability" content="${product.soldOut ? "out of stock" : "in stock"}"><meta property="product:condition" content="new">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(ogImg)}">
<link rel="icon" type="image/png" href="${base}images/logo.png">
<link rel="apple-touch-icon" href="${base}images/logo.png">
<link rel="alternate" type="text/plain" title="LLM summary" href="${base}llms.txt">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}css/app.css${ver("css/app.css")}">
<script type="application/ld+json">${JSON.stringify(orgLd())}</script>
${extraHead}
</head>`;
}
/* Sitewide Organization + WebSite (with on-site search) structured data */
function orgLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": ["Organization", "OnlineStore"], "@id": absUrl("#org"), name: C.name, url: absUrl(""), logo: absUrl("images/logo.png"),
        description: C.tagline, email: C.email, telephone: "+" + C.whatsapp, areaServed: { "@type": "Country", name: "Pakistan" },
        address: { "@type": "PostalAddress", addressLocality: C.city, addressCountry: "PK" }, sameAs: Object.values(C.social),
        contactPoint: { "@type": "ContactPoint", telephone: "+" + C.whatsapp, contactType: "customer service", areaServed: "PK", availableLanguage: ["English", "Urdu"] } },
      { "@type": "WebSite", "@id": absUrl("#website"), name: C.name, url: absUrl(""), inLanguage: "en-PK", publisher: { "@id": absUrl("#org") },
        potentialAction: { "@type": "SearchAction", target: absUrl("shop/") + "?q={search_term_string}", "query-input": "required name=search_term_string" } },
    ],
  };
}

function announcement() {
  const msgs = [
    `${icon("truck")} FREE delivery over ${rs(C.freeShippingOver)}`,
    `${icon("cash")} Cash on Delivery nationwide`,
    `${icon("wallet")} Pay online &amp; save ${rs(C.onlineSaving)}`,
    `${icon("refresh")} Free ${C.replacementDays}-day replacement`,
  ];
  return `<div class="topbar"><div class="topbar-track">${msgs.map((m, i) => `<span class="topbar-msg${i === 0 ? " is-active" : ""}">${m}</span>`).join("")}</div></div>`;
}

function header(base, active = "") {
  const catLinks = PARENTS
    .map((c) => `<div class="catbar-item">
      <a href="${base}${collectionUrl(c)}" class="${active === c.slug ? "is-active" : ""}">${icon(c.icon)}<span>${esc(c.name)}</span>${icon("down", "catbar-caret")}</a>
      <div class="catbar-menu"><a href="${base}${collectionUrl(c)}"><b>All ${esc(c.short)}</b></a>${c.subs.map((s) => `<a href="${base}${collectionUrl(s)}">${esc(s.name)}</a>`).join("")}</div>
    </div>`)
    .join("");
  return `${announcement()}
<header class="site-header" id="site-header">
  <div class="container header-row">
    <button class="icon-btn hide-desktop" id="menu-open" aria-label="Open menu" aria-controls="mobile-nav" aria-expanded="false">${icon("menu")}</button>
    <a href="${base || "./"}" class="brand" aria-label="${C.name} home">
      <img src="${base}images/logo.png" alt="" width="40" height="40"><span>Shop<b>Nest</b></span>
    </a>
    <form class="search" action="${base}shop/" method="get" role="search" autocomplete="off">
      ${icon("search")}
      <input type="search" name="q" placeholder="Search earbuds, fans, tasbih…" aria-label="Search products" id="search-input">
      <div class="search-results" id="search-results" hidden></div>
    </form>
    <nav class="header-links hide-mobile" aria-label="Quick links">
      <a href="${base}shop/" class="${active === "shop" ? "is-active" : ""}">Shop All</a>
      <a href="${base}buying-guides/" class="${active === "guides" ? "is-active" : ""}">Buying Guides</a>
      <a href="${base}track-order/" class="${active === "track" ? "is-active" : ""}">${icon("truck")} Track Order</a>
    </nav>
    <a href="${waLink()}" class="icon-btn hide-mobile wa-mini" target="_blank" rel="noopener" aria-label="WhatsApp us">${icon("whatsapp")}</a>
    <button class="icon-btn cart-btn" id="cart-open" aria-label="Open cart">${icon("bag")}<span class="cart-count" data-cart-count hidden>0</span></button>
  </div>
  <nav class="catbar" aria-label="Categories"><div class="container catbar-row">
    <a href="${base}shop/" class="catbar-all ${active === "shop" ? "is-active" : ""}">${icon("tag")}<span>All Products</span></a>${catLinks}
  </div></nav>
</header>
<div class="drawer-backdrop" id="backdrop" hidden></div>
<aside class="mobile-nav" id="mobile-nav" aria-label="Menu" aria-hidden="true">
  <div class="drawer-head"><a href="${base || "./"}" class="brand"><img src="${base}images/logo.png" alt="" width="32" height="32"><span>Shop<b>Nest</b></span></a>
    <button class="icon-btn" data-close aria-label="Close menu">${icon("x")}</button></div>
  <div class="mobile-nav-body">
    <a href="${base}shop/" class="mnav-all">${icon("tag")} Shop All Products ${icon("right")}</a>
    <p class="mnav-label">Categories</p>
    ${PARENTS.map((c) => `<a href="${base}${collectionUrl(c)}">${icon(c.icon)} ${esc(c.name)}</a><div class="mnav-subs">${c.subs.map((s) => `<a href="${base}${collectionUrl(s)}">${esc(s.name)}</a>`).join("")}</div>`).join("")}
    <p class="mnav-label">Help</p>
    <a href="${base}buying-guides/">${icon("info")} Buying Guides</a>
    <a href="${base}track-order/">${icon("truck")} Track Your Order</a>
    <a href="${base}pages/shipping-policy/">${icon("package")} Shipping &amp; Delivery</a>
    <a href="${base}pages/returns-policy/">${icon("refresh")} Returns &amp; Replacement</a>
    <a href="${base}pages/faq/">${icon("info")} FAQs</a>
    <a href="${base}contact/">${icon("headset")} Contact Us</a>
    <a href="${waLink("Hi ShopNest! I need help with an order.")}" class="btn btn-wa btn-block" target="_blank" rel="noopener">${icon("whatsapp")} Chat on WhatsApp</a>
  </div>
</aside>`;
}

function cartDrawer(base) {
  return `<aside class="cart-drawer" id="cart-drawer" aria-label="Shopping cart" aria-hidden="true">
  <div class="drawer-head"><h2>Your Cart <span data-cart-count-text></span></h2><button class="icon-btn" data-close aria-label="Close cart">${icon("x")}</button></div>
  <div class="ship-progress" id="drawer-ship"></div>
  <div class="drawer-items" id="drawer-items"></div>
  <div class="drawer-foot" id="drawer-foot">
    <div class="drawer-total"><span>Subtotal</span><b id="drawer-subtotal">Rs 0</b></div>
    <p class="drawer-note">${icon("cash")} Pay cash on delivery · Arrives in ${C.deliveryTime}</p>
    <a href="${base}cart/" class="btn btn-cta btn-lg btn-block" id="drawer-checkout">${icon("lock")} Checkout</a>
    <button class="btn btn-ghost btn-block" data-close>Continue shopping</button>
  </div>
</aside>`;
}

function trustStrip() {
  const items = [
    ["cash", "Cash on Delivery or Online", `Pay at your door, or pay online &amp; save ${rs(C.onlineSaving)}`],
    ["truck", "Fast Nationwide Delivery", `${C.deliveryTime} · FREE over ${rs(C.freeShippingOver)}`],
    ["refresh", `${C.replacementDays}-Day Replacement`, "Damaged or faulty? We replace it free"],
    ["whatsapp", "Real Human Support", "Chat with us on WhatsApp"],
  ];
  return `<section class="trust"><div class="container trust-row">${items
    .map(([ic, t, s]) => `<div class="trust-item">${icon(ic)}<div><b>${t}</b><span>${s}</span></div></div>`)
    .join("")}</div></section>`;
}

function footer(base) {
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a href="${base || "./"}" class="brand brand--light"><img src="${base}images/logo.png" alt="" width="40" height="40"><span>Shop<b>Nest</b></span></a>
      <p>Hand-picked gadgets and everyday essentials at honest prices. Pay cash on delivery anywhere in Pakistan, get a free replacement if anything arrives damaged, and talk to a real person on WhatsApp.</p>
      <div class="socials">
        <a href="${C.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon("instagram")}</a>
        <a href="${C.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icon("facebook")}</a>
        <a href="${C.social.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${icon("tiktok")}</a>
        <a href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon("whatsapp")}</a>
      </div>
    </div>
    <div class="footer-col"><h3>Shop</h3><ul>
      <li><a href="${base}shop/">All Products</a></li>
      ${PARENTS.map((c) => `<li><a href="${base}${collectionUrl(c)}">${esc(c.name)}</a></li>`).join("")}
    </ul></div>
    <div class="footer-col"><h3>Help</h3><ul>
      <li><a href="${base}buying-guides/">Buying Guides</a></li>
      <li><a href="${base}track-order/">Track Your Order</a></li>
      <li><a href="${base}pages/shipping-policy/">Shipping &amp; Delivery</a></li>
      <li><a href="${base}pages/returns-policy/">Returns &amp; Replacement</a></li>
      <li><a href="${base}pages/faq/">FAQs</a></li>
      <li><a href="${base}contact/">Contact Us</a></li>
      <li><a href="${base}pages/about-us/">About ShopNest</a></li>
    </ul></div>
    <div class="footer-col"><h3>Contact</h3><ul class="footer-contact">
      <li><a href="${waLink()}" target="_blank" rel="noopener">${icon("whatsapp")} ${C.phoneDisplay}</a></li>
      <li><a href="tel:+${C.whatsapp}">${icon("phone")} +92 ${C.phoneDisplay.slice(1)}</a></li>
      <li><a href="mailto:${C.email}">${icon("mail")} ${C.email}</a></li>
    </ul></div>
  </div>
  <div class="footer-bottom"><div class="container footer-bottom-row">
    <p>© ${year} ${C.name}. All rights reserved. · <a href="${base}pages/privacy-policy/">Privacy Policy</a> · <a href="${base}pages/terms-of-service/">Terms of Service</a></p>
    <div class="pay-badges"><span>${icon("cash")} Cash on Delivery</span><span>JazzCash</span><span>Bank Transfer</span></div>
  </div></div>
</footer>`;
}

function waFloat() {
  return `<a href="${waLink("Hi ShopNest! I have a question.")}" class="wa-float" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">${icon("whatsapp")}<span>Questions? Chat with us</span></a>`;
}

function commerceData() {
  return `data-ship="${C.shippingFee}" data-free="${C.freeShippingOver}" data-cod="${C.codFee}" data-online-off="${C.onlineDiscount}" data-wa="${C.whatsapp}"`;
}

/* Full page wrapper */
function page(opts) {
  const { base = "", body, active = "", scripts = [], bodyClass = "", noDrawer = false } = opts;
  return `${head(opts)}
<body class="${bodyClass}" ${commerceData()}>
<a class="skip-link" href="#main">Skip to content</a>
${header(base, active)}
<main id="main">
${body}
</main>
${footer(base)}
${noDrawer ? "" : cartDrawer(base)}
${waFloat()}
<script src="${base}js/app.js${ver("js/app.js")}" defer></script>
${scripts.map((s) => (s.startsWith("<") ? s : `<script src="${base}js/${s}${ver("js/" + s)}" defer></script>`)).join("\n")}
</body>
</html>
`;
}

function breadcrumb(base, items) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><a href="${base || "./"}">Home</a>${items
    .map((it) => `${icon("right")}${it.href ? `<a href="${base}${it.href}">${esc(it.label)}</a>` : `<span aria-current="page">${esc(it.label)}</span>`}`)
    .join("")}</nav>`;
}

module.exports = {
  C, PARENTS, SUBS, ver, thumb, parentBySlug, collectionUrl, esc, rs, discountPct, encPath, catBySlug, productUrl, waLink, absUrl, COLOR_HEX,
  icon, stars, priceBlock, cartPayload, productCard, page, breadcrumb, trustStrip,
};
