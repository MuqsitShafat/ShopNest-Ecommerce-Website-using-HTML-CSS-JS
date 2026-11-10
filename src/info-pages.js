/* ============================================================
   ShopNest — policy & information pages
   ============================================================ */
const { C, rs, icon, page, breadcrumb, waLink, trustStrip } = require("./lib");

const B = "../../"; // every info page lives at /pages/<handle>/
const wa = `<a href="${waLink()}" target="_blank" rel="noopener">WhatsApp (${C.phoneDisplay})</a>`;
const mail = `<a href="mailto:${C.email}">${C.email}</a>`;

function doc({ slug, title, description, intro, sections, aside = true, extra = {} }) {
  const toc = sections.map((s, i) => `<li><a href="#s${i + 1}">${s[0]}</a></li>`).join("");
  const body = `
<section class="page-hero page-hero-left"><div class="container narrow">
  ${breadcrumb(B, [{ label: title }])}
  <h1>${title}</h1>
  ${intro ? `<p class="lead">${intro}</p>` : ""}
</div></section>
<section class="section section-tight"><div class="container doc-grid ${aside ? "" : "doc-grid-single"}">
  ${aside ? `<aside class="doc-toc"><b>On this page</b><ol>${toc}</ol></aside>` : ""}
  <article class="doc">
    ${sections.map(([h, html], i) => `<section id="s${i + 1}"><h2>${h}</h2>${html}</section>`).join("")}
    <div class="doc-help card">${icon("headset")}<div><b>Still have a question?</b><p class="muted">Message us on WhatsApp — we're happy to help.</p></div>
      <a class="btn btn-wa" href="${waLink("Hi ShopNest! I have a question.")}" target="_blank" rel="noopener">${icon("whatsapp")} Chat now</a></div>
  </article>
</div></section>`;
  return [`pages/${slug}/index.html`, page({ base: B, title, description, canonical: `pages/${slug}/`, body, ...extra })];
}

const shipping = () =>
  doc({
    slug: "shipping-policy", title: "Shipping & Delivery Policy",
    description: `ShopNest delivers all over Pakistan in ${C.deliveryTime}. Free delivery on orders over ${rs(C.freeShippingOver)}. Cash on Delivery available.`,
    intro: `From Karachi to Gilgit — we deliver everywhere in Pakistan. Here's exactly how long it takes, what it costs and how to pay.`,
    sections: [
      ["Where we deliver", `<p>We deliver nationwide — to all major cities, towns and most rural areas of Pakistan through trusted courier partners. Orders are dispatched from ${C.city}.</p>`],
      ["Delivery time", `<p>Orders are delivered within <b>${C.deliveryTime}</b> after your order is confirmed.</p><ul><li>We take and process orders <b>24/7</b> — every day of the week, including weekends and holidays.</li><li>Remote areas, bad weather, strikes or courier delays can occasionally add 1–3 days. We'll keep you updated if that happens.</li></ul>`],
      ["Delivery charges", `<table class="specs"><tbody>
        <tr><th>Order total below ${rs(C.freeShippingOver)}</th><td>${rs(C.shippingFee)} delivery fee</td></tr>
        <tr><th>Order total ${rs(C.freeShippingOver)} or more</th><td><b>FREE delivery</b></td></tr>
        <tr><th>Cash on Delivery</th><td>+${rs(C.codFee)} COD fee on every COD order</td></tr>
        <tr><th>Online payment (JazzCash / bank transfer)</th><td><b>No COD fee</b> — you save ${rs(C.onlineSaving)}</td></tr>
      </tbody></table><p><b>How the COD fee works:</b> every Cash on Delivery order has a flat ${rs(C.codFee)} COD fee, whatever the order amount — even when delivery is free. Pay online by JazzCash or bank transfer instead and the COD fee is removed, so you save ${rs(C.onlineSaving)}.</p><p>The exact charges are always shown in your order summary before you place your order. Some bundle deals have their own city-based package price, shown on the product page.</p>`],
      ["Order confirmation", `<p>After you place an order, you'll see your <b>Order ID</b> (e.g. SN-12345) on screen. Our team will call or WhatsApp you to confirm your order and address before dispatch. Please keep your phone reachable — unconfirmed orders may be delayed or cancelled.</p>`],
      ["Payment methods", `<ul><li><b>Cash on Delivery (COD):</b> pay the rider in cash when your parcel arrives. A flat ${rs(C.codFee)} COD fee is added to every COD order.</li><li><b>Online payment:</b> send payment via JazzCash or bank transfer (account details are shown at checkout) and WhatsApp us the screenshot. No COD fee — you save ${rs(C.onlineSaving)}.</li></ul><p>Please only place Cash on Delivery orders you intend to receive. Refused parcels cost us two-way courier charges.</p>`],
      ["Tracking your order", `<p>Use our <a href="${B}track-order/">Track Order</a> page with your Order ID or phone number, or message us on ${wa} for an update.</p>`],
      ["Receiving your parcel", `<p>Please check that the outer packaging is intact when you receive your parcel. We strongly recommend recording a short <b>unboxing video</b> — it's required if you need a replacement for a damaged, faulty or wrong item (see our <a href="${B}pages/returns-policy/">Returns &amp; Replacement Policy</a>).</p>`],
    ],
  });

