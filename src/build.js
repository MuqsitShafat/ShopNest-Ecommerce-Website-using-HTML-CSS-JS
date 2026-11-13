#!/usr/bin/env node
/* ============================================================
   ShopNest static site builder
   Usage:  node src/build.js
   Reads products.json + src/config.js + src/guides.js and writes every page
   to the repository root using clean folder URLs, e.g.
     /products/<handle>/   /collections/<handle>/   /buying-guides/<handle>/
     /pages/shipping-policy/   /shop/   /cart/   /track-order/   /contact/
   Also writes sitemap.xml, robots.txt and llms.txt. No dependencies.
   ============================================================ */
const fs = require("fs");
const path = require("path");
const C = require("./config");
const pages = require("./pages");
const infoPages = require("./info-pages");
const G = require("./guides-pages");
const { rs, productUrl, collectionUrl, catBySlug, encPath, discountPct } = require("./lib");

const ROOT = path.resolve(__dirname, "..");
const allProducts = JSON.parse(fs.readFileSync(path.join(ROOT, "products.json"), "utf8"));
// "hidden": true keeps a product's data in products.json but takes it off the whole site.
// Its old address forwards to "hiddenRedirect" (another product id), or to the shop. Delete the two lines to bring it back.
const hiddenProducts = allProducts.filter((p) => p.hidden);
const products = allProducts.filter((p) => !p.hidden);

/* ---- validate data so mistakes fail loudly ---- */
const errors = [];
const seen = new Set();
const catSlugs = new Set(C.categories.flatMap((c) => c.subs.map((s) => s.slug)));
for (const p of products) {
  for (const k of ["id", "slug", "name", "category", "price", "images", "tagline", "description", "highlights", "specs", "inBox"]) {
    if (p[k] === undefined || p[k] === "") errors.push(`${p.id || p.name}: missing "${k}"`);
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug || "")) errors.push(`${p.id}: slug must be lowercase-with-dashes, got "${p.slug}"`);
  if (seen.has(p.slug)) errors.push(`duplicate slug: ${p.slug}`);
  seen.add(p.slug);
  if (!catSlugs.has(p.category)) errors.push(`${p.id}: unknown subcategory "${p.category}" (use a sub slug from src/config.js)`);
  for (const img of p.images || []) if (!fs.existsSync(path.join(ROOT, img))) errors.push(`${p.id}: image not found "${img}"`);
}
if (errors.length) {
  console.error("Build failed:\n  " + errors.join("\n  "));
  process.exit(1);
}

/* ---- write helpers ---- */
const written = [];
const contents = new Map();
function out(rel, content) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  written.push(rel);
  contents.set(rel, content);
}
const GEN_DIRS = ["products", "collections", "pages", "buying-guides", "shop", "cart", "track-order", "contact"];

// Snapshot the previous build so sitemap <lastmod> only changes when a page really changed
const prevHtml = new Map();
function walk(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return;
  if (fs.statSync(abs).isDirectory()) for (const e of fs.readdirSync(abs)) walk(`${rel}/${e}`);
  else if (rel.endsWith("index.html")) prevHtml.set(rel, fs.readFileSync(abs, "utf8"));
}
walk("index.html");
GEN_DIRS.forEach(walk);
const prevLastmod = new Map();
try {
  const old = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
  for (const m of old.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) prevLastmod.set(m[1], m[2]);
} catch {}

// Remove previously generated output so renamed/deleted products don't linger
for (const dir of GEN_DIRS) {
  fs.rmSync(path.join(ROOT, dir), { recursive: true, force: true });
}
for (const f of ["faq.html", "about.html", "shipping-policy.html", "returns-policy.html", "privacy-policy.html", "terms.html"]) {
  fs.rmSync(path.join(ROOT, f), { force: true });
}

/* ---- pages ---- */
out("index.html", pages.home(products));
out("shop/index.html", pages.listing(products));
for (const c of C.categories) {
  out(`collections/${c.slug}/index.html`, pages.listing(products, { category: c.slug }));
  for (const s of c.subs) out(`collections/${s.slug}/index.html`, pages.listing(products, { category: s.slug }));
}
for (const p of products) out(`products/${p.slug}/index.html`, pages.productPage(p, products));
out("cart/index.html", pages.cartPage(products));
out("track-order/index.html", pages.trackPage());
out("contact/index.html", pages.contactPage());
for (const [rel, html] of infoPages()) out(rel, html);
out(...G.guidesIndex(products));
for (const g of G.GUIDES) out(...G.guidePage(g, products));

