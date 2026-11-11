/* ============================================================
   ShopNest — page templates (home, listings, product, cart, track, contact)
   ============================================================ */
const L = require("./lib");
const G = require("./guides-pages");
const { C, ver, thumb, PARENTS, parentBySlug, collectionUrl, esc, rs, discountPct, encPath, catBySlug, productUrl, waLink, absUrl, COLOR_HEX, icon, stars, priceBlock, cartPayload, productCard, page, breadcrumb, trustStrip } = L;

const byId = (products, id) => products.find((p) => p.id === id);
const inParent = (products, parent) => products.filter((p) => catBySlug(p.category).parent.slug === parent.slug);
// Variants of one product (Air Pro with box / without box) should never sit side by side in a list
const family = (p) => (p.id.startsWith("sp-airpro") ? "airpro" : p.id);
function spread(list) {
  const out = [...list];
  for (let i = 1; i < out.length; i++) {
    if (family(out[i]) !== family(out[i - 1])) continue;
    const j = out.findIndex((x, k) => k > i && family(x) !== family(out[i - 1]));
    if (j > 0) out.splice(i, 0, out.splice(j, 1)[0]);
  }
  return out;
}
const bestsellers = (products) =>
  spread([...products].filter((p) => !p.soldOut).sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0) || b.ratingCount - a.ratingCount));

function rail(products, base, { title, sub, href, linkText = "View all" }) {
  return `<section class="section"><div class="container">
  <div class="section-head"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div>${href ? `<a class="link-more" href="${base}${href}">${linkText} ${icon("arrow")}</a>` : ""}</div>
  <div class="rail-wrap">
    <button class="rail-btn prev" aria-label="Scroll left" disabled>${icon("left")}</button>
    <div class="rail">${spread(products).map((p) => productCard(p, base)).join("")}</div>
    <button class="rail-btn next" aria-label="Scroll right">${icon("right")}</button>
  </div>
</div></section>`;
}

