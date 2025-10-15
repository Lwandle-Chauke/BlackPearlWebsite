(function() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mainNav = document.getElementById('mainNav') || document.querySelector('nav');
  const navLinks = document.querySelectorAll('nav ul li a, .mobile-menu a');
  const currentPath = window.location.pathname;

  // =====================
  // RESPONSIVE NAV DISPLAY
  // =====================
  function applyNavDisplay() {
    if (window.innerWidth >= 720) {
      mainNav.style.display = 'flex';
      mobileMenu.classList.remove('active');
      hamburger.classList.remove('active');
    } else {
      mainNav.style.display = 'none';
    }
  }

  applyNavDisplay();
  window.addEventListener('resize', applyNavDisplay);

  // =====================
  // TOGGLE MOBILE MENU
  // =====================
  hamburger.addEventListener('click', function() {
    const isActive = mobileMenu.classList.toggle('active');
    hamburger.classList.toggle('active', isActive);
    mobileMenu.setAttribute('aria-hidden', !isActive);
  });

  // =====================
  // HIGHLIGHT CURRENT PAGE
  // =====================
  navLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname.replace(/\/$/, '');
    const pagePath = currentPath.replace(/\/$/, '');
    if (linkPath === pagePath) {
      link.classList.add('active');
    }
  });

  // =====================
  // CLOSE MENU WHEN CLICKING OUTSIDE
  // =====================
  document.addEventListener('click', function(e) {
    if (
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target) &&
      window.innerWidth < 720
    ) {
      mobileMenu.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });

  // =====================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // =====================
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(ev) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        ev.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.innerWidth < 720) {
          mobileMenu.classList.remove('active');
          hamburger.classList.remove('active');
        }
      }
    });
  });
})();

// =====================
// AUTH POPUP HANDLING
// =====================
document.addEventListener("DOMContentLoaded", function() {
  const signInBtn = document.getElementById('signInBtn');
  const overlay = document.getElementById('authOverlay');
  const closeBtn = document.getElementById('closeAuth');
  const signinTab = document.getElementById('signinTab');
  const registerTab = document.getElementById('registerTab');
  const signinForm = document.getElementById('signinForm');
  const registerForm = document.getElementById('registerForm');

  if (!signInBtn || !overlay) return; // Exit safely if elements don't exist

  signInBtn.addEventListener('click', (e) => {
    e.preventDefault();
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });

  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
  });

  signinTab.addEventListener('click', () => {
    signinTab.classList.add('active');
    registerTab.classList.remove('active');
    signinForm.classList.add('active');
    registerForm.classList.remove('active');
  });

  registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    signinTab.classList.remove('active');
    registerForm.classList.add('active');
    signinForm.classList.remove('active');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
});
