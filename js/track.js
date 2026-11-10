/* ============================================================
   ShopNest — track.js (track-order/)  [ES module]
   Looks up orders in Firestore by Order ID or phone number.
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, limit } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyC5dKkXC0QzbtrzSsYoZY-V38Y3MS8WDIQ",
  authDomain: "shopnest-e2d57.firebaseapp.com",
  projectId: "shopnest-e2d57",
  storageBucket: "shopnest-e2d57.firebasestorage.app",
  messagingSenderId: "171603675621",
  appId: "1:171603675621:web:94dacd14762cc7494b870c",
}, "track-order-app");
const db = getFirestore(app);

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const money = (n) => "Rs " + Number(n || 0).toLocaleString("en-US");
const input = $("#track-input");
const btn = $("#track-btn");
const results = $("#track-results");
const errBox = $("#track-error");
let mode = "id";

document.querySelectorAll('input[name="track-mode"]').forEach((r) =>
  r.addEventListener("change", () => {
    mode = r.value;
    input.value = "";
    input.placeholder = mode === "id" ? "e.g. SN-98234" : "e.g. 0328 4430589";
    input.inputMode = mode === "id" ? "text" : "tel";
    results.innerHTML = "";
    errBox.hidden = true;
    input.focus();
  })
);

const params = new URLSearchParams(location.search);
if (params.get("order")) input.value = params.get("order");

function phoneVariants(v) {
  const raw = v.trim();
  let d = raw.replace(/[^\d]/g, "");
  if (d.startsWith("0092")) d = d.slice(4);
  if (d.startsWith("92") && d.length === 12) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  const local = "0" + d; // 03001234567
  const set = new Set([raw, local, "+92" + d, "92" + d, local.slice(0, 4) + "-" + local.slice(4), local.slice(0, 4) + " " + local.slice(4)]);
  return [...set].slice(0, 10);
}

function showError(title, sub) {
  $("#track-error-msg").textContent = title;
  $("#track-error-sub").textContent = sub || "";
  errBox.hidden = false;
}

const STAGES = { Pending: 0, Processing: 1, Shipped: 2, Delivered: 3 };

function orderCard(o) {
  const status = o.status || "Pending";
  const stage = STAGES[status] ?? 0;
  const cancelled = status === "Cancelled";
  const date = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" }) : "—";
  const c = o.customer || {};
  const steps = document.getElementById("track-steps-tpl").content.cloneNode(true).firstElementChild;
  if (!cancelled) {
    steps.style.setProperty("--progress", String(stage / 3));
    steps.querySelectorAll(".step").forEach((s, i) => s.classList.add(i < stage ? "is-done" : i === stage ? "is-current" : "x"));
    if (stage === 3) steps.querySelectorAll(".step")[3].classList.add("is-done");
  }
  const items = (o.items || []).map((i) => `<div><span>${esc(i.qty)} × ${esc(i.name)}${i.color ? ` <em class="muted">(${esc(i.color)})</em>` : ""}</span><b>${money(i.total || i.price * i.qty)}</b></div>`).join("");
  return `<div class="card track-result">
    <div class="track-result-head"><div><h3>${esc(o.orderId || "—")}</h3><span class="muted small">Placed on ${esc(date)}</span></div>
      <span class="status status-${esc(status.toLowerCase().replace(/\s/g, ""))}">${esc(status)}</span></div>
    ${cancelled ? `<p class="summary-hint">This order was cancelled. Contact us on WhatsApp if you have questions.</p>` : steps.outerHTML}
    <div class="track-info">
      <div><span>Customer</span>${esc(c.name || "—")}</div>
      <div><span>Payment</span>${esc(o.paymentMethod || "—")}</div>
      <div class="full"><span>Delivery address</span>${esc([c.street, c.city, c.province].filter(Boolean).join(", ") || "—")}</div>
      <div><span>Total</span><b>${o.total ? money(o.total) : "—"}</b></div>
    </div>
    ${items ? `<div class="track-items">${items}</div>` : ""}
  </div>`;
}

async function track(e) {
  e && e.preventDefault();
  const val = input.value.trim();
  results.innerHTML = "";
  errBox.hidden = true;
  if (!val) { showError("Please enter an Order ID or phone number."); return; }
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = "Searching…";
  try {
    const q = mode === "id"
      ? query(collection(db, "orders"), where("orderId", "==", val.toUpperCase().replace(/\s/g, "")), limit(1))
      : query(collection(db, "orders"), where("customer.phone", "in", phoneVariants(val)), limit(20));
    const snap = await getDocs(q);
    if (snap.empty) {
      showError(`No order found for “${val}”`, mode === "id" ? "Please double-check your Order ID — it looks like SN-75117." : "Please check the number you used when ordering, or try your Order ID.");
    } else {
      const orders = snap.docs.map((d) => d.data()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      results.innerHTML = (orders.length > 1 ? `<p class="muted" style="margin-top:1rem">Found ${orders.length} orders:</p>` : "") + orders.map(orderCard).join("");
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (err) {
    console.error("Track order error:", err);
    showError("We couldn't check your order right now.", "Please check your internet connection and try again, or message us on WhatsApp.");
  }
  btn.disabled = false;
  btn.innerHTML = orig;
}

$("#track-form").addEventListener("submit", track);
if (input.value) track();
