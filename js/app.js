/* ============================================================
   ShopNest — app.js (loaded on every page)
   Cart store · cart drawer · mobile menu · live search · toasts
   ============================================================ */
(function () {
  "use strict";
  const BASE = document.documentElement.dataset.base || "";
  const body = document.body;
  const RULES = {
    ship: +body.dataset.ship || 199,
    free: +body.dataset.free || 2499,
    cod: +body.dataset.cod || 99,
    onlineOff: +(body.dataset.onlineOff || 0), // extra online discount on top of the waived COD fee
    wa: body.dataset.wa || "923284430589",
  };

  /* ---------- utils ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const money = (n) => "Rs " + Math.round(Number(n) || 0).toLocaleString("en-US");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const imgSrc = (img) => {
    if (!img) return BASE + "images/logo.png";
    if (/^(https?:|\/|data:)/.test(img)) return img;
    return BASE + img.split("/").map(encodeURIComponent).join("/");
  };
  const ICON = {
    trash: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    minus: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    plus: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14M12 5v14"/></svg>',
    check: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    bag: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    info: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
  };

  // Meta Pixel events (no-op if the Pixel is blocked or not installed)
  const track = (event, data = {}, opts = {}) => {
    try { if (typeof window.fbq === "function") window.fbq("track", event, data, opts); } catch (e) { /* ignore */ }
  };
  let catalog = null, catalogPromise = null; // products.json, loaded lazily

  /* ---------- storage-safe helpers ---------- */
  function readLS(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch (e) { return fallback; }
  }
  function writeLS(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage blocked */ }
  }

  /* ---------- cart store ---------- */
  // Item shape: { key, id, name, price, img, cat, slug, color, colors[], qty, lp? }
  const lineKey = (id, color) => id + "|" + (color || "");
  const Cart = {
    _key: "sn_cart",
    get() {
      const list = readLS(this._key, []);
      if (!Array.isArray(list)) return [];
      return list
        .filter((i) => i && i.id && i.qty > 0)
        .map((i) => {
          i.price = Number(i.price) || 0;
          if (!i.key) i.key = lineKey(i.id, i.color);
          // Legacy summer-deal ids (sp-summer-deal-1800) → base id with location pricing
          if (/^sp-summer-deal/.test(i.id) && !i.lp) i.lp = { lahore: 1700, other: 1800 };
          return i;
        });
    },
    save(list) {
      writeLS(this._key, list);
      document.dispatchEvent(new CustomEvent("cart:change"));
    },
    add(item, qty = 1) {
      const list = this.get();
      const key = lineKey(item.id, item.color);
      const existing = list.find((i) => i.key === key);
      if (existing) existing.qty = Math.min(99, existing.qty + qty);
      else list.push({ ...item, key, qty });
      list.forEach((i) => { if (i.color) i.colors = Array(i.qty).fill(i.color); });
      this.save(list);
      track("AddToCart", { content_ids: [item.id], content_name: item.name, content_type: "product", contents: [{ id: item.id, quantity: qty }], value: item.price * qty, currency: "PKR" });
    },
    setQty(key, qty) {
      let list = this.get();
      const it = list.find((i) => i.key === key);
      if (!it) return;
      it.qty = Math.max(0, Math.min(99, qty));
      if (it.color) it.colors = Array(it.qty).fill(it.color);
      list = list.filter((i) => i.qty > 0);
      this.save(list);
    },
    setColor(key, color) {
      let list = this.get();
      const it = list.find((i) => i.key === key);
      if (!it) return;
      const newKey = lineKey(it.id, color);
      const dup = list.find((i) => i.key === newKey && i !== it);
      if (dup) { dup.qty += it.qty; list = list.filter((i) => i !== it); dup.colors = Array(dup.qty).fill(color); }
      else {
        it.color = color; it.key = newKey; it.colors = Array(it.qty).fill(color);
        const p = catalog && catalog.find((x) => x.id === it.id);
        const c = p && (p.colors || []).find((x) => x.name === color);
        if (c && c.img !== undefined && p.images[c.img]) it.img = p.images[c.img];
      }
      this.save(list);
    },
    remove(key) { this.save(this.get().filter((i) => i.key !== key)); },
    clear() { this.save([]); },
    count() { return this.get().reduce((s, i) => s + i.qty, 0); },
    subtotal() { return this.get().reduce((s, i) => s + i.price * i.qty, 0); },
  };

  /* ---------- toast ---------- */
  function toast(msg, type = "ok") {
    let wrap = $(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; wrap.setAttribute("role", "status"); wrap.setAttribute("aria-live", "polite"); body.appendChild(wrap); }
    const t = document.createElement("div");
    t.className = "toast" + (type === "error" ? " is-error" : "");
    t.innerHTML = (type === "error" ? ICON.info : ICON.check) + "<span>" + esc(msg) + "</span>";
    wrap.appendChild(t);
    setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 2600);
  }

  /* ---------- drawers ---------- */
  const backdrop = $("#backdrop");
  let openDrawerEl = null;
  function openDrawer(el) {
    if (!el) return;
    closeDrawer();
    openDrawerEl = el;
    if (backdrop) { backdrop.hidden = false; requestAnimationFrame(() => backdrop.classList.add("is-open")); }
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    body.classList.add("no-scroll");
    const focusable = el.querySelector("[data-close]");
    focusable && focusable.focus({ preventScroll: true });
    if (el.id === "mobile-nav") $("#menu-open")?.setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    if (!openDrawerEl) return;
    openDrawerEl.classList.remove("is-open");
    openDrawerEl.setAttribute("aria-hidden", "true");
    if (openDrawerEl.id === "mobile-nav") $("#menu-open")?.setAttribute("aria-expanded", "false");
    openDrawerEl = null;
    body.classList.remove("no-scroll");
    if (backdrop) { backdrop.classList.remove("is-open"); setTimeout(() => { if (!openDrawerEl) backdrop.hidden = true; }, 250); }
  }
  backdrop?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });
  $$("[data-close]").forEach((b) => b.addEventListener("click", closeDrawer));
  $("#menu-open")?.addEventListener("click", () => openDrawer($("#mobile-nav")));

  const cartDrawer = $("#cart-drawer");
  function openCart() {
    if (!cartDrawer) {
      if (/\/cart\/?(index\.html)?$/.test(location.pathname)) { toast("Added to your order"); return; }
      window.location.href = BASE + "cart/"; return;
    }
    renderDrawer();
    if (!catalog) loadCatalog().then(renderDrawer); // suggestions need the product list
    openDrawer(cartDrawer);
  }
  $("#cart-open")?.addEventListener("click", openCart);

  /* ---------- free-shipping progress ---------- */
  function shipProgressHTML(subtotal) {
    if (subtotal <= 0) return "";
    if (subtotal >= RULES.free) return `🎉 You've unlocked <b>FREE delivery!</b><div class="ship-bar"><i style="width:100%"></i></div>`;
    const pct = Math.min(100, (subtotal / RULES.free) * 100);
    return `Add <b>${money(RULES.free - subtotal)}</b> more for <b>FREE delivery</b><div class="ship-bar"><i style="width:${pct}%"></i></div>`;
  }
  function paintShip(el, subtotal) {
    if (!el) return;
    el.innerHTML = shipProgressHTML(subtotal);
    el.classList.toggle("is-free", subtotal >= RULES.free);
  }

  /* ---------- cart line markup (shared with checkout) ---------- */
  function lineHTML(i, { colorOptions } = {}) {
    const opts = colorOptions && colorOptions.length > 1
      ? `<select data-color aria-label="Colour">${colorOptions.map((c) => `<option ${c === i.color ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>`
      : i.color ? (i.color.includes(": ") ? `<span class="line-meta line-meta-set">${i.color.split(", ").map((c) => esc(c)).join("<br>")}</span>` : `<span class="line-meta">Colour: ${esc(i.color)}</span>`) : "";
    const href = i.slug ? `${BASE}products/${i.slug}/` : null;
    return `<div class="line" data-key="${esc(i.key)}">
      ${href ? `<a href="${href}">` : ""}<img class="line-img" src="${esc(thumbSrc(i.img))}" data-full="${esc(imgSrc(i.img))}" alt="" loading="lazy">${href ? "</a>" : ""}
      <div class="line-info">
        <div class="line-top"><span class="line-name">${esc(i.name)}</span><button class="line-remove" data-remove aria-label="Remove ${esc(i.name)}">${ICON.trash}</button></div>
        ${opts}
        <div class="line-bottom">
          <div class="qty"><button data-dec aria-label="Decrease quantity">${ICON.minus}</button><span>${i.qty}</span><button data-inc aria-label="Increase quantity">${ICON.plus}</button></div>
          <span class="line-price">${money(i.price * i.qty)}</span>
        </div>
      </div>
    </div>`;
  }
  function bindLines(container) {
    container.addEventListener("click", (e) => {
      const line = e.target.closest(".line");
      if (!line) return;
      const key = line.dataset.key;
      const item = Cart.get().find((i) => i.key === key);
      if (!item) return;
      if (e.target.closest("[data-inc]")) Cart.setQty(key, item.qty + 1);
      else if (e.target.closest("[data-dec]")) Cart.setQty(key, item.qty - 1);
      else if (e.target.closest("[data-remove]")) Cart.remove(key);
    });
    container.addEventListener("change", (e) => {
      const sel = e.target.closest("[data-color]");
      if (!sel) return;
      Cart.setColor(sel.closest(".line").dataset.key, sel.value);
    });
  }

  function renderDrawer() {
    if (!cartDrawer) return;
    const items = Cart.get();
    const box = $("#drawer-items");
    const foot = $("#drawer-foot");
    const sub = Cart.subtotal();
    paintShip($("#drawer-ship"), sub);
    $$("[data-cart-count-text]").forEach((el) => (el.textContent = items.length ? `(${Cart.count()})` : ""));
    if (!items.length) {
      box.innerHTML = `<div class="drawer-empty">${ICON.bag}<p><b>Your cart is empty</b></p><p>Find something you'll love.</p><a class="btn btn-primary" href="${BASE}shop/">Shop products</a></div>`;
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    box.innerHTML = items.map((i) => lineHTML(i)).join("") + upsellHTML(3);
    if (!catalog) loadCatalog().then(() => { if (cartDrawer.classList.contains("is-open")) renderDrawer(); });
    $("#drawer-subtotal").textContent = money(sub);
    const go = $("#drawer-checkout");
    if (go) go.lastChild.textContent = " Checkout · " + money(sub);
  }
  if (cartDrawer) bindLines($("#drawer-items"));

  function refreshBadges() {
    const n = Cart.count();
    $$("[data-cart-count]").forEach((el) => { el.textContent = n > 99 ? "99+" : n; el.hidden = n === 0; });
  }
  document.addEventListener("cart:change", () => { refreshBadges(); if (cartDrawer?.classList.contains("is-open")) renderDrawer(); });
  window.addEventListener("storage", (e) => { if (e.key === "sn_cart") { refreshBadges(); renderDrawer(); } });
  refreshBadges();

  function bump() {
    const b = $("#cart-open");
    if (!b) return;
    b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
  }

  /* ---------- thumbnails (fallback to original if missing) ---------- */
  const thumbSrc = (img) => (/^(https?:|\/|data:)/.test(img || "") ? img : imgSrc("images/thumbs/" + String(img).replace(/^images\//, "").replace(/\.(jpe?g|png)$/i, ".webp")));
  document.addEventListener("error", (e) => {
    const el = e.target;
    if (el.tagName === "IMG" && el.dataset.full && el.src.indexOf("/thumbs/") > -1) el.src = el.dataset.full;
  }, true);

  /* Same palette as src/lib.js COLOR_HEX (used for swatches rendered in the browser) */
  const COLOR_HEX = { "Black": "#1f1f24", "White": "#ffffff", "Grey": "#a3a7b0", "Red": "#d43c3c", "Crimson": "#e2483a", "Pink": "#f5a9c0", "Hot Pink": "#ec4899", "Light Pink": "#fbcfe0", "Peach": "#f8c4a2", "Yellow": "#f5d34f", "Cream": "#efe4cc", "Light Brown": "#c9a27a", "Brown": "#7b4a2b", "Gold": "#d4a63c", "Mint Green": "#9fe0c9", "Green": "#2f8f5b", "Dark Green": "#1f5a3d", "Light Green": "#a8ecc8", "Sky Blue": "#7cc4f0", "Light Blue": "#a9d7f3", "Blue": "#5b9cf2", "Dark Blue": "#1f3a8a", "Purple": "#a283db" };

  /* ---------- quick options popup (choose colour without leaving the page) ---------- */
  let qv = null, qvLastFocus = null;
  function closeOptions() {
    if (!qv) return;
    qv.classList.remove("is-open");
    const el = qv; qv = null;
    setTimeout(() => el.remove(), 200);
    body.classList.remove("no-scroll");
    qvLastFocus && qvLastFocus.focus && qvLastFocus.focus({ preventScroll: true });
  }
  function openOptions(data, mode) {
    closeOptions();
    qvLastFocus = document.activeElement;
    const colors = data.colors || [];
    const images = data.images && data.images.length ? data.images : [data.img];
    const pct = data.oldPrice > data.price ? Math.round((1 - data.price / data.oldPrice) * 100) : 0;
    const wrap = document.createElement("div");
    wrap.className = "qv-backdrop";
    wrap.innerHTML = `<div class="qv" role="dialog" aria-modal="true" aria-labelledby="qv-title">
      <button class="icon-btn qv-close" aria-label="Close"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <div class="qv-media"><img id="qv-img" src="${esc(imgSrc(images[colors[0] && colors[0].img !== undefined ? colors[0].img : 0] || images[0]))}" alt=""></div>
      <div class="qv-body">
        <h2 id="qv-title">${esc(data.name)}</h2>
        <div class="price"><span class="price-now">${money(data.price)}</span>${pct ? `<s class="price-was">${money(data.oldPrice)}</s><span class="price-save">${pct}% OFF</span>` : ""}</div>
        ${data.lp ? `<p class="opt-note">Lahore ${money(data.lp.lahore)} · Outside Lahore ${money(data.lp.other)} — set by your city at checkout.</p>` : ""}
        ${colors.length ? `<fieldset class="opt"><legend>${esc(data.colorLabel || "Colour")}: <b id="qv-color">${esc(colors[0].name)}</b></legend><div class="swatches">${colors.map((c, i) => `<label class="swatch" title="${esc(c.name)}"><input type="radio" name="qv-color" value="${esc(c.name)}" ${i ? "" : "checked"} ${c.img !== undefined ? `data-img="${c.img}"` : ""}><span style="--sw:${c.hex || COLOR_HEX[c.name] || "#ccc"}"></span><em>${esc(c.name)}</em></label>`).join("")}</div></fieldset>` : ""}
        <div class="qv-row"><span class="qv-label">Quantity</span><div class="qty"><button type="button" data-q="-1" aria-label="Decrease">${ICON.minus}</button><span id="qv-qty">1</span><button type="button" data-q="1" aria-label="Increase">${ICON.plus}</button></div></div>
        <button class="btn btn-cta btn-lg btn-block" data-act="buy">Buy Now</button>
        <button class="btn btn-outline btn-lg btn-block" data-act="add">${ICON.bag} Add to Cart</button>
        <a class="qv-more" href="${BASE}products/${esc(data.slug)}/">View full product details →</a>
      </div>
    </div>`;
    body.appendChild(wrap);
    body.classList.add("no-scroll");
    qv = wrap;
    requestAnimationFrame(() => wrap.classList.add("is-open"));
    let qty = 1;
    const primary = wrap.querySelector(`[data-act="${mode === "buy" ? "buy" : "add"}"]`);
    primary && primary.focus({ preventScroll: true });
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap || e.target.closest(".qv-close")) return closeOptions();
      const q = e.target.closest("[data-q]");
      if (q) { qty = Math.max(1, Math.min(20, qty + +q.dataset.q)); wrap.querySelector("#qv-qty").textContent = qty; return; }
      const act = e.target.closest("[data-act]");
      if (!act) return;
      const color = wrap.querySelector('input[name="qv-color"]:checked')?.value;
      const item = { id: data.id, name: data.name, price: data.price, img: data.img, cat: data.cat, slug: data.slug };
      if (data.lp) item.lp = data.lp;
      if (color) item.color = color;
      const sw = wrap.querySelector('input[name="qv-color"]:checked');
      if (sw && sw.dataset.img !== undefined && images[+sw.dataset.img]) item.img = images[+sw.dataset.img];
      Cart.add(item, qty);
      bump();
      if (act.dataset.act === "buy") { location.href = BASE + "cart/"; return; }
      closeOptions();
      openCart();
    });
    wrap.addEventListener("change", (e) => {
      if (e.target.name !== "qv-color") return;
      wrap.querySelector("#qv-color").textContent = e.target.value;
      if (e.target.dataset.img !== undefined) wrap.querySelector("#qv-img").src = imgSrc(images[+e.target.dataset.img] || images[0]);
    });
    wrap.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.stopPropagation(); closeOptions(); }
      if (e.key === "Tab") { // simple focus trap
        const f = $$("button, a, input:checked", wrap.querySelector(".qv"));
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  /* ---------- card buttons: Add / Buy Now ---------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".js-add, .js-buy");
    if (!btn) return;
    e.preventDefault();
    let data;
    try { data = JSON.parse(btn.dataset.product); } catch (err) { return; }
    const isBuy = btn.classList.contains("js-buy");
    if (btn.hasAttribute("data-choose")) { openOptions(data, isBuy ? "buy" : "add"); return; }
    const { images, colors, colorLabel, tagline, oldPrice, ...item } = data;
    Cart.add(item, 1);
    bump();
    if (isBuy) { location.href = BASE + "cart/"; return; }
    const orig = btn.innerHTML;
    btn.innerHTML = ICON.check;
    btn.disabled = true;
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1400);
    openCart();
  });

  /* ---------- free-delivery upsell (drawer + checkout) ---------- */
  // Products that go well together (shown first when one of them is in the cart)
  const PAIRS = {
    "sp-airpro-nobox": ["sp-white-cable", "sp-orange-cable", "sp-heart-keychain"],
    "sp-airpro-box": ["sp-white-cable", "sp-orange-cable", "sp-heart-keychain"],
    "sp-w161-earbuds": ["sp-white-cable", "sp-orange-cable"],
    "sp-ulex-ux1": ["sp-white-cable", "sp-orange-cable"],
    "sp-fd1-earbuds": ["sp-white-cable", "sp-orange-cable"],
    "sp-gb03-earphones": ["sp-white-cable", "sp-orange-cable"],
    "sp-gp07-powerbank": ["sp-white-cable", "sp-orange-cable", "sp-oknew-bulb"],
    "sp-orange-cable": ["sp-white-cable", "sp-airpro-nobox"],
    "sp-white-cable": ["sp-orange-cable", "sp-airpro-nobox"],
    "sp-v380-wifi": ["sp-oknew-bulb", "sp-white-cable"],
    "sp-bk530-camera": ["sp-white-cable", "sp-oknew-bulb"],
    "sp-oknew-bulb": ["sp-wego-bulb", "sp-orange-cable"],
    "sp-wego-bulb": ["sp-oknew-bulb", "sp-orange-cable"],
    "sp-xc901-comb": ["sp-vented-brush", "sp-cushion-brush", "sp-teardrop-brush", "sp-velvet-potato-soap"],
    "sp-vented-brush": ["sp-teardrop-brush", "sp-round-brush", "sp-cushion-brush"],
    "sp-cushion-brush": ["sp-vented-brush", "sp-round-brush", "sp-teardrop-brush"],
    "sp-round-brush": ["sp-vented-brush", "sp-cushion-brush", "sp-teardrop-brush"],
    "sp-teardrop-brush": ["sp-vented-brush", "sp-round-brush", "sp-cushion-brush"],
    "sp-lm130-gun": ["sp-paper-soap", "sp-teardrop-brush"],
    "sp-jy760-massager": ["sp-paper-soap", "sp-teardrop-brush"],
    "sp-paper-soap": ["sp-velvet-potato-soap", "sp-teardrop-brush", "sp-vented-brush"],
    "sp-velvet-potato-soap": ["sp-paper-soap", "sp-vented-brush", "sp-teardrop-brush"],
    "sp-brush-family-set": ["sp-velvet-potato-soap", "sp-paper-soap"],
    "sp-spoon": ["sp-soap-brush", "sp-bbq-lighter"],
    "sp-soap-brush": ["sp-spoon", "sp-bbq-lighter"],
    "sp-combo-brush": ["sp-bbq-lighter"],
    "sp-bbq-lighter": ["sp-soap-brush", "sp-glue-gun"],
    "sp-glue-gun": ["sp-bbq-lighter", "sp-soap-brush"],
    "sp-azan-counter": ["sp-pearl-tasbih", "sp-tasbih-compass", "sp-flower-keychain"],
    "sp-tasbih-compass": ["sp-pearl-tasbih", "sp-azan-counter"],
    "sp-pearl-tasbih": ["sp-tasbih-compass", "sp-flower-keychain", "sp-heart-keychain"],
    "sp-heart-keychain": ["sp-flower-keychain", "sp-pearl-tasbih"],
    "sp-flower-keychain": ["sp-heart-keychain", "sp-pearl-tasbih"],
    "sp-toy-cars": ["sp-fidget-spinner"],
    "sp-fidget-spinner": ["sp-toy-cars", "sp-heart-keychain"],
  };
  // Categories that make sense together
  const RELATED_CAT = {
    "earbuds-audio": ["mobile-accessories", "gifts-toys"],
    "mobile-accessories": ["earbuds-audio", "security-lighting"],
    "security-lighting": ["mobile-accessories"],
    "fans-cooling": ["mobile-accessories"],
    "kitchen-home": ["health-personal-care"],
    "hair-care": ["health-personal-care"],
    "health-personal-care": ["hair-care"],
    "islamic-essentials": ["gifts-toys"],
    "gifts-toys": ["islamic-essentials"],
  };

  // Margin rating used to rank add-on suggestions: 3 = high, 2 = good / unknown, 1 = low.
  // Only the rating lives here — supplier costs never go into public site code.
  const MARGIN = {
    "sp-airpro-nobox": 3, "sp-w161-earbuds": 3, "sp-fd1-earbuds": 3, "sp-ulex-ux1": 3, "sp-gp07-powerbank": 3, "sp-bk530-camera": 3,
    "sp-xc901-comb": 3, "sp-lm130-gun": 3, "sp-oknew-bulb": 3, "sp-orange-cable": 3, "sp-white-cable": 3, "sp-teardrop-brush": 3,
    "sp-vented-brush": 3, "sp-round-brush": 3, "sp-toy-cars": 3, "sp-heart-keychain": 3, "sp-flower-keychain": 3, "sp-tasbih-compass": 3,
    "sp-bbq-lighter": 3, "sp-glue-gun": 3,
    "sp-cushion-brush": 2, "sp-paper-soap": 2, "sp-jy760-massager": 2, "sp-azan-counter": 2,
    "sp-v380-wifi": 1,
  };
  const marginOf = (p) => MARGIN[p.id] || 2;

  function upsellHTML(visible = 3) {
    const sub = Cart.subtotal();
    if (!catalog || sub <= 0 || sub >= RULES.free) return "";
    const gap = RULES.free - sub;
    const items = Cart.get();
    const inCart = new Set(items.map((i) => i.id));
    const month = new Date().getMonth();
    const inSeason = (p) => p.category !== "fans-cooling" || (month >= 2 && month <= 8);
    const byId = (id) => catalog.find((p) => p.id === id);
    const cartProducts = items.map((i) => byId(i.id)).filter(Boolean);
    const paired = new Set(cartProducts.flatMap((p) => PAIRS[p.id] || []));
    const sameCat = new Set(cartProducts.map((p) => p.category));
    const relCat = new Set(cartProducts.flatMap((p) => RELATED_CAT[p.category] || []));
    // keep suggestions sensible for the cart size: nothing far above what's needed for free delivery
    const maxPrice = Math.max(gap + 700, 700);
    const pool = catalog.filter((p) => !p.soldOut && !p.parts && !inCart.has(p.id) && inSeason(p) && p.price <= maxPrice);
    const relevance = (p) => (paired.has(p.id) ? 3 : sameCat.has(p.category) ? 2 : relCat.has(p.category) ? 1 : 0);
    const pairRank = (p) => { // position in the pairing list (first = best match)
      let best = 99;
      cartProducts.forEach((c) => { const i = (PAIRS[c.id] || []).indexOf(p.id); if (i >= 0 && i < best) best = i; });
      return best;
    };
    const crosses = (p) => p.price >= gap;
    const scored = pool.map((p) => ({ p, r: relevance(p), x: crosses(p), m: marginOf(p) }));
    // Related items: closeness to the cart + margin, then "unlocks free delivery", best pairing, cheapest crossing item
    const related = scored.filter((s) => s.r > 0).sort((a, b) =>
      (b.r * 2 + b.m) - (a.r * 2 + a.m) ||
      b.x - a.x ||
      pairRank(a.p) - pairRank(b.p) ||
      (a.x ? a.p.price - b.p.price : 0) ||
      b.p.ratingCount - a.p.ratingCount);
    // Other items: highest margin first. Close to free delivery -> cheapest item that unlocks it;
    // far from it -> an affordable add-on (Rs 900 or less) rather than a big-ticket jump. Then popular.
    const affordable = (p) => p.price <= 900;
    const others = scored.filter((s) => s.r === 0).sort((a, b) =>
      b.m - a.m ||
      (gap <= 1000 ? (b.x - a.x || (a.x ? a.p.price - b.p.price : 0)) : (affordable(b.p) - affordable(a.p))) ||
      b.p.ratingCount - a.p.ratingCount);
    // First row: the two best related items + the best high-margin pick from the rest of the store
    const first = [...related.slice(0, 2)];
    const bestOther = others.find((s) => s.m === 3);
    if (bestOther) first.push(bestOther);
    const rest = [...related, ...others].filter((s) => !first.includes(s));
    const picks = [...first, ...rest].slice(0, 8);
    if (!picks.length) return "";
    const title = gap <= 900 ? `Add one of these and get <b>FREE delivery</b>` : `Add <b>${money(gap)}</b> more for <b>FREE delivery</b>`;
    const more = picks.length - visible;
    return `<div class="upsell"><p class="upsell-title">${title}</p>${picks.map(({ p, r, x }, idx) => {
      const choose = p.colors && p.colors.length > 1;
      const payload = { id: p.id, name: p.name, price: p.price, img: p.images[0], cat: p.category, slug: p.slug };
      if (p.locationPricing) payload.lp = p.locationPricing;
      if (choose) Object.assign(payload, { oldPrice: p.oldPrice || 0, images: p.images, colors: p.colors, colorLabel: p.colorLabel || "Colour" });
      const tags = (r >= 2 ? `<i class="upsell-tag is-match">Goes with your order</i>` : "") + (x ? `<i class="upsell-tag is-free">Unlocks FREE delivery</i>` : "");
      return `<div class="upsell-item${idx >= visible ? " is-extra" : ""}"><a href="${BASE}products/${esc(p.slug)}/"><img src="${esc(thumbSrc(p.images[0]))}" data-full="${esc(imgSrc(p.images[0]))}" alt="" loading="lazy"></a>
        <div><a class="upsell-name" href="${BASE}products/${esc(p.slug)}/">${esc(p.name)}</a><span class="upsell-meta"><b>${money(p.price)}</b>${tags}</span></div>
        <button class="btn btn-outline js-add" data-product="${esc(JSON.stringify(payload))}"${choose ? " data-choose" : ""}>+ Add</button></div>`;
    }).join("")}${more > 0 ? `<button type="button" class="upsell-more" aria-expanded="false">See ${more} more option${more > 1 ? "s" : ""}</button>` : ""}</div>`;
  }
  // "See more" in the suggestions (drawer + checkout re-render, so delegate)
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".upsell-more");
    if (!b) return;
    const box = b.closest(".upsell");
    const open = box.classList.toggle("is-open");
    b.setAttribute("aria-expanded", open ? "true" : "false");
    if (!b.dataset.label) b.dataset.label = b.textContent;
    b.textContent = open ? "Show fewer" : b.dataset.label;
  });

  /* ---------- product rails (desktop arrows) ---------- */
  $$(".rail-wrap").forEach((wrap) => {
    const rail = $(".rail", wrap), prev = $(".rail-btn.prev", wrap), next = $(".rail-btn.next", wrap);
    if (!rail || !prev || !next) return;
    const sync = () => {
      prev.disabled = rail.scrollLeft < 8;
      next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8;
    };
    prev.addEventListener("click", () => rail.scrollBy({ left: -rail.clientWidth * 0.9, behavior: "smooth" }));
    next.addEventListener("click", () => rail.scrollBy({ left: rail.clientWidth * 0.9, behavior: "smooth" }));
    rail.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  });

  /* ---------- announcement rotation (mobile) ---------- */
  const msgs = $$(".topbar-msg");
  if (msgs.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let idx = 0;
    setInterval(() => {
      if (window.innerWidth >= 1100) return;
      msgs[idx].classList.remove("is-active");
      idx = (idx + 1) % msgs.length;
      msgs[idx].classList.add("is-active");
    }, 3800);
  }

  /* ---------- live search ---------- */
  const sInput = $("#search-input");
  const sBox = $("#search-results");
  let focusIdx = -1;
  // Items added before a price change keep the old price in localStorage: refresh them from products.json
  function syncCartPrices(list) {
    const items = Cart.get();
    let changed = false;
    items.forEach((i) => {
      const p = list.find((x) => x.id === i.id);
      if (!p || i.lp || p.locationPricing) return; // city-priced deals are set at checkout
      if (i.price !== p.price) { i.price = p.price; changed = true; }
    });
    if (changed) Cart.save(items);
  }
  function loadCatalog() {
    if (catalog) return Promise.resolve(catalog);
    if (!catalogPromise) {
      catalogPromise = fetch(BASE + "products.json")
        .then((r) => r.json())
        .then((list) => (catalog = list.map((p) => ({ ...p, _s: [p.name, p.tagline, p.category, ...(p.colors || []).map((c) => c.name)].join(" ").toLowerCase() }))))
        .then((list) => { syncCartPrices(list); return list; })
        .catch(() => (catalog = []));
    }
    return catalogPromise;
  }
  function searchCatalog(q) {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    return catalog.filter((p) => tokens.every((t) => p._s.includes(t)));
  }
  function renderSearch() {
    const q = sInput.value.trim();
    focusIdx = -1;
    if (q.length < 2 || !catalog) { sBox.hidden = true; return; }
    const hits = searchCatalog(q);
    sBox.innerHTML = hits.length
      ? hits.slice(0, 6).map((p) => `<a href="${BASE}products/${p.slug}/"><img src="${esc(thumbSrc(p.images[0]))}" data-full="${esc(imgSrc(p.images[0]))}" alt="" loading="lazy"><span>${esc(p.name)}</span><b>${money(p.price)}</b></a>`).join("") +
        `<a class="search-all" href="${BASE}shop/?q=${encodeURIComponent(q)}">See all ${hits.length} result${hits.length > 1 ? "s" : ""} →</a>`
      : `<div class="search-none">No products match “${esc(q)}”. Try “earbuds”, “fan” or “tasbih”.</div>`;
    sBox.hidden = false;
  }
  if (sInput && sBox) {
    const params = new URLSearchParams(location.search);
    if (params.get("q")) sInput.value = params.get("q");
    sInput.addEventListener("focus", loadCatalog, { once: true });
    sInput.addEventListener("input", () => loadCatalog().then(renderSearch));
    sInput.addEventListener("keydown", (e) => {
      const links = $$("a", sBox);
      if (sBox.hidden || !links.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        focusIdx = (focusIdx + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
        links.forEach((l, i) => l.classList.toggle("is-focus", i === focusIdx));
      } else if (e.key === "Enter" && focusIdx >= 0) {
        e.preventDefault();
        location.href = links[focusIdx].href;
      } else if (e.key === "Escape") sBox.hidden = true;
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".search")) sBox.hidden = true; });
    sInput.closest("form").addEventListener("submit", (e) => { if (!sInput.value.trim()) e.preventDefault(); else track("Search", { search_string: sInput.value.trim() }); });
  }

  /* ---------- compact header on scroll (mobile) ---------- */
  const hdr = $("#site-header");
  if (hdr) {
    // Hide the category bar after a deliberate scroll down, show it after a deliberate scroll up.
    // A distance threshold (not every tiny scroll event) stops it flickering on small finger movements.
    let anchorY = window.scrollY, ticking = false;
    const update = () => {
      ticking = false;
      const y = Math.max(0, window.scrollY);
      const compact = hdr.classList.contains("is-compact");
      if (y < 120) { if (compact) hdr.classList.remove("is-compact"); anchorY = y; return; }
      if (!compact && y > anchorY + 40) { hdr.classList.add("is-compact"); anchorY = y; }
      else if (compact && y < anchorY - 40) { hdr.classList.remove("is-compact"); anchorY = y; }
      else if (compact ? y > anchorY : y < anchorY) anchorY = y; // keep the anchor at the furthest point in the current direction
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  }
  if ("requestIdleCallback" in window) requestIdleCallback(() => loadCatalog(), { timeout: 4000 });
  else setTimeout(loadCatalog, 2500);

  /* ---------- expose ---------- */
  // WhatsApp taps (product page, floating button, header, help links)
  document.addEventListener("click", (e) => { if (e.target.closest('a[href*="wa.me/"]')) track("Contact", { content_name: "WhatsApp" }); });

  window.SN = { BASE, RULES, Cart, track, money, esc, imgSrc, thumbSrc, toast, openCart, bump, lineHTML, bindLines, paintShip, loadCatalog, upsellHTML, openOptions };
})();
