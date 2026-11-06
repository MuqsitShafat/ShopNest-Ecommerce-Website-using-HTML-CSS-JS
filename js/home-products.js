document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  const HOME_LIMIT = null; // number = show only that many extra products, null = show all
  const esc = (t) => String(t).replace(/"/g, "&quot;");
  function card(p) {
    const short = p.id.replace("sp-", "");
    const badges = (p.badges || []).map((b) => `<span class="badge badge--${b.type}" ${b.style ? `style="${b.style}"` : ""}>${b.text}</span>`).join("");
    const colors = p.hasColorOptions && p.colorOptions
      ? `<div style="margin: 0.5rem 0;"><select class="input-field" style="width: auto; padding: 0.4rem; border-radius: 4px; border: 1px solid #ccc; font-family: inherit; font-size: 0.9rem; font-weight: 500;" onchange="this.closest('.product-card').dataset.color = this.value;">${p.colorOptions.map((c) => `<option value="${esc(c.name)}">${c.name}</option>`).join("")}</select></div>`
      : "";
    const soldOut = p.isSoldOut;
    const btnStyle = soldOut ? "background-color: #999; border-color: #999; cursor: not-allowed; color: #fff;" : "";
    return `
      <article class="product-card" id="${p.id}" data-category="${p.category}" data-price="${p.price}" data-rating="${p.rating}" data-sale="${p.sale}" data-new="${p.new}" data-images='${JSON.stringify(p.images).replace(/'/g, "&#39;")}'>
        <div class="product-img-wrap carousel-container">
          <img src="${p.images[0]}" alt="${esc(p.name)}" class="product-img" loading="lazy" />
          <div class="product-badges">${badges}</div>
          <div class="product-actions">
            <button class="product-action-btn" id="wish-${short}" aria-label="Add to wishlist"><span class="material-icons">favorite_border</span></button>
          </div>
        </div>
        <div class="product-info">
          <span class="product-cat">${p.productCat}</span>
          <h3 class="product-name">${p.name}</h3>
          <div class="product-rating"><span class="stars">${"★".repeat(p.rating)}${"☆".repeat(5 - p.rating)}</span><span class="rating-count">(${p.ratingCount})</span></div>
          <div class="product-pricing">
            <span class="price-current">PKR ${p.price.toLocaleString()}</span>
            ${p.oldPrice ? `<span class="price-old">PKR ${p.oldPrice.toLocaleString()}</span>` : ""}
            ${p.priceSave ? `<span class="price-save">${p.priceSave}</span>` : ""}
          </div>
          ${colors}
          <button class="btn btn-coral btn-full btn-buy-now" id="buy-${short}" ${soldOut ? "disabled" : ""} style="${btnStyle}">${soldOut ? "SOLD OUT" : "⚡ Buy Now"}</button>
          <button class="btn btn-primary btn-full shop-add-cart" id="add-${short}" ${soldOut ? "disabled" : ""} style="margin-top: 0.5rem; ${btnStyle}">${soldOut ? "SOLD OUT" : "Add to Cart"}</button>
        </div>
      </article>`;
  }
  fetch("products.json").then((r) => r.json()).then((products) => {
    let extra = products.filter((p) => !document.getElementById(p.id));
    if (HOME_LIMIT) extra = extra.slice(0, HOME_LIMIT);
    if (extra.length) grid.insertAdjacentHTML("beforeend", extra.map(card).join(""));
    const MOVE_TO_END = ["sp-summer-deal","sp-aesthetic-mini-fan","sp-big-display-fan","sp-desktop-fan","sp-neck-fan","sp-handheld-fan","sp-combo-brush","sp-glue-gun"];
    MOVE_TO_END.forEach((id) => { const el = document.getElementById(id); if (el) grid.appendChild(el); });
    if (typeof window.initProductCards === "function") window.initProductCards();
  }).catch((err) => console.error("Could not load products for home page:", err));
});