const returns = () =>
  doc({
    slug: "returns-policy", title: "Returns, Replacement & Refund Policy",
    description: `${C.replacementDays}-day free replacement on damaged, faulty or wrong items. Cancel any time before dispatch. Read ShopNest's returns policy.`,
    intro: `If something arrives damaged, faulty or wrong, we replace it — free. Here's how it works, in plain language.`,
    sections: [
      [`${C.replacementDays}-day replacement guarantee`, `<p>If your product arrives <b>damaged, defective / not working, or is not the item you ordered</b>, we will replace it free of cost. Just contact us within <b>${C.replacementDays} days of delivery</b>.</p>`],
      ["How to request a replacement", `<ol><li>Message us on ${wa} or email ${mail} within ${C.replacementDays} days of delivery.</li><li>Share your <b>Order ID</b>, a short description of the problem, photos, and your <b>unboxing video</b>.</li><li>Our team reviews your request (usually within 1–2 working days) and arranges the return pickup or tells you how to send the item back.</li><li>Once we receive and check the item, we dispatch your replacement. Delivery charges for approved replacements are covered by us.</li></ol>`],
      ["Conditions", `<ul><li>An unboxing video (from opening the sealed parcel) is required for damaged, missing-item or wrong-item claims.</li><li>The item must be returned with its original box, accessories, manuals and free gifts (if any).</li><li>The item must not show signs of misuse, physical damage, water damage or tampering after delivery.</li></ul>`],
      ["What is not covered", `<ul><li>Change of mind or no longer needing the item.</li><li>Damage caused by misuse, accidents, wrong voltage or not following instructions.</li><li>Normal wear and tear, or minor colour/shade differences from product photos due to screen settings.</li><li>Personal-care and hygiene items (e.g. hair brushes, combs, paper soap) once used — unless they arrived damaged or faulty.</li><li>Claims made after ${C.replacementDays} days of delivery.</li></ul>`],
      ["Refunds", `<p>If a replacement isn't available, we'll offer you a different product of your choice or a full refund of the item price. Refunds are sent by JazzCash or bank transfer within <b>3–5 working days</b> after we receive and inspect the returned item.</p>`],
      ["Order cancellation", `<p>You can <b>cancel your order any time before it is dispatched</b> — just message us on ${wa} or call. If you already paid online, we'll refund the full amount within 3–5 working days. Once an order has been handed to the courier it can no longer be cancelled, but you're welcome to contact us for help.</p>`],
    ],
  });

const privacy = () =>
  doc({
    slug: "privacy-policy", title: "Privacy Policy",
    description: "How ShopNest collects, uses and protects your personal information when you order — what we store, who we share it with (couriers only) and your rights.",
    intro: `Your privacy matters to us. This policy explains what information we collect when you shop with ${C.name} and how we use it.`,
    sections: [
      ["Information we collect", `<ul><li><b>Order details:</b> your name, mobile number, delivery address, city, province, optional order notes, items ordered and payment method.</li><li><b>Messages:</b> anything you send us on WhatsApp, phone, email or social media.</li><li><b>Browser storage:</b> your cart is saved in your own browser (localStorage) so it's there when you come back. We don't use it to identify you.</li></ul><p>We do not collect card numbers. Online payments are made directly by you through JazzCash or your bank.</p>`],
      ["How we use it", `<ul><li>To process, confirm and deliver your order.</li><li>To contact you about your order, delivery or replacement requests.</li><li>To provide customer support and improve our products and service.</li></ul><p>We will not send you marketing messages unless you ask us to.</p>`],
      ["Who we share it with", `<p>We share only what's needed to deliver your order — your name, phone number and address — with our courier partners. We use trusted service providers to run the store, such as Google Firebase (secure order storage) and EmailJS (order notification emails). <b>We never sell or rent your personal information.</b></p>`],
      ["Data security & retention", `<p>Order data is stored securely and only accessible to authorised ShopNest staff. We keep order records for as long as needed for delivery, support, replacements and legal or accounting purposes.</p>`],
      ["Your rights", `<p>You can ask us to view, correct or delete your personal information at any time by contacting ${wa} or ${mail}.</p>`],
      ["Third-party links", `<p>Our website links to WhatsApp, Instagram, Facebook and TikTok. These services have their own privacy policies.</p>`],
      ["Changes", `<p>We may update this policy from time to time. The latest version will always be on this page.</p>`],
    ],
  });

