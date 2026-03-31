/* ============================================================
   SHOPNEST — main.js
   Shared functionality across all pages:
   - Announcement bar, mobile menu, header scroll
   - Wishlist (localStorage, dropdown, heart icon)
   - Quick-view modal
   - Cart (localStorage, badge, add-to-cart → redirect to cart)
   - Category bar routing (links with ?cat=)
   - Countdown timer, newsletter, scroll reveal
   ============================================================ */

/* ============================================================
   WISHLIST & CART — localStorage helpers
   ============================================================ */
const ShopNestWishlist = {
  _key: "sn_wishlist",
  get() {
    try {
      return JSON.parse(localStorage.getItem(this._key)) || [];
    } catch {
      return [];
    }
  },
  save(items) {
    localStorage.setItem(this._key, JSON.stringify(items));
  },
  add(item) {
    const list = this.get();
    if (!list.find((i) => i.id === item.id)) {
      list.push(item);
      this.save(list);
    }
  },
  remove(id) {
    this.save(this.get().filter((i) => i.id !== id));
  },
  has(id) {
    return !!this.get().find((i) => i.id === id);
  },
  toggle(item) {
    if (this.has(item.id)) {
      this.remove(item.id);
      return false;
    } else {
      this.add(item);
      return true;
    }
  },
};

const ShopNestCart = {
  _key: "sn_cart",
  get() {
    try {
      return JSON.parse(localStorage.getItem(this._key)) || [];
    } catch {
      return [];
    }
  },
  save(items) {
    localStorage.setItem(this._key, JSON.stringify(items));
  },
  add(item) {
    const list = this.get();
    const existing = list.find((i) => i.id === item.id);
    if (existing) {
      existing.qty++;
    } else {
      list.push({ ...item, qty: 1 });
    }
    this.save(list);
  },
  remove(id) {
    this.save(this.get().filter((i) => i.id !== id));
  },
  setQty(id, qty) {
    const list = this.get();
    const item = list.find((i) => i.id === id);
    if (item) {
      item.qty = qty;
      if (item.qty <= 0) return this.remove(id);
      this.save(list);
    }
  },
  total() {
    return this.get().reduce((s, i) => s + i.price * i.qty, 0);
  },
  count() {
    return this.get().reduce((s, i) => s + i.qty, 0);
  },
};

/* ============================================================
   QUICK VIEW — product data from card DOM
   ============================================================ */
const productDescriptions = {
  default:
    "A premium quality product from ShopNest's curated collection. Designed for modern lifestyles with attention to detail and lasting comfort.",
};

function buildQuickViewHTML(card) {
  const name = card.querySelector(".product-name")?.textContent || "";
  const cat = card.querySelector(".product-cat")?.textContent || "";
  const stars = card.querySelector(".stars")?.textContent || "★★★★★";
  const ratingC = card.querySelector(".rating-count")?.textContent || "";
  const curr = card.querySelector(".price-current")?.textContent || "";
  const old = card.querySelector(".price-old")?.textContent || "";
  const save = card.querySelector(".price-save")?.textContent || "";
  const imgSrc = card.querySelector(".product-img")?.src || "";
  const imgStyle =
    card.querySelector(".product-img")?.getAttribute("style") || "";
  const id = card.id || "prod-" + Math.random().toString(36).slice(2);
  const priceNum = parseInt(card.dataset.price || "0");

  const isWishlisted = ShopNestWishlist.has(id);
  const heartIcon = isWishlisted ? "favorite" : "favorite_border";
  const heartColor = isWishlisted ? "color:var(--coral)" : "";

  return `
    <div class="qv-img-wrap">
      <img src="${imgSrc}" alt="${name}" style="${imgStyle}" loading="lazy" />
    </div>
    <div class="qv-info">
      <span class="qv-cat">${cat}</span>
      <h2 class="qv-name">${name}</h2>
      <div class="qv-rating">
        <span class="stars">${stars}</span>
        <span>${ratingC}</span>
      </div>
      <div class="qv-pricing">
        <span class="qv-price-current">${curr}</span>
        ${old ? `<span class="qv-price-old">${old}</span>` : ""}
        ${save ? `<span class="qv-price-save">${save}</span>` : ""}
      </div>
      <p class="qv-desc">${productDescriptions.default}</p>
      <div class="qv-actions">
        <button class="btn btn-primary btn-full qv-add-cart"
                data-id="${id}" data-name="${name}" data-price="${priceNum}"
                data-img="${imgSrc}" data-cat="${cat}">
          <span class="material-icons">shopping_bag</span> Add to Cart
        </button>
        <button class="btn btn-coral btn-full qv-buy-now"
                data-id="${id}" data-name="${name}" data-price="${priceNum}"
                data-img="${imgSrc}" data-cat="${cat}">
          <span class="material-icons">bolt</span> Buy Now
        </button>
        <button class="qv-add-wishlist" data-id="${id}" data-name="${name}"
                data-price="${priceNum}" data-img="${imgSrc}">
          <span class="material-icons" style="${heartColor}">${heartIcon}</span>
          ${isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        </button>
      </div>
    </div>`;
}

