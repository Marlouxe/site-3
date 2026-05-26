/* ===================================================
   TRYHOOKME — CONTACT JS
   Upload fichiers · compteur · validation mailto
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const MAX_SIZE_MB = 20;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  // ── COMPTEUR DE CARACTÈRES ────────────────────────
  const textarea = document.getElementById('message');
  const counter  = document.getElementById('charCounter');
  if (textarea && counter) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      counter.textContent = `${len} / 2000`;
      counter.style.color = len > 1800 ? '#ffd700' : '';
      if (len > 2000) textarea.value = textarea.value.slice(0, 2000);
    });
  }

  // ── GESTION FICHIERS ──────────────────────────────
  const dropZone  = document.getElementById('fileDropZone');
  const fileInput = document.getElementById('fileInput');
  const fileList  = document.getElementById('fileList');
  const warning   = document.getElementById('fileWarning');

  let selectedFiles = [];

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  }

  function getTotalSize() {
    return selectedFiles.reduce((sum, f) => sum + f.size, 0);
  }

  function renderFileList() {
    if (!fileList) return;
    fileList.innerHTML = '';
    selectedFiles.forEach((file, idx) => {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = `
        <span class="file-item-name" title="${file.name}">📄 ${file.name}</span>
        <span class="file-item-size">${formatSize(file.size)}</span>
        <button class="file-item-remove" data-idx="${idx}" aria-label="Supprimer">✕</button>
      `;
      fileList.appendChild(item);
    });
    fileList.querySelectorAll('.file-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedFiles.splice(parseInt(btn.dataset.idx), 1);
        renderFileList();
        checkSize();
      });
    });
  }

  function checkSize() {
    if (!warning) return true;
    const total = getTotalSize();
    if (total > MAX_SIZE_BYTES) {
      warning.textContent = `⚠ Total trop lourd (${formatSize(total)}) — limite : ${MAX_SIZE_MB} Mo`;
      return false;
    }
    warning.textContent = selectedFiles.length > 0 ? `Total : ${formatSize(total)} / ${MAX_SIZE_MB} Mo` : '';
    return true;
  }

  function addFiles(newFiles) {
    Array.from(newFiles).forEach(file => {
      if (!selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
        selectedFiles.push(file);
      }
    });
    renderFileList();
    checkSize();
  }

  if (fileInput) fileInput.addEventListener('change', () => addFiles(fileInput.files));

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      addFiles(e.dataTransfer.files);
    });
  }

  // ── VALIDATION & ENVOI ─────────────────────────────
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const success   = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!checkSize()) return;

      const nom     = document.getElementById('nom')?.value || '';
      const email   = document.getElementById('email')?.value || '';
      const sujet   = document.getElementById('sujet')?.value || '';
      const message = textarea?.value || '';
      const sujetLabel = document.querySelector(`#sujet option[value="${sujet}"]`)?.textContent || sujet;

      const body = encodeURIComponent(
        `Nom : ${nom}\nEmail : ${email}\nObjet : ${sujetLabel}\n\n${message}\n\n` +
        (selectedFiles.length > 0 ? `[Fichiers à joindre : ${selectedFiles.map(f => f.name).join(', ')}]` : '')
      );

      const mailto = `mailto:contact@tryhookme.fr?subject=${encodeURIComponent('[TryHookMe] ' + sujetLabel)}&body=${body}`;
      window.location.href = mailto;

      setTimeout(() => {
        if (form && success) {
          form.style.display = 'none';
          success.style.display = 'block';
        }
      }, 800);
    });
  }

  // ── ANIMATIONS ENTRÉE ──────────────────────────────
  const els = document.querySelectorAll('.form-group, .info-card');
  els.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    setTimeout(() => {
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 60 + i * 55);
  });

});
