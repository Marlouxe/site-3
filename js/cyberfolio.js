/* ===================================================
   TRYHOOKME — CYBERFOLIO JS
   Navigation sidebar + scroll spy
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── SIDEBAR ACTIVE AU SCROLL ─────────────────────
  const sections = document.querySelectorAll('[data-section-id]');
  const sideLinks = document.querySelectorAll('.sidebar-link[data-section]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.dataset.sectionId;
        sideLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: `-64px 0px 0px 0px` });

  sections.forEach(s => observer.observe(s));

  // ── SMOOTH SCROLL SIDEBAR ────────────────────────
  sideLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.dataset.section;
      const target = document.querySelector(`[data-section-id="${id}"]`);
      if (target) {
        const offset = 80;
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // ── SIDEBAR TOGGLE MOBILE ────────────────────────
  const toggle  = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // ── ANIMATION APPARITION DES CARTES ─────────────
  const animEls = document.querySelectorAll('.offer-card, .template-card, .portfolio-card, .process-step');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.45s ease ${i * 0.05}s, transform 0.45s ease ${i * 0.05}s`;
    fadeObserver.observe(el);
  });

});