/* ---------------- HOME ---------------- */
function home(products) {
  const base = "";
  const best = bestsellers(products).slice(0, 8);
  const heroPicks = ["sp-gp07-powerbank", "sp-airpro-nobox", "sp-azan-counter"].map((id) => byId(products, id)).filter(Boolean);
  const heroImgIdx = { "sp-gp07-powerbank": 3 };
  const inSeason = (p) => p.category !== "fans-cooling" || [3, 4, 5, 6, 7, 8].includes(new Date().getMonth());
  const deals = [...products].filter((p) => !p.soldOut && inSeason(p)).sort((a, b) => discountPct(b) - discountPct(a)).slice(0, 8);
  const under1000 = products.filter((p) => p.price < 1000 && !p.soldOut).sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 8);
  const catTiles = PARENTS
    .map((c) => {
      const items = bestsellers(inParent(products, c));
      return `<div class="cat-card">
        <a class="cat-card-imgs" href="${collectionUrl(c)}" aria-label="${esc(c.name)}">${items.slice(0, 3).map((p) => `<img src="${encPath(thumb(p.images[0]))}" alt="" loading="lazy" width="300" height="400">`).join("")}</a>
        <div class="cat-card-body">
          <a href="${collectionUrl(c)}" class="cat-card-title">${icon(c.icon)}<span>${esc(c.name)}</span>${icon("arrow")}</a>
          <span class="cat-card-count">${items.length} products</span>
          <div class="cat-card-subs">${c.subs.map((sub) => `<a href="${collectionUrl(sub)}">${esc(sub.name)}</a>`).join("")}</div>
        </div>
      </div>`;
    })
    .join("");
  const catRows = PARENTS
    .map((c) => rail(bestsellers(inParent(products, c)).slice(0, 10), base, { title: c.name, sub: c.blurb, href: collectionUrl(c), linkText: "Shop all" }))
    .join("");
  const faqs = [
    ["Do I need to create an account?", `No. Add what you like to your cart, enter your name, number and address, and tap <b>Place Order</b>. It takes under a minute.`],
    ["Can I really pay when it arrives?", `Yes — Cash on Delivery is available everywhere in Pakistan (${rs(C.codFee)} COD fee). Prefer to pay online? Use JazzCash or bank transfer and skip the COD fee — <b>save ${rs(C.onlineSaving)}</b>.`],
    ["How fast will I get my order?", `Most orders arrive in <b>${C.deliveryTime}</b>. Delivery is <b>FREE on orders over ${rs(C.freeShippingOver)}</b> — otherwise just ${rs(C.shippingFee)}.`],
    ["What if something arrives damaged or doesn't work?", `We replace it — free. Just WhatsApp us your unboxing video within ${C.replacementDays} days of delivery. <a href="pages/returns-policy/">See how it works</a>.`],
    ["Can I cancel after ordering?", `Yes, any time before your parcel is dispatched. Just send us a WhatsApp message.`],
  ];
  const body = `
<section class="hero2"><div class="container bento">
  <div class="bento-main">
    <div class="bento-copy">
      <span class="hero-rating">${icon("star")}${icon("star")}${icon("star")}${icon("star")}${icon("star")}<b>${(products.reduce((s, p) => s + p.rating * p.ratingCount, 0) / products.reduce((s, p) => s + p.ratingCount, 0)).toFixed(1)}</b> from ${(Math.floor(products.reduce((s, p) => s + p.ratingCount, 0) / 100) * 100).toLocaleString("en-US")}+ customer ratings</span>
      <h1>Everyday essentials that make life easier.</h1>
      <p>Earbuds, power banks, WiFi cameras, hair care and Islamic gifts — hand-picked, fairly priced and up to ${Math.max(...products.map(discountPct))}% off. Order in under a minute, pay when it arrives.</p>
      <div class="hero-cta">
        <a href="shop/" class="btn btn-cta btn-lg">Shop Best Sellers ${icon("arrow")}</a>
        <a href="#categories" class="btn btn-glass btn-lg">Browse categories</a>
      </div>
      <ul class="hero-points">
        <li>${icon("cash")} Cash on Delivery</li>
        <li>${icon("truck")} ${C.deliveryTime}</li>
        <li>${icon("refresh")} ${C.replacementDays}-day replacement</li>
      </ul>
    </div>
    <div class="bento-products" aria-hidden="true">
      ${heroPicks.slice(0, 3).map((p, i) => `<a href="${productUrl(p)}" class="float-card fc-${i + 1}" tabindex="-1"><img src="${encPath(thumb(p.images[heroImgIdx[p.id] || 0]))}" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} width="480" height="640"><span><b>${rs(p.price)}</b>${discountPct(p) ? `<i>${discountPct(p)}% OFF</i>` : ""}</span></a>`).join("")}
    </div>
  </div>
  ${[
    { href: "buying-guides/load-shedding-essentials/", id: "sp-wego-bulb", tag: "Load-shedding ready", title: "Light & power that outlast the outage", from: Math.min(...["sp-wego-bulb", "sp-oknew-bulb", "sp-gp07-powerbank"].map((id) => byId(products, id).price)), cls: "tile-lilac" },
    { href: "collections/islamic-gifts/", id: "sp-pearl-tasbih", tag: "Ramadan & Eid gifts", title: "Tasbih, Azan clocks & gift boxes", from: Math.min(...products.filter((p) => ["islamic-essentials", "gifts-toys"].includes(p.category)).map((p) => p.price)), cls: "tile-mint" },
  ].map((t) => `<a class="bento-tile ${t.cls}" href="${t.href}">
      <span class="bento-tile-copy"><span class="eyebrow-sm">${t.tag}</span><b>${t.title}</b><span class="bento-from">From ${rs(t.from)} <i>${icon("arrow")}</i></span></span>
      <img src="${encPath(thumb(byId(products, t.id).images[0]))}" alt="" loading="lazy" width="480" height="640">
    </a>`).join("")}
</div></section>
${trustStrip()}
<section class="section" id="categories"><div class="container">
  <div class="section-head"><div><span class="eyebrow-sm">Categories</span><h2>Shop by Category</h2><p>Four aisles. Everything you need, nothing you don't.</p></div></div>
  <div class="cat-cards">${catTiles}</div>
</div></section>
<section class="section section-tint"><div class="container">
  <div class="section-head"><div><span class="eyebrow-sm">Customer favourites</span><h2>Best Sellers</h2><p>The products customers order again — and recommend to family.</p></div><a class="link-more" href="shop/">View all ${icon("arrow")}</a></div>
  <div class="grid">${best.map((p) => productCard(p, base)).join("")}</div>
</div></section>
${rail(deals, base, { title: "Biggest Savings", sub: "Our deepest discounts right now — same quality, much lower price.", href: "shop/?sort=discount" })}
<section class="section"><div class="container">
  <div class="steps">
    <h2>Order in 3 easy steps</h2>
    <ol>
      <li><span>1</span><div><b>Add to cart</b><p>Pick your products and colours. No account, no sign-up.</p></div></li>
      <li><span>2</span><div><b>Place your order</b><p>Enter your name, number and address and tap Place Order — it takes under a minute. Stuck? <a href="${waLink("Hi ShopNest! Please help me place an order.")}" target="_blank" rel="noopener">Tap WhatsApp</a> and we'll place it for you.</p></div></li>
      <li><span>3</span><div><b>Pay your way</b><p>Cash on Delivery, or pay online by JazzCash / bank transfer and save ${rs(C.onlineSaving)} (no COD fee). Delivered in ${C.deliveryTime}.</p></div></li>
    </ol>
  </div>
</div></section>
${catRows}
${rail(under1000, base, { title: "Under Rs 1,000", sub: "Small prices, big smiles — easy gifts and everyday helpers.", href: "shop/?price=0-999" })}
<section class="section"><div class="container">
  <div class="section-head"><div><span class="eyebrow-sm">Buying guides</span><h2>Not sure what to buy?</h2><p>Honest, simple advice from our team — so you pick the right thing the first time.</p></div><a class="link-more" href="buying-guides/">All guides ${icon("arrow")}</a></div>
  <div class="guide-cards">${G.GUIDES.slice(0, 3).map((g) => G.guideCard(g, products, base)).join("")}</div>
</div></section>
<section class="section section-tint"><div class="container faq-wrap">
  <div><h2>Got questions? Good.</h2><p class="muted">Here are the answers customers ask for most. Still unsure? Message us on WhatsApp — a real person replies, not a bot.</p>
    <a class="btn btn-wa" href="${waLink("Hi ShopNest! I have a question.")}" target="_blank" rel="noopener">${icon("whatsapp")} Chat on WhatsApp</a>
    <a class="link-more" href="pages/faq/" style="margin-left:1rem">All FAQs ${icon("arrow")}</a></div>
  <div class="accordion">${faqs.map(([q, a]) => `<details><summary>${q}${icon("down")}</summary><div>${a}</div></details>`).join("")}</div>
</div></section>`;
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: G.plain(a) } })) };
  return page({
    base, title: `${C.name}: Online Shopping in Pakistan with Cash on Delivery`,
    description: `Shop wireless earbuds, power banks, WiFi cameras, hair care and Islamic gifts online in Pakistan. Cash on Delivery nationwide, delivery in ${C.deliveryTime}, free ${C.replacementDays}-day replacement.`,
    canonical: "", image: heroPicks[0]?.images[0], body, active: "home",
    extraHead: `<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
  });
}

/* ---------------- LISTING (shop + main categories + subcategories) ---------------- */
function listing(products, { category } = {}) {
  const base = category ? "../../" : "../";
  const sub = category ? catBySlug(category) : null;            // subcategory page
  const parent = sub ? sub.parent : category ? parentBySlug(category) : null;
  const cat = sub || parent;
  const list = spread(sub ? products.filter((p) => p.category === sub.slug) : parent ? inParent(products, parent) : products);
  const chips = `<div class="chips chips-scroll">
    <a href="${base}shop/" class="chip ${!parent ? "is-active" : ""}">All products</a>
    ${PARENTS.map((c) => `<a href="${base}${collectionUrl(c)}" class="chip ${parent && parent.slug === c.slug ? "is-active" : ""}">${esc(c.name)}</a>`).join("")}
  </div>`;
  const subChips = parent ? `<div class="chips chips-scroll subchips">
    <a href="${base}${collectionUrl(parent)}" class="chip chip-sm ${!sub ? "is-active" : ""}">All ${esc(parent.short)} <em>${inParent(products, parent).length}</em></a>
    ${parent.subs.map((x) => `<a href="${base}${collectionUrl(x)}" class="chip chip-sm ${sub && sub.slug === x.slug ? "is-active" : ""}">${esc(x.name)} <em>${products.filter((p) => p.category === x.slug).length}</em></a>`).join("")}
  </div>` : "";
  const cards = list
    .map((p, i) => {
      const c = catBySlug(p.category);
      const search = [p.name, p.tagline, c.name, c.parent.name, ...(p.colors || []).map((x) => x.name)].join(" ").toLowerCase();
      return `<div class="grid-item" data-order="${i}" data-price="${p.price}" data-count="${p.ratingCount}" data-pct="${discountPct(p)}" data-search="${esc(search)}">${productCard(p, base)}</div>`;
    })
    .join("");
  const crumbs = sub ? [{ label: "Shop", href: "shop/" }, { label: parent.name, href: collectionUrl(parent) }, { label: sub.name }]
    : parent ? [{ label: "Shop", href: "shop/" }, { label: parent.name }] : [{ label: "Shop All" }];
  const body = `
<section class="listing-head"><div class="container">
  ${breadcrumb(base, crumbs)}
  <h1 id="listing-title">${cat ? esc(cat.name) : "All Products"}</h1>
  <p class="muted" id="listing-sub">${cat ? esc(cat.blurb) : "Every ShopNest product in one place — Cash on Delivery all over Pakistan."}</p>
  ${chips}
  ${subChips}
</div></section>
<section class="section section-tight"><div class="container">
  <div class="toolbar">
    <p class="toolbar-count"><b id="result-count">${list.length}</b> products</p>
    <div class="toolbar-filters" role="group" aria-label="Filter by price">
      <button class="chip chip-sm is-active" data-price="all">Any price</button>
      <button class="chip chip-sm" data-price="0-999">Under Rs 1,000</button>
      <button class="chip chip-sm" data-price="1000-2499">Rs 1,000 – 2,499</button>
      <button class="chip chip-sm" data-price="2500-999999">Rs 2,500+</button>
    </div>
    <label class="sort">Sort
      <select id="sort-select">
        <option value="featured">Featured</option>
        <option value="popular">Most popular</option>
        <option value="discount">Biggest discount</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </label>
  </div>
  <div class="grid" id="listing-grid">${cards}</div>
  <div class="empty" id="listing-empty" hidden>
    ${icon("search")}<h2>No products found</h2><p>Try a different search or browse all products.</p>
    <a href="${base}shop/" class="btn btn-primary">See all products</a>
  </div>
</div></section>
${(() => { const gs = cat ? G.guidesForCollection(cat.slug) : G.GUIDES.slice(0, 3); return gs.length ? `<section class="section section-tint"><div class="container">
  <div class="section-head"><div><span class="eyebrow-sm">Need help choosing?</span><h2>Read our buying guide${gs.length > 1 ? "s" : ""}</h2></div></div>
  <div class="guide-cards">${gs.map((g) => G.guideCard(g, products, base)).join("")}</div></div></section>` : ""; })()}
${trustStrip()}`;
  return page({
    base,
    title: cat ? `${cat.name} Price in Pakistan — Buy Online` : "Shop All Products Online in Pakistan",
    description: cat
      ? `Buy ${cat.name.toLowerCase()} online in Pakistan from ${rs(Math.min(...list.map((p) => p.price)))}. ${cat.blurb} Cash on Delivery, delivery in ${C.deliveryTime}.`
      : `Browse all ${products.length} ShopNest products — earbuds, power banks, WiFi cameras, hair care and Islamic gifts. Cash on Delivery all over Pakistan.`,
    canonical: cat ? collectionUrl(cat) : "shop/",
    image: list[0]?.images[0], body, active: parent ? parent.slug : "shop", scripts: ["listing.js"],
    extraHead: `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org", "@type": "CollectionPage", name: cat ? cat.name : "All products", description: cat ? cat.blurb : undefined,
      mainEntity: { "@type": "ItemList", numberOfItems: list.length, itemListElement: list.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absUrl(productUrl(p)), name: p.name })) },
    })}</script>`,
  });
}

/* ---------------- PRODUCT PAGE ---------------- */
/* SEO helpers: "<short name> Price in Pakistan" titles and price-led descriptions */
function seoProductTitle(p) {
  if (p.seoTitle) return p.seoTitle;
  let name = p.name;
  if ((name + " Price in Pakistan").length > 60) name = name.replace(/\s*\([^)]*\)/g, "").replace(/\s+(—|with)\s+.*$/i, "").trim();
  return (name + " Price in Pakistan").length <= 62 ? `${name} Price in Pakistan` : `${name} — Buy Online`;
}
function seoProductDesc(p, pct) {
  const tail = `Cash on Delivery across Pakistan · ${C.deliveryTime} delivery · ${C.replacementDays}-day replacement.`;
  const head = `${p.name}: ${rs(p.price)}${pct ? ` (${pct}% off)` : ""}.`;
  const withTag = `${head} ${p.tagline} ${tail}`;
  return withTag.length <= 158 ? withTag : `${head} ${tail}`;
}
const productFaqs = (p) => [
  ["Can I pay cash on delivery?", `Yes — pay the rider when your parcel arrives, anywhere in Pakistan (${rs(C.codFee)} COD fee). Or pay online via JazzCash / bank transfer — no COD fee, so you save ${rs(C.onlineSaving)}.`],
  ["When will it arrive?", `In ${C.deliveryTime}, all over Pakistan. ${p.price >= C.freeShippingOver ? "Good news: this product ships FREE." : `Delivery is FREE on orders over ${rs(C.freeShippingOver)} — otherwise ${rs(C.shippingFee)}.`}`],
  ["What if it arrives damaged or doesn't work?", `We'll replace it free. Send us your unboxing video on WhatsApp within ${C.replacementDays} days of delivery.`],
  ["Can I cancel my order?", "Yes — any time before it's dispatched. Just message us on WhatsApp or call."],
]

