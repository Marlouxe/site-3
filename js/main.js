/* ===================================================
   TRYHOOKME — JS PRINCIPAL
   Navbar · Burger · Panier badge · URL params
   =================================================== */

// ── NAVBAR SCROLL ───────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ── BURGER MENU MOBILE ──────────────────────────────
const burger = document.getElementById('navBurger');
const navLinks = document.querySelector('.nav-links');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ── BADGE PANIER (mis à jour sur toutes les pages) ──
function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  try {
    const cart = JSON.parse(localStorage.getItem('thm_cart') || '[]');
    badge.textContent = cart.length;
    badge.classList.toggle('visible', cart.length > 0);
  } catch(e) {}
}
updateCartBadge();

// ── PRÉ-SÉLECTION DROPDOWN CONTACT ─────────────────
document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('sujet');
  if (select) {
    const params = new URLSearchParams(window.location.search);
    const sujet = params.get('sujet');
    if (sujet) {
      const option = select.querySelector(`option[value="${sujet}"]`);
      if (option) {
        option.selected = true;
        select.dispatchEvent(new Event('change'));
      }
    }
  }
});

// ── TOAST NOTIFICATION ──────────────────────────────
function showToast(msg, duration = 2200) {
  let toast = document.querySelector('.toast-notif');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notif';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

window.showToast = showToast;
