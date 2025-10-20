<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Gallery | Black Pearl Coach Charters & Tours</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css" />
    <script src="script.js" defer></script>

    <!-- Favicon setup -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon_16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon_32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon_48x48.png">
<link rel="icon" type="image/png" sizes="64x64" href="/favicon_64x64.png">
<link rel="icon" type="image/png" sizes="128x128" href="/favicon_128x128.png">
<link rel="icon" type="image/png" sizes="256x256" href="/favicon_256x256.png">
<style>
:root{
  --black:#0b0b0b;
  --dark-gray:#1f1f1f;
  --mid-gray:#bfbfbf;
  --light-gray:#efefef;
  --white:#ffffff;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--light-gray);color:#222;line-height:1.4;}

/* GALLERY SECTION */
.gallery-section{padding:50px 5%;min-height:100vh;}
.gallery-section h1{margin-bottom:30px;font-size:32px;text-align:center;color:var(--black);}
.gallery-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:30px;}
.card{background:var(--white);border-radius:8px;overflow:hidden;box-shadow:0 4px 8px rgba(0,0,0,0.1);transition:transform 0.3s;}
.card:hover{transform:translateY(-5px);}
.card img{width:100%;height:200px;object-fit:cover;}
.card p{padding:15px;background:var(--black);color:var(--white);font-size:14px;min-height:60px;}

/* SEARCH BAR */
.search-bar{display:flex;align-items:center;background:#eee;padding:10px 15px;border-radius:10px;max-width:400px;margin:0 auto 40px;}
.search-bar input{flex:1;border:none;background:transparent;font-size:16px;}
.search-bar .close-btn{font-size:20px;cursor:pointer;color:#777;}
/* RESPONSIVE */
@media(max-width:768px){
  .gallery-section{padding:30px 3%;}
  .card img{height:180px;}
}
</style>
</head>
<body>

 <!-- Header Section -->
  <header>
    <div class="header-container">
      <!-- Logo -->
      <div class="logo">BLACK PEARL <span>TOURS</span></div>

      <!-- Desktop Navigation -->
      <nav>
          <ul>
            <li><a href="travel-Dashboard.html">Dashboard</a></li>
            <li><a href="fleet.html">Our Fleet</a></li>
            <li><a href="gallery.html" class="active">Gallery</a></li>
            <li><a href="bookings.html">Bookings</a></li>
            <li><a href="profile.html">Profile</a></li>
            <li><a href="contact.html">Contact Us</a></li>
          </ul>
        </nav>

      <!-- Navigation Actions -->
      <div class="nav-actions">
        <button class="hamburger" id="hamburger" aria-label="Toggle menu">
          <span></span>
        </button>
      </div>
    </div>

    <!-- Mobile Dropdown Menu -->
    <div class="mobile-menu" id="mobileMenu" aria-hidden="true">
      <a href="travel-Dashboard.html">DASHBOARD</a>
      <a href="fleet.html">OUR FLEET</a>
      <li><a href="gallery.html" class="active">GALLERY</a></li>
      <li><a href="bookings.html">BOOKINGS</a></li>
      <li><a href="profile.html">PROFILE</a></li>
      <a href="contact.html">CONTACT US</a>
      <hr />
    </div>
  </header>

<!-- Gallery Section -->
<main class="gallery-section">
  <h1 style="margin-top: 50px;">GALLERY</h1>
  <div class="search-bar">
    <input type="text" placeholder="Search" disabled />
    <span class="close-btn">×</span>
  </div>
  <div class="gallery-grid">
    <div class="card"><img src="images/vacation1.jpg" alt="Holiday group"><p>"Made our holiday stress-free from start to finish." – Lerato M</p></div>
    <div class="card"><img src="images/vacation2.jpg" alt="Group adventure"><p>"Turned our group trip into a real adventure." – Priya S.</p></div>
    <div class="card"><img src="images/vacation3.jpg" alt="Sightseeing"><p>"Made sightseeing in Johannesburg so easy." – David N.</p></div>
    <div class="card"><img src="images/vacation4.jpg" alt="Bus to the game"><p>"Traveling to the game was half the fun!" – Jason L.</p></div>
    <div class="card"><img src="images/vacation5.jpg" alt="Beach trip"><p>"Relaxing by the ocean never felt this good!" – Amara P.</p></div>
    <div class="card"><img src="images/vacation6.jpg" alt="Mountain hike"><p>"The mountain views were breathtaking. Highly recommend!" – Sipho K.</p></div>
    <div class="card"><img src="images/vacation7.jpg" alt="City tour"><p>"Exploring the city was effortless and fun." – Thandi R.</p></div>
    <div class="card"><img src="images/vacation8.jpg" alt="Family trip"><p>"Our kids loved every moment of the trip!" – Johan D.</p></div>
    <div class="card"><img src="images/vacation9.jpg" alt="Safari adventure"><p>"Seeing wildlife up close was an unforgettable experience." – Lebo M.</p></div>
    <div class="card"><img src="images/vacation10.jpg" alt="Sunset cruise"><p>"Sunset on the water made the evening magical." – Aisha T.</p></div>
  </div>
</main>

   <!-- Floating chat icon -->
  <div class="chat-fab" title="Chat with us">
    <!-- simple SVG robot face -->
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5" width="20" height="14" rx="3" fill="#fff"/>
      <circle cx="8.5" cy="10.3" r="1.1" fill="#666"/>
      <circle cx="15.5" cy="10.3" r="1.1" fill="#666"/>
      <rect x="9.5" y="13.6" width="5" height="1.3" rx="0.65" fill="#c1c1c1"/>
    </svg>
  </div>

    <!-- Footer -->
  <!-- Footer -->
  <footer class="footer">
    <div class="wrap footer-inner">
      <div class="footer-block">
        <div class="logo-sm">BLACK PEARL COACH CHARTERS AND TOURS</div>
      </div>

      <div class="footer-block">
        <h3>QUICK LINKS</h3>
        <a href="fleet.html">View Our Fleet</a>
        <a href="gallery.html">Browse Gallery</a>
        <a href="quote.html">Get A Quote</a>
        <a href="contact.html">Contact Us</a>
      </div>

      <div class="footer-block">
        <h3>OUR SERVICES</h3>
        <a href="#">Airport Transfers</a>
        <a href="#">Conference Shuttle Hire</a>
        <a href="#">Sports Tours</a>
        <a href="#">Events & Leisure Travel</a>
      </div>
    </div>

    <div class="bottom-bar">2025 Black Pearl Coach Charters and Tours | All Rights Reserved</div>
  </footer>

</body>
</html>