/* ---- redirects for URLs used by the old site (keeps query strings, e.g. shop.html?product=…) ---- */
const redirect = (to) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Redirecting…</title>
<meta name="robots" content="noindex"><link rel="canonical" href="${to}">
<script>location.replace(${JSON.stringify(to)} + location.search + location.hash);</script>
<meta http-equiv="refresh" content="0; url=${to}"></head><body><a href="${to}">Continue</a></body></html>\n`;
for (const h of hiddenProducts) {
  const to = products.find((p) => p.id === h.hiddenRedirect);
  out(`products/${h.slug}/index.html`, redirect(to ? `../${to.slug}/` : "../../shop/"));
}
const LEGACY = { "shop.html": "shop/", "cart.html": "cart/", "contact.html": "contact/", "track-order.html": "track-order/" };
for (const [from, to] of Object.entries(LEGACY)) out(from, redirect(to));

/* ============================================================
   sitemap.xml · robots.txt · llms.txt · llms-full.txt
   ============================================================ */
const SITE = (C.siteUrl || "").replace(/\/+$/, "");
const u = (p) => `${SITE}/${p}`;
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const img = (p) => u(encPath(p));
const today = new Date().toISOString().slice(0, 10);
const pct = (p) => discountPct(p);
const live = (p) => !p.soldOut;

/* ---- sitemap.xml: every indexable page, with product/guide images ---- */
// Pages that should not be in search results (they carry noindex)
const NOINDEX = new Set(["cart/", "track-order/", ...hiddenProducts.map((h) => productUrl(h))]); // hidden products only forward
const byProductPath = new Map(products.map((p) => [productUrl(p), p]));
const byGuidePath = new Map(G.GUIDES.map((g) => [G.guideUrl(g), g]));
const order = (path) => (path === "" ? 0 : path === "shop/" ? 1 : path.startsWith("collections/") ? 2 : path.startsWith("products/") ? 3 : path.startsWith("buying-guides/") ? 4 : 5);
const sitemapEntries = written
  .filter((rel) => rel.endsWith("index.html"))
  .map((rel) => ({ rel, path: rel.replace(/index\.html$/, "") }))
  .filter((e) => !NOINDEX.has(e.path))
  .sort((a, b) => order(a.path) - order(b.path));

if (SITE) {
  const urls = sitemapEntries.map(({ rel, path: pth }) => {
    const loc = u(pth);
    // Keep the old date when the page HTML is byte-for-byte unchanged
    const lastmod = prevHtml.get(rel) === contents.get(rel) && prevLastmod.get(loc) ? prevLastmod.get(loc) : today;
    const p = byProductPath.get(pth);
    const g = byGuidePath.get(pth);
    let images = [];
    if (p) images = p.images;
    else if (g) {
      const ids = [g.cover, ...g.picks.map(([id]) => id)];
      images = [...new Set(ids)].map((id) => products.find((x) => x.id === id)).filter(Boolean).map((x) => x.images[0]);
    }
    const imgXml = images.map((src) => `\n    <image:image><image:loc>${xml(img(src))}</image:loc></image:image>`).join("");
    return `  <url>\n    <loc>${xml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>${imgXml}\n  </url>`;
  });
  out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>
`);
}

/* ---- robots.txt ---- */
const RULES = [
  "Allow: /",
  "Disallow: /admin/",
  "Disallow: /cart/",
  "Disallow: /*?q=",
];
// AI search / assistant crawlers — explicitly welcome so ShopNest can be cited in AI answers
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "Amazonbot", "DuckAssistBot", "meta-externalagent", "MistralAI-User", "CCBot",
];
out("robots.txt", `# robots.txt — ${C.name}${SITE ? ` (${SITE})` : ""}
# Shop pages, collections, products and buying guides are open to all crawlers.
# Checkout and internal search result pages are kept out of the index.

User-agent: *
${RULES.join("\n")}

# AI search engines and assistants are welcome.
# A plain-text summary of the store for AI tools: ${SITE ? u("llms.txt") : "/llms.txt"}
${AI_BOTS.map((b) => `User-agent: ${b}`).join("\n")}
${RULES.join("\n")}
${SITE ? `\nSitemap: ${u("sitemap.xml")}\n` : ""}`);

