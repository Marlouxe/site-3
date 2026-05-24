/* ============================================================
   home.js — TryHookMe (index.html)
   Gère le split-screen hero :
     - Hover souris : expansion gauche / droite
     - Touches fléchées ← → ou A / D
     - Hint footer disparaît après interaction
     - Animations d'entrée
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const hero      = document.getElementById('hero');
  const panelCraft = document.getElementById('panel-craft');
  const panelCyber = document.getElementById('panel-cyber');
  const divider    = document.getElementById('divider');
  const hint       = document.getElementById('footer-home-hint');

  if (!hero || !panelCraft || !panelCyber) return;

  /* ── État ─────────────────────────────────────────────── */
  let mode = 'neutral';   // 'neutral' | 'craft' | 'cyber'
  let hintDismissed = false;

  /* ── Classes utilitaires ─────────────────────────────── */
  function setMode(newMode) {
    if (newMode === mode) return;
    mode = newMode;

    hero.classList.remove('expand-craft', 'expand-cyber');
    if (mode === 'craft') hero.classList.add('expand-craft');
    if (mode === 'cyber') hero.classList.add('expand-cyber');

    dismissHint();
  }

  function dismissHint() {
    if (hintDismissed || !hint) return;
    hintDismissed = true;
    hint.style.opacity = '0';
    hint.style.transform = 'translateY(8px)';
    setTimeout(() => hint.remove(), 400);
  }

  /* ── Hover souris ─────────────────────────────────────── */
  panelCraft.addEventListener('mouseenter', () => setMode('craft'));
  panelCyber.addEventListener('mouseenter', () => setMode('cyber'));
  hero.addEventListener('mouseleave',       () => setMode('neutral'));

  /* ── Clavier ←→ ──────────────────────────────────────── */
  document.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        if (mode === 'craft') {
          // Déjà sur craft → aller à la boutique
          window.location.href = 'shop.html';
        } else {
          setMode('craft');
        }
        break;

      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        if (mode === 'cyber') {
          window.location.href = 'cyberfolio.html';
        } else {
          setMode('cyber');
        }
        break;

      case 'Enter':
        if (mode === 'craft') window.location.href = 'shop.html';
        if (mode === 'cyber') window.location.href = 'cyberfolio.html';
        break;

      case 'Escape':
        setMode('neutral');
        break;
    }
  });

  /* ── Touch / Swipe (mobile) ───────────────────────────── */
  let touchStartX = 0;

  hero.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  hero.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const threshold = 40;
    if (dx < -threshold) setMode('cyber');
    else if (dx > threshold) setMode('craft');
  }, { passive: true });

  /* ── Tap sur mobile : expand au 1er tap, navigue au 2e ─ */
  panelCraft.addEventListener('click', () => {
    if (mode === 'craft') window.location.href = 'shop.html';
    else setMode('craft');
  });

  panelCyber.addEventListener('click', () => {
    if (mode === 'cyber') window.location.href = 'cyberfolio.html';
    else setMode('cyber');
  });

  /* ── Divider badge cliquable ─────────────────────────── */
  if (divider) {
    divider.addEventListener('click', () => {
      setMode(mode === 'neutral' ? 'craft' : mode === 'craft' ? 'cyber' : 'neutral');
    });
  }

  /* ── Animation d'entrée ──────────────────────────────── */
  // Les éléments apparaissent avec un léger délai cascadé
  setTimeout(() => {
    hero.classList.add('hero--visible');
    if (hint) {
      hint.style.opacity = '1';
      hint.style.transform = 'translateY(0)';
    }
  }, 100);

});