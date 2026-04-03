/*
==========================================================
  script.js — Liberation War Archive
  Custom JavaScript

  TABLE OF CONTENTS:
  1. Dark / Light Mode Toggle
  2. Document Filter (Type, Date, Relevance)
  3. Gallery Filter (Category buttons)
  4. Lightbox (open image in modal + zoom + download)
  5. File Upload (drag & drop + file select)
  6. Form Submit Handler
  7. Navbar Scroll Effect
==========================================================
*/


/* ──────────────────────────────────────────────────────
   1. DARK / LIGHT MODE TOGGLE
   - Reads the current theme from <html data-bs-theme="...">
   - Toggles between "light" and "dark"
   - Updates the button icon and label
   - Saves user preference to localStorage so it persists
────────────────────────────────────────────────────── */

// Run once the DOM (HTML) is fully loaded
document.addEventListener('DOMContentLoaded', function () {

  const htmlEl    = document.documentElement; // the <html> tag
  const toggleBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel= document.getElementById('themeLabel');

  // If there's no toggle button on this page, stop (e.g., document-details might not have it)
  if (!toggleBtn) return;

  // ── Check if a theme was saved previously ──
  const savedTheme = localStorage.getItem('lwaTheme');
  if (savedTheme) {
    // Apply saved theme
    htmlEl.setAttribute('data-bs-theme', savedTheme);
    updateToggleAppearance(savedTheme);
  }

  // ── Listen for clicks on the toggle button ──
  toggleBtn.addEventListener('click', function () {
    // Read the current theme
    const current = htmlEl.getAttribute('data-bs-theme');

    // Switch to the opposite theme
    const newTheme = (current === 'light') ? 'dark' : 'light';

    // Apply to <html> (Bootstrap 5 reads this attribute)
    htmlEl.setAttribute('data-bs-theme', newTheme);

    // Save to localStorage
    localStorage.setItem('lwaTheme', newTheme);

    // Update button appearance
    updateToggleAppearance(newTheme);
  });

  // ── Helper: update the button icon and label ──
  function updateToggleAppearance(theme) {
    if (theme === 'dark') {
      // Show sun icon (to switch back to light)
      themeIcon.className  = 'bi bi-moon-stars-fill';
      themeLabel.textContent = 'Dark Mode';
    } else {
      // Show moon icon (to switch to dark)
      themeIcon.className  = 'bi bi-sun-fill';
      themeLabel.textContent = 'Light Mode';
    }
  }

}); // END DOMContentLoaded


/* ──────────────────────────────────────────────────────
   2. DOCUMENT TABS
   How it works:
   - All tab buttons are inside #docTabs
   - Each button has a data-tab="..." attribute (e.g. "all", "declarations")
   - Each tab panel has an id like "tab-all", "tab-declarations", etc.
   - Clicking a button:
     1. Removes "active" from all buttons → adds "active" to clicked one
     2. Hides all panels (adds d-none) → shows the matching panel (removes d-none)
────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function () {

  /* ================= TABS ================= */
  const tabs = document.querySelectorAll('#docTabs .nav-link');

  tabs.forEach(btn => {
    btn.addEventListener('click', function () {

      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.add('d-none');
      });

      const target = document.getElementById('tab-' + btn.dataset.tab);
      if (target) target.classList.remove('d-none');

    });
  });

  /* ================= GALLERY FILTER ================= */
  const filters = document.querySelectorAll('.filter-btn');

  filters.forEach(btn => {
    btn.addEventListener('click', function () {

      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      document.querySelectorAll('.gallery-item').forEach(item => {
        const category = item.dataset.category;

        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

    });
  });

});


/* ================= LIGHTBOX ================= */
function openLightbox(src) {
  const img = document.getElementById('lightboxImg');
  img.src = src;

  const modal = new bootstrap.Modal(document.getElementById('lightboxModal'));
  modal.show();
}

/* ──────────────────────────────────────────────────────
   5. FILE UPLOAD (Drag & Drop + File Select)
   - Listens for dragover and drop events on the upload area
   - Also handles when user selects files via click + browse
   - Displays file names below the upload box
────────────────────────────────────────────────────── */