/* ---- llms.txt (llmstxt.org format) — short, link-first overview for AI assistants ---- */
const priceLine = (p) => `${rs(p.price)}${pct(p) ? ` (was ${rs(p.oldPrice)}, ${pct(p)}% off)` : ""}${p.soldOut ? " — currently sold out" : ""}`;
const priceRange = (list) => {
  const prices = list.filter(live).map((p) => p.price);
  return prices.length ? (Math.min(...prices) === Math.max(...prices) ? rs(prices[0]) : `${rs(Math.min(...prices))}–${rs(Math.max(...prices))}`) : "";
};
const subsWithProducts = C.categories.flatMap((c) => c.subs.map((s) => ({ ...s, parent: c, items: products.filter((p) => p.category === s.slug) }))).filter((s) => s.items.length);
const POLICIES = [
  ["Shipping & Delivery", "pages/shipping-policy/", `Delivery in ${C.deliveryTime} anywhere in Pakistan. ${rs(C.shippingFee)} delivery fee; free on orders of ${rs(C.freeShippingOver)} or more.`],
  ["Returns, Replacement & Refunds", "pages/returns-policy/", `Free replacement within ${C.replacementDays} days of delivery for damaged, faulty or wrong items (an unboxing video is required). Orders can be cancelled free of charge any time before dispatch.`],
  ["FAQ", "pages/faq/", "Answers about ordering, payment, delivery, replacements and order tracking."],
  ["Privacy Policy", "pages/privacy-policy/", "What customer information is stored and who it is shared with (couriers only)."],
  ["Terms of Service", "pages/terms-of-service/", "Terms for orders, prices, payment, delivery and cancellations."],
  ["About ShopNest", "pages/about-us/", `Who we are: an online store based in ${C.city} that delivers nationwide.`],
  ["Contact", "contact/", `WhatsApp or call +${C.whatsapp}, or email ${C.email}.`],
  ["Track an order", "track-order/", "Check order status with an Order ID (e.g. SN-12345) or the phone number used to order."],
];

const llms = `# ${C.name}

> ${C.name} (${SITE.replace(/^https?:\/\//, "")}) is an online store based in ${C.city}, Pakistan, selling useful gadgets and everyday essentials — wireless earbuds, power banks, WiFi security cameras, rechargeable emergency LED bulbs, portable fans, kitchen tools, hair brushes, massage guns and Islamic gifts. Every order can be paid by Cash on Delivery, and delivery takes ${C.deliveryTime} anywhere in Pakistan.

Key facts for answering shopper questions:

- Currency: all prices are in Pakistani Rupees (PKR, written "Rs"). ${products.filter(live).length} products are in stock, priced ${priceRange(products)}.
- Delivery: ${C.deliveryTime} to every city in Pakistan. Delivery fee ${rs(C.shippingFee)}; free delivery on orders of ${rs(C.freeShippingOver)} or more.
- Payment: Cash on Delivery (${rs(C.codFee)} COD fee), or pay online by JazzCash or bank transfer: no COD fee, so the customer saves ${rs(C.onlineSaving)}. The COD fee is a flat ${rs(C.codFee)} on every COD order, whatever the order amount.
- Replacement: free replacement within ${C.replacementDays} days of delivery if an item arrives damaged, faulty or wrong (unboxing video required). Cancel free of charge any time before dispatch.
- Ordering: no account needed. Order on the website or on WhatsApp (+${C.whatsapp}); every order is confirmed by phone or WhatsApp before dispatch.
- Social: [Instagram](${C.social.instagram}) · [Facebook](${C.social.facebook}) · [TikTok](${C.social.tiktok})

## Shop by category

${C.categories.map((c) => `- [${c.name}](${u(collectionUrl(c))}): ${c.blurb}`).join("\n")}
${subsWithProducts.map((s) => `- [${s.name}](${u(collectionUrl(s))}): ${s.blurb} ${s.items.length} products, ${priceRange(s.items)}.`).join("\n")}

${subsWithProducts.map((s) => `## ${s.name} (${s.parent.name})