/* ============================================================
   DOMContentLoaded — shared init
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  /* -------- ANNOUNCEMENT BAR -------- */
  const announcementBar = document.getElementById("announcement-bar");
  const announcementClose = document.getElementById("announcement-close");
  if (announcementClose && announcementBar) {
    announcementClose.addEventListener("click", () => {
      announcementBar.style.maxHeight = announcementBar.offsetHeight + "px";
      requestAnimationFrame(() => {
        announcementBar.style.transition =
          "max-height 0.3s ease, opacity 0.3s ease";
        announcementBar.style.maxHeight = "0";
        announcementBar.style.opacity = "0";
        announcementBar.style.overflow = "hidden";
      });
      setTimeout(() => announcementBar.remove(), 350);
    });
  }

  /* -------- MOBILE MENU -------- */
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileOverlay = document.getElementById("mobile-overlay");
  const mobileClose = document.getElementById("mobile-close");

  function openMobileMenu() {
    mobileMenu?.classList.add("open");
    mobileOverlay?.classList.add("active");
    hamburger?.classList.add("open");
    hamburger?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMobileMenu() {
    mobileMenu?.classList.remove("open");
    mobileOverlay?.classList.remove("active");
    hamburger?.classList.remove("open");
    hamburger?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  hamburger?.addEventListener("click", openMobileMenu);
  mobileClose?.addEventListener("click", closeMobileMenu);
  mobileOverlay?.addEventListener("click", () => {
    // Only close mobile nav if the sidebar filter is not the thing open
    if (!document.querySelector(".shop-sidebar.open")) closeMobileMenu();
  });
  document
    .querySelectorAll(".mobile-nav-link")
    .forEach((l) => l.addEventListener("click", closeMobileMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileMenu();
      closeQuickView();
    }
  });

  /* -------- STICKY HEADER SHADOW -------- */
  const header = document.getElementById("header");
  if (header) {
    window.addEventListener(
      "scroll",
      () => {
        header.style.boxShadow =
          window.scrollY > 20
            ? "0px 4px 24px rgba(18,28,44,0.12)"
            : "0px 2px 20px rgba(18,28,44,0.08)";
      },
      { passive: true },
    );
  }

  /* -------- BACK TO TOP -------- */
  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      () => {
        backToTop.classList.toggle("visible", window.scrollY > 400);
      },
      { passive: true },
    );
    backToTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );
  }

  /* -------- SEARCH BAR -------- */
  const searchInput = document.getElementById("search-input");
  const searchBar = document.getElementById("search-bar");
  const searchBtn = searchBar ? searchBar.querySelector("button") : null;

  if (searchInput && searchBar) {
    searchInput.addEventListener("focus", () => {
      searchBar.style.maxWidth = "380px";
    });
    searchInput.addEventListener("blur", () => {
      searchBar.style.maxWidth = "";
    });

    function performSearch() {
      const q = searchInput.value.trim();
      if (q) window.location.href = `shop.html?search=${encodeURIComponent(q)}`;
    }

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") performSearch();
    });

    if (searchBtn) {
      searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        performSearch();
      });
    }
  }

  /* -------- CART BADGE (from localStorage) -------- */
  function refreshCartBadge() {
    const count = ShopNestCart.count();
    document.querySelectorAll(".cart-badge").forEach((el) => {
      el.textContent = count;
      el.style.display = count === 0 ? "none" : "";
    });
  }
  refreshCartBadge();

  /* -------- WISHLIST HEADER ICON UPDATE -------- */
  function refreshWishlistHeaderIcon() {
    const items = ShopNestWishlist.get();
    const headers = document.querySelectorAll("#wishlist-header-icon");
    const badges = document.querySelectorAll("#wishlist-icon-badge");

    headers.forEach((icon) => {
      icon.textContent = items.length > 0 ? "favorite" : "favorite_border";
      icon.style.color = items.length > 0 ? "var(--coral)" : "";
    });

    badges.forEach((badge) => {
      badge.textContent = items.length;
      badge.style.display = items.length > 0 ? "" : "none";
    });
  }
  refreshWishlistHeaderIcon();

  /* -------- WISHLIST DROPDOWN -------- */
  const wishlistWrap = document.getElementById("wishlist-wrap");
  const wishlistDropdown = document.getElementById("wishlist-dropdown");
  const wishlistBtn = document.getElementById("btn-wishlist");

  function renderWishlistDropdown() {
    const items = ShopNestWishlist.get();
    const emptyEl = document.getElementById("wishlist-empty");
    const listEl = document.getElementById("wishlist-items-list");
    const countBadge = document.getElementById("wishlist-count-badge");

    if (!listEl) return;

    if (countBadge) countBadge.textContent = items.length;

    if (items.length === 0) {
      if (emptyEl) emptyEl.style.display = "";
      listEl.innerHTML = "";
    } else {
      if (emptyEl) emptyEl.style.display = "none";
      listEl.innerHTML = items
        .map(
          (item) => `
        <li class="wishlist-item">
          <img class="wishlist-item-img" src="${item.img}" alt="${item.name}" />
          <div class="wishlist-item-info">
            <div class="wishlist-item-name">${item.name}</div>
            <div class="wishlist-item-price">PKR ${item.price.toLocaleString()}</div>
          </div>
          <button class="wishlist-item-remove" data-id="${item.id}" aria-label="Remove from wishlist">✕</button>
        </li>
      `,
        )
        .join("");

      listEl.querySelectorAll(".wishlist-item-remove").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          ShopNestWishlist.remove(btn.dataset.id);
          // Sync heart on page if present
          syncWishlistHeartOnPage(btn.dataset.id, false);
          renderWishlistDropdown();
          refreshWishlistHeaderIcon();
        });
      });
    }
  }

  const accountBtn = document.getElementById("btn-account");
  const accountWrap = document.getElementById("account-wrap");
  const accountDropdown = document.getElementById("account-dropdown");

  if (accountBtn && accountDropdown) {
    accountBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (wishlistDropdown && wishlistDropdown.classList.contains("open"))
        wishlistDropdown.classList.remove("open");
      accountDropdown.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (accountWrap && !accountWrap.contains(e.target)) {
        accountDropdown.classList.remove("open");
      }
    });
  }

  if (wishlistBtn && wishlistDropdown) {
    wishlistBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      renderWishlistDropdown();
      if (accountDropdown && accountDropdown.classList.contains("open"))
        accountDropdown.classList.remove("open");
      wishlistDropdown.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (wishlistWrap && !wishlistWrap.contains(e.target)) {
        wishlistDropdown.classList.remove("open");
      }
    });
  }

  /* -------- SYNC HEART ICON ON PAGE -------- */
  function syncWishlistHeartOnPage(id, wishlisted) {
    // Find the wishlist button for this product on the page
    const btn = document.querySelector(
      `[data-wishlist-id="${id}"], #wish-${id.replace("prod-", "").replace("sp-", "")}`,
    );
    if (!btn) {
      // Try to find via card id
      const card = document.getElementById(id);
      if (card) {
        const wishBtn = card.querySelector(
          '.product-action-btn[aria-label="Add to wishlist"]',
        );
        if (wishBtn) updateHeartBtn(wishBtn, wishlisted);
      }
      return;
    }
    updateHeartBtn(btn, wishlisted);
  }

  function updateHeartBtn(btn, wishlisted) {
    const icon = btn.querySelector(".material-icons");
    if (!icon) return;
    if (wishlisted) {
      icon.textContent = "favorite";
      icon.style.color = "var(--coral)";
      btn.classList.add("wishlisted");
      btn.style.background = "";
      btn.style.color = "";
    } else {
      icon.textContent = "favorite_border";
      icon.style.color = "";
      btn.classList.remove("wishlisted");
      btn.style.background = "";
      btn.style.color = "";
    }
  }

  /* -------- INIT ALL PRODUCT CARDS -------- */
  function initProductCards() {
    document.querySelectorAll(".product-card").forEach((card) => {
      const id = card.id;

      // ---- Wishlist button ----
      const wishBtn = card.querySelector(
        '.product-action-btn[aria-label="Add to wishlist"]',
      );
      if (wishBtn) {
        // Set initial state from localStorage
        const already = ShopNestWishlist.has(id);
        updateHeartBtn(wishBtn, already);

        wishBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          const name = card.querySelector(".product-name")?.textContent || "";
          const price = parseInt(card.dataset.price) || 0;
          const img = card.querySelector(".product-img")?.src || "";
          const cat = card.querySelector(".product-cat")?.textContent || "";
          const added = ShopNestWishlist.toggle({ id, name, price, img, cat });
          updateHeartBtn(wishBtn, added);
          refreshWishlistHeaderIcon();
          if (wishlistDropdown?.classList.contains("open"))
            renderWishlistDropdown();
        });
      }

      // ---- Quick View button (Click on Image) ----
      const imgWrap = card.querySelector(".product-img-wrap");
      if (imgWrap) {
        imgWrap.style.cursor = "pointer";
        imgWrap.addEventListener("click", () => openQuickView(card));
      }

      // ---- Add to Cart button ----
      const addBtn = card.querySelector(
        ".btn-primary.btn-full.shop-add-cart, .btn-primary.btn-full:not(.btn-buy-now)",
      );
      if (
        addBtn &&
        (addBtn.textContent.includes("Add to Cart") ||
          addBtn.classList.contains("shop-add-cart"))
      ) {
        addBtn.addEventListener("click", () => {
          const name = card.querySelector(".product-name")?.textContent || "";
          const price = parseInt(card.dataset.price) || 0;
          const img = card.querySelector(".product-img")?.src || "";
          const cat = card.querySelector(".product-cat")?.textContent || "";
          ShopNestCart.add({ id, name, price, img, cat });
          // Brief visual feedback then redirect
          const orig = addBtn.innerHTML;
          addBtn.innerHTML = "✓ Added! Redirecting…";
          addBtn.style.background = "linear-gradient(135deg,#22c55e,#16a34a)";
          addBtn.disabled = true;
          refreshCartBadge();
          setTimeout(() => {
            window.location.href = "cart.html";
          }, 900);
        });
      }

      // ---- Buy Now button ----
      const buyNowBtn = card.querySelector(".btn-buy-now");
      if (buyNowBtn) {
        buyNowBtn.addEventListener("click", () => {
          const name = card.querySelector(".product-name")?.textContent || "";
          const price = parseInt(card.dataset.price) || 0;
          const img = card.querySelector(".product-img")?.src || "";
          const cat = card.querySelector(".product-cat")?.textContent || "";
          // Clear cart and add only this item for direct purchase
          ShopNestCart.save([{ id, name, price, img, cat, qty: 1 }]);
          refreshCartBadge();
          window.location.href = "cart.html";
        });
      }
    });
  }
  initProductCards();

  // Also handle index.html selected-items "Add" buttons
  document.querySelectorAll('[id^="sel-add-"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = {
        id: btn.id,
        name:
          btn.closest(".selected-item")?.querySelector("h4")?.textContent ||
          "Product",
        price: parseInt(
          (
            btn.closest(".selected-item")?.querySelector(".selected-price")
              ?.textContent || "0"
          ).replace(/\D/g, ""),
        ),
        img:
          btn.dataset.img ||
          (btn.id.includes("headphones")
            ? "images/product_headphones.png"
            : btn.id.includes("lamp")
              ? "images/product_lamp.png"
              : btn.id.includes("book")
                ? "images/product_laptop.png"
                : "images/category_gadgets.png"),
        cat: "Electronics",
      };
      ShopNestCart.add(item);
      const orig = btn.textContent;
      btn.textContent = "✓";
      btn.style.background = "#22c55e";
      btn.style.color = "#fff";
      btn.style.borderColor = "#22c55e";
      refreshCartBadge();
      setTimeout(() => {
        window.location.href = "cart.html";
      }, 700);
    });
  });

  /* -------- CART ICON → CART PAGE -------- */
  document.getElementById("btn-cart")?.addEventListener("click", (e) => {
    // btn-cart is now an <a> link to cart.html — no need for JS redirect
  });

  /* -------- QUICK VIEW MODAL -------- */
  const qvOverlay = document.getElementById("quick-view-overlay");
  const qvModal = document.getElementById("quick-view-modal");
  const qvContent = document.getElementById("quick-view-content");
  const qvClose = document.getElementById("quick-view-close");

  function openQuickView(card) {
    if (!qvOverlay || !qvContent) return;
    qvContent.innerHTML = buildQuickViewHTML(card);
    qvOverlay.classList.add("open");
    document.body.style.overflow = "hidden";

    // Wire up QV buttons
    qvContent.querySelector(".qv-add-cart")?.addEventListener("click", (e) => {
      const btn = e.currentTarget;
      ShopNestCart.add({
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseInt(btn.dataset.price),
        img: btn.dataset.img,
        cat: btn.dataset.cat,
      });
      btn.innerHTML = "✓ Added! Redirecting…";
      btn.style.background = "linear-gradient(135deg,#22c55e,#16a34a)";
      btn.disabled = true;
      refreshCartBadge();
      setTimeout(() => {
        window.location.href = "cart.html";
      }, 800);
    });

    qvContent.querySelector(".qv-buy-now")?.addEventListener("click", (e) => {
      const btn = e.currentTarget;
      ShopNestCart.save([
        {
          id: btn.dataset.id,
          name: btn.dataset.name,
          price: parseInt(btn.dataset.price),
          img: btn.dataset.img,
          cat: btn.dataset.cat,
          qty: 1,
        },
      ]);
      refreshCartBadge();
      window.location.href = "cart.html";
    });

    qvContent
      .querySelector(".qv-add-wishlist")
      ?.addEventListener("click", (e) => {
        const btn = e.currentTarget;
        const id = btn.dataset.id;
        const added = ShopNestWishlist.toggle({
          id,
          name: btn.dataset.name,
          price: parseInt(btn.dataset.price),
          img: btn.dataset.img,
        });
        const icon = btn.querySelector(".material-icons");
        icon.textContent = added ? "favorite" : "favorite_border";
        icon.style.color = added ? "var(--coral)" : "";
        btn.childNodes[btn.childNodes.length - 1].textContent = added
          ? " Remove from Wishlist"
          : " Add to Wishlist";
        syncWishlistHeartOnPage(id, added);
        refreshWishlistHeaderIcon();
      });
  }

  function closeQuickView() {
    qvOverlay?.classList.remove("open");
    document.body.style.overflow = "";
  }

  qvClose?.addEventListener("click", closeQuickView);
  qvOverlay?.addEventListener("click", (e) => {
    if (e.target === qvOverlay) closeQuickView();
  });

  /* -------- FLASH SALE COUNTDOWN -------- */
  let totalSeconds = 8 * 3600 + 34 * 60 + 59;
  const cdH = document.getElementById("cd-hours");
  const cdM = document.getElementById("cd-minutes");
  const cdS = document.getElementById("cd-seconds");
  const pad = (n) => String(n).padStart(2, "0");

  if (cdH || cdM || cdS) {
    function tick() {
      if (totalSeconds <= 0) {
        clearInterval(tid);
        return;
      }
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      if (cdH) cdH.textContent = pad(h);
      if (cdM) cdM.textContent = pad(m);
      if (cdS) cdS.textContent = pad(s);
      totalSeconds--;
    }
    tick();
    const tid = setInterval(tick, 1000);
  }

  /* -------- NEWSLETTER -------- */
  const nlForm = document.getElementById("newsletter-form");
  if (nlForm) {
    nlForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("newsletter-email");
      const submitBtn = document.getElementById("newsletter-submit");
      const email = emailInput.value.trim();
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        emailInput.style.borderColor = "#ba1a1a";
        emailInput.focus();
        return;
      }
      submitBtn.textContent = "✓ Subscribed!";
      submitBtn.style.background = "linear-gradient(135deg,#22c55e,#16a34a)";
      emailInput.value = "";
      emailInput.style.borderColor = "";
      setTimeout(() => {
        submitBtn.textContent = "Subscribe";
        submitBtn.style.background = "";
      }, 3000);
    });
  }

  /* -------- SCROLL REVEAL -------- */
  if ("IntersectionObserver" in window) {
    const revealEls = document.querySelectorAll(
      ".product-card, .cat-card, .trust-item, .selected-item, .newsletter-inner",
    );
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    revealEls.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
      obs.observe(el);
    });
  }
});
