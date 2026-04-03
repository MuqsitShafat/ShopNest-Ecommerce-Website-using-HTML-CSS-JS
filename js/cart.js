/* ============================================================
   SHOPNEST — Cart Fulfillment Logic (with Firestore order saving)
   ============================================================ */

// Generate a random ShopNest Order ID like "SN-98234"
function generateOrderId() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `SN-${num}`;
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
  const SHIPPING_FEE = 250;
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

        row.innerHTML = `
          <div class="cart-item-info">
            <img src="${item.img}" class="cart-item-img" alt="${item.name}">
            <div>
              <h3 class="cart-item-name">${item.name}</h3>
              <div class="cart-item-cat">${item.cat || "Product"}</div>
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

        cartItemsList.appendChild(row);
      });
    }

    calculateTotals();
  }

  function calculateTotals() {
    const subtotal =
      typeof ShopNestCart !== "undefined" ? ShopNestCart.total() : 0;

    let shipping = SHIPPING_FEE;
    if (subtotal === 0) shipping = 0;
    else if (subtotal > FREE_SHIPPING_THRESHOLD) shipping = 0;

    const totalBeforeDiscount = subtotal + shipping;
    const finalDiscount = Math.min(currentDiscount, subtotal);
    const total = totalBeforeDiscount - finalDiscount;

    if (summarySubtotal)
      summarySubtotal.textContent = `PKR ${subtotal.toLocaleString()}`;
    if (summaryShipping)
      summaryShipping.textContent =
        shipping === 0 && subtotal > 0
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

    const shippingRow = document.getElementById("shipping-notice");
    if (shippingRow) {
      if (subtotal > 0 && subtotal <= FREE_SHIPPING_THRESHOLD) {
        const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
        shippingRow.style.display = "block";
        shippingRow.textContent = `Add PKR ${remaining.toLocaleString()} more for FREE delivery!`;
      } else if (subtotal > FREE_SHIPPING_THRESHOLD) {
        shippingRow.style.display = "block";
        shippingRow.textContent = "✅ You qualify for FREE delivery!";
        shippingRow.style.color = "#16a34a";
      } else {
        shippingRow.style.display = "none";
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
      });
    });
  }

  // Place order logic — saves to Firestore if available
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", async () => {
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

      const orderId = generateOrderId();
      const subtotal = typeof ShopNestCart !== "undefined" ? ShopNestCart.total() : 0;
      const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
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
        })),
        subtotal,
        shipping,
        discount: currentDiscount,
        total,
      };

      // Try to save to Firestore
      try {
        // Dynamically import Firestore functions & use exported db from firebase-auth.js
        const { db } = await import("./firebase-auth.js");
        const { collection, addDoc } = await import(
          "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js"
        );
        await addDoc(collection(db, "orders"), orderData);
        console.log("Order saved to Firestore:", orderId);
      } catch (err) {
        console.warn("Could not save order to Firestore:", err.message);
        // Still allow order to go through even if Firestore fails
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
          ${selectedPaymentMethod === "online" ? `<p style="background:rgba(37,211,102,0.1);border:1px solid rgba(37,211,102,0.3);border-radius:8px;padding:0.75rem;font-size:0.9rem;color:#16a34a;"><strong>📱 Don't forget!</strong> Send your payment screenshot to <strong>03284430589</strong> on WhatsApp for faster processing.</p>` : ""}
          <button class="btn btn-primary btn-full" onclick="window.location.href='index.html'" style="margin-top:1rem;">Return to Shop</button>
        </div>
      `;
      document.body.appendChild(overlay);
    });
  }

  // Initial render
  renderCart();
});
