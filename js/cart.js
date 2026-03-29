/* ============================================================
   SHOPNEST — Cart Fulfillment Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const cartItemsList = document.getElementById('cart-items-list');
  const cartEmpty = document.getElementById('cart-empty');
  const cartContent = document.getElementById('cart-content');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryShipping = document.getElementById('summary-shipping');
  const discountRow = document.getElementById('discount-row');
  const summaryDiscount = document.getElementById('summary-discount');
  const summaryTotal = document.getElementById('summary-total');

  const promoInput = document.getElementById('promo-input');
  const promoApply = document.getElementById('promo-apply');
  const promoMsg = document.getElementById('promo-msg');
  const titleCount = document.getElementById('cart-title-count');

  let currentDiscount = 0;
  const SHIPPING_FEE = 250;
  const FREE_SHIPPING_THRESHOLD = 50000; // Free shipping if over 50k PKR

  function renderCart() {
    const items = typeof ShopNestCart !== 'undefined' ? ShopNestCart.get() : [];
    
    // Update top header count
    if (titleCount) titleCount.textContent = `(${items.length} ${items.length === 1 ? 'item' : 'items'})`;

    if (items.length === 0) {
      if (cartContent) cartContent.style.display = 'none';
      if (cartEmpty) cartEmpty.style.display = 'block';
      return;
    }

    if (cartContent) cartContent.style.display = 'grid';
    if (cartEmpty) cartEmpty.style.display = 'none';

    if (cartItemsList) {
      cartItemsList.innerHTML = '';
      items.forEach(item => {
        const itemTotal = item.price * item.qty;
        
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.dataset.id = item.id;
        
        row.innerHTML = `
          <div class="cart-item-info">
            <img src="${item.img}" class="cart-item-img" alt="${item.name}">
            <div>
              <h3 class="cart-item-name">${item.name}</h3>
              <div class="cart-item-cat">${item.cat || 'Product'}</div>
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

        const btnMinus = row.querySelector('.qty-minus');
        const btnPlus = row.querySelector('.qty-plus');
        const btnRemove = row.querySelector('.cart-item-remove');

        btnMinus.addEventListener('click', () => {
          ShopNestCart.setQty(item.id, item.qty - 1);
          renderCart();
          if(typeof refreshCartBadge === 'function') refreshCartBadge();
        });

        btnPlus.addEventListener('click', () => {
          ShopNestCart.setQty(item.id, item.qty + 1);
          renderCart();
          if(typeof refreshCartBadge === 'function') refreshCartBadge();
        });

        btnRemove.addEventListener('click', () => {
          ShopNestCart.remove(item.id);
          renderCart();
          if(typeof refreshCartBadge === 'function') refreshCartBadge();
        });

        cartItemsList.appendChild(row);
      });
    }

    calculateTotals();
  }

  function calculateTotals() {
    const subtotal = typeof ShopNestCart !== 'undefined' ? ShopNestCart.total() : 0;
    
    let shipping = SHIPPING_FEE;
    if (subtotal === 0) shipping = 0;
    else if (subtotal > FREE_SHIPPING_THRESHOLD) shipping = 0; // Free shipping threshold logic

    const totalBeforeDiscount = subtotal + shipping;
    
    const finalDiscount = Math.min(currentDiscount, subtotal); // Cap discount to subtotal
    const total = totalBeforeDiscount - finalDiscount;

    if (summarySubtotal) summarySubtotal.textContent = `PKR ${subtotal.toLocaleString()}`;
    if (summaryShipping) summaryShipping.textContent = shipping === 0 ? 'Free' : `PKR ${shipping.toLocaleString()}`;
    
    if (finalDiscount > 0) {
      if (discountRow) discountRow.style.display = 'flex';
      if (summaryDiscount) summaryDiscount.textContent = `− PKR ${finalDiscount.toLocaleString()}`;
    } else {
      if (discountRow) discountRow.style.display = 'none';
    }

    if (summaryTotal) summaryTotal.textContent = `PKR ${total.toLocaleString()}`;
  }

  // Promo handling logic
  if (promoApply) {
    promoApply.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (!code) return;
      
      if (code === 'SHOPNEST10') {
        currentDiscount = 500;
        promoMsg.textContent = 'Discount applied successfully!';
        promoMsg.className = 'promo-msg promo-msg--success';
        calculateTotals();
      } else {
        promoMsg.textContent = 'Invalid or expired promo code.';
        promoMsg.className = 'promo-msg promo-msg--error';
        currentDiscount = 0;
        calculateTotals();
      }
    });
  }

  // Place order logic
  const placeOrderBtn = document.getElementById('place-order-btn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
       if (typeof ShopNestCart !== 'undefined') ShopNestCart.save([]); // Clear cart secure state
       renderCart();
       if(typeof refreshCartBadge === 'function') refreshCartBadge();
       
       const overlay = document.createElement('div');
       overlay.className = 'order-success-overlay';
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
