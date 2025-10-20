<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tours - Black Pearl Admin</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

  <style>
    :root {
      --white: #ffffff;
      --dark-gray: #4a4a4a;
      --light-gray: #f8f8f8;
      --primary-blue: #3498db;
      --text-dark: #333;
      --silver: #aaa;
      --active-status: #2ecc71;
      --inactive-status: #e74c3c;
    }

    body {
      font-family: "Poppins", sans-serif;
      margin: 0;
      background: var(--light-gray);
      color: var(--text-dark);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* SIDEBAR (desktop) */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 250px;
      background: var(--dark-gray);
      color: white;
      padding-top: 20px;
      transition: transform 0.3s ease;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    nav ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    nav ul li a {
      display: flex;
      align-items: center;
      padding: 15px 20px;
      color: #ccc;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.2s, color 0.2s;
    }

    nav ul li a i {
      margin-right: 15px;
      font-size: 1.2rem;
    }

    nav ul li a:hover {
      background: #3c3c3c;
      color: white;
    }

    nav ul li a.active {
      background: white;
      color: var(--text-dark);
      font-weight: 600;
      border-right: 4px solid var(--primary-blue);
    }

    .sidebar-logo {
      text-align: center;
      margin-bottom: 15px;
    }

    .sidebar-logo img {
      max-width: 140px;
      height: auto;
      filter: grayscale(100%) brightness(150%);
    }

    /* TOP BAR */
    .top-bar {
      height: 60px;
      background: var(--white);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: fixed;
      top: 0;
      left: 250px;
      right: 0;
      z-index: 900;
      transition: left 0.3s ease;
    }

    .page-title h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-dark);
    }

    .admin-info {
      display: flex;
      align-items: center;
      font-size: 1rem;
    }

    .admin-info i {
      margin-left: 10px;
      font-size: 1.3rem;
    }

    /* HAMBURGER */
    #hamburger {
      display: none;
      font-size: 1.6rem;
      cursor: pointer;
      color: var(--text-dark);
    }

    /* MAIN CONTENT */
    #content-wrapper {
      flex-grow: 1;
      padding: 20px;
      margin-left: 250px;
      margin-top: 80px;
      transition: margin-left 0.3s ease;
    }

    .main-content {
      background: white;
      padding: 20px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .main-content h2 {
      font-size: 1.4rem;
      margin-bottom: 20px;
      color: var(--dark-gray);
    }

    /* TABLE */
    .data-table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 600px;
    }

    .data-table th, .data-table td {
      padding: 12px 10px;
      border-bottom: 1px solid #eee;
      text-align: left;
      font-size: 0.9rem;
    }

    .status-badge-tour {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-block;
    }

    .status-active { background: var(--active-status); color: white; }
    .status-inactive { background: var(--inactive-status); color: white; }

    .action-icons i {
      cursor: pointer;
      margin-right: 8px;
      color: var(--dark-gray);
      transition: color 0.2s;
    }

    .action-icons i:hover {
      color: var(--primary-blue);
    }

    /* FOOTER */
    .bottom-bar {
      text-align: center;
      background: var(--light-gray);
      padding: 20px 0;
      color: var(--silver);
      font-size: 0.8rem;
    }

    /* MOBILE MENU */
    #mobileMenu {
      display: none;
      position: fixed;
      top: 60px;
      left: 0;
      width: 100%;
      background: var(--dark-gray);
      flex-direction: column;
      z-index: 1001;
    }

    #mobileMenu.active {
      display: flex;
    }

    .mobile-menu a {
      color: white;
      text-decoration: none;
      padding: 15px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .mobile-menu a.active {
      background: var(--primary-blue);
    }

    /* RESPONSIVE */
    @media (max-width: 720px) {
      nav { display: none; }
      #hamburger { display: block; }
      .top-bar { left: 0; }
      #content-wrapper { margin-left: 0; }
    }

     @media (max-width: 600px) {
      .page-title h1 {
        font-size: 1.2rem;
      }

      .main-content {
        padding: 15px;
      }

      .data-table th, .data-table td {
        padding: 8px;
        font-size: 0.85rem;
      }
    }
  </style>
</head>

<body>
  <!-- SIDEBAR -->
  <nav id="mainNav">
    <div class="sidebar-logo">
      <img src="https://i.imgur.com/your-black-pearl-logo.png" alt="Black Pearl Tours Admin">
    </div>
    <ul>
      <li><a href="admin.html"><i class="fas fa-tachometer-alt"></i><span>Dashboard</span></a></li>
      <li><a href="admin-messages.html"><i class="fas fa-envelope"></i><span>Messages</span></a></li>
      <li><a href="admin-bookings.html"><i class="fas fa-calendar-alt"></i><span>Bookings</span></a></li>
      <li><a href="admin-tours.html" class="active"><i class="fas fa-route"></i><span>Tours</span></a></li>
      <li><a href="admin-gallery.html"><i class="fas fa-images"></i><span>Gallery</span></a></li>
      <li><a href="admin-settings.html"><i class="fas fa-cog"></i><span>Settings</span></a></li>
      <li><a href="index.html" onclick="alert('Logged out.');"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a></li>
    </ul>
  </nav>

  <!-- MOBILE MENU -->
  <div id="mobileMenu" class="mobile-menu">
    <a href="admin.html">Dashboard</a>
    <a href="admin-messages.html">Messages</a>
    <a href="admin-bookings.html">Bookings</a>
    <a href="admin-tours.html" class="active">Tours</a>
    <a href="admin-gallery.html">Gallery</a>
    <a href="admin-settings.html">Settings</a>
    <a href="index.html" onclick="alert('Logged out.');">Logout</a>
  </div>

  <!-- TOP BAR -->
  <div class="top-bar">
    <i class="fas fa-bars" id="hamburger"></i>
    <div class="page-title"><h1>Tours</h1></div>
    <div class="admin-info">Admin <i class="fas fa-user-circle"></i></div>
  </div>

  <!-- MAIN CONTENT -->
  <div id="content-wrapper">
    <div class="main-content">
      <h2>Manage Tours :</h2>
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tour ID</th>
              <th>Tour Name</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>T - 085Q</td>
              <td>OR Tambo Airport Transfer</td>
              <td>2 Hours</td>
              <td>R 160</td>
              <td><span class="status-badge-tour status-active">Active</span></td>
              <td class="action-icons"><i class="fas fa-edit" title="Edit Tour"></i></td>
            </tr>
            <tr>
              <td>T - 086</td>
              <td>Cape Town City Tour</td>
              <td>1 Day</td>
              <td>R 800</td>
              <td><span class="status-badge-tour status-inactive">Inactive</span></td>
              <td class="action-icons"><i class="fas fa-edit" title="Edit Tour"></i></td>
            </tr>
            <tr>
              <td>T - 089Q</td>
              <td>Soccer Stadium Shuttle</td>
              <td>1 Day</td>
              <td>R 400</td>
              <td><span class="status-badge-tour status-active">Active</span></td>
              <td class="action-icons"><i class="fas fa-edit" title="Edit Tour"></i></td>
            </tr>
            <tr>
              <td>T - 018W</td>
              <td>Conference Shuttle Hire</td>
              <td>3 Hours</td>
              <td>R 170</td>
              <td><span class="status-badge-tour status-active">Active</span></td>
              <td class="action-icons"><i class="fas fa-edit" title="Edit Tour"></i></td>
            </tr>
            <tr>
              <td>T - 022W</td>
              <td>Durban Tour</td>
              <td>5 Days</td>
              <td>R 6850</td>
              <td><span class="status-badge-tour status-inactive">Inactive</span></td>
              <td class="action-icons"><i class="fas fa-edit" title="Edit Tour"></i></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="bottom-bar">&copy; 2025 Black Pearl Admin. All Rights Reserved.</div>

  <!-- YOUR JS FOR MOBILE MENU -->
  <script>
    (function() {
      const hamburger = document.getElementById('hamburger');
      const mobileMenu = document.getElementById('mobileMenu');
      const mainNav = document.getElementById('mainNav') || document.querySelector('nav');
      const navLinks = document.querySelectorAll('nav ul li a, .mobile-menu a');
      const currentPath = window.location.pathname;

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

      hamburger.addEventListener('click', function() {
        const isActive = mobileMenu.classList.toggle('active');
        hamburger.classList.toggle('active', isActive);
        mobileMenu.setAttribute('aria-hidden', !isActive);
      });

      navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname.replace(/\/$/, '');
        const pagePath = currentPath.replace(/\/$/, '');
        if (linkPath === pagePath) link.classList.add('active');
      });

      document.addEventListener('click', function(e) {
        if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target) && window.innerWidth < 720) {
          mobileMenu.classList.remove('active');
          hamburger.classList.remove('active');
        }
      });

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
  </script>
</body>
</html>
