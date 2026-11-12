/* ============================================================
   ShopNest — Buying guides content
   Tokens inside html:
     {{cards:id1,id2}}  → product cards grid
     {{link:id}}        → inline link to a product (uses its name)
     {{link:id|text}}   → inline link with custom text
     {{cat:slug|text}}  → link to a collection
   "picks" builds the comparison table (product id + best-for label).
   ============================================================ */
module.exports = [
{
  handle: "best-wireless-earbuds-pakistan",
  title: "Best Wireless Earbuds in Pakistan Under Rs 3,500 (2026 Buying Guide)",
  seoTitle: "Best Wireless Earbuds Under Rs 3,500 in Pakistan (2026)",
  description: "Which budget earbuds are worth it in Pakistan? We compare battery, call quality, noise cancellation and comfort to help you pick the right pair under Rs 3,500.",
  excerpt: "Battery, Bluetooth version, call quality and comfort in the heat — what actually matters when you buy earbuds on a budget.",
  cover: "sp-w161-earbuds",
  readTime: 6,
  collections: ["electronics", "earbuds-audio"],
  quickAnswer: "For most people, the <b>Pro 2nd Gen (Without Box)</b> at Rs 1,750 is the best value. If you take lots of calls on noisy roads, get the <b>W161 ANC + ENC</b>. If battery life matters most, the <b>FDl FD1</b> gives up to 45 hours with its case. Can't stand in-ear buds? The clip-on <b>G-Golden GB-03</b> is the most comfortable.",
  picks: [
    ["sp-airpro-nobox", "Best value overall"],
    ["sp-w161-earbuds", "Best for calls & noisy roads"],
    ["sp-fd1-earbuds", "Longest battery life"],
    ["sp-gb03-earphones", "Most comfortable (open-ear)"],
    ["sp-ulex-ux1", "Best for gamers"],
    ["sp-airpro-box", "Best gift"],
  ],
  sections: [
    ["What should I look for in budget earbuds?", `
      <p>Under Rs 3,500 you can get genuinely good earbuds — if you focus on the five things that make a difference day to day:</p>
      <ol>
        <li><b>Bluetooth 5.0 or newer.</b> Newer versions (5.3, 5.4) connect faster, drop out less and are kinder to your battery. Everything in this guide meets that bar.</li>
        <li><b>Real-world battery.</b> Look at the total playtime <i>with the case</i>, not just one charge. It decides whether you charge daily or weekly.</li>
        <li><b>Call quality.</b> If you're on calls a lot, look for <b>ENC</b> (environmental noise cancellation) — it filters traffic and wind out of your voice.</li>
        <li><b>Fit and sweat resistance.</b> Pakistan's heat makes comfort critical. Soft silicone tips and an IPX4 rating mean they stay put and survive sweaty commutes and workouts.</li>
        <li><b>Who stands behind them.</b> Buy where you can check the product before paying and get a replacement if it's faulty. Every order at ShopNest is Cash on Delivery with a 7-day replacement.</li>
      </ol>`],
    ["Which earbuds are best for everyday use?", `
      <p>{{link:sp-airpro-nobox}} is our most-ordered pair for a reason: a clean white design, a compact magnetic case, quick pairing with Android and iPhone, and a price that leaves change from Rs 2,000. If you're buying for yourself, skip the box and save. Buying a gift? Get {{link:sp-airpro-box|the boxed version}} — identical inside.</p>
      {{cards:sp-airpro-nobox,sp-airpro-box}}`],
    ["What are the best earbuds for calls in traffic?", `
      <p>Most budget earbuds sound fine for music but fall apart on calls outdoors. {{link:sp-w161-earbuds}} is the exception at this price: <b>ANC</b> lowers background noise while you listen and dual-mic <b>ENC</b> cleans up your voice for the person on the other end. Add Bluetooth 5.4 and IPX4 sweat resistance and it's the pair we'd pick for riders, field staff and anyone who works on the phone.</p>
      {{cards:sp-w161-earbuds}}`],
    ["Which earbuds have the longest battery?", `
      <p>{{link:sp-fd1-earbuds}} offers up to <b>45 hours of total playtime</b> with its charging case — most people only charge it once or twice a week. It auto-connects when you open the case and uses Bluetooth 5.4.</p>
      {{cards:sp-fd1-earbuds}}`],
    ["I find in-ear earbuds uncomfortable. What else is there?", `
      <p>Try open-ear. {{link:sp-gb03-earphones}} clips gently over your ear instead of sitting inside it, so there's no pressure and they don't fall out. You can still hear traffic and people around you — safer when walking or riding. About 8 hours per charge and Hi-Res Audio.</p>
      {{cards:sp-gb03-earphones}}`],
    ["What about gaming?", `
      <p>{{link:sp-ulex-ux1}} brings the gaming look — a glowing hexagon case with a digital battery display — plus smart noise cancellation to help you focus. Great for students and mobile gamers who want something that stands out.</p>
      {{cards:sp-ulex-ux1}}`],
  ],
  faqs: [
    ["Are cheap earbuds bad for your ears?", "Volume matters more than price. Keep volume around 60% and take breaks; noise-cancelling models like the W161 let you listen at lower volume in noisy places."],
    ["Do these earbuds work with iPhone?", "Yes. Every pair in this guide pairs over Bluetooth with both iPhone and Android phones."],
    ["What is the difference between ANC and ENC?", "ANC reduces the noise you hear while listening. ENC reduces the background noise the other person hears during a call."],
    ["Can I check the earbuds before paying?", "You pay the rider when the parcel arrives (Cash on Delivery). If anything is faulty, send us your unboxing video within 7 days and we replace it free."],
  ],
},
{
  handle: "load-shedding-essentials",
  title: "Load-Shedding Survival Kit: Power Banks, Emergency Bulbs & Backup Light (2026)",
  seoTitle: "Load-Shedding Kit: Best Power Bank & Emergency Bulb",
  description: "Long power cuts in Pakistan? Here's how to choose an emergency bulb and power bank that actually last — backup hours, mAh explained and our top picks.",
  excerpt: "How many hours of backup do you need, what mAh really means, and the affordable kit that keeps your lights and phone alive.",
  cover: "sp-oknew-bulb",
  readTime: 7,
  collections: ["home-kitchen", "security-lighting", "mobile-accessories"],
  quickAnswer: "For light, get the <b>WEGO WG-611</b> if your outages are long (up to 9.5 hours on low) or the <b>OKNEW 5W</b> for shorter cuts (3–4 hours). For your phone, the <b>G-Golden GP-07 30,000mAh</b> charges a typical phone several times and has cables built in. Total kit: under Rs 9,500 — far less than a UPS.",
  picks: [
    ["sp-wego-bulb", "Longest backup light (up to 9.5h)"],
    ["sp-oknew-bulb", "Simple plug-and-forget bulb"],
    ["sp-gp07-powerbank", "Keep phones charged for days"],
    ["sp-orange-cable", "Spare tough charging cable"],
  ],
  sections: [
    ["Why not just buy a UPS?", `
      <p>A UPS and battery can run fans and lights, but it costs tens of thousands, needs installation and space, and its battery wears out. For many homes — especially rented flats, hostels and shops — a couple of rechargeable bulbs and a big power bank cover the essentials (light and a working phone) for a fraction of the price, with zero wiring.</p>`],
    ["How does a rechargeable emergency bulb work?", `
      <p>It screws into a normal E27 holder like any bulb. While electricity is on, it lights up <i>and</i> charges its internal battery. When the power cuts out, it switches to battery automatically — as long as your wall switch is left <b>on</b>.</p>
      <p><b>Tip:</b> put one in the kitchen and one where the family sits in the evening. Those are the two places a sudden blackout hurts most.</p>`],
    ["Which emergency bulb should I buy?", `
      <p><b>Long or frequent outages?</b> {{link:sp-wego-bulb}} lets you choose brightness with your wall switch: 100% for up to 2.5 hours, 50% for 4.5 hours, or 25% for up to 9.5 hours. It also charges over Type-C, so you can top it up from a power bank.</p>
      <p><b>Shorter cuts and want it simple?</b> {{link:sp-oknew-bulb}} gives 3–4 hours of bright cool-white light with replaceable batteries, so it keeps going for years.</p>
      {{cards:sp-wego-bulb,sp-oknew-bulb}}`],
    ["How much mAh do I need in a power bank?", `
      <p>Most smartphones have a 4,000–5,000mAh battery. Because some energy is lost while charging, a power bank delivers roughly 60–70% of its rated capacity. So:</p>
      <table class="specs"><tbody>
        <tr><th>10,000mAh</th><td>about 1–1.5 phone charges</td></tr>
        <tr><th>20,000mAh</th><td>about 2.5–3 phone charges</td></tr>
        <tr><th>30,000mAh</th><td>about 4 or more phone charges</td></tr>
      </tbody></table>
      <p>For multi-hour outages or a whole family sharing, 30,000mAh is the sweet spot. Also look for <b>at least 18–20W fast charging (PD)</b> so a top-up doesn't take forever.</p>
      <p>{{link:sp-gp07-powerbank}} ticks every box: 30,000mAh, 22.5W fast charging, a digital battery display and built-in Type-C, Lightning and USB cables — nobody has to hunt for a wire in the dark.</p>
      {{cards:sp-gp07-powerbank}}`],
    ["What else should be in a load-shedding kit?", `
      <ul>
        <li>A spare, tough charging cable such as the {{link:sp-orange-cable|braided USB-C cable}} — cheap cables are always the first thing to fail.</li>
        <li>A WiFi camera with its own battery, like the {{link:sp-bk530-camera|V380 BK-530}}, if you want to keep watching your home or shop when the power goes. See our {{guide:wifi-security-camera-buying-guide|camera buying guide}}.</li>
        <li>Charge everything the moment power returns, and keep bulbs switched on so they stay topped up.</li>
      </ul>
      {{cards:sp-orange-cable,sp-white-cable}}`],
  ],
  faqs: [
    ["Do I need to switch the emergency bulb on during a power cut?", "Leave the wall switch ON all the time. The bulb charges while electricity is on and lights up automatically from its battery when the power goes."],
    ["How many times will a 30,000mAh power bank charge my phone?", "Roughly four or more full charges for a typical 4,000–5,000mAh phone, depending on the phone and cable."],
    ["Can I charge the WEGO bulb from a power bank?", "Yes — it has a Type-C port, so you can charge it from any USB charger or power bank."],
    ["Is a power bank safe to leave charging overnight?", "The GP-07 has overcharge, overheating and short-circuit protection. As with any battery, keep it on a hard surface away from heat."],
  ],
},
{
  handle: "wifi-security-camera-buying-guide",
  title: "How to Choose a WiFi Security Camera for Your Home or Shop in Pakistan",
  seoTitle: "WiFi Security Camera Buying Guide (Pakistan)",
  description: "Plug-in or battery? Do you need a memory card? Will it work in load shedding? A simple guide to choosing and setting up a WiFi camera in Pakistan.",
  excerpt: "Plug-in vs battery, memory cards, night vision, and how to keep watching during load shedding — explained simply.",
  cover: "sp-v380-wifi",
  readTime: 5,
  collections: ["home-kitchen", "security-lighting"],
  quickAnswer: "Choose the <b>V380 WiFi Camera</b> (Rs 3,999) for a fixed spot like a room, gate view or shop counter — it has night vision, motion alerts and two-way audio. Choose the <b>V380 BK-530</b> (Rs 4,300) if you need to move it around or place it where there's no socket — it has a built-in battery. Both work with the free V380 app.",
  picks: [
    ["sp-v380-wifi", "Fixed spot · night vision · two-way talk"],
    ["sp-bk530-camera", "Wire-free · place anywhere"],
  ],
  sections: [
    ["What can a WiFi camera actually do?", `
      <p>A WiFi camera connects to your home internet and streams live video to your phone — from the office, a relative's house or abroad. You can watch kids coming home from school, check on elderly parents, keep an eye on a maid or a shop counter, and get a notification the moment it sees movement.</p>`],
    ["Plug-in or battery camera — which is better?", `
      <p><b>Plug-in cameras</b> like the {{link:sp-v380-wifi}} are best for a permanent spot. They run 24/7, add <b>infrared night vision</b> and <b>two-way audio</b> (you can talk through the camera), and come with a wall-mount kit.</p>
      <p><b>Battery cameras</b> like the {{link:sp-bk530-camera}} run without a cable, so you can put them on a shelf, near a cot or on a counter in seconds — and move them whenever you like. You can still plug it in for 24/7 use.</p>
      {{cards:sp-v380-wifi,sp-bk530-camera}}`],
    ["Do I need a memory card?", `
      <p>Not for live viewing — that works straight away. If you want to <b>save recordings</b> to watch later, add a microSD (TF) card. The V380 WiFi Camera supports cards up to 64GB. A 32GB card is plenty for most homes because the camera overwrites old footage automatically.</p>`],
    ["Will it work during load shedding?", `
      <p>A camera needs both power and WiFi. During a power cut:</p>
      <ul>
        <li>The <b>BK-530</b> keeps running on its own battery.</li>
        <li>A plug-in camera can run from a power bank such as the {{link:sp-gp07-powerbank|G-Golden 30,000mAh}} using its USB cable.</li>
        <li>Your WiFi router also needs backup power — many people run it from a small UPS or a router power bank.</li>
      </ul>
      <p>More ideas in our {{guide:load-shedding-essentials|load-shedding survival kit}}.</p>`],
    ["How do I set it up?", `
      <ol>
        <li>Install the free <b>V380</b> app (Android or iPhone).</li>
        <li>Power on the camera and connect your phone to your <b>2.4GHz</b> WiFi (most home routers have this).</li>
        <li>Add the camera in the app by scanning its QR code and follow the steps.</li>
        <li><b>Change the default password</b> straight away — this is the single most important privacy step.</li>
        <li>Mount it high, pointing at entrances or the area you care about, and avoid facing bright windows.</li>
      </ol>`],
  ],
  faqs: [
    ["Does a WiFi camera need internet all the time?", "Yes, to view it from your phone. Without internet, it can still record to a memory card if one is installed."],
    ["Will it work with 5GHz WiFi?", "Use the 2.4GHz network — most routers broadcast both. 2.4GHz also reaches further through walls."],
    ["Can I watch the camera from abroad?", "Yes. As long as the camera is online, you can watch from anywhere in the world through the V380 app."],
    ["Is it legal to use a camera at home or in my shop?", "Cameras in your own home or shop are common. Avoid pointing them into neighbours' private spaces and let staff know if they're being recorded."],
  ],
},
{
  handle: "hair-brush-guide",
  title: "Which Hair Brush Is Right for You? A Simple Guide by Hair Type",
  seoTitle: "Which Hair Brush Should I Use? Guide by Hair Type",
  description: "Detangling, vented, paddle or round? Find the right hair brush for your hair type — plus how to brush wet hair without breakage and a scalp-oiling tip.",
  excerpt: "Vented, paddle, round or teardrop — match the brush to your hair and stop the tangles, breakage and frizz.",
  cover: "sp-vented-brush",
  readTime: 5,
  collections: ["beauty-care", "hair-care"],
  quickAnswer: "Tangles and wet hair: <b>Vented Detangling Brush</b>. Kids or sensitive scalp: <b>Teardrop Detangling Brush</b>. Long, thick hair and shine: <b>Cushion Paddle Brush</b>. Volume and curls when blow-drying: <b>Round Styling Brush</b>. Weekly oiling without the mess: <b>XC-901 Oil Dispensing Massage Comb</b>.",
  picks: [
    ["sp-vented-brush", "Tangles · wet hair · faster drying"],
    ["sp-teardrop-brush", "Kids · sensitive scalps · travel"],
    ["sp-cushion-brush", "Long, thick hair · shine"],
    ["sp-round-brush", "Blow-dry volume & curls"],
    ["sp-xc901-comb", "Mess-free hair oiling"],
  ],
  sections: [
    ["Why does the right brush matter?", `
      <p>Most breakage and frizz isn't caused by your hair — it's caused by forcing the wrong brush through it. A brush that flexes with knots instead of ripping through them means less hair on the floor and smoother results.</p>`],
    ["Best brush for tangles and wet hair", `
      <p>Wet hair is at its most fragile. {{link:sp-vented-brush}} has flexible bristles that bend around knots, and an open vented design so blow-dryer air passes through — your hair dries faster with less heat. Always start at the ends and work upwards.</p>
      {{cards:sp-vented-brush}}`],
    ["Best brush for kids and sensitive scalps", `
      <p>No handle, no tugging. {{link:sp-teardrop-brush}} sits in your palm, so you naturally use gentle pressure, and its two-length teeth tease out knots instead of pulling. It ends the morning brushing battle — and fits in a school bag.</p>
      {{cards:sp-teardrop-brush}}`],
    ["Best brush for long, thick hair", `
      <p>A wide {{link:sp-cushion-brush|cushion paddle brush}} covers more hair per stroke and its soft base flexes as you brush, giving your scalp a light massage that spreads natural oils for shine. Use it on dry hair.</p>
      {{cards:sp-cushion-brush}}`],
    ["Best brush for volume and curls", `
      <p>For a salon-style blow-dry, wrap sections around a {{link:sp-round-brush|round styling brush}} and lift from the roots while drying. Point the dryer down the hair shaft to reduce frizz.</p>
      {{cards:sp-round-brush}}`],
    ["What about hair oiling?", `
      <p>Oiling works best at the roots, but it's messy and wastes oil. The {{link:sp-xc901-comb}} releases oil directly onto your scalp while 72 bristles massage it in. Splashproof and Type-C rechargeable.</p>
      {{cards:sp-xc901-comb}}`],
  ],
  faqs: [
    ["Should I brush my hair wet or dry?", "Both are fine with the right brush. For wet hair, use a flexible detangling brush (Vented or Teardrop) and start from the ends."],
    ["How often should I clean my hair brush?", "Remove loose hair every few days and wash the brush with mild shampoo and water every 1–2 weeks."],
    ["Which brush is best for curly hair?", "A flexible detangling brush like the Vented or Teardrop works through curls gently, ideally on damp hair with conditioner."],
    ["How often should I oil my hair?", "Once or twice a week suits most people. Apply to the scalp, massage, and wash out after a few hours or the next morning."],
  ],
},
{
  handle: "islamic-gift-ideas",
  title: "Islamic Gift Ideas for Ramadan, Eid & Umrah — For Every Budget",
  seoTitle: "Islamic Gift Ideas for Ramadan, Eid & Umrah",
  description: "Thoughtful Islamic gifts for parents, friends and kids: digital tasbih, Azan clocks, pearl tasbih gift boxes and Eidi ideas — from under Rs 500.",
  excerpt: "Meaningful gifts for parents, friends and kids — from Rs 349 tasbih gift boxes to Azan reminders they'll use every day.",
  cover: "sp-azan-counter",
  readTime: 5,
  collections: ["islamic-gifts", "islamic-essentials", "gifts-toys"],
  quickAnswer: "For parents and elders: the <b>AL-Fatiha Azan & Digital Tasbih</b> (Rs 1,850) — it plays the Azan and shows prayer times. For friends, colleagues and bulk giveaways: the <b>Pearl Tasbih & Counter Gift Box</b> (Rs 349, 12 colours). For travellers: the <b>Digital Tasbih with Qibla Compass</b> (Rs 799). For kids' Eidi: the <b>Racing Toy Cars Set</b> or a <b>Mini Fidget Spinner pair</b>.",
  picks: [
    ["sp-azan-counter", "Parents & elders"],
    ["sp-pearl-tasbih", "Friends · giveaways · weddings"],
    ["sp-tasbih-compass", "Travellers & Umrah"],
    ["sp-toy-cars", "Kids' Eidi"],
    ["sp-heart-keychain", "Small gift for sisters & friends"],
  ],
  sections: [
    ["What makes a good Islamic gift?", `
      <p>The best gifts are the ones that get used every day and carry a little reward with them. Something that helps with dhikr or reminds someone of prayer time is both personal and practical — and it doesn't need to be expensive.</p>`],
    ["For parents and grandparents", `
      <p>{{link:sp-azan-counter}} is a digital tasbih that also <b>plays the Azan at prayer times</b> and shows Athan timings for over 6,000 cities, plus Hijri and Gregorian dates. It arrives in a gift box — a present they'll reach for five times a day.</p>
      {{cards:sp-azan-counter}}`],
    ["For friends, colleagues and bulk Eid gifts", `
      <p>At Rs 349, the {{link:sp-pearl-tasbih}} looks far more expensive than it is: a pearl tasbih with gold accents and a matching digital counter in a display box. With 12 colours you can match personalities — or order a mix for Eid gatherings, weddings and Aqeeqah giveaways. Need a larger quantity? <a href="{{wa}}">Message us on WhatsApp</a>.</p>
      {{cards:sp-pearl-tasbih}}`],
    ["For travellers and anyone going for Umrah", `
      <p>The {{link:sp-tasbih-compass}} counts dhikr on a clear LCD, has an LED light for night use, and a <b>built-in compass</b> to help find the Qibla in hotels and unfamiliar places.</p>
      {{cards:sp-tasbih-compass}}`],
    ["Eidi ideas for kids", `
      <p>Pair your Eidi envelope with something fun: the {{link:sp-toy-cars|12-piece racing cars set}} for little racers, or a {{link:sp-fidget-spinner|pair of metal fidget spinners}} for older kids. For sisters and friends, a sparkling {{link:sp-heart-keychain|gold heart keychain}} is a sweet touch under Rs 300.</p>
      {{cards:sp-toy-cars,sp-fidget-spinner,sp-heart-keychain,sp-flower-keychain}}`],
    ["When should I order for Eid?", `
      <p>Delivery takes 2–4 working days across Pakistan, and couriers get busy in the last week before Eid. Order at least <b>7–10 days before Eid</b> to be safe. You can pay cash on delivery.</p>`],
  ],
  faqs: [
    ["What is a good Islamic gift for my mother or father?", "A digital tasbih with Azan reminders, like the AL-Fatiha Azan & Digital Tasbih Counter, is useful every day and comes gift-boxed."],
    ["What can I give in bulk for Eid or a wedding?", "The Pearl Tasbih & Digital Counter Gift Box at Rs 349 comes in 12 colours and in a display box — ideal for giveaways. Message us on WhatsApp for larger quantities."],
    ["How early should I order Eid gifts?", "Order 7–10 days before Eid. Standard delivery is 2–4 working days, and couriers are busiest just before Eid."],
    ["Can I send a gift directly to someone else?", "Yes — just enter their name, number and address at checkout, and mention it is a gift in the order notes."],
  ],
},
];