function productPage(p, products) {
  const base = "../../";
  const cat = catBySlug(p.category);
  const pct = discountPct(p);
  const parent = cat.parent;
  const related = [...new Set([...products.filter((x) => x.category === p.category), ...bestsellers(inParent(products, parent)), ...bestsellers(products)])].filter((x) => x.id !== p.id).slice(0, 8);
  const imgs = p.images.map(encPath);
  const colors = p.colors || [];
  const hasChoice = colors.length > 1;
  const firstColor = colors[0];
  const freeShip = p.price >= C.freeShippingOver;
  const waText = `Hi ShopNest! I want to order:\n${p.name}${firstColor || (p.parts || []).length ? " ({colour})" : ""}\nPrice: ${rs(p.price)}\nLink: ${absUrl(productUrl(p))}`;

  const gallery = `<div class="gallery" id="gallery">
    <div class="gallery-main" id="gallery-main" tabindex="0" aria-label="Product images">
      ${imgs.map((src, i) => `<figure><img src="${base}${src}" alt="${esc(i === 0 ? `${p.name} — ${p.tagline}` : `${p.name} — photo ${i + 1}`)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} width="900" height="1200"></figure>`).join("")}
    </div>
    ${pct ? `<span class="pcard-off gallery-off"><b>${pct}%</b> OFF</span>` : ""}
    ${imgs.length > 1 ? `<button class="gallery-nav prev" aria-label="Previous image">${icon("left")}</button><button class="gallery-nav next" aria-label="Next image">${icon("right")}</button>
    <div class="gallery-thumbs" role="tablist">${imgs.map((src, i) => `<button class="${i ? "" : "is-active"}" data-index="${i}" aria-label="Show image ${i + 1}"><img src="${base}${encPath(thumb(p.images[i]))}" alt="" loading="lazy" width="120" height="160"></button>`).join("")}</div>
    <div class="gallery-dots">${imgs.map((_, i) => `<i class="${i ? "" : "is-active"}"></i>`).join("")}</div>` : ""}
  </div>`;

  // Sets (e.g. Brush Family Set): customer chooses the colour of every item, using each item's own colour photos
  const partsPicker = (p.parts || []).length
    ? `<div class="parts-picker" data-parts>
      ${p.parts.map((part, pi) => {
        const item = products.find((x) => x.id === part.id);
        const opts = (item.colors || []).map((c) => ({ name: c.name, img: item.images[c.img !== undefined ? c.img : 0] }));
        const def = opts.some((o) => o.name === part.default) ? part.default : opts[0].name;
        return `<fieldset class="part-opt" data-part-label="${esc(part.label)}">
          <legend><span class="part-num">${pi + 1}</span>${esc(part.label)}: <b class="part-chosen">${esc(def)}</b></legend>
          <div class="part-tiles">${opts.map((o) => `<label class="part-tile" title="${esc(o.name)}">
            <input type="radio" name="part-${pi}" value="${esc(o.name)}" data-img="${esc(base + encPath(thumb(o.img)))}" ${o.name === def ? "checked" : ""}>
            <span class="part-img"><img src="${base}${encPath(thumb(o.img))}" alt="${esc(part.label)} in ${esc(o.name)}" loading="lazy" width="96" height="128"></span>
            <span class="part-name"><i style="background:${COLOR_HEX[o.name] || "#ccc"}"></i>${esc(o.name)}</span>
          </label>`).join("")}</div>
        </fieldset>`;
      }).join("")}
      <div class="set-preview" aria-live="polite"><span class="set-preview-label">Your set</span><div class="set-preview-row">${p.parts.map((part, pi) => {
        const item = products.find((x) => x.id === part.id);
        const c = (item.colors || []).find((x) => x.name === part.default) || item.colors[0];
        return `<img data-preview="${pi}" src="${base}${encPath(thumb(item.images[c.img !== undefined ? c.img : 0]))}" alt="" width="96" height="128">`;
      }).join("")}</div></div>
    </div>`
    : "";
  const colorPicker = hasChoice
    ? `<fieldset class="opt"><legend>${esc(p.colorLabel || "Colour")}: <b id="color-name">${esc(firstColor.name)}</b></legend>
      <div class="swatches">${colors
        .map((c, i) => `<label class="swatch" title="${esc(c.name)}"><input type="radio" name="color" value="${esc(c.name)}" ${i ? "" : "checked"} ${c.img !== undefined ? `data-img="${c.img}" data-cart-img="${esc(p.images[c.img])}"` : ""}><span style="--sw:${COLOR_HEX[c.name] || "#ccc"}"></span><em>${esc(c.name)}</em></label>`)
        .join("")}</div></fieldset>`
    : "";
  const locPicker = p.locationPricing
    ? `<fieldset class="opt"><legend>Delivery city</legend><div class="seg">
        <label><input type="radio" name="loc" value="lahore" data-price="${p.locationPricing.lahore}" checked><span>Lahore · ${rs(p.locationPricing.lahore)}</span></label>
        <label><input type="radio" name="loc" value="other" data-price="${p.locationPricing.other}"><span>Outside Lahore · ${rs(p.locationPricing.other)}</span></label>
      </div><p class="opt-note">Final price is set automatically from the city you enter at checkout.</p></fieldset>`
    : "";

  const info = `<div class="pdp-info">
    <a class="pdp-cat" href="${base}${collectionUrl(cat)}">${icon(cat.icon)} ${esc(cat.name)}</a>
    <h1>${esc(p.name)}</h1>
    <div class="pdp-rating">${stars(p, false)}${p.ratingCount ? `<a href="#details">${p.ratingCount} ratings</a>` : ""}${p.bestseller ? `<span class="badge badge-hot">Bestseller</span>` : p.badge ? `<span class="badge badge-hot">${esc(p.badge)}</span>` : ""}</div>
    <div id="pdp-price">${priceBlock(p, true)}</div>
    <p class="pdp-pk">${esc(p.name)} price in Pakistan: <b>${rs(p.price)}</b>${p.oldPrice > p.price ? ` (was ${rs(p.oldPrice)})` : ""} · Cash on Delivery</p>
    <p class="pdp-tagline">${esc(p.tagline)}</p>
    <ul class="pdp-highlights">${(p.highlights || []).slice(0, 4).map((h) => `<li>${icon("check")}${esc(h)}</li>`).join("")}</ul>
    <form class="pdp-form" id="pdp-form" data-product="${cartPayload(p)}">
      ${locPicker}
      ${colorPicker}
      ${partsPicker}
      <div class="pdp-actions">
        <div class="qty" aria-label="Quantity"><button type="button" data-qty="-1" aria-label="Decrease">${icon("minus")}</button><input type="number" name="qty" value="1" min="1" max="20" inputmode="numeric" aria-label="Quantity"><button type="button" data-qty="1" aria-label="Increase">${icon("plus")}</button></div>
        <button type="submit" class="btn btn-outline btn-lg" name="action" value="add" ${p.soldOut ? "disabled" : ""}>${icon("bag")} Add to Cart</button>
      </div>
      <button type="submit" class="btn btn-cta btn-lg btn-block" name="action" value="buy" id="buy-now" ${p.soldOut ? "disabled" : ""}>${p.soldOut ? "Sold out" : `${icon("zap")} Buy Now`}</button>
      <a class="btn btn-wa-outline btn-block" id="wa-order" href="${waLink(waText.replace(" ({colour})", firstColor ? ` (${firstColor.name})` : (p.parts || []).length ? ` (${p.parts.map((x) => `${x.label}: ${x.default}`).join(", ")})` : ""))}" data-template="${esc(waText)}" target="_blank" rel="noopener">${icon("whatsapp")} Order on WhatsApp</a>
    </form>
    <div class="pdp-perks">
      <div>${icon("truck")}<p><b id="delivery-eta">Arrives in ${C.deliveryTime}</b><span>${freeShip ? "FREE delivery on this item" : `FREE delivery on orders over ${rs(C.freeShippingOver)}`}</span></p></div>
      <div>${icon("cash")}<p><b>Cash on Delivery</b><span>Pay the rider when it arrives — or pay online &amp; save ${rs(C.onlineSaving)}</span></p></div>
      <div>${icon("refresh")}<p><b>${C.replacementDays}-day replacement</b><span>Damaged or faulty? <a href="${base}pages/returns-policy/">We replace it free</a></span></p></div>
    </div>
    <div class="pdp-share"><span>Share:</span>
      <a href="https://wa.me/?text=${encodeURIComponent(p.name + " — " + absUrl(productUrl(p)))}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">${icon("whatsapp")}</a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absUrl(productUrl(p)))}" target="_blank" rel="noopener" aria-label="Share on Facebook">${icon("facebook")}</a>
      <button type="button" id="copy-link" aria-label="Copy link">${icon("copy")}</button>
    </div>
  </div>`;

  const details = `<section class="section pdp-details" id="details"><div class="container pdp-details-grid">
    <div class="pdp-desc">
      <h2>Why you'll love it</h2>
      ${p.description.map((d) => `<p>${esc(d)}</p>`).join("")}
      <h3>At a glance</h3>
      <ul class="ticks">${p.highlights.map((h) => `<li>${icon("check")}${esc(h)}</li>`).join("")}</ul>
    </div>
    <div class="pdp-side">
      <div class="card"><h3>Specifications</h3><table class="specs"><tbody>${p.specs.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table></div>
${G.guidesFor(p.id).map((g) => `<a class="card guide-mini" href="${base}${G.guideUrl(g)}">${icon("info")}<span><em>Buying guide</em><b>${esc(g.title)}</b></span>${icon("right")}</a>`).join("")}
      <div class="card"><h3>What's in the box</h3><ul class="inbox">${p.inBox.map((x) => `<li>${icon("package")}${esc(x)}</li>`).join("")}</ul></div>
    </div>
  </div></section>
  <section class="section section-tint"><div class="container faq-wrap">
    <div><h2>Order with confidence</h2>
      <ul class="policy-points">
        <li>${icon("truck")}<span><b>Delivery:</b> ${C.deliveryTime} all over Pakistan. ${rs(C.shippingFee)} delivery fee — FREE over ${rs(C.freeShippingOver)}.</span></li>
        <li>${icon("cash")}<span><b>Payment:</b> Cash on Delivery (+${rs(C.codFee)} COD fee) or JazzCash / bank transfer (no COD fee — save ${rs(C.onlineSaving)}).</span></li>
        <li>${icon("refresh")}<span><b>Replacement:</b> ${C.replacementDays} days for damaged, faulty or wrong items (unboxing video required).</span></li>
      </ul>
      <a class="link-more" href="${base}pages/shipping-policy/">Shipping policy ${icon("arrow")}</a> &nbsp; <a class="link-more" href="${base}pages/returns-policy/">Returns policy ${icon("arrow")}</a>
    </div>
    <div class="accordion">${[...(p.faqs || []).map(([q, a]) => [esc(q), esc(a)]), ...productFaqs(p)].map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${q}${icon("down")}</summary><div>${a}</div></details>`).join("")}</div>
  </div></section>`;

  const body = `
<div class="container">${breadcrumb(base, [{ label: parent.name, href: collectionUrl(parent) }, { label: cat.name, href: collectionUrl(cat) }, { label: p.name }])}</div>
<section class="pdp"><div class="container pdp-grid">${gallery}${info}</div></section>
${details}
${rail(related, base, { title: "You may also like", href: collectionUrl(cat), linkText: `More ${cat.name}` })}
<div class="sticky-buy" id="sticky-buy" aria-hidden="true">
  <img src="${base}${encPath(thumb(p.images[0]))}" alt="" width="48" height="64">
  <div><b>${esc(p.name)}</b><span id="sticky-price">${rs(p.price)}</span></div>
  <button class="btn btn-cta" id="sticky-buy-btn" ${p.soldOut ? "disabled" : ""}>${p.soldOut ? "Sold out" : "Buy Now"}</button>
</div>`;

  const brand = (p.specs.find(([k]) => k === "Brand") || [])[1];
  const ld = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, sku: p.id, mpn: (p.specs.find(([k]) => k === "Model") || [])[1],
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    image: p.images.map((i) => absUrl(encPath(i))), description: [p.tagline, ...p.description].join(" "), category: `${parent.name} > ${cat.name}`,
    additionalProperty: p.specs.map(([k, v]) => ({ "@type": "PropertyValue", name: k, value: v })),
    offers: {
      "@type": "Offer", priceCurrency: "PKR", price: p.price, url: absUrl(productUrl(p)), itemCondition: "https://schema.org/NewCondition",
      availability: p.soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock", seller: { "@id": absUrl("#org") },
      shippingDetails: { "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: p.price >= C.freeShippingOver ? 0 : C.shippingFee, currency: "PKR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "PK" },
        deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" }, transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 5, unitCode: "DAY" } } },
      hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", applicableCountry: "PK", returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow", merchantReturnDays: C.replacementDays, returnFees: "https://schema.org/FreeReturn", returnMethod: "https://schema.org/ReturnByMail" },
    },
  };
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [...(p.faqs || []), ...productFaqs(p)].map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: G.plain(a) } })) };
  const crumbsLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("") },
      { "@type": "ListItem", position: 2, name: parent.name, item: absUrl(collectionUrl(parent)) },
      { "@type": "ListItem", position: 3, name: cat.name, item: absUrl(collectionUrl(cat)) },
      { "@type": "ListItem", position: 4, name: p.name },
    ],
  };
  return page({
    base, title: seoProductTitle(p),
    description: seoProductDesc(p, pct),
    canonical: productUrl(p), image: p.images[0], body, active: parent.slug, scripts: ["product.js"], bodyClass: "has-sticky-buy", ogType: "product", product: p,
    extraHead: [ld, crumbsLd, faqLd].map((x) => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join(""),
  });
}

