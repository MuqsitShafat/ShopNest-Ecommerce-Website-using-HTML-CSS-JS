/* ============================================================
   ShopNest — store configuration (single source of truth)
   Change values here, then run:  node src/build.js
   ============================================================ */

module.exports = {
  // Public URL of the live site, no trailing slash (e.g. "https://shopnest.pk").
  // Used for canonical links, sitemap and WhatsApp/Facebook link previews.
  siteUrl: "https://theshopnest.xyz",
  metaPixelId: "1384881198048721", // Meta Pixel (Events Manager); empty string turns tracking off

  name: "ShopNest",
  tagline: "Useful gadgets & everyday essentials, delivered to your door anywhere in Pakistan",
  city: "Lahore",

  phoneDisplay: "0328 4430589",
  whatsapp: "923284430589",
  email: "shopnest260@gmail.com",
  social: {
    instagram: "https://www.instagram.com/theshopnest_",
    facebook: "https://www.facebook.com/share/1Cg2ZbM8R8/",
    tiktok: "https://www.tiktok.com/@theshopnest_",
  },

  // Commerce rules (keep in sync with js/checkout.js, which reads them from <body data-*>)
  shippingFee: 199,
  freeShippingOver: 1999,
  codFee: 99,
  onlineDiscount: 0, // extra discount for paying online, on top of skipping the COD fee (0 = none)
  get onlineSaving() { return this.codFee + this.onlineDiscount; }, // what a customer saves by paying online
  deliveryTime: "2–4 working days",
  replacementDays: 7,

  // Payment accounts shown at checkout for online payment
  paymentAccounts: [
    { bank: "JazzCash", rows: [["Number", "03284430589"], ["Name", "Muqsit Shafat Hussain"]] },
    { bank: "Meezan Bank", rows: [["Name", "MUQSIT SHAFAT HUSSAIN"], ["Account", "11390111920101"], ["IBAN", "PK67MEZN0011390111920101"]] },
    { bank: "MCB Bank", rows: [["Name", "MUQSIT SHAFAT HUSSAIN"], ["Account", "1651641191006729"], ["IBAN", "PK58MUCB1651641191006729"]] },
  ],

  // Categories — 4 main categories, each with subcategories.
  // Products use a SUBCATEGORY slug in their "category" field.
  categories: [
    { slug: "electronics", name: "Electronics & Gadgets", short: "Electronics", icon: "headphones",
      blurb: "Wireless earbuds, power banks, cables and rechargeable fans for everyday life.",
      subs: [
        { slug: "earbuds-audio", name: "Earbuds & Audio", blurb: "Wireless earbuds with clear sound, long battery and noise cancellation." },
        { slug: "mobile-accessories", name: "Power Banks & Cables", blurb: "Fast-charging power banks and tough USB-C cables that keep you connected." },
        { slug: "fans-cooling", name: "Fans & Cooling", blurb: "Rechargeable handheld, neck and desk fans to beat the heat anywhere." },
      ] },
    { slug: "home-kitchen", name: "Home & Kitchen", short: "Home & Kitchen", icon: "cooking-pot",
      blurb: "Clever kitchen helpers, handy tools, WiFi cameras and lights that stay on during load shedding.",
      subs: [
        { slug: "kitchen-home", name: "Kitchen & Household", blurb: "Clever kitchen helpers and handy home tools that make daily chores easier." },
        { slug: "security-lighting", name: "Cameras & Emergency Lights", blurb: "WiFi cameras to watch your home from your phone, and bulbs that stay on during load shedding." },
      ] },
    { slug: "beauty-care", name: "Beauty & Personal Care", short: "Beauty & Care", icon: "comb",
      blurb: "Hair brushes, scalp care, handmade skincare soap, massage guns and travel-friendly personal care.",
      subs: [
        { slug: "hair-care", name: "Hair Care", blurb: "Detangling brushes, styling brushes and scalp care for healthy, smooth hair." },
        { slug: "health-personal-care", name: "Massagers & Personal Care", blurb: "Handmade skincare soap, massage guns for muscle relief and travel-friendly personal care." },
      ] },
    { slug: "islamic-gifts", name: "Islamic & Gifts", short: "Islamic & Gifts", icon: "moon-star",
      blurb: "Digital tasbih counters, Azan clocks, gift boxes, keychains and toys.",
      subs: [
        { slug: "islamic-essentials", name: "Islamic Essentials", blurb: "Digital tasbih counters, Azan clocks and gift sets for Ramadan, Eid and every day." },
        { slug: "gifts-toys", name: "Gifts & Toys", blurb: "Cute keychains, toy cars and fidget toys — small gifts that make people smile." },
      ] },
  ],
};