${s.items.map((p) => `- [${p.name}](${u(productUrl(p))}): ${priceLine(p)}. ${p.tagline}`).join("\n")}`).join("\n\n")}

## Buying guides

${G.GUIDES.map((g) => `- [${g.title}](${u(G.guideUrl(g))}): ${g.description}`).join("\n")}

## Policies and help

${POLICIES.map(([t, p, d]) => `- [${t}](${u(p)}): ${d}`).join("\n")}

## Optional

- [Full catalogue for AI assistants](${u("llms-full.txt")}): every product with full description, specs, what's in the box and FAQs, plus buying-guide answers.
- [All products](${u("shop/")}): browse and filter the whole store.
- [Sitemap](${u("sitemap.xml")})
`;
out("llms.txt", llms);

/* ---- llms-full.txt — the complete, self-contained reference ---- */
const list = (arr) => arr.map((x) => `- ${x}`).join("\n");
const productBlock = (p) => {
  const cat = catBySlug(p.category);
  return `### ${p.name}

- URL: ${u(productUrl(p))}
- Price: ${priceLine(p)}${p.locationPricing ? ` (Lahore ${rs(p.locationPricing.lahore)}, rest of Pakistan ${rs(p.locationPricing.other)})` : ""}
- Category: ${cat.parent ? `${cat.parent.name} › ` : ""}${cat.name}
- Availability: ${p.soldOut ? "Sold out" : "In stock"} · Cash on Delivery · delivery in ${C.deliveryTime}
${p.colors && p.colors.length ? `- Colours: ${p.colors.map((c) => c.name).join(", ")}\n` : ""}${p.ratingCount ? `- Customer rating: ${p.rating}/5 from ${p.ratingCount} ratings\n` : ""}
${p.tagline}

${p.description.join("\n\n")}

Highlights:
${list(p.highlights)}

Specifications:
${list(p.specs.map(([k, v]) => `${k}: ${v}`))}

In the box:
${list(p.inBox)}
${p.faqs && p.faqs.length ? `\nFAQs:\n${p.faqs.map(([q, a]) => `- Q: ${q}\n  A: ${a}`).join("\n")}\n` : ""}`;
};
const guideBlock = (g) => `### ${g.title}

- URL: ${u(G.guideUrl(g))}
- Recommended products: ${g.picks.map(([id]) => products.find((p) => p.id === id)).filter(Boolean).map((p) => `${p.name} (${rs(p.price)}, ${u(productUrl(p))})`).join("; ")}

Quick answer: ${G.plain(g.quickAnswer)}
${g.faqs && g.faqs.length ? `\nFAQs:\n${g.faqs.map(([q, a]) => `- Q: ${G.plain(q)}\n  A: ${G.plain(a)}`).join("\n")}\n` : ""}`;

out("llms-full.txt", `# ${C.name} — full catalogue

> The complete reference for AI assistants: store policies, every product with price, description, specifications, box contents and FAQs, and the answers from our buying guides. All prices are in Pakistani Rupees (PKR). Short version: ${u("llms.txt")}

## Store policies

${POLICIES.map(([t, p, d]) => `- ${t} (${u(p)}): ${d}`).join("\n")}
- Payment: Cash on Delivery (${rs(C.codFee)} COD fee) or JazzCash / bank transfer (no COD fee — save ${rs(C.onlineSaving)}).

${C.categories.map((c) => `## ${c.name}

${c.blurb} ${u(collectionUrl(c))}

${products.filter((p) => catBySlug(p.category).parent && catBySlug(p.category).parent.slug === c.slug).map(productBlock).join("\n")}`).join("\n")}
## Buying guides

${G.GUIDES.map(guideBlock).join("\n")}`);

console.log(`Built ${written.length} files (${products.length} products, ${C.categories.length} categories, ${catSlugs.size} subcategories, ${G.GUIDES.length} guides).`);
if (!SITE) console.log("Tip: set siteUrl in src/config.js to enable absolute canonical URLs, sitemap.xml and rich link previews.");