/* ---------------- CART / CHECKOUT ---------------- */
const PK_CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Gujranwala", "Peshawar", "Quetta", "Sialkot", "Hyderabad", "Bahawalpur", "Sargodha", "Sahiwal", "Sheikhupura", "Gujrat", "Rahim Yar Khan", "Kasur", "Okara", "Jhelum", "Abbottabad", "Mardan", "Sukkur", "Larkana", "Dera Ghazi Khan", "Mirpur", "Muzaffarabad", "Wah Cantt", "Chiniot", "Kamoke"];

function cartPage(products) {
  const base = "../";
  const recs = bestsellers(products).slice(0, 4);
  const body = `
<section class="checkout"><div class="container">
  <div class="checkout-head">
    <h1>Checkout</h1>
    <ol class="checkout-steps"><li class="is-done">Cart</li><li class="is-active">Details</li><li>Done</li></ol>
  </div>

  <div class="success" id="order-success" hidden></div>
  <div class="empty" id="cart-empty" hidden>
    ${icon("bag")}<h2 id="cart-empty-title">Your cart is empty</h2><p id="cart-empty-sub">Not sure where to start? These are our customers' favourites:</p>
    <div class="grid grid-4">${recs.map((p) => productCard(p, base)).join("")}</div>
    <a href="${base}shop/" class="btn btn-primary btn-lg">Browse all products</a>
  </div>

  <div class="checkout-grid" id="checkout" hidden>
    <div class="checkout-main">
      <div class="card">
        <h2 class="card-title">${icon("bag")} Your order <span class="muted" id="item-count"></span></h2>
        <div class="ship-progress" id="checkout-ship"></div>
        <div id="cart-lines" class="lines"></div>
      </div>

      <form class="card" id="checkout-form" novalidate>
        <h2 class="card-title">${icon("pin")} Delivery details</h2>
        <p class="muted small">No account needed — takes under a minute. We'll only use your number to confirm and deliver your order.</p>
        <div class="form-grid">
          <label class="field"><span>Full name *</span><input id="addr-name" name="name" autocomplete="name" placeholder="e.g. Ahmed Raza" required></label>
          <label class="field"><span>Mobile number (WhatsApp) *</span><input id="addr-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="03XX XXXXXXX" required><em class="field-err" data-for="phone"></em></label>
          <label class="field"><span>City *</span><input id="addr-city" name="city" list="pk-cities" autocomplete="address-level2" placeholder="e.g. Lahore" required></label>
          <label class="field"><span>Province *</span><select id="addr-province" name="province" required>
            <option value="">Select province</option><option>Punjab</option><option>Sindh</option><option>KPK</option><option>Balochistan</option><option>Islamabad (Capital)</option><option>Gilgit-Baltistan</option><option>Azad Kashmir</option></select></label>
          <label class="field field-full"><span>Complete address *</span><input id="addr-street" name="street" autocomplete="street-address" placeholder="House no., street, area / landmark" required></label>
          <label class="field field-full"><span>Order notes <em class="muted">(optional)</em></span><input id="addr-notes" name="notes" placeholder="e.g. Call before delivery"></label>
        </div>
        <datalist id="pk-cities">${PK_CITIES.map((c) => `<option value="${c}">`).join("")}</datalist>

        <h2 class="card-title" style="margin-top:1.5rem">${icon("wallet")} Payment method</h2>
        <div class="pay-options">
          <label class="pay-opt"><input type="radio" name="payment" value="cod" checked>
            <span class="pay-opt-body"><span class="pay-ic">${icon("cash")}</span><span><b>Cash on Delivery</b><small>Pay when your parcel arrives · +${rs(C.codFee)} COD fee</small></span></span></label>
          <label class="pay-opt"><input type="radio" name="payment" value="online">
            <span class="pay-opt-body"><span class="pay-ic">${icon("wallet")}</span><span><b>Pay Online <span class="badge badge-save">Save ${rs(C.onlineSaving)}</span></b><small>JazzCash or bank transfer · no COD fee</small></span></span></label>
        </div>
        <div class="pay-accounts" id="pay-accounts" hidden>
          <p class="pay-accounts-note">${icon("info")} Send the total amount to any account below, place your order, then WhatsApp us the payment screenshot.</p>
          <div class="accounts">${C.paymentAccounts
            .map((a) => `<div class="account"><b>${esc(a.bank)}</b>${a.rows.map(([k, v]) => `<div class="account-row"><span>${esc(k)}</span><code>${esc(v)}</code>${k !== "Name" ? `<button type="button" class="copy" data-copy="${esc(v)}" aria-label="Copy ${esc(k)}">${icon("copy")}</button>` : ""}</div>`).join("")}</div>`)
            .join("")}</div>
        </div>
      </form>
    </div>

    <aside class="checkout-side">
      <div class="card summary">
        <h2 class="card-title">Order summary</h2>
        <div class="summary-rows">
          <div><span>Subtotal</span><b id="summary-subtotal">Rs 0</b></div>
          <div><span>Delivery</span><b id="summary-shipping">Rs 0</b></div>
          <div id="cod-fee-row"><span>COD fee</span><b id="summary-cod">Rs ${C.codFee}</b></div>
          <div id="discount-row" class="is-discount" hidden><span>Online payment discount</span><b id="summary-discount">− Rs ${C.onlineDiscount}</b></div>
          <div class="summary-total"><span>Total</span><b id="summary-total">Rs 0</b></div>
        </div>
        <p class="summary-hint" id="summary-hint"></p>
        <button class="btn btn-cta btn-lg btn-block" id="place-order-btn" type="button">${icon("lock")} Place Order</button>
        <p class="small center pay-reassure" id="pay-reassure">✓ Pay when your order arrives.</p>
        <p class="tiny muted center">By placing your order you agree to our <a href="${base}pages/terms-of-service/">Terms</a> &amp; <a href="${base}pages/returns-policy/">Returns Policy</a>.</p>
        <ul class="summary-trust">
          <li>${icon("cash")} Cash on Delivery available</li>
          <li>${icon("truck")} Delivery in ${C.deliveryTime}</li>
          <li>${icon("refresh")} ${C.replacementDays}-day replacement guarantee</li>
          <li>${icon("whatsapp")} Help on WhatsApp: ${C.phoneDisplay}</li>
        </ul>
      </div>
    </aside>
  </div>


</div></section>
<div class="sticky-checkout" id="sticky-checkout" hidden><div><span>Total</span><b id="sticky-total">Rs 0</b></div><button class="btn btn-cta" id="sticky-place">Place Order</button></div>`;
  return page({
    base, title: "Checkout — Cash on Delivery", description: "Review your cart and place your order in under a minute. Cash on Delivery all over Pakistan, or pay online and save.",
    canonical: "cart/", body, active: "cart", noDrawer: true, noindex: true, bodyClass: "page-checkout",
    scripts: ['<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4.4.1/dist/email.min.js" defer></script>', "checkout.js"],
  });
}

