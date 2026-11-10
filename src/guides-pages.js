/* ============================================================
   ShopNest — buying guide pages (/buying-guides/ and /buying-guides/<handle>/)
   ============================================================ */
const { C, esc, rs, icon, page, breadcrumb, productCard, productUrl, encPath, thumb, waLink, absUrl, discountPct } = require("./lib");
const GUIDES = require("./guides");

const UPDATED_ISO = "2026-11-10";
const UPDATED = "10 November 2026";
const guideUrl = (g) => `buying-guides/${g.handle}/`;

/* Which guides mention a product (picks or any token) — used for internal links on product pages */
function guidesFor(productId) {
  return GUIDES.filter((g) => g.picks.some(([id]) => id === productId) || g.sections.some(([, html]) => html.includes(productId)));
}
function guidesForCollection(slug) {
  return GUIDES.filter((g) => g.collections.includes(slug));
}

function resolve(html, products, base) {
  const byId = (id) => {
    const p = products.find((x) => x.id === id.trim());
    if (!p) throw new Error(`Guide references unknown product "${id}"`);
    return p;
  };
  return html
    .replace(/\{\{cards:([^}]+)\}\}/g, (_, ids) => `<div class="grid guide-grid">${ids.split(",").map((id) => productCard(byId(id), base)).join("")}</div>`)
    .replace(/\{\{link:([^}|]+)(?:\|([^}]+))?\}\}/g, (_, id, text) => { const p = byId(id); return `<a href="${base}${productUrl(p)}">${esc(text || p.name)}</a>`; })
    .replace(/\{\{guide:([^}|]+)\|([^}]+)\}\}/g, (_, h, text) => {
      if (!GUIDES.some((g) => g.handle === h)) throw new Error(`Unknown guide "${h}"`);
      return `<a href="${base}buying-guides/${h}/">${esc(text)}</a>`;
    })
    .replace(/\{\{cat:([^}|]+)\|([^}]+)\}\}/g, (_, slug, text) => `<a href="${base}collections/${slug}/">${esc(text)}</a>`)
    .replace(/\{\{wa\}\}/g, waLink("Hi ShopNest! I'd like to place a bulk order."));
}
const plain = (html) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

function guideCard(g, products, base) {
  const cover = products.find((p) => p.id === g.cover);
  return `<a class="guide-card" href="${base}${guideUrl(g)}">
    <span class="guide-card-img"><img src="${base}${encPath(thumb(cover.images[0]))}" alt="" loading="lazy" width="480" height="640"></span>
    <span class="guide-card-body"><span class="guide-tag">${icon("info")} Buying guide · ${g.readTime} min read</span>
      <b>${esc(g.title)}</b><span class="muted">${esc(g.excerpt)}</span><span class="link-more">Read the guide ${icon("arrow")}</span></span>
  </a>`;
}

