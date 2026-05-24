/* ============================================================
   shop.js — TryHookMe (shop.html)
   - Filtrage par catégorie (sidebar + toolbar chips)
   - Sous-catégories accordéon sidebar
   - Filtre prix max (range slider)
   - Tri (nouveautés / prix)
   - Sidebar toggle mobile
   - Ajout au panier (via main.js THM.cartAdd)
   - Boutons favoris (cœur toggle)
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ── Références ───────────────────────────────────────── */
  const sidebar        = document.getElementById('sidebar');
  const sidebarToggle  = document.getElementById('sidebar-toggle');
  const productGrid    = document.getElementById('product-grid');
  const productCount   = document.getElementById('product-count');
  const sortSelect     = document.getElementById('sort-select');
  const priceRange     = document.getElementById('price-range');
  const priceVal       = document.getElementById('price-val');
  const filterChips    = document.querySelectorAll('.filter-chip');
  const sidebarItems   = document.querySelectorAll('.sidebar__item[data-cat]');
  const subItems       = document.querySelectorAll('.sidebar__sub-item[data-subcat]');

  /* ── État ─────────────────────────────────────────────── */
  let activeCategory  = 'all';
  let activeSubcat    = null;
  let activeFilter    = 'all';   // chip toolbar : all / new / custom
  let maxPrice        = 300;
  let sortMode        = 'default';

  /* ── Données produits depuis le DOM ───────────────────── */
  function getCards() {
    return [...document.querySelectorAll('.product-card')];
  }

  /* ── Filtrage & tri ───────────────────────────────────── */
  function applyFilters() {
    const cards = getCards();
    let visible = 0;

    // Tri d'abord (réordonne le DOM)
    sortCards(cards);

    cards.forEach(card => {
      const cats   = (card.dataset.cat  || '').split(' ');
      const price  = Number(card.dataset.price) || 0;
      const isNew  = !!card.querySelector('.badge--new');
      const isCust = !!card.querySelector('.badge--custom');

      let show = true;

      // Filtre catégorie sidebar
      if (activeCategory !== 'all' && !cats.includes(activeCategory)) show = false;

      // Filtre sous-catégorie
      if (activeSubcat) {
        // ex: 'crochet-deco' → cherche dans data-cat
        const subCatBase = activeSubcat.split('-').slice(1).join('-');
        const parentCat  = activeSubcat.split('-')[0];
        if (!cats.includes(parentCat) && !cats.includes(subCatBase)) show = false;
      }

      // Filtre chip toolbar
      if (activeFilter === 'new'    && !isNew)  show = false;
      if (activeFilter === 'custom' && !isCust) show = false;

      // Filtre prix
      if (price > maxPrice) show = false;

      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (productCount) {
      productCount.textContent = `${visible} création${visible > 1 ? 's' : ''}`;
    }
  }

  function sortCards(cards) {
    if (!productGrid) return;
    if (sortMode === 'default') {
      // Ordre original (via data-order si présent, sinon DOM order)
      return;
    }
    const sorted = [...cards].sort((a, b) => {
      const pa = Number(a.dataset.price) || 0;
      const pb = Number(b.dataset.price) || 0;
      return sortMode === 'price-asc' ? pa - pb : pb - pa;
    });
    sorted.forEach(c => productGrid.appendChild(c));
  }

  /* ── Catégories sidebar ───────────────────────────────── */
  sidebarItems.forEach(item => {
    item.addEventListener('click', e => {
      // Si c'est un item avec sous-menu, basculer le sous-menu
      const cat    = item.dataset.cat;
      const subId  = item.id ? item.id.replace('toggle-', '') : null;
      const subMenu = subId ? document.getElementById(`sub-${subId}`) : null;

      if (subMenu) {
        // Toggle accordéon
        const isOpen = subMenu.classList.toggle('open');
        item.querySelector('.expand-arrow')?.classList.toggle('open', isOpen);
      }

      // Activer catégorie principale
      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      activeCategory = cat;
      activeSubcat   = null;
      // Désélectionner sous-cat
      subItems.forEach(s => s.classList.remove('active'));
      applyFilters();
    });
  });

  /* ── Sous-catégories ─────────────────────────────────── */
  subItems.forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      subItems.forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      activeSubcat = item.dataset.subcat;
      applyFilters();
    });
  });

  /* ── Chips toolbar ───────────────────────────────────── */
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      applyFilters();
    });
  });

  /* ── Slider prix ─────────────────────────────────────── */
  if (priceRange) {
    priceRange.addEventListener('input', () => {
      maxPrice = Number(priceRange.value);
      if (priceVal) priceVal.textContent = maxPrice + ' €';
      applyFilters();
    });
  }

  /* ── Tri ─────────────────────────────────────────────── */
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      sortMode = sortSelect.value;
      applyFilters();
    });
  }

  /* ── Boutons ajouter au panier ───────────────────────── */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.product-card__action');
    if (!btn) return;

    const { name, price, emoji } = btn.dataset;
    if (!name) return;

    // Animation feedback
    btn.textContent = '✓';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = '+';
      btn.classList.remove('added');
    }, 1200);

    if (window.THM) {
      window.THM.cartAdd(name, Number(price) || 0, emoji || '🛒');
    }
  });

  /* ── Favoris ─────────────────────────────────────────── */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.product-card__wish');
    if (!btn) return;
    const isWished = btn.classList.toggle('wished');
    btn.textContent = isWished ? '❤️' : '🤍';
    btn.setAttribute('aria-pressed', isWished);
  });

  /* ── Sidebar toggle mobile ───────────────────────────── */
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      const open = sidebar.classList.toggle('open');
      sidebarToggle.textContent = open ? '✕ Fermer' : '☰ Catégories';
    });

    // Fermer en cliquant en dehors
    document.addEventListener('click', e => {
      if (
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !sidebarToggle.contains(e.target)
      ) {
        sidebar.classList.remove('open');
        sidebarToggle.textContent = '☰ Catégories';
      }
    });
  }

  /* ── Init ────────────────────────────────────────────── */
  applyFilters();

});