/* ---------------- TRACK ORDER ---------------- */
function trackPage() {
  const base = "../";
  const steps = [["package", "Order placed"], ["clock", "Processing"], ["truck", "Shipped"], ["home", "Delivered"]];
  const body = `
<section class="page-hero"><div class="container narrow center">
  <span class="page-hero-ic">${icon("truck")}</span>
  <h1>Where's my order?</h1>
  <p class="muted">Enter your Order ID (like SN-98234) or the mobile number you ordered with — we'll show you exactly where it is.</p>
</div></section>
<section class="section section-tight"><div class="container narrow">
  <div class="card track-card">
    <div class="seg seg-tabs" role="tablist">
      <label><input type="radio" name="track-mode" value="id" checked><span>Order ID</span></label>
      <label><input type="radio" name="track-mode" value="phone"><span>Phone number</span></label>
    </div>
    <form class="track-form" id="track-form">
      <input id="track-input" placeholder="e.g. SN-98234" autocomplete="off" aria-label="Order ID or phone number" required>
      <button class="btn btn-primary btn-lg" id="track-btn" type="submit">${icon("search")} Track</button>
    </form>
    <p class="tiny muted">Your Order ID was shown after you placed your order.</p>
  </div>
  <div class="track-error card" id="track-error" hidden>${icon("search")}<div><b id="track-error-msg">No order found</b><p id="track-error-sub" class="muted"></p></div></div>
  <div id="track-results"></div>
  <template id="track-steps-tpl"><div class="stepper">${steps.map(([ic, l], i) => `<div class="step" data-step="${i}"><span>${icon(ic)}</span><em>${l}</em></div>`).join("")}</div></template>
  <div class="card help-card">${icon("headset")}<div><b>Need help with your order?</b><p class="muted">Message us on WhatsApp with your Order ID and we'll update you.</p></div>
    <a class="btn btn-wa" href="${waLink("Hi ShopNest! I want to know the status of my order. Order ID: ")}" target="_blank" rel="noopener">${icon("whatsapp")} WhatsApp</a></div>
</div></section>`;
  return page({ base, title: "Track Your Order", description: "Check where your ShopNest order is. Enter your Order ID (e.g. SN-12345) or the mobile number you ordered with to see live status.", canonical: "track-order/", body, active: "track", noindex: true, scripts: [`<script type="module" src="../js/track.js${ver("js/track.js")}"></script>`] });
}

