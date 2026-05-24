/* ============================================================
   main.js — TryHookMe
   Logique partagée sur toutes les pages :
     - Navbar burger (menu mobile)
     - Cart / Devis drawer
     - Modal authentification
     - Persistence panier (localStorage)
   ============================================================ */

'use strict';

/* ── Utilitaires ─────────────────────────────────────────── */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Panier (shared state) ───────────────────────────────── */

const CART_KEY = 'tryhookme_cart';

function cartLoad() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function cartSave(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

// items : [{ name, price, emoji, qty }]
let cartItems = cartLoad();

function cartAdd(name, price, emoji = '🛒') {
  const existing = cartItems.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cartItems.push({ name, price: Number(price), emoji, qty: 1 });
  }
  cartSave(cartItems);
  cartRender();
  cartOpen();
}

function cartRemove(name) {
  cartItems = cartItems.filter(i => i.name !== name);
  cartSave(cartItems);
  cartRender();
}

function cartClear() {
  cartItems = [];
  cartSave(cartItems);
  cartRender();
}

function cartTotal() {
  return cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function cartRender() {
  const countEl   = $('#cartCount');
  const itemsEl   = $('#cartItems');
  const emptyEl   = $('#cartEmpty');
  const totalEl   = $('#cartTotal');

  const total = cartItems.reduce((s, i) => s + i.qty, 0);
  if (countEl) countEl.textContent = total;

  // sidebar counter (cyberfolio)
  const sidebarCount = $('#sidebarCartCount');
  if (sidebarCount) sidebarCount.textContent = `${cartItems.length} service(s)`;

  const cyberCartSection = $('#cyberCartSection');
  if (cyberCartSection) {
    cyberCartSection.style.display = cartItems.length ? '' : 'none';
  }

  if (!itemsEl || !emptyEl) return;

  if (cartItems.length === 0) {
    emptyEl.style.display = '';
    itemsEl.style.display = 'none';
    if (totalEl) totalEl.textContent = '0 €';
    return;
  }

  emptyEl.style.display = 'none';
  itemsEl.style.display = '';
  itemsEl.innerHTML = cartItems.map(item => `
    <div class="cart-item">
      <span class="cart-item__emoji">${item.emoji}</span>
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__price">${item.price > 0 ? item.price * item.qty + ' €' : 'Sur devis'}</p>
      </div>
      <div class="cart-item__qty">
        <button class="cart-qty-btn" data-action="dec" data-name="${item.name}">−</button>
        <span>${item.qty}</span>
        <button class="cart-qty-btn" data-action="inc" data-name="${item.name}">+</button>
      </div>
      <button class="cart-remove-btn" data-name="${item.name}" aria-label="Supprimer">✕</button>
    </div>
  `).join('');

  // Boutons quantité & suppression
  $$('.cart-qty-btn', itemsEl).forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const item = cartItems.find(i => i.name === name);
      if (!item) return;
      if (btn.dataset.action === 'inc') {
        item.qty += 1;
      } else {
        item.qty -= 1;
        if (item.qty <= 0) { cartRemove(name); return; }
      }
      cartSave(cartItems);
      cartRender();
    });
  });

  $$('.cart-remove-btn', itemsEl).forEach(btn => {
    btn.addEventListener('click', () => cartRemove(btn.dataset.name));
  });

  if (totalEl) {
    const t = cartTotal();
    totalEl.textContent = t > 0 ? t + ' €' : 'Sur devis';
  }
}

function cartOpen() {
  const drawer  = $('#cartDrawer');
  const overlay = $('#cartOverlay');
  if (drawer)  drawer.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cartClose() {
  const drawer  = $('#cartDrawer');
  const overlay = $('#cartOverlay');
  if (drawer)  drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

/* ── Navbar burger ───────────────────────────────────────── */

function initNavbar() {
  const burger     = $('#burger');
  const mobileMenu = $('#mobile-menu');
  const navbar     = $('#navbar');

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      burger.classList.toggle('active', open);
    });

    // Fermer au clic extérieur
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        mobileMenu.classList.remove('open');
        burger.classList.remove('active');
      }
    });
  }

  // Scroll → ombre navbar
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ── Modal Auth ──────────────────────────────────────────── */

function initAuth() {
  const overlay  = $('#authOverlay');
  const closeBtn = $('#authClose');
  const tabs      = $$('.auth-tab');
  const submitBtn = $('#authSubmit');
  const titleEl   = $('.auth-modal__title');
  const accountBtns = $$('#accountBtn, #sidebarAccountBtn');

  if (!overlay) return;

  function openAuth() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeAuth() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  accountBtns.forEach(btn => btn && btn.addEventListener('click', openAuth));
  if (closeBtn) closeBtn.addEventListener('click', closeAuth);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeAuth(); });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isLogin = tab.dataset.tab === 'login';
      if (titleEl) titleEl.textContent = isLogin ? 'Bon retour !' : 'Créer un compte';
      if (submitBtn) submitBtn.textContent = isLogin ? 'Se connecter' : "S'inscrire";
    });
  });

  // Soumission simulée
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      submitBtn.textContent = '…';
      setTimeout(() => {
        submitBtn.textContent = '✓ Connecté !';
        setTimeout(closeAuth, 800);
      }, 900);
    });
  }
}

/* ── Cart events ─────────────────────────────────────────── */

function initCart() {
  const openBtn  = $('#cartOpenBtn');
  const openSide = $('#cartOpenSidebar');
  const closeBtn = $('#cartClose');
  const overlay  = $('#cartOverlay');
  const checkout = $('#cartCheckout');

  if (openBtn)  openBtn.addEventListener('click',  cartOpen);
  if (openSide) openSide.addEventListener('click', cartOpen);
  if (closeBtn) closeBtn.addEventListener('click', cartClose);
  if (overlay)  overlay.addEventListener('click',  cartClose);

  if (checkout) {
    checkout.addEventListener('click', () => {
      const params = new URLSearchParams({ objet: 'commande' });
      if (cartItems.length) {
        params.set('produits', cartItems.map(i => `${i.name} x${i.qty}`).join(', '));
        params.set('total', cartTotal() + ' €');
      }
      window.location.href = `contact.html?${params}`;
    });
  }

  // Exposer globalement pour shop.js / cyber.js
  window.THM = window.THM || {};
  Object.assign(window.THM, { cartAdd, cartRemove, cartClear, cartRender, cartOpen, cartClose });
}

/* ── Keyboard nav (home split screen) ───────────────────────
   Utilisé par home.js mais on expose ici le helper URL param  */

/* ── Init ────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCart();
  initAuth();
  cartRender(); // sync compteur dès le chargement

  // Pré-remplir contact depuis URL ?objet=
  const params = new URLSearchParams(location.search);
  const objet  = params.get('objet');
  if (objet) {
    const sel = document.querySelector(`#objet, select[name="objet"]`);
    if (sel) {
      // Trouver l'option la plus proche
      const opt = [...sel.options].find(o => o.value.includes(objet) || objet.includes(o.value));
      if (opt) sel.value = opt.value;
    }
  }
});