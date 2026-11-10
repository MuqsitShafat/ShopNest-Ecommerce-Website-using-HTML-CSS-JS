# ShopNest storefront

Static e-commerce site (HTML/CSS/JS, no framework). Every page is **generated** from
`products.json` and `src/config.js` by a small Node script with no dependencies.

## Everyday workflow

1. Edit `products.json` (products) or `src/config.js` (contact details, delivery fee,
   free-delivery threshold, COD fee, payment accounts, categories).
2. If you added new product photos, create their small card thumbnails
   (needs Python + Pillow; the site falls back to full images if you skip this):

   ```bash
   python tools/make-thumbs.py
   ```

3. Run the build:

   ```bash
   node src/build.js        # or: npm run build
   ```

4. Commit the regenerated HTML files together with your data change, then deploy.

> Don't hand-edit the generated pages (`index.html`, `shop/`, `cart/`, `products/`, `collections/`,
> `pages/`, `buying-guides/`, …) — they are overwritten on every build. Change the templates in `src/` instead.

## URLs

Clean folder URLs (each is a folder containing an `index.html`):

| Page | URL |
| --- | --- |
| Home | `/` |
| All products / search | `/shop/` · `/shop/?q=earbuds` |
| Category / subcategory | `/collections/electronics/` · `/collections/earbuds-audio/` |
| Product | `/products/<slug>/` |
| Buying guides | `/buying-guides/` · `/buying-guides/<handle>/` |
| Policies & info | `/pages/shipping-policy/`, `/pages/returns-policy/`, `/pages/privacy-policy/`, `/pages/terms-of-service/`, `/pages/faq/`, `/pages/about-us/` |
| Checkout, tracking, contact | `/cart/`, `/track-order/`, `/contact/` |

Old URLs from the previous site (`shop.html`, `cart.html`, `contact.html`, `track-order.html`, including
`shop.html?product=…` and `?cat=…`) redirect automatically. Serve the site from the domain root.

## Buying guides

Guides live in `src/guides.js`. Inside a guide's HTML you can use `{{cards:id1,id2}}` (product cards),
`{{link:id}}` / `{{link:id|text}}` (product links) and `{{guide:handle|text}}`. Products mentioned in a guide
automatically link back to it from their product page, and guides tagged with a collection appear on that
collection page.

## SEO / AEO / GEO

Generated automatically on every page: a unique title (about 60 characters max) and meta description, canonical URL,
Open Graph and Twitter cards, geo tags, and JSON-LD (Organization + WebSite search, Product with price, shipping and
return policy, BreadcrumbList, FAQPage, CollectionPage/ItemList, Article for guides). The build also writes:

| File | What it contains |
| --- | --- |
| `sitemap.xml` | Every indexable page (checkout and order tracking are excluded — they are `noindex`) with product and guide images. `<lastmod>` only changes when a page's HTML actually changed. |
| `robots.txt` | Allows everything except `/admin/`, `/cart/` and search-result URLs; welcomes AI search crawlers (GPTBot, ClaudeBot, PerplexityBot, …); points to the sitemap. |
| `llms.txt` | Short, link-first store overview for AI assistants ([llmstxt.org](https://llmstxt.org) format): key facts, categories, every product with price, guides, policies. |
| `llms-full.txt` | Full reference: every product's description, specs, box contents and FAQs, plus buying-guide answers. |

An optional per-product `seoTitle` overrides the automatic title.

Preview locally: `python -m http.server 8080` then open http://localhost:8080.

## Adding a product

Add an object to `products.json`. The build checks required fields and image paths and
fails with a clear message if something is missing.

```jsonc
{
  "id": "sp-unique-id",              // never change once live (used in carts & orders)
  "slug": "url-friendly-name",       // page: products/url-friendly-name.html
  "name": "Product name",
  "category": "earbuds-audio",       // a SUBCATEGORY slug from src/config.js
  "price": 1999,
  "oldPrice": 2999,                  // optional – shows the discount
  "rating": 5, "ratingCount": 120,
  "bestseller": true,                // optional – badge + featured on home
  "soldOut": true,                   // optional
  "images": ["images/folder/photo.jpg"],
  "colors": [{ "name": "Black", "img": 0 }],   // optional; img = gallery index to jump to
  "tagline": "One-line benefit shown under the price.",
  "description": ["Paragraph 1", "Paragraph 2"],
  "highlights": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4"],
  "specs": [["Battery", "300mAh"]],
  "inBox": ["1 × product", "1 × cable"],
  "faqs": [["Question?", "Answer."]],   // optional – shown first on the product page
  "locationPricing": { "lahore": 1700, "other": 1800 }  // optional (bundle deals)
}
```

Categories: 4 main categories (Electronics & Gadgets, Home & Kitchen, Beauty & Personal Care,
Islamic & Gifts), each with subcategories, defined in `src/config.js`. Each gets its own page in
`collections/`. To add a subcategory, add it to a main category's `subs` list and rebuild.

Colour swatch shades live in `COLOR_HEX` in `src/lib.js` — add a new colour name there.

## Structure

| Path | Purpose |
| --- | --- |
| `src/config.js` | Store settings, categories, payment accounts, `siteUrl` |
| `src/lib.js` | Layout (header, footer, drawers), product card, icons |
| `src/pages.js` | Home, shop/collections, product page, checkout, tracking, contact |
| `src/info-pages.js` | Shipping, returns, privacy, terms, FAQ, about, 404 |
| `css/app.css` | Whole design system |
| `js/app.js` | Cart store (localStorage `sn_cart`), cart drawer, menu, live search |
| `js/product.js` · `js/listing.js` · `js/checkout.js` · `js/track.js` · `js/contact.js` | Page scripts |
| `src/guides.js` · `src/guides-pages.js` | Buying guide content and templates |
| `nginx.conf` | Server config used by the Dockerfile (clean URLs, 404 page, caching, gzip) |
| `admin/` | Admin panel (orders from Firestore) — unchanged |

Orders are saved to Firestore `orders` with the same schema the admin panel and the
order tracker use, the admin is emailed via EmailJS, and customers can confirm on WhatsApp.

## Domain

`siteUrl` in `src/config.js` is `https://theshopnest.xyz`. It is used for canonical URLs, `sitemap.xml`,
`llms.txt` and image previews when links are shared on WhatsApp/Facebook. If the domain ever changes,
update it there and rebuild. After going live, submit `https://theshopnest.xyz/sitemap.xml` in
Google Search Console and Bing Webmaster Tools.
