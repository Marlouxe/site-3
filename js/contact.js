/* ============================================================
   contact.js — TryHookMe (contact.html)
   - Pré-remplissage du formulaire depuis les params URL
   - Validation client (champs requis, format e-mail)
   - Soumission simulée avec feedback
   - Compteur de caractères pour le message
   - FAQ accordéon (si présente)
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ── Pré-remplissage depuis URL ──────────────────────── */
  const params  = new URLSearchParams(location.search);
  const objet   = params.get('objet')   || '';
  const produits = params.get('produits') || '';
  const total   = params.get('total')   || '';

  const selectObjet = document.getElementById('objet');
  const msgArea     = document.getElementById('message');

  if (selectObjet && objet) {
    const opt = [...selectObjet.options].find(o => o.value === objet || objet.includes(o.value));
    if (opt) selectObjet.value = opt.value;
  }

  if (msgArea && produits) {
    const lines = [`Bonjour,\n\nVoici les éléments de ma commande :\n${produits}`];
    if (total) lines.push(`\nTotal estimé : ${total}`);
    lines.push('\nMerci de me recontacter pour confirmer.');
    msgArea.value = lines.join('');
    updateCharCount();
  }

  /* ── Compteur caractères ─────────────────────────────── */
  const charCount = document.getElementById('char-count');
  const maxChars  = 1000;

  function updateCharCount() {
    if (!msgArea || !charCount) return;
    const len = msgArea.value.length;
    charCount.textContent = `${len} / ${maxChars}`;
    charCount.style.color = len > maxChars * 0.9 ? 'var(--craft-pink, #e07a7a)' : '';
  }

  if (msgArea) {
    msgArea.addEventListener('input', updateCharCount);
    msgArea.setAttribute('maxlength', maxChars);
    updateCharCount();
  }

  /* ── Validation ──────────────────────────────────────── */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function showError(fieldId, msg) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add('error');
    let errEl = field.parentElement.querySelector('.field-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'field-error';
      field.parentElement.appendChild(errEl);
    }
    errEl.textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.field-error').forEach(el => el.remove());
  }

  function validateForm() {
    clearErrors();
    let valid = true;

    const prenom = document.getElementById('prenom');
    const email  = document.getElementById('email');
    const message = document.getElementById('message');

    if (prenom && !prenom.value.trim()) {
      showError('prenom', 'Veuillez entrer votre prénom.');
      valid = false;
    }
    if (email && !validateEmail(email.value)) {
      showError('email', 'Adresse e-mail invalide.');
      valid = false;
    }
    if (message && message.value.trim().length < 10) {
      showError('message', 'Votre message est trop court (10 caractères min).');
      valid = false;
    }

    return valid;
  }

  /* ── Soumission ──────────────────────────────────────── */
  const form      = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit');
  const successEl = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateForm()) return;

      // Feedback envoi
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi…';
      }

      // Simule un délai réseau (remplacer par fetch réel plus tard)
      await new Promise(r => setTimeout(r, 1200));

      // Succès
      form.style.display = 'none';
      if (successEl) {
        successEl.style.display = '';
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Vider le panier si commande envoyée
      if (window.THM) window.THM.cartClear();
    });
  }

  /* ── Inputs : retirer l'état erreur au focus ─────────── */
  document.querySelectorAll('.contact-form input, .contact-form textarea, .contact-form select')
    .forEach(el => {
      el.addEventListener('focus', () => {
        el.classList.remove('error');
        const errEl = el.parentElement.querySelector('.field-error');
        if (errEl) errEl.remove();
      });
    });

  /* ── FAQ accordéon ───────────────────────────────────── */
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item   = question.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      // Fermer tous les autres
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        const ans = openItem.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = '0';
      });

      if (!isOpen) {
        item.classList.add('open');
        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

});