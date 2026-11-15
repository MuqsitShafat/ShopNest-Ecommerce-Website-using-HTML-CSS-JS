/* ============================================================
   ShopNest — checkout.js (cart/)
   One-page checkout. Saves orders to Firestore (same schema the
   admin panel & tracker read), emails the admin via EmailJS and
   offers a WhatsApp confirmation.
   ============================================================ */
(function () {
  "use strict";
  const { Cart, money, esc, toast, lineHTML, bindLines, paintShip, RULES, BASE } = window.SN;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------- backend config (unchanged from previous site) ---------- */
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyC5dKkXC0QzbtrzSsYoZY-V38Y3MS8WDIQ",
    authDomain: "shopnest-e2d57.firebaseapp.com",
    projectId: "shopnest-e2d57",
    storageBucket: "shopnest-e2d57.firebasestorage.app",
    messagingSenderId: "171603675621",
    appId: "1:171603675621:web:94dacd14762cc7494b870c",
  };
  const EMAILJS_PUBLIC_KEY = "Wyup2APERv9Bi74sF";
  const EMAILJS_SERVICE_ID = "service_o2czoas";
  const EMAILJS_TEMPLATE_ID = "template_gzwqgho";
  const ADMIN_EMAIL = "shopnest260@gmail.com";

  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

  async function firestore() {
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js");
    const fsMod = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js");
    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    return { ...fsMod, db: fsMod.getFirestore(app) };
  }
  async function saveOrderToFirestore(orderData) {
    const { db, collection, addDoc } = await firestore();
    await addDoc(collection(db, "orders"), orderData);
  }

  const colorText = (i) => {
    const list = Array.isArray(i.colors) && i.colors.length ? [...new Set(i.colors)] : i.color ? [i.color] : [];
    return list.length ? list.join(", ") : "Standard";
  };

  function adminMessage(o) {
    const items = o.items.map((i) => `• ${i.qty}x ${i.name} (${colorText(i)})`).join("\n");
    return (
      `*SHOPNEST — NEW ORDER: ${o.orderId}*\n\n` +
      `*Customer Details:*\n--------------------------\n` +
      `*Name:* ${o.customer.name}\n*Phone:* ${o.customer.phone}\n*City:* ${o.customer.city}\n*Address:* ${o.customer.street}\n*Payment:* ${o.paymentMethod}\n\n` +
      `*Subtotal:* PKR ${o.subtotal.toLocaleString()}\n` +
      `*Delivery:* ${o.shipping ? `PKR ${o.shipping}` : "FREE"}\n` +
      (o.codFee ? `*COD Fee:* PKR ${o.codFee}\n` : "") +
      (o.notes ? `*Notes:* ${o.notes}\n` : "") +
      `*Items Ordered:*\n${items}\n\n*Total Amount:* PKR ${o.total.toLocaleString()}\n--------------------------\n\n` +
      (o.paymentMethod === "Online Payment" ? `*I have sent the payment — screenshot attached.*` : `*Please confirm my order. Thank you!*`)
    );
  }

  async function notifyAdminByEmail(o) {
    if (typeof emailjs === "undefined") return;
    emailjs.init(EMAILJS_PUBLIC_KEY);
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      order_id: o.orderId,
      customer_name: o.customer.name,
      customer_phone: o.customer.phone,
      customer_address: `${o.customer.street}, ${o.customer.city}`,
      payment_method: o.paymentMethod,
      total_amount: `PKR ${o.total.toLocaleString()}`,
      subtotal: `PKR ${o.subtotal.toLocaleString()}`,
      delivery_fee: o.shipping ? `PKR ${o.shipping}` : "FREE",
      cod_fee: o.codFee ? `PKR ${o.codFee}` : "None",
      order_items: o.items.map((i) => `• ${i.qty}x ${i.name} (${colorText(i)})`).join("\n"),
      admin_email: ADMIN_EMAIL,
    });
  }

  /* ---------- elements ---------- */
  const elEmpty = $("#cart-empty");
  const elCheckout = $("#checkout");
  const elLines = $("#cart-lines");
  const elSuccess = $("#order-success");
  const form = $("#checkout-form");
  const btn = $("#place-order-btn");
  const sticky = $("#sticky-checkout");
  const cityInput = $("#addr-city");
  const provinceSel = $("#addr-province");

  let payment = "cod";
  let colorMap = {};
  let placing = false;

  /* colour options per product (for in-cart colour change) */
  window.SN.loadCatalog().then((list) => {
    list.forEach((p) => { if (p.colors && p.colors.length > 1) colorMap[p.id] = p.colors.map((c) => c.name); });
    render();
  });

  /* ---------- location-based pricing (bundle deals) ---------- */
  const isLahore = (city) => /^lahore\b/i.test((city || "").trim());
  function applyLocationPricing() {
    const city = cityInput.value.trim();
    if (!city) return;
    const list = Cart.get();
    let changed = false;
    list.forEach((i) => {
      if (!i.lp) return;
      const p = isLahore(city) ? i.lp.lahore : i.lp.other;
      if (i.price !== p) { i.price = p; changed = true; }
    });
    if (changed) Cart.save(list);
  }

  /* ---------- totals ---------- */
  // COD: delivery fee below the free-delivery line + flat COD fee. Online: FREE delivery + no COD fee, any amount.
  function totals() {
    const subtotal = Cart.subtotal();
    const codShipping = subtotal === 0 || subtotal >= RULES.free ? 0 : RULES.ship;
    const codCost = subtotal > 0 ? codShipping + RULES.cod : 0; // what Cash on Delivery adds on top of the items
    const online = payment === "online";
    const shipping = online ? 0 : codShipping;
    const codFee = subtotal > 0 && !online ? RULES.cod : 0;
    return { subtotal, shipping, codFee, codShipping, onlineSaving: codCost, total: subtotal + shipping + codFee };
  }

  function render() {
    if (elSuccess && !elSuccess.hidden) return;
    const items = Cart.get();
    if (!items.length) {
      elEmpty.hidden = false;
      elCheckout.hidden = true;
      sticky.hidden = true;
      return;
    }
    elEmpty.hidden = true;
    elCheckout.hidden = false;
    sticky.hidden = false;
    $("#item-count").textContent = `(${Cart.count()})`;
    elLines.innerHTML = items.map((i) => lineHTML(i, { colorOptions: colorMap[i.id.replace(/-\d+$/, "")] || colorMap[i.id] })).join("") + (window.SN.upsellHTML ? window.SN.upsellHTML(3) : "");
    const t = totals();
    paintShip($("#checkout-ship"), t.subtotal);
    $("#summary-subtotal").textContent = money(t.subtotal);
    $("#summary-shipping").innerHTML = t.shipping ? money(t.shipping) : '<span style="color:var(--ok)">FREE</span>';
    $("#cod-fee-row").hidden = !t.codFee;
    $("#summary-cod").textContent = money(RULES.cod);
    $("#summary-total").textContent = money(t.total);
    $("#sticky-total").textContent = money(t.total);
    if (!placing) btn.lastChild.textContent = " Place Order · " + money(t.total);
    // payment options show what each method costs for this order
    const codNote = $("#pay-cod-note");
    if (codNote) codNote.textContent = `– ${t.codShipping ? money(t.codShipping) + " delivery" : "FREE delivery"} + ${money(RULES.cod)} COD fee`;
    const saveBadge = $("#pay-online-save");
    if (saveBadge) saveBadge.textContent = "Save " + money(t.onlineSaving);
    const hint = $("#summary-hint");
    hint.className = payment === "cod" ? "summary-hint is-ok is-tip" : "summary-hint is-ok";
    hint.innerHTML = payment === "cod"
      ? `💡 Pay online and get <b>FREE delivery + NO COD fee</b> – save ${money(t.onlineSaving)}!`
      : `✅ FREE delivery + NO COD fee – you're saving <b>${money(t.onlineSaving)}</b> by paying online.`;
  }
  bindLines(elLines);
  document.addEventListener("cart:change", render);
  (() => { // InitiateCheckout once when the checkout page opens with items
    const items = Cart.get();
    if (items.length && window.SN.track) window.SN.track("InitiateCheckout", { content_ids: items.map((i) => i.id), contents: items.map((i) => ({ id: i.id, quantity: i.qty })), content_type: "product", num_items: Cart.count(), value: Cart.subtotal(), currency: "PKR" });
  })();

  /* ---------- payment method ---------- */
  $$('input[name="payment"]').forEach((r) =>
    r.addEventListener("change", () => {
      payment = r.value;
      $("#pay-accounts").hidden = payment !== "online";
      $("#pay-reassure").textContent = payment === "online" ? "✓ Send payment, place your order, then WhatsApp us the screenshot." : "✓ Pay when your order arrives.";
      render();
      scheduleLead();
    })
  );
  $$(".copy").forEach((b) =>
    b.addEventListener("click", () => {
      const v = b.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast("Copied: " + v), () => toast("Couldn't copy", "error"));
    })
  );

  /* ---------- remember details for returning customers ---------- */
  const FIELDS = ["name", "phone", "city", "province", "street"];
  try {
    const saved = JSON.parse(localStorage.getItem("sn_checkout") || "{}");
    FIELDS.forEach((f) => { if (saved[f] && form.elements[f]) form.elements[f].value = saved[f]; });
  } catch (e) { /* ignore */ }

  const PROVINCE_BY_CITY = { lahore: "Punjab", faisalabad: "Punjab", rawalpindi: "Punjab", multan: "Punjab", gujranwala: "Punjab", sialkot: "Punjab", bahawalpur: "Punjab", sargodha: "Punjab", sahiwal: "Punjab", sheikhupura: "Punjab", gujrat: "Punjab", "rahim yar khan": "Punjab", kasur: "Punjab", okara: "Punjab", jhelum: "Punjab", "dera ghazi khan": "Punjab", "wah cantt": "Punjab", chiniot: "Punjab", kamoke: "Punjab", karachi: "Sindh", hyderabad: "Sindh", sukkur: "Sindh", larkana: "Sindh", peshawar: "KPK", abbottabad: "KPK", mardan: "KPK", quetta: "Balochistan", islamabad: "Islamabad (Capital)", mirpur: "Azad Kashmir", muzaffarabad: "Azad Kashmir" };
  cityInput.addEventListener("change", () => {
    const p = PROVINCE_BY_CITY[cityInput.value.trim().toLowerCase()];
    if (p && !provinceSel.value) provinceSel.value = p;
    applyLocationPricing();
  });
  cityInput.addEventListener("input", applyLocationPricing);

  /* ---------- validation ---------- */
  function normalizePhone(v) {
    let d = String(v).replace(/[^\d+]/g, "");
    if (d.startsWith("+92")) d = "0" + d.slice(3);
    else if (d.startsWith("0092")) d = "0" + d.slice(4);
    else if (d.startsWith("92") && d.length === 12) d = "0" + d.slice(2);
    else if (d.startsWith("3") && d.length === 10) d = "0" + d;
    return d;
  }
  function setInvalid(el, msg) {
    const field = el.closest(".field");
    field.classList.add("is-invalid");
    const err = field.querySelector(".field-err");
    if (err) err.textContent = msg || "";
  }
  form.addEventListener("input", (e) => {
    const field = e.target.closest(".field");
    if (field) { field.classList.remove("is-invalid"); const err = field.querySelector(".field-err"); if (err) err.textContent = ""; }
  });
  function validate() {
    const f = form.elements;
    const bad = [];
    if (f.name.value.trim().length < 2) bad.push([f.name]);
    const phone = normalizePhone(f.phone.value);
    if (!/^03\d{9}$/.test(phone)) bad.push([f.phone, "Enter a valid mobile number, e.g. 0300 1234567"]);
    if (f.city.value.trim().length < 2) bad.push([f.city]);
    if (!f.province.value) bad.push([f.province]);
    if (f.street.value.trim().length < 5) bad.push([f.street]);
    bad.forEach(([el, msg]) => setInvalid(el, msg));
    if (bad.length) {
      toast("Please complete your delivery details", "error");
      bad[0][0].scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => bad[0][0].focus({ preventScroll: true }), 350);
      return null;
    }
    return {
      name: f.name.value.trim(), phone, street: f.street.value.trim(), city: f.city.value.trim(), province: f.province.value,
      notes: f.notes.value.trim(),
    };
  }

  /* ---------- abandoned checkouts ----------
     Once a valid number (03XXXXXXXXX) is typed, save the cart as a lead so we can follow up on WhatsApp.
     One document per phone number (the number is the document ID), updated as details change.
     When the order is placed the lead is marked "converted" and drops out of the admin list. */
  const LEAD_COLLECTION = "abandoned_checkouts";
  const LEAD_KEY = "sn_lead"; // { phone, createdAt }: keeps the first-seen time across updates
  let leadTimer = null, leadSig = "";
  const readLeadMeta = () => { try { return JSON.parse(localStorage.getItem(LEAD_KEY) || "{}"); } catch (e) { return {}; } };
  function leadPayload() {
    const f = form.elements;
    const phone = normalizePhone(f.phone.value);
    const items = Cart.get();
    if (!/^03\d{9}$/.test(phone) || !items.length) return null;
    return {
      name: f.name.value.trim().slice(0, 80),
      phone,
      city: f.city.value.trim().slice(0, 60),
      items: items.slice(0, 30).map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, color: i.color || null })),
      total: totals().total,
      paymentMethod: payment === "online" ? "Online Payment" : "Cash on Delivery",
      status: "abandoned",
    };
  }
  async function saveLead() {
    if (placing) return;
    const data = leadPayload();
    if (!data) return;
    const sig = JSON.stringify(data);
    if (sig === leadSig) return; // nothing changed since the last save
    const now = new Date().toISOString();
    let meta = readLeadMeta();
    if (meta.phone !== data.phone || !meta.createdAt) meta = { phone: data.phone, createdAt: now };
    try {
      const { db, doc, setDoc } = await firestore();
      await setDoc(doc(db, LEAD_COLLECTION, data.phone), { ...data, createdAt: meta.createdAt, updatedAt: now }, { merge: true });
      leadSig = sig;
      try { localStorage.setItem(LEAD_KEY, JSON.stringify(meta)); } catch (e) { /* ignore */ }
    } catch (err) { console.warn("Checkout lead not saved:", err && err.message); }
  }
  const scheduleLead = () => { clearTimeout(leadTimer); leadTimer = setTimeout(saveLead, 2000); };
  ["name", "phone", "city"].forEach((n) => form.elements[n].addEventListener("input", scheduleLead));
  document.addEventListener("cart:change", scheduleLead);
  async function convertLead(orderId) {
    clearTimeout(leadTimer);
    const phone = readLeadMeta().phone;
    if (!phone) return; // no lead was saved from this browser
    try { localStorage.removeItem(LEAD_KEY); } catch (e) { /* ignore */ }
    try {
      const { db, doc, setDoc } = await firestore();
      await setDoc(doc(db, LEAD_COLLECTION, phone), { status: "converted", orderId, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) { console.warn("Checkout lead not updated:", err && err.message); }
  }

  /* ---------- place order ---------- */
  const generateOrderId = () => `SN-${Math.floor(10000 + Math.random() * 90000)}`;

  async function placeOrder() {
    if (placing) return;
    const items = Cart.get();
    if (!items.length) return;
    const cust = validate();
    if (!cust) return;
    applyLocationPricing();

    const fresh = Cart.get();
    const t = totals();
    const orderData = {
      orderId: generateOrderId(),
      createdAt: new Date().toISOString(),
      status: "Pending",
      paymentMethod: payment === "online" ? "Online Payment" : "Cash on Delivery",
      customer: { name: cust.name, phone: cust.phone, street: cust.street, city: cust.city, province: cust.province },
      items: fresh.map((i) => ({
        id: i.id, name: i.name, price: i.price, qty: i.qty, total: i.price * i.qty,
        color: i.color || null, colors: Array.isArray(i.colors) && i.colors.length ? i.colors : null,
      })),
      subtotal: t.subtotal, shipping: t.shipping, codFee: t.codFee, total: t.total,
    };
    if (cust.notes) orderData.notes = cust.notes;

    placing = true;
    [btn, $("#sticky-place")].forEach((b) => { b.disabled = true; b.textContent = "Placing order…"; });

    try { localStorage.setItem("sn_checkout", JSON.stringify(Object.fromEntries(FIELDS.map((f) => [f, cust[f]])))); } catch (e) { /* ignore */ }

    clearTimeout(leadTimer);
    let saved = true;
    try { await withTimeout(saveOrderToFirestore(orderData), 15000); }
    catch (err) { saved = false; console.warn("Order not saved to Firestore:", err && err.message); }
    if (saved) convertLead(orderData.orderId); // runs in the background
    try { await withTimeout(notifyAdminByEmail(orderData), 8000); }
    catch (err) { console.warn("EmailJS failed:", err && err.message); }

    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "purchase", ecommerce: { transaction_id: orderData.orderId, value: orderData.total, currency: "PKR", items: orderData.items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.qty })) } });
      if (window.SN.track) window.SN.track("Purchase", { value: orderData.total, currency: "PKR", content_type: "product", content_ids: orderData.items.map((i) => i.id), contents: orderData.items.map((i) => ({ id: i.id, quantity: i.qty, item_price: i.price })), num_items: orderData.items.reduce((n, i) => n + i.qty, 0), order_id: orderData.orderId }, { eventID: orderData.orderId });
    } catch (e) { /* ignore */ }

    Cart.clear();
    showSuccess(orderData, fresh, saved);
  }

  function showSuccess(o, lines, saved) {
    const waUrl = `https://wa.me/${RULES.wa}?text=${encodeURIComponent(adminMessage(o))}`;
    elCheckout.hidden = true;
    sticky.hidden = true;
    $$(".checkout-steps li").forEach((li, i) => { li.className = i < 2 ? "is-done" : "is-active"; });
    $(".checkout-head h1").textContent = "Order placed";
    elSuccess.innerHTML = `<div class="card">
      <div class="success-ic"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
      <h2>Thank you, ${esc(o.customer.name.split(" ")[0])}! 🎉</h2>
      <p class="muted">Your order has been placed. Your Order ID is:</p>
      <div class="order-id">${esc(o.orderId)}</div>
      <p>We'll call or WhatsApp you on <b>${esc(o.customer.phone)}</b> to confirm. Delivery in <b>2–4 working days</b>.</p>
      <div class="success-lines">
        ${lines.map((i) => `<div><span>${i.qty} × ${esc(i.name)}${i.color ? ` <em class="muted">(${esc(i.color)})</em>` : ""}</span><b>${money(i.price * i.qty)}</b></div>`).join("")}
        <div style="border-top:1px dashed var(--line);margin-top:.3rem;padding-top:.5rem"><span>Delivery</span><b>${o.shipping ? money(o.shipping) : "FREE"}</b></div>
        ${o.codFee ? `<div><span>COD fee</span><b>${money(o.codFee)}</b></div>` : ""}
        <div><span>Total (${esc(o.paymentMethod)})</span><b>${money(o.total)}</b></div>
      </div>
      <div class="success-box">
        <p><b>${o.paymentMethod === "Online Payment" ? "📲 Send your payment screenshot" : "⚡ Get faster confirmation"}</b><br>
        ${o.paymentMethod === "Online Payment" ? `Please send ${money(o.total)} to one of our accounts and share the screenshot with us on WhatsApp so we can dispatch your order.` : "Tap below to send your order details to our team on WhatsApp for quicker processing."}</p>
        <a class="btn btn-wa btn-lg btn-block" href="${waUrl}" target="_blank" rel="noopener">Confirm on WhatsApp</a>
      </div>
      ${saved ? "" : `<p class="summary-hint">We couldn't reach our server — please tap “Confirm on WhatsApp” so we receive your order.</p>`}
      <div class="success-actions">
        <a class="btn btn-outline btn-block" href="${BASE}track-order/">Track your order</a>
        <a class="btn btn-primary btn-block" href="${BASE}shop/">Continue shopping</a>
      </div>
    </div>`;
    elSuccess.hidden = false;
    // Below the thank-you box, keep the product suggestions but drop the "cart is empty" wording
    elEmpty.hidden = false;
    elEmpty.classList.add("after-order");
    $("#cart-empty-title").textContent = "Need anything else?";
    $("#cart-empty-sub").textContent = "Customers also love these:";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  btn.addEventListener("click", placeOrder);
  $("#sticky-place").addEventListener("click", placeOrder);
  form.addEventListener("submit", (e) => { e.preventDefault(); placeOrder(); });

  render();
  scheduleLead(); // returning customers arrive with their number already filled in
})();
