/* ============================================================
   SHOPNEST — Cart Fulfillment Logic (with Firestore order saving)
   ============================================================ */

// Generate a random ShopNest Order ID like "SN-98234"
function generateOrderId() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `SN-${num}`;
}

// ---- Firestore write helper (self-contained, no dynamic import) ----
async function saveOrderToFirestore(orderData) {
  const { initializeApp, getApps } = await import(
    "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js"
  );
  const { getFirestore, collection, addDoc } = await import(
    "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js"
  );

  const firebaseConfig = {
    apiKey: "AIzaSyC5dKkXC0QzbtrzSsYoZY-V38Y3MS8WDIQ",
    authDomain: "shopnest-e2d57.firebaseapp.com",
    projectId: "shopnest-e2d57",
    storageBucket: "shopnest-e2d57.firebasestorage.app",
    messagingSenderId: "171603675621",
    appId: "1:171603675621:web:94dacd14762cc7494b870c",
  };

  // Re-use the default app if already initialized, otherwise create it
  const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  await addDoc(collection(db, "orders"), orderData);
}

document.addEventListener("DOMContentLoaded", () => {
  const cartItemsList = document.getElementById("cart-items-list");
  const cartEmpty = document.getElementById("cart-empty");
  const cartContent = document.getElementById("cart-content");
  const summarySubtotal = document.getElementById("summary-subtotal");
  const summaryShipping = document.getElementById("summary-shipping");
  const discountRow = document.getElementById("discount-row");
  const summaryDiscount = document.getElementById("summary-discount");
  const summaryTotal = document.getElementById("summary-total");
  const titleCount = document.getElementById("cart-title-count");

  let currentDiscount = 0;
  const SHIPPING_FEE = 150;
  const FREE_SHIPPING_THRESHOLD = 1000;

  function renderCart() {
    const items = typeof ShopNestCart !== "undefined" ? ShopNestCart.get() : [];

    if (titleCount)
      titleCount.textContent = `(${items.length} ${items.length === 1 ? "item" : "items"})`;

    if (items.length === 0) {
      if (cartContent) cartContent.style.display = "none";
      if (cartEmpty) cartEmpty.style.display = "block";
      return;
    }

    if (cartContent) cartContent.style.display = "grid";
    if (cartEmpty) cartEmpty.style.display = "none";

    if (cartItemsList) {
      cartItemsList.innerHTML = "";
      items.forEach((item) => {
        const itemTotal = item.price * item.qty;

        const row = document.createElement("div");
        row.className = "cart-item";
        row.dataset.id = item.id;

        let colorSelectorHtml = '';
        if (item.id.startsWith("sp-neck-fan") || item.id.startsWith("sp-summer-deal")) {
          colorSelectorHtml = `
            <div style="margin-top: 0.5rem; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
              <label style="color: #666; font-weight: 500;">Neck Fan Color:</label>
              <select class="cart-item-color-select" style="padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid #ddd; background: #fff; font-family: inherit; font-size: 0.85rem; cursor: pointer; min-width: 100px;">
                <option value="Black" ${item.color === 'Black' || !item.color ? 'selected' : ''}>Black</option>
                <option value="Light Green" ${item.color === 'Light Green' ? 'selected' : ''}>Light Green</option>
              </select>
            </div>
          `;
        }

        row.innerHTML = `
          <div class="cart-item-info">
            <img src="${item.img}" class="cart-item-img" alt="${item.name}">
            <div>
              <h3 class="cart-item-name">${item.name}</h3>
              <div class="cart-item-cat">${item.cat || "Product"}</div>
              ${colorSelectorHtml}
            </div>
          </div>
          <div class="cart-item-price">PKR ${item.price.toLocaleString()}</div>
          <div class="qty-controls">
            <button class="qty-btn qty-minus" type="button" aria-label="Decrease quantity">−</button>
            <div class="qty-num">${item.qty}</div>
            <button class="qty-btn qty-plus" type="button" aria-label="Increase quantity">+</button>
          </div>
          <div class="cart-item-total">PKR ${itemTotal.toLocaleString()}</div>
          <button class="cart-item-remove" type="button" aria-label="Remove item"><span class="material-icons">delete_outline</span></button>
        `;

        const btnMinus = row.querySelector(".qty-minus");
        const btnPlus = row.querySelector(".qty-plus");
        const btnRemove = row.querySelector(".cart-item-remove");

        btnMinus.addEventListener("click", () => {
          ShopNestCart.setQty(item.id, item.qty - 1);
          renderCart();
          if (typeof refreshCartBadge === "function") refreshCartBadge();
        });

        btnPlus.addEventListener("click", () => {
          ShopNestCart.setQty(item.id, item.qty + 1);
          renderCart();
          if (typeof refreshCartBadge === "function") refreshCartBadge();
        });

        btnRemove.addEventListener("click", () => {
          ShopNestCart.remove(item.id);
          renderCart();
          if (typeof refreshCartBadge === "function") refreshCartBadge();
        });

        const colorSelect = row.querySelector(".cart-item-color-select");
        if (colorSelect) {
          colorSelect.addEventListener("change", (e) => {
            const items = ShopNestCart.get();
            const targetItem = items.find(i => i.id === item.id);
            if (targetItem) {
              targetItem.color = e.target.value;
              ShopNestCart.save(items);
            }
          });
        }

        cartItemsList.appendChild(row);
      });
    }

    calculateTotals();
  }

  function calculateTotals() {
    const subtotal =
      typeof ShopNestCart !== "undefined" ? ShopNestCart.total() : 0;

    let shipping = SHIPPING_FEE;
    const items = typeof ShopNestCart !== "undefined" ? ShopNestCart.get() : [];
    const hasFreeShipProduct = items.some(item => item.id === 'sp-spoon');

    if (subtotal === 0) shipping = 0;
    else if (subtotal >= FREE_SHIPPING_THRESHOLD || hasFreeShipProduct) shipping = 0;

    const totalBeforeDiscount = subtotal + shipping;
    const finalDiscount = Math.min(currentDiscount, subtotal);
    const total = totalBeforeDiscount - finalDiscount;

    if (summarySubtotal)
      summarySubtotal.textContent = `PKR ${subtotal.toLocaleString()}`;
    if (summaryShipping)
      summaryShipping.textContent =
        shipping === 0 && (subtotal > 0 || hasFreeShipProduct)
          ? "Free 🎉"
          : shipping === 0
            ? "PKR 0"
            : `PKR ${shipping.toLocaleString()}`;

    if (finalDiscount > 0) {
      if (discountRow) discountRow.style.display = "flex";
      if (summaryDiscount)
        summaryDiscount.textContent = `− PKR ${finalDiscount.toLocaleString()}`;
    } else {
      if (discountRow) discountRow.style.display = "none";
    }

    if (summaryTotal)
      summaryTotal.textContent = `PKR ${total.toLocaleString()}`;

    const shippingNotice = document.getElementById("shipping-notice");
    if (shippingNotice) {
      if (hasFreeShipProduct) {
        shippingNotice.style.display = "block";
        shippingNotice.textContent = "✅ Special Offer: FREE delivery on this order!";
        shippingNotice.style.color = "#16a34a";
      } else if (subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD) {
        const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
        shippingNotice.style.display = "block";
        shippingNotice.textContent = `Add PKR ${remaining.toLocaleString()} more for FREE delivery!`;
        shippingNotice.style.color = "";
      } else if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        shippingNotice.style.display = "block";
        shippingNotice.textContent = "✅ You qualify for FREE delivery!";
        shippingNotice.style.color = "#16a34a";
      } else {
        shippingNotice.style.display = "none";
      }
    }
  }

  // Payment method UI toggling
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const onlineDetails = document.getElementById("online-payment-details");
  const placeOrderBtn = document.getElementById("place-order-btn");

  let selectedPaymentMethod = "cod"; // default

  if (paymentRadios.length) {
    paymentRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        selectedPaymentMethod = e.target.value;
        const screenshotNote = document.getElementById("whatsapp-screenshot-note");
        if (e.target.value === "online") {
          currentDiscount = 100;
          if (onlineDetails) onlineDetails.style.display = "block";

          if (screenshotNote) screenshotNote.style.display = "block";
          if (placeOrderBtn) {
            placeOrderBtn.disabled = false;
            placeOrderBtn.style.opacity = "";
            placeOrderBtn.style.cursor = "";
            placeOrderBtn.innerHTML =
              '<span class="material-icons">shopping_bag</span> Place Order';
          }
        } else {
          currentDiscount = 0;
          if (onlineDetails) onlineDetails.style.display = "none";
          if (screenshotNote) screenshotNote.style.display = "none";
          if (placeOrderBtn) {
            placeOrderBtn.disabled = false;
            placeOrderBtn.style.opacity = "";
            placeOrderBtn.style.cursor = "";
            placeOrderBtn.innerHTML =
              '<span class="material-icons">shopping_bag</span> Place Order';
          }
        }
        calculateTotals();
      });
    });
  }
  // City change logic to automatically adjust Summer Deal Combo price
  const cityInput = document.getElementById("addr-city");
  if (cityInput) {
    cityInput.addEventListener("input", (e) => {
      const city = e.target.value.trim().toLowerCase();
      const items = typeof ShopNestCart !== "undefined" ? ShopNestCart.get() : [];
      let changed = false;
      
      items.forEach(item => {
        if (item.id.startsWith("sp-summer-deal")) {
          const newPrice = city === "lahore" ? 1700 : 1800;
          if (item.price !== newPrice) {
            item.price = newPrice;
            item.id = "sp-summer-deal-" + newPrice; // This will update the ID consistently
            changed = true;
          }
        }
      });
      
      if (changed && typeof ShopNestCart !== "undefined") {
        ShopNestCart.save(items);
        renderCart();
        if (typeof refreshCartBadge === "function") refreshCartBadge();
      }
    });
  }

  // Place order logic — saves to Firestore if available
  let isOrderPlacing = false; // debounce / guard against double-click

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", async () => {
      // ---- Debounce: prevent duplicate submissions ----
      if (isOrderPlacing) return;

      const items = typeof ShopNestCart !== "undefined" ? ShopNestCart.get() : [];
      if (items.length === 0) return;

      // Collect delivery info
      const name = document.getElementById("addr-name")?.value.trim() || "";
      const phone = document.getElementById("addr-phone")?.value.trim() || "";
      const street = document.getElementById("addr-street")?.value.trim() || "";
      const email = document.getElementById("addr-email")?.value.trim() || "";
      const city = document.getElementById("addr-city")?.value.trim() || "";
      const province = document.getElementById("addr-province")?.value || "";

      if (!name || !phone || !street || !email || !city || !province) {
        if (typeof showToast === "function") {
          showToast("Please fill in all required delivery fields!", "error");
        } else {
          alert("Please fill in your complete delivery address (including email) before placing the order.");
        }
        document.getElementById("address-section")?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      // Phone must not contain letters — digits, +, -, spaces only
      if (/[a-zA-Z]/.test(phone)) {
        if (typeof showToast === "function") {
          showToast("Phone number must contain only digits — no letters allowed!", "error");
        } else {
          alert("Phone number must contain only digits.");
        }
        document.getElementById("addr-phone")?.focus();
        return;
      }

      // Email must contain @
      if (!email.includes("@")) {
        if (typeof showToast === "function") {
          showToast("Please enter a valid email address (must include @)", "error");
        } else {
          alert("Please enter a valid email address with @.");
        }
        document.getElementById("addr-email")?.focus();
        return;
      }

      const orderId = generateOrderId();
      const subtotal = typeof ShopNestCart !== "undefined" ? ShopNestCart.total() : 0;
      const hasFreeShipProduct = items.some(item => item.id === 'sp-spoon');
      const shipping = (subtotal >= FREE_SHIPPING_THRESHOLD || hasFreeShipProduct) ? 0 : SHIPPING_FEE;
      const total = subtotal + shipping - currentDiscount;

      const orderData = {
        orderId,
        createdAt: new Date().toISOString(),
        status: "Pending",
        paymentMethod: selectedPaymentMethod === "online" ? "Online Payment" : "Cash on Delivery",
        customer: { name, phone, email, street, city, province },
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          total: i.price * i.qty,
          color: i.color || (i.id.startsWith('sp-neck-fan') || i.id.startsWith('sp-summer-deal') ? 'Black' : null)
        })),
        subtotal,
        shipping,
        discount: currentDiscount,
        total,
      };

      // ---- Lock button immediately to prevent duplicate orders ----
      isOrderPlacing = true;
      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = '<span class="material-icons" style="animation:spin 1s linear infinite;display:inline-block;">sync</span> Placing Order…';

      // ---- Save to Firestore (self-contained, no relative import) ----
      try {
        await saveOrderToFirestore(orderData);
        console.log("✅ Order saved to Firestore:", orderId);
      } catch (err) {
        console.warn("⚠️ Could not save order to Firestore:", err.message);
        // Still allow order to complete even if Firestore fails
      }

      // ---- Add spinner animation style if not already present ----
      if (!document.getElementById("cart-spin-style")) {
        const style = document.createElement("style");
        style.id = "cart-spin-style";
        style.textContent = "@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}";
        document.head.appendChild(style);
      }

      // Clear cart
      if (typeof ShopNestCart !== "undefined") ShopNestCart.save([]);
      renderCart();
      if (typeof refreshCartBadge === "function") refreshCartBadge();

      // Show success modal
      const overlay = document.createElement("div");
      overlay.className = "order-success-overlay";
      overlay.style.display = "flex";
      overlay.innerHTML = `
        <div class="order-success-modal">
          <div class="order-success-icon"><span class="material-icons" style="color:#22c55e;font-size:4rem;">check_circle</span></div>
          <h2>Order Placed! 🎉</h2>
          <p style="font-size:0.95rem;color:#6b7280;margin-bottom:0.5rem;">Your Order ID is:</p>
          <div style="background:#f3f4f6;border-radius:8px;padding:0.6rem 1.2rem;display:inline-block;font-weight:700;font-size:1.2rem;letter-spacing:1px;color:#121c2c;margin-bottom:1rem;">${orderId}</div>
          <p>Your order has been successfully placed. We'll contact you at <strong>${phone}</strong> to confirm delivery.</p>
          ${selectedPaymentMethod === "online" ? `<div style="background:rgba(37,211,102,0.1);border:1px solid rgba(37,211,102,0.3);border-radius:12px;padding:1rem;margin-top:1rem;text-align:left;">
            <div style="background:#16a34a;color:white;padding:3px 10px;border-radius:20px;font-size:0.7rem;font-weight:700;margin-bottom:0.5rem;display:inline-flex;align-items:center;gap:4px;">
              <span class="material-icons" style="font-size:12px;">card_giftcard</span>
              PKR 100 DISCOUNT APPLIED
            </div>
            <p style="margin:0;font-size:0.9rem;color:#16a34a;line-height:1.4;"><strong>📱 Don't forget!</strong> Send your payment screenshot to <strong>03284430589</strong> on WhatsApp for faster processing.</p>
          </div>` : ""}
          <button class="btn btn-primary btn-full" onclick="window.location.href='index.html'" style="margin-top:1rem;">Return to Shop</button>
        </div>
      `;
      document.body.appendChild(overlay);
    });
  }

  // Initial render
  renderCart();
});