/* ---------------- CONTACT ---------------- */
function contactPage() {
  const base = "../";
  const body = `
<section class="page-hero"><div class="container narrow center">
  <span class="page-hero-ic">${icon("headset")}</span>
  <h1>Talk to a real person</h1>
  <p class="muted">Not sure which product is right? Need help with an order? Message us on WhatsApp — it's the fastest way to get an answer.</p>
</div></section>
<section class="section section-tight"><div class="container contact-grid">
  <div class="contact-cards">
    <a class="card contact-card is-wa" href="${waLink("Hi ShopNest! I have a question.")}" target="_blank" rel="noopener">${icon("whatsapp")}<div><b>WhatsApp</b><span>${C.phoneDisplay}</span><small>Fastest replies</small></div></a>
    <a class="card contact-card" href="tel:+${C.whatsapp}">${icon("phone")}<div><b>Call us</b><span>+92 ${C.phoneDisplay.slice(1)}</span></div></a>
    <a class="card contact-card" href="mailto:${C.email}">${icon("mail")}<div><b>Email</b><span>${C.email}</span></div></a>
    <a class="card contact-card" href="${C.social.instagram}" target="_blank" rel="noopener">${icon("instagram")}<div><b>Instagram</b><span>@theshopnest_</span></div></a>
    <a class="card contact-card" href="${C.social.tiktok}" target="_blank" rel="noopener">${icon("tiktok")}<div><b>TikTok</b><span>@theshopnest_</span></div></a>
    <a class="card contact-card" href="${base}track-order/">${icon("truck")}<div><b>Track an order</b><span>Check your delivery status</span></div></a>
  </div>
  <form class="card contact-form" id="contact-form">
    <h2 class="card-title">Send us a message</h2>
    <p class="muted small">Your message opens in WhatsApp, so our reply comes straight to your phone — no waiting for emails.</p>
    <label class="field"><span>Your name *</span><input name="name" required autocomplete="name"></label>
    <label class="field"><span>Topic</span><select name="topic"><option>Product question</option><option>Order status</option><option>Replacement / damaged item</option><option>Payment</option><option>Other</option></select></label>
    <label class="field"><span>Order ID <em class="muted">(if any)</em></span><input name="order" placeholder="SN-12345"></label>
    <label class="field"><span>Message *</span><textarea name="message" rows="4" required></textarea></label>
    <button class="btn btn-wa btn-lg btn-block" type="submit">${icon("whatsapp")} Send on WhatsApp</button>
  </form>
</div></section>`;
  return page({ base, title: "Contact Us — WhatsApp, Phone & Email", description: `Contact ShopNest on WhatsApp (${C.phoneDisplay}), phone or email. We're happy to help with products, orders and delivery.`, canonical: "contact/", body, active: "contact", scripts: ["contact.js"] });
}

module.exports = { home, listing, productPage, cartPage, trackPage, contactPage, bestsellers };
