/* ===================================================
   TRYHOOKME — BOUTIQUE JS
   Filtrage · Favoris · Panier · Prix · Tri
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── DONNÉES PRODUITS ─────────────────────────────
  // Centralisées ici pour synchro avec favoris.html
  window.THM_PRODUCTS = [
    { id:'1', name:'Suspension murale boho',      price:35,  badge:'Crochet',  badgeClass:'',               emoji:'🧶', cat:'crochet decoration',   desc:'Décoration murale en macramé crocheté, tons naturels.' },
    { id:'2', name:'Pull cosy sur mesure',         price:80,  badge:'Tricot',   badgeClass:'badge-tricot',   emoji:'🧣', cat:'tricot vetements',     desc:'Pull tricoté main, laine douce, coloris & taille au choix.' },
    { id:'3', name:'Tableau brodé personnalisé',   price:45,  badge:'Broderie', badgeClass:'badge-broderie', emoji:'🪡', cat:'broderie decoration',  desc:'Portrait, paysage, citation — tout est possible sur tissu.' },
    { id:'4', name:'Sac cabas crocheté',           price:30,  badge:'Crochet',  badgeClass:'',               emoji:'👜', cat:'crochet accessoires',  desc:'Sac tressé léger, idéal marché ou plage. Couleur au choix.' },
    { id:'5', name:'Bonnet & écharpe assortis',    price:40,  badge:'Tricot',   badgeClass:'badge-tricot',   emoji:'🧢', cat:'tricot accessoires',   desc:'Ensemble tricoté main, douillet pour l'hiver. Personnalisable.' },
    { id:'6', name:'Personnalisation vêtement',    price:20,  badge:'Broderie', badgeClass:'badge-broderie', emoji:'👕', cat:'broderie accessoires vetements', desc:'Envoyez votre vêtement, on y brode votre motif. Unique.' },
  ];

  // ── FILTRE PAR CATÉGORIE ─────────────────────────
  const filterLinks = document.querySelectorAll('.sidebar-link[data-filter]');
  const cards = document.querySelectorAll('.product-card[data-cat]');

  filterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const filter = link.dataset.filter;
      filterLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      applyFilters(filter);
    });
  });

  function applyFilters(catFilter) {
  const maxPrice = parseInt(document.getElementById('price-range')?.value || 999);
  let visible = 0;
  cards.forEach(card => {
    const cats = (card.dataset.cat || '').split(' ');
    const price = parseInt(card.dataset.price || 0);
    const matchCat   = catFilter === 'all' || cats.includes(catFilter);
    const matchPrice = price <= maxPrice;
    card.style.display = (matchCat && matchPrice) ? '' : 'none';
    if (matchCat && matchPrice) visible++;
  });
  const countEl = document.getElementById('product-count');
  if (countEl) countEl.textContent = visible + ' création' + (visible > 1 ? 's' : '');
}

  // ── SIDEBAR TOGGLE MOBILE ────────────────────────
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
  document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) && e.target !== sidebarToggle) {
      sidebar.classList.remove('open');
    }
  });

  // ── FILTRE PRIX ──────────────────────────────────
  const priceRange = document.getElementById('price-range');
  const priceVal   = document.getElementById('price-val');
  if (priceRange) {
    priceRange.addEventListener('input', () => {
      if (priceVal) priceVal.textContent = priceRange.value + ' €';
      const activeFilter = document.querySelector('.sidebar-link.active[data-filter]')?.dataset.filter || 'all';
      applyFilters(activeFilter);
  });
}

  // ── TRI ──────────────────────────────────────────
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const grid = document.getElementById('productsGrid');
      if (!grid) return;
      const allCards = [...grid.querySelectorAll('.product-card')];
      allCards.sort((a, b) => {
        const pa = parseInt(a.dataset.price || 0);
        const pb = parseInt(b.dataset.price || 0);
        if (sortSelect.value === 'price-asc')  return pa - pb;
        if (sortSelect.value === 'price-desc') return pb - pa;
        return 0;
      });
      allCards.forEach(c => grid.appendChild(c));
    });
  }

  // ── FAVORIS ──────────────────────────────────────
  let favorites = [];
  try { favorites = JSON.parse(localStorage.getItem('thm_favorites') || '[]'); } catch(e) {}

  function saveFavorites() {
    localStorage.setItem('thm_favorites', JSON.stringify(favorites));
  }

  function updateFavUI() {
  document.querySelectorAll('.btn-wish').forEach(btn => {
    const id = btn.dataset.id;
    btn.textContent = favorites.includes(id) ? '❤️' : '🤍';
    btn.classList.toggle('active', favorites.includes(id));
  });
  const countEl = document.getElementById('fav-count-sidebar');
  if (countEl) {
    countEl.textContent = favorites.length > 0 ? favorites.length : '';
    countEl.style.display = favorites.length > 0 ? 'inline' : 'none';
  }
}
  updateFavUI();

  document.querySelectorAll('.btn-wish').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = btn.dataset.id;
    if (favorites.includes(id)) {
      favorites = favorites.filter(f => f !== id);
    } else {
      favorites.push(id);
    }
    saveFavorites();   // ← écrit dans localStorage
    updateFavUI();
    showToast(favorites.includes(id) ? '❤️ Ajouté aux favoris !' : 'Retiré des favoris');
  });
});

  // ── PANIER ───────────────────────────────────────
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('thm_cart') || '[]'); } catch(e) {}

  function saveCart() {
    localStorage.setItem('thm_cart', JSON.stringify(cart));
  }
  function refreshCartBadge() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    badge.textContent = cart.length;
    badge.classList.toggle('visible', cart.length > 0);
  }
  refreshCartBadge();

  document.querySelectorAll('.product-btn-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = {
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: parseInt(btn.dataset.price || 0)
    };
    if (!cart.find(c => c.id === item.id)) {
      cart.push(item);
      saveCart();          // ← écrit dans localStorage
      refreshCartBadge();
      showToast('🛒 Ajouté au panier !');
      const orig = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => btn.textContent = orig, 1400);
    } else {
      showToast('Déjà dans le panier');
    }
  });
});

  // ── ANIMATION CSS ────────────────────────────────
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes fadeInCard {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleEl);

  // Init count
  const countEl = document.getElementById('product-count');
  if (countEl) countEl.textContent = cards.length + ' créations';

});