const terms = () =>
  doc({
    slug: "terms-of-service", title: "Terms of Service",
    description: "The terms that apply when you shop with ShopNest: orders, prices, Cash on Delivery and online payment, delivery, replacements and cancellations in Pakistan.",
    intro: `By using this website and placing an order with ${C.name}, you agree to these terms.`,
    sections: [
      ["Orders", `<p>Placing an order is an offer to buy. An order is accepted once we confirm it with you by call or WhatsApp. We may decline or cancel an order if a product is out of stock, the address can't be reached, the contact number is unreachable, or we suspect a fraudulent or fake order. If you've paid online for a cancelled order, we refund you in full.</p>`],
      ["Prices & offers", `<p>All prices are in Pakistani Rupees (PKR). Delivery, COD fee and any discount are shown in your order summary before you order. Prices and offers may change without notice, but changes won't affect orders already confirmed. If an item is listed at an obviously wrong price due to an error, we'll contact you before processing the order.</p>`],
      ["Product information", `<p>We do our best to describe and photograph products accurately. Colours may look slightly different depending on your screen, and packaging may change from time to time. Specifications are provided by manufacturers.</p>`],
      ["Payment", `<p>You can pay by Cash on Delivery or by online transfer (JazzCash / bank). For online payments, your order is processed once we've verified your payment.</p>`],
      ["Delivery, returns & cancellation", `<p>Delivery is covered by our <a href="${B}pages/shipping-policy/">Shipping &amp; Delivery Policy</a>. Replacements, refunds and cancellations are covered by our <a href="${B}pages/returns-policy/">Returns &amp; Replacement Policy</a>.</p>`],
      ["Acceptable use", `<p>Please don't misuse the website, place fake orders, or attempt to interfere with its operation.</p>`],
      ["Liability", `<p>To the extent permitted by law, ${C.name} is not liable for indirect or consequential losses arising from the use of our products or website. Nothing in these terms limits your rights under Pakistani consumer protection law.</p>`],
      ["Governing law", `<p>These terms are governed by the laws of Pakistan.</p>`],
      ["Contact", `<p>Questions about these terms? Contact us on ${wa} or ${mail}.</p>`],
    ],
  });

const FAQ_GROUPS = [
  ["Ordering", [
    ["How do I place an order?", `Add products to your cart, tap <b>Checkout</b>, enter your name, mobile number and address, choose a payment method and tap <b>Place Order</b>. You'll get an Order ID instantly. No account or sign-up is needed.`],
    ["Can I order on WhatsApp?", `Yes! Tap <b>Order on WhatsApp</b> on any product page or message us at ${wa}.`],
    ["How will I know my order is confirmed?", `We'll call or WhatsApp you on the number you entered to confirm your order and address before dispatch.`],
    ["Can I change or cancel my order?", `Yes — any time before dispatch. Message us on WhatsApp with your Order ID.`],
  ]],
  ["Payment", [
    ["Is Cash on Delivery available?", `Yes, all over Pakistan. A flat ${rs(C.codFee)} COD fee is added to every Cash on Delivery order, whatever the order amount. Pay online and you skip it.`],
    ["How do I pay online?", `Choose <b>Pay Online</b> at checkout to see our JazzCash and bank account details. Send the payment, place your order and WhatsApp us the screenshot. There's no COD fee, so you save ${rs(C.onlineSaving)}.`],
    ["Is it safe to pay online?", `You pay directly from your own JazzCash or bank app to our registered accounts — we never ask for your card or PIN.`],
  ]],
  ["Delivery", [
    ["How long does delivery take?", `${C.deliveryTime} after confirmation, all over Pakistan.`],
    ["How much is delivery?", `${rs(C.shippingFee)}, or <b>FREE</b> on orders of ${rs(C.freeShippingOver)} or more.`],
    ["How can I track my order?", `Use the <a href="${B}track-order/">Track Order</a> page with your Order ID or phone number, or ask us on WhatsApp.`],
  ]],
  ["Returns & replacement", [
    ["What if my product arrives damaged or doesn't work?", `Contact us within ${C.replacementDays} days of delivery with your unboxing video and we'll replace it free of cost.`],
    ["Do I need an unboxing video?", `Yes — please record a short video while opening your parcel. It's required for damaged, missing or wrong-item claims.`],
    ["Can I return something if I change my mind?", `We only replace items that are damaged, faulty or wrong. Please check product details carefully, and ask us on WhatsApp if you're unsure before ordering.`],
  ]],
  ["Products", [
    ["Are the photos real?", `Product images show the actual products we sell. Colours may vary slightly depending on your screen.`],
    ["Which colour will I get?", `You choose your colour on the product page before adding to cart, and you can change it in your cart before checkout.`],
  ]],
];

