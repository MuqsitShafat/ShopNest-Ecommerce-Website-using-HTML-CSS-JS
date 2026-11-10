/* ============================================================
   ShopNest — listing.js (shop/ + collections/*)
   Search (?q=), price filter (?price=), sort (?sort=)
   ============================================================ */
(function () {
  "use strict";
  const { BASE, loadCatalog } = window.SN;
  const params = new URLSearchParams(location.search);

  /* Legacy links from the old site → new pages */
  const legacyProduct = params.get("product");
  const legacyCat = params.get("cat");
  if (legacyProduct) {
    loadCatalog().then((list) => {
      const p = list.find((x) => x.id === legacyProduct || x.id.startsWith(legacyProduct));
      if (p) location.replace(BASE + "products/" + p.slug + "/");
    });
  }
  if (legacyCat) {
    const map = { home: "home-kitchen", electronics: "electronics", beauty: "beauty-care", fashion: "gifts-toys", toys: "gifts-toys" };
    if (map[legacyCat]) { location.replace(BASE + "collections/" + map[legacyCat] + "/"); return; }
  }
  if (params.get("search") && !params.get("q")) params.set("q", params.get("search"));

  const grid = document.getElementById("listing-grid");
  if (!grid) return;
  const items = Array.from(grid.querySelectorAll(".grid-item"));
  const countEl = document.getElementById("result-count");
  const empty = document.getElementById("listing-empty");
  const sortSel = document.getElementById("sort-select");
  const priceBtns = Array.from(document.querySelectorAll("[data-price]")).filter((b) => b.tagName === "BUTTON");

  const state = {
    q: (params.get("q") || "").trim(),
    price: params.get("price") || "all",
    sort: params.get("sort") || "featured",
  };

  if (state.q) {
    const t = document.getElementById("listing-title");
    const s = document.getElementById("listing-sub");
    if (t) t.textContent = `Results for “${state.q}”`;
    if (s) s.innerHTML = `<a class="link-more" href="${BASE}shop/">Clear search ×</a>`;
    document.title = `Search: ${state.q} | ShopNest`;
  }
  if ([...sortSel.options].some((o) => o.value === state.sort)) sortSel.value = state.sort;

  function apply() {
    const tokens = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    let lo = 0, hi = Infinity;
    if (state.price !== "all") { const [a, b] = state.price.split("-").map(Number); lo = a || 0; hi = b || Infinity; }
    const visible = items.filter((el) => {
      const price = +el.dataset.price;
      if (price < lo || price > hi) return false;
      return tokens.every((t) => el.dataset.search.includes(t));
    });
    const key = { featured: (a, b) => a.dataset.order - b.dataset.order, popular: (a, b) => b.dataset.count - a.dataset.count, discount: (a, b) => b.dataset.pct - a.dataset.pct, "price-asc": (a, b) => a.dataset.price - b.dataset.price, "price-desc": (a, b) => b.dataset.price - a.dataset.price }[state.sort];
    visible.sort(key);
    items.forEach((el) => (el.hidden = true));
    visible.forEach((el) => { el.hidden = false; grid.appendChild(el); });
    countEl.textContent = visible.length;
    empty.hidden = visible.length > 0;
    priceBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.price === state.price));

    const url = new URL(location.href);
    ["product", "cat", "search"].forEach((k) => url.searchParams.delete(k));
    state.q ? url.searchParams.set("q", state.q) : url.searchParams.delete("q");
    state.price !== "all" ? url.searchParams.set("price", state.price) : url.searchParams.delete("price");
    state.sort !== "featured" ? url.searchParams.set("sort", state.sort) : url.searchParams.delete("sort");
    history.replaceState(null, "", url);
  }

  priceBtns.forEach((b) => b.addEventListener("click", () => { state.price = b.dataset.price; apply(); }));
  sortSel.addEventListener("change", () => { state.sort = sortSel.value; apply(); });
  apply();
})();