function guidePage(g, products) {
  const base = "../../";
  const picks = g.picks.map(([id, best]) => [products.find((p) => p.id === id), best]);
  picks.forEach(([p], i) => { if (!p) throw new Error(`Guide ${g.handle}: unknown pick ${g.picks[i][0]}`); });
  const cover = products.find((p) => p.id === g.cover);
  const toc = g.sections.map(([h], i) => `<li><a href="#g${i + 1}">${esc(h)}</a></li>`).join("");
  const related = GUIDES.filter((x) => x.handle !== g.handle).slice(0, 3);
  const body = `
<article class="guide">
  <header class="guide-hero"><div class="container narrow">
    ${breadcrumb(base, [{ label: "Buying Guides", href: "buying-guides/" }, { label: g.title }])}
    <span class="guide-tag">${icon("info")} Buying guide</span>
    <h1>${esc(g.title)}</h1>
    <p class="lead">${esc(g.description)}</p>
    <p class="guide-meta">By the ShopNest team · Updated <time datetime="${UPDATED_ISO}">${UPDATED}</time> · ${g.readTime} min read</p>
  </div></header>

  <div class="container narrow guide-body">
    <section class="quick-answer" aria-labelledby="qa-title">
      <h2 id="qa-title">${icon("zap")} Quick answer</h2>
      <p>${g.quickAnswer}</p>
    </section>

    <section class="guide-compare">
      <h2>Our picks at a glance</h2>
      <div class="compare-table" role="table" aria-label="Product comparison">
        ${picks.map(([p, best]) => `<a class="compare-row" role="row" href="${base}${productUrl(p)}">
          <img src="${base}${encPath(thumb(p.images[0]))}" alt="" loading="lazy" width="64" height="80">
          <span class="compare-name" role="cell"><b>${esc(p.name)}</b><em>${esc(best)}</em></span>
          <span class="compare-price" role="cell"><b>${rs(p.price)}</b>${discountPct(p) ? `<s>${rs(p.oldPrice)}</s>` : ""}</span>
          <span class="compare-go" role="cell">${icon("right")}</span></a>`).join("")}
      </div>
    </section>

    <nav class="guide-toc" aria-label="In this guide"><b>In this guide</b><ol>${toc}<li><a href="#g-faq">Frequently asked questions</a></li></ol></nav>

    ${g.sections.map(([h, html], i) => `<section class="guide-section" id="g${i + 1}"><h2>${esc(h)}</h2>${resolve(html, products, base)}</section>`).join("")}

    <section class="guide-section" id="g-faq"><h2>Frequently asked questions</h2>
      <div class="accordion">${g.faqs.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}${icon("down")}</summary><div>${esc(a)}</div></details>`).join("")}</div>
    </section>

    <div class="guide-cta card">${icon("cash")}<div><b>Order with Cash on Delivery</b><p class="muted">Delivery in ${C.deliveryTime} across Pakistan · FREE over ${rs(C.freeShippingOver)} · ${C.replacementDays}-day replacement.</p></div>
      <a class="btn btn-cta" href="${base}collections/${g.collections[0]}/">Shop now ${icon("arrow")}</a></div>
  </div>
</article>
<section class="section section-tint"><div class="container">
  <div class="section-head"><div><h2>More buying guides</h2></div><a class="link-more" href="${base}buying-guides/">All guides ${icon("arrow")}</a></div>
  <div class="guide-cards">${related.map((x) => guideCard(x, products, base)).join("")}</div>
</div></section>`;

  const url = absUrl(guideUrl(g));
  const ld = [
    { "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description, image: absUrl(encPath(cover.images[0])),
      datePublished: UPDATED_ISO, dateModified: UPDATED_ISO, author: { "@type": "Organization", name: C.name }, publisher: { "@type": "Organization", name: C.name, logo: { "@type": "ImageObject", url: absUrl("images/logo.png") } },
      mainEntityOfPage: url, about: picks.map(([p]) => ({ "@type": "Product", name: p.name, url: absUrl(productUrl(p)) })) },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: g.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("") },
      { "@type": "ListItem", position: 2, name: "Buying Guides", item: absUrl("buying-guides/") },
      { "@type": "ListItem", position: 3, name: g.title } ] },
  ];
  return [guideUrl(g) + "index.html", page({
    base, title: g.seoTitle, description: g.description, canonical: guideUrl(g), image: cover.images[0], body, active: "guides", ogType: "article",
    extraHead: ld.map((x) => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join(""),
  })];
}

function guidesIndex(products) {
  const base = "../";
  const body = `
<section class="page-hero"><div class="container narrow center">
  <span class="page-hero-ic">${icon("info")}</span>
  <h1>Buying Guides</h1>
  <p class="lead">Honest, simple advice to help you choose the right product the first time — written for shoppers in Pakistan.</p>
</div></section>
<section class="section section-tight"><div class="container">
  <div class="guide-cards guide-cards-all">${GUIDES.map((g) => guideCard(g, products, base)).join("")}</div>
</div></section>`;
  const ld = { "@context": "https://schema.org", "@type": "CollectionPage", name: "ShopNest Buying Guides",
    hasPart: GUIDES.map((g) => ({ "@type": "Article", headline: g.title, url: absUrl(guideUrl(g)) })) };
  return ["buying-guides/index.html", page({
    base, title: "Buying Guides — Earbuds, Power Banks, Cameras & Gifts", description: "Simple, honest buying guides for Pakistani shoppers: best budget earbuds, load-shedding essentials, WiFi cameras, hair brushes and Islamic gift ideas.",
    canonical: "buying-guides/", body, active: "guides", extraHead: `<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
  })];
}

module.exports = { GUIDES, guidePage, guidesIndex, guidesFor, guidesForCollection, guideCard, guideUrl, plain };