function faq() {
  const body = `
<section class="page-hero"><div class="container narrow center">
  <span class="page-hero-ic">${icon("info")}</span>
  <h1>Frequently Asked Questions</h1>
  <p class="muted">Quick answers about ordering, payment, delivery and replacements.</p>
</div></section>
<section class="section section-tight"><div class="container narrow">
  ${FAQ_GROUPS.map(([g, qs]) => `<h2 class="faq-group">${g}</h2><div class="accordion">${qs.map(([q, a]) => `<details><summary>${q}${icon("down")}</summary><div>${a}</div></details>`).join("")}</div>`).join("")}
  <div class="doc-help card">${icon("headset")}<div><b>Didn't find your answer?</b><p class="muted">Message us — a real person will reply.</p></div>
    <a class="btn btn-wa" href="${waLink("Hi ShopNest! I have a question.")}" target="_blank" rel="noopener">${icon("whatsapp")} Chat now</a></div>
</div></section>`;
  const ld = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQ_GROUPS.flatMap(([, qs]) => qs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } }))),
  };
  return ["pages/faq/index.html", page({ base: B, title: "FAQs", description: "Answers to common questions about ordering, Cash on Delivery, delivery times and replacements at ShopNest.", canonical: "pages/faq/", body, extraHead: `<script type="application/ld+json">${JSON.stringify(ld)}</script>` })];
}

function about() {
  const body = `
<section class="page-hero"><div class="container narrow center">
  <img src="${B}images/logo.png" alt="ShopNest logo" width="88" height="88" class="about-logo">
  <h1>About ShopNest</h1>
  <p class="lead">Useful things, honest prices, and a real person on the other end of WhatsApp.</p>
</div></section>
<section class="section section-tight"><div class="container narrow doc">
  <p>ShopNest started in ${C.city} with a simple idea: buying everyday gadgets online in Pakistan shouldn't feel like a gamble. So we only stock products we'd happily use ourselves — earbuds, power banks, WiFi cameras, emergency lights, kitchen helpers, hair-care tools, Islamic essentials and gifts — and photograph the real thing so you know exactly what you're getting.</p>
  <p>You don't pay until your parcel is in your hands. And if anything arrives damaged or faulty, we replace it. No arguments, no runaround.</p>
  <h2>What we promise</h2>
  <ul class="ticks">
    <li>${icon("check")}<span><b>Real products, real photos.</b> What you see is what we ship.</span></li>
    <li>${icon("check")}<span><b>Pay the way you like.</b> Cash on Delivery nationwide, or pay online by JazzCash / bank transfer and skip the ${rs(C.codFee)} COD fee.</span></li>
    <li>${icon("check")}<span><b>Fast, careful delivery.</b> ${C.deliveryTime}, free over ${rs(C.freeShippingOver)}.</span></li>
    <li>${icon("check")}<span><b>We stand behind every order.</b> ${C.replacementDays}-day replacement on damaged, faulty or wrong items.</span></li>
    <li>${icon("check")}<span><b>Humans, not bots.</b> Reach us on WhatsApp, phone or email.</span></li>
  </ul>
  <p><a href="${B}shop/" class="btn btn-cta btn-lg">Start shopping ${icon("arrow")}</a></p>
</div></section>
${trustStrip()}`;
  return ["pages/about-us/index.html", page({ base: B, title: "About Us", description: `ShopNest is an online store from ${C.city} delivering useful gadgets and everyday essentials across Pakistan with Cash on Delivery.`, canonical: "pages/about-us/", body })];
}

function notFound() {
  const body = `<section class="section"><div class="container narrow center empty">
    ${icon("search")}<h1>Page not found</h1><p>The page you're looking for doesn't exist or has moved.</p>
    <a href="/" class="btn btn-primary btn-lg">Go to homepage</a> <a href="/shop/" class="btn btn-outline btn-lg">Shop all products</a>
  </div></section>`;
  return ["404.html", page({ base: "/", title: "Page not found", description: "Page not found.", body, noindex: true })];
}

module.exports = () => [shipping(), returns(), privacy(), terms(), faq(), about(), notFound()];
