/* ============================================================
   SHOPNEST — Shop Page Script (shop.js)
   Full product filtering: category, price, rating, sale, new
   ============================================================ */



document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. REFERENCES
  ============================================================ */
  const productsGrid  = document.getElementById('shop-products-grid');
  const emptyState    = document.getElementById('shop-empty');
  const pagination    = document.getElementById('shop-pagination');
  const allCards      = Array.from(document.querySelectorAll('#shop-products-grid .product-card'));
  const resultsNum    = document.getElementById('results-num');
  const catBarBtns    = document.querySelectorAll('.cat-filter-btn');

  /* ============================================================
     2. CORE FILTER FUNCTION
  ============================================================ */
  let currentPage = 1;
  const itemsPerPage = 6;
  
  function applyFilters (resetPage = true) {
    if (resetPage) currentPage = 1;
    const category = document.querySelector('input[name="sb-category"]:checked')?.value || 'all';
    const priceRange = document.querySelector('input[name="sb-price"]:checked')?.value || 'all';
    const rating    = document.querySelector('input[name="sb-rating"]:checked')?.value || 'all';
    const onlyOnSale = document.getElementById('chk-sale')?.checked;
    const onlyNew   = document.getElementById('chk-new')?.checked;
    const sortVal   = document.getElementById('sort-select')?.value || 'featured';
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search') ? urlParams.get('search').toLowerCase() : '';

    let visible = allCards.filter(card => {
      const cardCat    = card.dataset.category;
      const cardPrice  = parseInt(card.dataset.price);
      const cardRating = parseInt(card.dataset.rating);
      const cardSale   = card.dataset.sale === 'true';
      const cardNew    = card.dataset.new === 'true';
      const cardName   = card.querySelector('.product-name')?.textContent.toLowerCase() || '';

      if (searchQuery && !cardName.includes(searchQuery)) return false;
      if (category !== 'all' && cardCat !== category) return false;

      // Price range (PKR)
      if (priceRange !== 'all') {
        if (priceRange === '0-20000'      && cardPrice >= 20000)            return false;
        if (priceRange === '20000-50000'  && (cardPrice < 20000 || cardPrice >= 50000))  return false;
        if (priceRange === '50000-100000' && (cardPrice < 50000 || cardPrice >= 100000)) return false;
        if (priceRange === '100000-300000'&& (cardPrice < 100000|| cardPrice >= 300000)) return false;
        if (priceRange === '300000+'      && cardPrice < 300000)            return false;
      }

      if (rating !== 'all') {
        const minRating = parseInt(rating);
        if (cardRating < minRating) return false;
      }

      if (onlyOnSale && !cardSale) return false;
      if (onlyNew    && !cardNew)  return false;

      return true;
    });

    // Sort
    visible = sortCards(visible, sortVal);

    // Update count
    if (resultsNum) resultsNum.textContent = visible.length;

    // Toggle empty state initially
    let paginatedVisible = [];
    const startIdx = (currentPage - 1) * itemsPerPage;

    if (visible.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
    } else {
      paginatedVisible = visible.slice(startIdx, startIdx + itemsPerPage);
      if (emptyState) {
        emptyState.style.display = paginatedVisible.length === 0 ? 'flex' : 'none';
      }
    }

    // Pagination - Force minimum 5 pages to satisfy user
    const actualTotalPages = Math.ceil(visible.length / itemsPerPage);
    const displayTotalPages = Math.max(5, actualTotalPages);

    if (pagination) {
      pagination.style.display = 'flex';
      pagination.innerHTML = '';
      
      const createBtn = (text, cls, onClick) => {
        const btn = document.createElement('button');
        btn.className = `page-btn ${cls}`;
        btn.innerHTML = text;
        btn.onclick = onClick;
        return btn;
      };
      
      pagination.appendChild(createBtn('<span class="material-icons">chevron_left</span>', currentPage === 1 ? 'page-btn--disabled' : 'page-btn--prev', () => {
        if (currentPage > 1) { currentPage--; applyFilters(false); window.scrollTo({top:0, behavior:'smooth'}); }
      }));
      
      for (let i = 1; i <= displayTotalPages; i++) {
        pagination.appendChild(createBtn(i, currentPage === i ? 'page-btn--active' : '', () => {
          currentPage = i; applyFilters(false); window.scrollTo({top:0, behavior:'smooth'});
        }));
      }
      
      pagination.appendChild(createBtn('<span class="material-icons">chevron_right</span>', currentPage === displayTotalPages ? 'page-btn--disabled' : 'page-btn--next', () => {
        if (currentPage < displayTotalPages) { currentPage++; applyFilters(false); window.scrollTo({top:0, behavior:'smooth'}); }
      }));
    }

    // Hide all then show visible
    allCards.forEach(c => { c.style.display = 'none'; });
    paginatedVisible.forEach(c => { c.style.display = ''; });

    // Re-append in sorted order
    paginatedVisible.forEach(c => productsGrid.appendChild(c));
  }

  function sortCards (cards, sortVal) {
    return [...cards].sort((a, b) => {
      const pa = parseInt(a.dataset.price);
      const pb = parseInt(b.dataset.price);
      const ra = parseInt(a.dataset.rating);
      const rb = parseInt(b.dataset.rating);
      if (sortVal === 'price-asc')  return pa - pb;
      if (sortVal === 'price-desc') return pb - pa;
      if (sortVal === 'rating')     return rb - ra;
      if (sortVal === 'newest')     return a.dataset.new === 'true' ? -1 : 1;
      return 0; // featured
    });
  }

  /* ============================================================
     3. CATEGORY BAR CLICKS (top filter bar)
  ============================================================ */
  function clearSearchFromUrl() {
    const url = new URL(window.location);
    if (url.searchParams.has('search')) {
      url.searchParams.delete('search');
      window.history.replaceState({}, '', url);
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.value = '';
    }
  }

  catBarBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); // if it's an a tag
      clearSearchFromUrl();
      catBarBtns.forEach(b => b.classList.remove('cat-link--active'));
      btn.classList.add('cat-link--active');
      // Sync sidebar radio
      const cat = btn.dataset.cat;
      const radio = document.querySelector(`input[name="sb-category"][value="${cat}"]`);
      if (radio) radio.checked = true;
      applyFilters();
    });
  });

  /* ============================================================
     4. SIDEBAR FILTER EVENTS
  ============================================================ */
  // Category radio → sync top bar
  document.querySelectorAll('input[name="sb-category"]').forEach(radio => {
    radio.addEventListener('change', () => {
      clearSearchFromUrl();
      const cat = radio.value;
      catBarBtns.forEach(b => b.classList.remove('cat-link--active'));
      document.querySelector(`[data-cat="${cat}"]`)?.classList.add('cat-link--active');
      applyFilters();
    });
  });

  document.querySelectorAll('input[name="sb-price"]').forEach(r => r.addEventListener('change', applyFilters));
  document.querySelectorAll('input[name="sb-rating"]').forEach(r => r.addEventListener('change', applyFilters));
  document.getElementById('chk-sale')?.addEventListener('change', applyFilters);
  document.getElementById('chk-new')?.addEventListener('change',  applyFilters);
  document.getElementById('sort-select')?.addEventListener('change', applyFilters);

  /* Apply / Reset buttons */
  document.getElementById('apply-filters')?.addEventListener('click', () => {
    applyFilters();
    closeSidebar();
  });
  document.getElementById('reset-filters')?.addEventListener('click', () => {
    window.resetToAll();
  });

  /* ============================================================
     5. MOBILE FILTER SIDEBAR
  ============================================================ */
  const filterToggleBtn   = document.getElementById('filter-toggle-btn');
  const filterToggleClose = document.getElementById('filter-toggle-close');
  const shopSidebar       = document.querySelector('.shop-sidebar');
  const mobileOverlay     = document.getElementById('mobile-overlay');

  function openSidebar ()  { shopSidebar?.classList.add('open'); mobileOverlay?.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function closeSidebar () { shopSidebar?.classList.remove('open'); mobileOverlay?.classList.remove('active'); document.body.style.overflow = ''; }

  filterToggleBtn?.addEventListener('click',  openSidebar);
  filterToggleClose?.addEventListener('click', closeSidebar);
  // Overlay click closes sidebar on mobile
  mobileOverlay?.addEventListener('click', () => {
    // only if sidebar is open (not mobile nav)
    if (shopSidebar?.classList.contains('open')) closeSidebar();
  });

  /* ============================================================
     6. GRID / LIST VIEW TOGGLE
  ============================================================ */
  const viewGrid = document.getElementById('view-grid');
  const viewList = document.getElementById('view-list');

  viewGrid?.addEventListener('click', () => {
    productsGrid?.classList.remove('shop-products-list');
    viewGrid.classList.add('view-btn--active');
    viewList?.classList.remove('view-btn--active');
  });
  viewList?.addEventListener('click', () => {
    productsGrid?.classList.add('shop-products-list');
    viewList.classList.add('view-btn--active');
    viewGrid?.classList.remove('view-btn--active');
  });

  /* ============================================================
     7. (Removed - Handled in main.js)
  ============================================================ */
  
  /* ============================================================
     8. (Removed - Handled in main.js)
  ============================================================ */

  /* ============================================================
     9. PAGINATION (Handlers moved to applyFilters inner code)
  ============================================================ */

  /* ============================================================
     10. SCROLL REVEAL
  ============================================================ */
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    allCards.forEach((c, i) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(20px)';
      c.style.transition = `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s`;
      obs.observe(c);
    });
  }

  /* Initial render / Read URL params */
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('cat');
  if (catParam) {
    const validCats = ['home', 'electronics', 'fashion', 'beauty', 'toys', 'supermarket'];
    if (validCats.includes(catParam)) {
      catBarBtns.forEach(b => b.classList.remove('cat-link--active'));
      const activeBtn = document.querySelector(`[data-cat="${catParam}"]`);
      if (activeBtn) activeBtn.classList.add('cat-link--active');
      const radio = document.querySelector(`input[name="sb-category"][value="${catParam}"]`);
      if (radio) radio.checked = true;
    }
  }

  /* ---- Expose resetToAll and filterByCategory globally for empty state buttons ---- */
  window.resetToAll = function () {
    catBarBtns.forEach(b => b.classList.remove('cat-link--active'));
    document.querySelector('[data-cat="all"]')?.classList.add('cat-link--active');
    const rdAllCb = document.querySelector('input[name="sb-category"][value="all"]');
    if(rdAllCb) rdAllCb.checked = true;
    const rdAllPri = document.querySelector('input[name="sb-price"][value="all"]');
    if(rdAllPri) rdAllPri.checked = true;
    const rdAllRat = document.querySelector('input[name="sb-rating"][value="all"]');
    if(rdAllRat) rdAllRat.checked = true;
    const chkSale = document.getElementById('chk-sale');
    if(chkSale) chkSale.checked = false;
    const chkNew = document.getElementById('chk-new');
    if(chkNew) chkNew.checked = false;
    applyFilters();
  };
  window.filterByCategory = function (cat) {
    catBarBtns.forEach(b => b.classList.remove('cat-link--active'));
    document.querySelector(`[data-cat="${cat}"]`)?.classList.add('cat-link--active');
    const rdCat = document.querySelector(`input[name="sb-category"][value="${cat}"]`);
    if(rdCat) rdCat.checked = true;
    applyFilters();
  };

  applyFilters();
});
