/* ============================================================
   SHOPNEST — Interactive Script
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* -------- ANNOUNCEMENT BAR -------- */
  const announcementBar = document.getElementById('announcement-bar');
  const announcementClose = document.getElementById('announcement-close');
  if (announcementClose && announcementBar) {
    announcementClose.addEventListener('click', () => {
      announcementBar.style.maxHeight = announcementBar.offsetHeight + 'px';
      requestAnimationFrame(() => {
        announcementBar.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
        announcementBar.style.maxHeight = '0';
        announcementBar.style.opacity = '0';
        announcementBar.style.overflow = 'hidden';
      });
      setTimeout(() => announcementBar.remove(), 350);
    });
  }

  /* -------- MOBILE MENU -------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const mobileClose = document.getElementById('mobile-close');

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('active');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('active');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openMobileMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* -------- STICKY HEADER SHADOW -------- */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.style.boxShadow = '0px 4px 24px rgba(18, 28, 44, 0.12)';
    } else {
      header.style.boxShadow = '0px 2px 20px rgba(18, 28, 44, 0.08)';
    }
  }, { passive: true });


  /* -------- FLASH SALE COUNTDOWN -------- */
  // Set countdown to 8h 34m 59s from now
  let totalSeconds = (8 * 3600) + (34 * 60) + 59;

  const cdHours   = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    if (totalSeconds <= 0) {
      clearInterval(countdownInterval);
      if (cdHours)   cdHours.textContent   = '00';
      if (cdMinutes) cdMinutes.textContent = '00';
      if (cdSeconds) cdSeconds.textContent = '00';
      return;
    }
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (cdHours)   cdHours.textContent   = pad(h);
    if (cdMinutes) cdMinutes.textContent = pad(m);
    if (cdSeconds) cdSeconds.textContent = pad(s);
    totalSeconds--;
  }

  let countdownInterval;
  if (cdHours || cdMinutes || cdSeconds) {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  /* -------- ADD TO CART INTERACTION -------- */
  const addToCartBtns = document.querySelectorAll('[id^="add-"]');
  const cartBadge = document.querySelector('.cart-badge');
  let cartCount = 3;

  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const originalText = btn.textContent;
      btn.textContent = '✓ Added!';
      btn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
      btn.disabled = true;
      cartCount++;
      if (cartBadge) cartBadge.textContent = cartCount;
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 1800);
    });
  });

  /* -------- WISHLIST INTERACTION -------- */
  document.querySelectorAll('[id^="wish-"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const icon = btn.querySelector('.material-icons');
      if (icon.textContent === 'favorite_border') {
        icon.textContent = 'favorite';
        icon.style.color = '#E94560';
        btn.style.background = '#E94560';
        btn.style.color = '#fff';
      } else {
        icon.textContent = 'favorite_border';
        icon.style.color = '';
        btn.style.background = '';
        btn.style.color = '';
      }
    });
  });

  /* -------- SELECTED ITEM ADD -------- */
  document.querySelectorAll('[id^="sel-add-"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const original = btn.textContent;
      btn.textContent = '✓';
      btn.style.background = '#22c55e';
      btn.style.color = '#fff';
      btn.style.borderColor = '#22c55e';
      cartCount++;
      if (cartBadge) cartBadge.textContent = cartCount;
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
      }, 1800);
    });
  });

  /* -------- NEWSLETTER FORM -------- */
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      const submitBtn = document.getElementById('newsletter-submit');
      const email = emailInput.value.trim();
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        emailInput.style.borderColor = '#ba1a1a';
        emailInput.focus();
        return;
      }
      submitBtn.textContent = '✓ Subscribed!';
      submitBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
      emailInput.value = '';
      emailInput.style.borderColor = '';
      setTimeout(() => {
        submitBtn.textContent = 'Subscribe';
        submitBtn.style.background = '';
      }, 3000);
    });
  }

  /* -------- SCROLL REVEAL ANIMATION -------- */
  const revealEls = document.querySelectorAll(
    '.product-card, .cat-card, .trust-item, .selected-item, .newsletter-inner'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
      observer.observe(el);
    });
  }

  /* -------- SEARCH BAR FOCUS EXPAND -------- */
  const searchInput = document.getElementById('search-input');
  const searchBar = document.getElementById('search-bar');
  if (searchInput && searchBar) {
    searchInput.addEventListener('focus', () => {
      searchBar.style.maxWidth = '380px';
    });
    searchInput.addEventListener('blur', () => {
      searchBar.style.maxWidth = '';
    });
  }

});
