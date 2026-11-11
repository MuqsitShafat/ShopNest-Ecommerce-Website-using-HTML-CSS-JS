/* ============================================================
   ShopNest — product.js (product detail pages)
   ============================================================ */
(function () {
  "use strict";
  const { Cart, money, toast, openCart, bump, BASE } = window.SN;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------- gallery ---------- */
  const main = $("#gallery-main");
  const thumbs = $$(".gallery-thumbs button");
  const dots = $$(".gallery-dots i");
  const slides = main ? $$("figure", main) : [];
  let current = 0;
  function goTo(i, smooth = true) {
    if (!main || !slides.length) return;
    const next = (i + slides.length) % slides.length;
    if (Math.abs(next - current) > 1) smooth = false; // jump straight to a colour photo instead of sliding past others
    current = next;
    main.scrollTo({ left: current * main.clientWidth, behavior: smooth ? "smooth" : "auto" });
    mark();
  }
  function mark() {
    thumbs.forEach((t, i) => t.classList.toggle("is-active", i === current));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
  }
  if (main) {
    let raf;
    main.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(main.scrollLeft / main.clientWidth);
        if (i !== current) { current = i; mark(); }
      });
    }, { passive: true });
    thumbs.forEach((t) => t.addEventListener("click", () => goTo(+t.dataset.index)));
    $(".gallery-nav.prev")?.addEventListener("click", () => goTo(current - 1));
    $(".gallery-nav.next")?.addEventListener("click", () => goTo(current + 1));
    main.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") goTo(current + 1);
      if (e.key === "ArrowLeft") goTo(current - 1);
    });
  }

  /* ---------- form ---------- */
  const form = $("#pdp-form");
  if (!form) return;
  const product = JSON.parse(form.dataset.product);
  const qtyInput = form.querySelector('input[name="qty"]');
  const colorName = $("#color-name");
  const waBtn = $("#wa-order");
  let price = product.price;
  window.SN.track && window.SN.track("ViewContent", { content_ids: [product.id], content_name: product.name, content_type: "product", value: price, currency: "PKR" });

  const partsBox = form.querySelector("[data-parts]");
  const selectedColor = () => {
    if (partsBox) {
      // e.g. "Vented Detangling Brush: Mint Green, Teardrop Detangling Brush: Pink, ..."
      return [...partsBox.querySelectorAll(".part-opt")].map((f) => `${f.dataset.partLabel}: ${f.querySelector("input:checked")?.value || ""}`).join(", ");
    }
    return form.querySelector('input[name="color"]:checked')?.value || null;
  };
  if (partsBox) partsBox.addEventListener("change", (e) => {
    const f = e.target.closest(".part-opt");
    if (!f) return;
    f.querySelector(".part-chosen").textContent = e.target.value;
    const idx = e.target.name.replace("part-", "");
    const prev = partsBox.querySelector(`[data-preview="${idx}"]`);
    if (prev && e.target.dataset.img) prev.src = e.target.dataset.img;
  });
  const qty = () => Math.max(1, Math.min(20, parseInt(qtyInput.value, 10) || 1));

  function updateWa() {
    if (!waBtn) return;
    const tpl = waBtn.dataset.template || "";
    const color = selectedColor();
    let text = tpl.replace(" ({colour})", color ? ` (${color})` : "");
    text = text.replace(/Price: Rs [\d,]+/, `Price: ${money(price)}${qty() > 1 ? " × " + qty() : ""}`);
    text = text.replace(/Link: .*/, "Link: " + location.href.split(/[?#]/)[0]);
    waBtn.href = `https://wa.me/${window.SN.RULES.wa}?text=${encodeURIComponent(text)}`;
  }

  form.addEventListener("change", (e) => {
    if (e.target.name === "color") {
      if (colorName) colorName.textContent = e.target.value;
      if (e.target.dataset.img !== undefined) goTo(+e.target.dataset.img);
    }
    if (e.target.name === "loc") {
      price = +e.target.dataset.price;
      const now = $("#pdp-price .price-now");
      if (now) now.textContent = money(price);
      const sticky = $("#sticky-price");
      if (sticky) sticky.textContent = money(price);
    }
    updateWa();
  });
  form.addEventListener("click", (e) => {
    // tapping a swatch always shows its photo, even the one that is already selected
    if (e.target.name === "color" && e.target.dataset.img !== undefined) goTo(+e.target.dataset.img);
    const b = e.target.closest("[data-qty]");
    if (!b) return;
    qtyInput.value = Math.max(1, Math.min(20, qty() + +b.dataset.qty));
    updateWa();
  });
  qtyInput.addEventListener("change", () => { qtyInput.value = qty(); updateWa(); });

  function addToCart() {
    const color = selectedColor();
    const item = { ...product, price };
    if (color) item.color = color;
    const sw = form.querySelector('input[name="color"]:checked');
    if (sw && sw.dataset.cartImg) item.img = sw.dataset.cartImg; // cart shows the chosen colour
    Cart.add(item, qty());
    bump();
  }

  let lastAction = "add";
  form.querySelectorAll('button[type="submit"]').forEach((b) => b.addEventListener("click", () => (lastAction = b.value)));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const action = e.submitter?.value || lastAction;
    addToCart();
    if (action === "buy") { location.href = BASE + "cart/"; return; }
    openCart();
  });
  $("#sticky-buy-btn")?.addEventListener("click", () => { addToCart(); location.href = BASE + "cart/"; });
  updateWa();

  /* ---------- sticky buy bar (mobile) ---------- */
  const sticky = $("#sticky-buy");
  const buyNow = $("#buy-now");
  if (sticky && buyNow && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => {
      const show = !en.isIntersecting && en.boundingClientRect.top < 0;
      sticky.classList.toggle("is-visible", show);
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
    }).observe(buyNow);
  }

  /* ---------- delivery estimate (2–4 working days, Mon–Sat) ---------- */
  const eta = $("#delivery-eta");
  if (eta) {
    const addWorkingDays = (d, n) => {
      const r = new Date(d);
      while (n > 0) { r.setDate(r.getDate() + 1); if (r.getDay() !== 0) n--; }
      return r;
    };
    const fmt = (d) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    const now = new Date();
    eta.textContent = `Get it between ${fmt(addWorkingDays(now, 2))} – ${fmt(addWorkingDays(now, 4))}`;
  }

  /* ---------- copy link ---------- */
  $("#copy-link")?.addEventListener("click", () => {
    const url = location.href.split("?")[0];
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(
      () => toast("Link copied"),
      () => toast("Couldn't copy — please copy from the address bar", "error")
    );
  });
})();
