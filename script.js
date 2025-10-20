(function() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mainNav = document.getElementById("mainNav") || document.querySelector("nav");
  const desktopNavList = document.querySelector("nav ul");
  const mobileMenuContent = document.querySelector(".mobile-menu");

  // Placeholder for user login status (will be replaced by actual auth logic)
  let isLoggedIn = false; // This should be determined by actual authentication status

  // Function to update navigation based on login status
  function updateNavigation() {
    // Clear existing nav items
    desktopNavList.innerHTML = '';
    mobileMenuContent.innerHTML = '';

    if (isLoggedIn) {
      // Logged-in navigation
      desktopNavList.innerHTML = `
        <li><a href="travel-Dashboard.html">Dashboard</a></li>
        <li><a href="about.html">About Us</a></li>
        <li><a href="fleet.html">Our Fleet</a></li>
        <li><a href="gallery.html">Gallery</a></li>
        <li><a href="bookings.html">Bookings</a></li>
        <li><a href="quote.html">Quote</a></li>
        <li><a href="Profile.html">Profile</a></li>
        <li><button id="signOutBtn" class="btn-header-signin">Sign Out</button></li>
      `;
      mobileMenuContent.innerHTML = `
        <a href="travel-Dashboard.html">DASHBOARD</a>
        <a href="about.html">ABOUT US</a>
        <a href="fleet.html">OUR FLEET</a>
        <a href="gallery.html">GALLERY</a>
        <a href="bookings.html">BOOKINGS</a>
        <a href="quote.html">QUOTE</a>
        <a href="Profile.html">PROFILE</a>
        <hr />
        <a href="#" id="signOutBtnMobile" class="btn-sign">SIGN OUT</a>
      `;
    } else {
      // Logged-out navigation
      desktopNavList.innerHTML = `
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About Us</a></li>
        <li><a href="fleet.html">Our Fleet</a></li>
        <li><a href="gallery.html">Gallery</a></li>
        <li><a href="quote.html">Quote</a></li>
        <li><a href="contact.html">Contact Us</a></li>
        <li><button id="signInBtn" class="btn-header-signin">Sign In</button></li>
      `;
      mobileMenuContent.innerHTML = `
        <a href="index.html">HOME</a>
        <a href="about.html">ABOUT US</a>
        <a href="fleet.html">OUR FLEET</a>
        <a href="gallery.html">GALLERY</a>
        <a href="quote.html">QUOTE</a>
        <a href="contact.html">CONTACT US</a>
        <hr />
        <a href="#" id="signInBtnMobile" class="btn-sign">SIGN IN</a>
      `;
    }

    // Re-attach event listeners for sign-in/sign-out buttons after updating HTML
    attachAuthEventListeners();
    // Re-apply active class to current page link
    highlightCurrentPage();
  }

  // Call updateNavigation initially and whenever login status changes
  updateNavigation();

  // Dummy function for login/logout (replace with actual auth logic)
  function simulateLogin() {
    isLoggedIn = true;
    updateNavigation();
    console.log("User logged in.");
  }

  function simulateLogout() {
    isLoggedIn = false;
    updateNavigation();
    console.log("User logged out.");
  }

  function attachAuthEventListeners() {
    const signInBtnDesktop = document.getElementById("signInBtn");
    const signInBtnMobile = document.getElementById("signInBtnMobile");
    const signOutBtnDesktop = document.getElementById("signOutBtn");
    const signOutBtnMobile = document.getElementById("signOutBtnMobile");

    if (signInBtnDesktop) {
      signInBtnDesktop.onclick = (e) => {
        e.preventDefault();
        document.getElementById("authOverlay").style.display = "flex";
        document.body.style.overflow = "hidden";
        // simulateLogin(); // For testing dynamic nav change
      };
    }
    if (signInBtnMobile) {
      signInBtnMobile.onclick = (e) => {
        e.preventDefault();
        document.getElementById("authOverlay").style.display = "flex";
        document.body.style.overflow = "hidden";
        // simulateLogin(); // For testing dynamic nav change
      };
    }
    if (signOutBtnDesktop) {
      signOutBtnDesktop.onclick = (e) => {
        e.preventDefault();
        simulateLogout();
      };
    }
    if (signOutBtnMobile) {
      signOutBtnMobile.onclick = (e) => {
        e.preventDefault();
        simulateLogout();
      };
    }
  }

  // Initial attachment of event listeners
  attachAuthEventListeners();

  // Existing highlighting logic, now a function to be called after nav updates
  function highlightCurrentPage() {
    const allNavLinks = document.querySelectorAll('nav ul li a, .mobile-menu a');
    const currentPath = window.location.pathname.replace(/\/$/, '');

    allNavLinks.forEach(link => {
      link.classList.remove('active'); // Remove active from all first
      const linkPath = new URL(link.href).pathname.replace(/\/$/, '');
      if (linkPath === currentPath) {
        link.classList.add('active');
      }
    });
  }

  // Call highlightCurrentPage after initial navigation setup
  highlightCurrentPage();

  // ... (rest of your existing script.js content)
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
// const signInBtn = document.getElementById("signInBtn"); // Managed by updateNavigation now
  const overlay = document.getElementById('authOverlay');
  const closeBtn = document.getElementById('closeAuth');
  const signinTab = document.getElementById('signinTab');
  const registerTab = document.getElementById('registerTab');
  const signinForm = document.getElementById('signinForm');
  const registerForm = document.getElementById('registerForm');

  if (!overlay) return; // Exit safely if elements don't exist

// signInBtn.addEventListener("click", (e) => { // Managed by attachAuthEventListeners now
//   e.preventDefault();
//   overlay.style.display = "flex";
//   document.body.style.overflow = "hidden";
// });

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