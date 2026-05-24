/* ============================================================
   cyber.js — TryHookMe (cyberfolio.html)
   - Navigation sidebar (sections filtrées)
   - Service cards : clic → ajout au panier devis
   - Sidebar toggle mobile
   - Highlight section active au scroll
   - Animation terminal cursor
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ── Références ───────────────────────────────────────── */
  const sidebar        = document.getElementById('sidebar');
  const sidebarToggle  = document.getElementById('sidebar-toggle');
  const navItems       = document.querySelectorAll('.cyber-nav-item[data-section]');
  const serviceCards   = document.querySelectorAll('.service-card[data-service]');
  const servicesGrid   = document.getElementById('services-grid');

  /* ── Navigation sidebar → sections ───────────────────── */
  const sectionMap = {
    'services'     : ['services-grid'],
    'from-scratch' : ['svc-scratch'],
    'template'     : ['svc-template'],
    'pdf'          : ['svc-pdf'],
    'portfolio'    : ['portfolio'],
    'process'      : ['process'],
    'tarifs'       : ['tarifs'],
    'faq'          : ['tarifs'],   // fusionné dans tarifs pour l'instant
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      const section = item.dataset.section;

      // Filtrage carte service
      filterServices(section);

      // Scroll vers la section cible
      const targets = sectionMap[section] || [];
      const firstId = targets[0];
      if (firstId) {
        const el = document.getElementById(firstId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      // Fermer sidebar mobile après clic
      if (window.innerWidth < 900 && sidebar) {
        sidebar.classList.remove('open');
        if (sidebarToggle) sidebarToggle.textContent = '⟨ MENU ⟩';
      }
    });
  });

  /* ── Filtrage cartes service ─────────────────────────── */
  function filterServices(section) {
    if (!servicesGrid) return;

    const highlightMap = {
      'from-scratch' : 'svc-scratch',
      'template'     : 'svc-template',
      'pdf'          : 'svc-pdf',
    };

    serviceCards.forEach(card => {
      card.classList.remove('highlighted');
    });

    if (highlightMap[section]) {
      const target = document.getElementById(highlightMap[section]);
      if (target) target.classList.add('highlighted');
    }
  }

  /* ── Service cards → panier devis ───────────────────── */
  serviceCards.forEach(card => {
    const cta = card.querySelector('.service-card__cta');
    if (!cta) return;

    cta.addEventListener('click', e => {
      e.stopPropagation();
      addServiceToCart(card);
    });

    card.addEventListener('click', () => {
      addServiceToCart(card);
    });
  });

  function addServiceToCart(card) {
    const name  = card.dataset.service;
    const price = Number(card.dataset.price) || 0;
    const icon  = card.querySelector('.service-card__icon')?.textContent || '🌐';

    if (!name || !window.THM) return;

    // Feedback visuel
    card.classList.add('card--adding');
    const cta = card.querySelector('.service-card__cta');
    const originalText = cta?.textContent;
    if (cta) cta.textContent = '✓ Ajouté';

    setTimeout(() => {
      card.classList.remove('card--adding');
      if (cta) cta.textContent = originalText;
    }, 1500);

    window.THM.cartAdd(name, price, icon);
  }

  /* ── Sidebar toggle mobile ───────────────────────────── */
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      const open = sidebar.classList.toggle('open');
      sidebarToggle.textContent = open ? '✕ FERMER' : '⟨ MENU ⟩';
    });

    document.addEventListener('click', e => {
      if (
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !sidebarToggle.contains(e.target)
      ) {
        sidebar.classList.remove('open');
        sidebarToggle.textContent = '⟨ MENU ⟩';
      }
    });
  }

  /* ── Scroll spy : active nav item ───────────────────── */
  const scrollSections = [
    { id: 'services-grid', nav: 'services' },
    { id: 'portfolio',     nav: 'portfolio' },
    { id: 'process',       nav: 'process' },
    { id: 'tarifs',        nav: 'tarifs' },
  ];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const match = scrollSections.find(s => s.id === entry.target.id);
      if (!match) return;
      navItems.forEach(n => {
        n.classList.toggle('active', n.dataset.section === match.nav);
      });
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  scrollSections.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  });

  /* ── Terminal cursor clignotant ──────────────────────── */
  // Le CSS gère l'animation, mais on randomise les textes de commandes
  const cmdLines = document.querySelectorAll('.cmd');
  const commands = [
    'ls services/',
    'npm run start',
    'git log --oneline',
    'cat portfolio.json',
    'open cyberfolio.html',
  ];
  let cmdIdx = 0;
  setInterval(() => {
    cmdLines.forEach(el => {
      cmdIdx = (cmdIdx + 1) % commands.length;
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = commands[cmdIdx];
        el.style.opacity = '1';
      }, 200);
    });
  }, 4000);

  /* ── Checkout drawer → contact ───────────────────────── */
  const checkoutBtn = document.getElementById('cartCheckout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      window.location.href = 'contact.html?objet=devis-cyberfolio';
    });
  }

});