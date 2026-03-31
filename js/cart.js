/* ============================================================
   SHOPNEST — Cart Fulfillment Logic
   ============================================================ */

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

    // Show free shipping notice
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

  let isOnlinePayment = false;
  let paymentConfirmed = false;

  if (paymentRadios.length) {
    paymentRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.value === "online") {
          isOnlinePayment = true;
          paymentConfirmed = false;
          if (onlineDetails) onlineDetails.style.display = "block";
          if (placeOrderBtn) {
            placeOrderBtn.disabled = true;
            placeOrderBtn.style.opacity = "0.5";
            placeOrderBtn.style.cursor = "not-allowed";
            placeOrderBtn.innerHTML =
              '<span class="material-icons">lock</span> Confirm Payment First';
          }
        } else {
          isOnlinePayment = false;
          paymentConfirmed = false;
          if (onlineDetails) onlineDetails.style.display = "none";
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

  // Confirm payment button
  const confirmPayBtn = document.getElementById("confirm-payment-btn");
  if (confirmPayBtn) {
    confirmPayBtn.addEventListener("click", () => {
      paymentConfirmed = true;
      confirmPayBtn.innerHTML = "✅ Payment Confirmed!";
      confirmPayBtn.disabled = true;
      confirmPayBtn.style.background = "#22c55e";
      confirmPayBtn.style.borderColor = "#22c55e";
      confirmPayBtn.style.color = "#fff";
      if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.style.opacity = "";
        placeOrderBtn.style.cursor = "";
        placeOrderBtn.innerHTML =
          '<span class="material-icons">shopping_bag</span> Place Order';
      }
    });
  }

  // Place order logic
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", () => {
      if (typeof ShopNestCart !== "undefined") ShopNestCart.save([]);
      renderCart();
      if (typeof refreshCartBadge === "function") refreshCartBadge();

      const overlay = document.createElement("div");
      overlay.className = "order-success-overlay";
      overlay.innerHTML = `
         <div class="order-success-modal">
           <div class="order-success-icon"><span class="material-icons" style="color: #22c55e; font-size: 4rem;">check_circle</span></div>
           <h2>Order Placed!</h2>
           <p>Your order has been successfully fulfilled. Thanks for shopping directly with ShopNest.</p>
           <button class="btn btn-primary btn-full" onclick="window.location.href='index.html'">Return to Shop</button>
         </div>
       `;
      document.body.appendChild(overlay);
    });
  }

  // Initial render trigger
  renderCart();
});