// Only set up if the upload area exists on this page
const uploadArea = document.getElementById('uploadArea');

if (uploadArea) {

  // ── Drag Over: highlight the upload box ──
  uploadArea.addEventListener('dragover', function (e) {
    e.preventDefault();                     // must prevent default to allow drop
    uploadArea.classList.add('drag-over');  // triggers the :hover CSS style
  });

  // ── Drag Leave: remove highlight ──
  uploadArea.addEventListener('dragleave', function () {
    uploadArea.classList.remove('drag-over');
  });

  // ── Drop: handle dropped files ──
  uploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');

    // e.dataTransfer.files is the list of files the user dropped
    displayFiles(e.dataTransfer.files);
  });
}

// ── Called when user selects files via the hidden <input> ──
function handleFileSelect(input) {
  displayFiles(input.files);
}

// ── Display selected/dropped file names below the upload box ──
function displayFiles(files) {
  const fileList = document.getElementById('fileList');
  if (!fileList) return;

  // Clear previous file list
  fileList.innerHTML = '';

  // Loop through each file and create a display item
  Array.from(files).forEach(function (file) {
    const div = document.createElement('div');
    div.className = 'file-item';

    // Choose icon based on file type
    let icon = 'bi-file-earmark';
    if (file.name.endsWith('.pdf')) icon = 'bi-file-earmark-pdf';
    if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png')) {
      icon = 'bi-file-earmark-image';
    }

    // Build the file item HTML
    // toLocaleString formats file size with commas: 1024 → 1,024
    div.innerHTML = `
      <i class="bi ${icon}"></i>
      <span>${file.name}</span>
      <small class="text-muted ms-auto">${(file.size / 1024).toFixed(1)} KB</small>
    `;

    fileList.appendChild(div);
  });
}


/* ──────────────────────────────────────────────────────
   6. FORM SUBMIT HANDLER
   - Basic validation: checks required fields are not empty
   - If valid: shows success message and resets form
   - If invalid: highlights the empty fields
────────────────────────────────────────────────────── */

function handleSubmit() {
  // Get field values
  const name    = document.getElementById('fullName');
  const email   = document.getElementById('emailInput');
  const subject = document.getElementById('subjectInput');

  let valid = true; // assume valid until proven otherwise

  // Simple check: are required fields filled?
  [name, email, subject].forEach(function (field) {
    if (!field) return; // field might not exist on this page

    if (field.value.trim() === '') {
      // Highlight invalid field with Bootstrap's is-invalid class
      field.classList.add('is-invalid');
      valid = false;
    } else {
      field.classList.remove('is-invalid');
    }
  });

  // Basic email format check (has @ and a dot after)
  if (email && email.value && !/\S+@\S+\.\S+/.test(email.value)) {
    email.classList.add('is-invalid');
    valid = false;
  }

  if (valid) {
    // ── Show success message ──
    const successMsg = document.getElementById('successMsg');
    if (successMsg) {
      successMsg.classList.remove('d-none');
    }

    // ── Reset all form fields ──
    const fieldsToReset = ['fullName', 'emailInput', 'subjectInput', 'messageInput'];
    fieldsToReset.forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    // Clear file list
    const fileList = document.getElementById('fileList');
    if (fileList) fileList.innerHTML = '';

    // Scroll to success message
    if (successMsg) {
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Auto-hide success message after 5 seconds
    setTimeout(function () {
      if (successMsg) successMsg.classList.add('d-none');
    }, 5000);
  }
}


/* ──────────────────────────────────────────────────────
   7. NAVBAR SCROLL EFFECT
   Adds a subtle shadow to the navbar when user scrolls down.
   This gives a "floating" effect so the nav stands out.
────────────────────────────────────────────────────── */
window.addEventListener('scroll', function () {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;

  if (window.scrollY > 50) {
    // User has scrolled: add shadow
    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
  } else {
    // At the top: remove shadow
    navbar.style.boxShadow = 'none';
  }
});