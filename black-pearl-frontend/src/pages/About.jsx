import React from 'react';
import "../styles/about.css";
import "../styles/style.css"; // Assuming you'll import the CSS

const AboutPage = () => {
  return (
    <>
      {/* Head content would be handled in your main HTML file or via React Helmet */}
      
      {/* Header Section */}
      <header>
        <div className="header-container">
          {/* Logo */}
          <div className="logo">BLACK PEARL <span>TOURS</span></div>

          {/* Desktop Navigation */}
          <nav>
            <ul>
              <li><a href="Index.jsx">Home</a></li>
              <li><a href="About.jsx" className="active">About Us</a></li>
              <li><a href="Fleet.jsx">Our Fleet</a></li>
              <li><a href="Gallery.jsx">Gallery</a></li>
              <li><a href="Quote.jsx">Quote</a></li>
              <li><a href="Contact.jsx">Contact Us</a></li>
              <li><button id="signInBtn" className="btn-header-signin">Sign In</button></li>
            </ul>
          </nav>

          {/* Navigation Actions */}
          <div className="nav-actions">
            <button className="hamburger" id="hamburger" aria-label="Toggle menu">
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className="mobile-menu" id="mobileMenu" aria-hidden="true">
          <a href="Index.jsx">HOME</a>
          <a href="About.jsx" className="active">ABOUT US</a>
          <a href="Fleet.jsx">OUR FLEET</a>
          <a href="Gallery.jsx">GALLERY</a>
          <a href="Quote.jsx">QUOTE</a>
          <a href="Contact.jsx">CONTACT US</a>
          <hr />
          <a href="#" id="signInBtn" className="btn-sign">SIGN IN</a>
        </div>
      </header>

      {/* Sign In / Register Popup Overlay */}
      <div id="authOverlay" className="auth-overlay">
        <div className="auth-modal">
          <button className="close-btn" id="closeAuth">&times;</button>
          <br />
          <div className="auth-tabs">
            <button id="signinTab" className="tab active">Sign In</button>
            <button id="registerTab" className="tab">Register</button>
          </div>

          {/* Sign In Form */}
          <form id="signinForm" className="auth-form active">
            <h2>Sign In</h2>
            <div className="form-group">
              <label htmlFor="signinEmail">Email Address</label>
              <input type="email" id="signinEmail" name="email" placeholder="Enter your email" required />
            </div>
            <div className="form-group">
              <label htmlFor="signinPassword">Password</label>
              <input type="password" id="signinPassword" name="password" placeholder="Enter your password" required />
            </div>
            <button type="submit" className="btn-auth">Sign In</button>
            <p id="signInMessage" className="error-message"></p>
          </form>

          {/* Register Form */}
          <form id="registerForm" className="auth-form">
            <h2>Register</h2>
            <div className="form-group">
              <label htmlFor="registerName">Name</label>
              <input type="text" id="registerName" name="name" placeholder="Enter your name" required />
            </div>
            <div className="form-group">
              <label htmlFor="registerSurname">Surname</label>
              <input type="text" id="registerSurname" name="surname" placeholder="Enter your surname" required />
            </div>
            <div className="form-group">
              <label htmlFor="registerEmail">Email Address</label>
              <input type="email" id="registerEmail" name="email" placeholder="Enter your email" required />
            </div>
            <div className="form-group">
              <label htmlFor="registerPhone">Phone Number</label>
              <input type="tel" id="registerPhone" name="phone" placeholder="Enter your phone number" required />
            </div>
            <div className="form-group">
              <label htmlFor="registerPassword">Password</label>
              <input type="password" id="registerPassword" name="password" placeholder="Enter a password (min. 8 chars)" minLength="8" required />
            </div>
            <div className="form-group">
              <label htmlFor="registerConfirmPassword">Confirm Password</label>
              <input type="password" id="registerConfirmPassword" name="confirm_password" placeholder="Confirm password" required />
            </div>
            <button type="submit" className="btn-auth">Register</button>
            <p id="registerMessage" className="error-message"></p>
          </form>
        </div>
      </div>

      <div className="about-container">
  <article className="about-panel">
    <h1 style={{ marginTop: '-30px' }}>ABOUT US</h1>

    <section>
        <h2 class="section-title">Our Mission</h2>
        <p>At Black Pearl Coach Charters and Tours, our mission is simple: to make passenger transport arranging a seamless, reliable, and affordable experience. We believe that whether you're travelling for business, sports, or leisure, your journey should be comfortable, safe, and stress-free from start to finish.</p>
      </section>

    <section>
        <h2 class="section-title">Who We Are?</h2>
        <p>We are a trusted provider of luxury coach charters and shuttle services based in Roodepoort, serving clients across South Africa. To achieve our goal of offering nationwide, value-driven services, we have strategically affiliated ourselves with a network of reputable service providers. This allows us to present our customers with various options to perfectly suit their specific needs and budget, without compromising on quality or reliability.</p>
      </section>

      <section>
        <h2 class="section-title">Our Promise</h2>
        <ul class="promises">
          <li><strong>Reliability:</strong> We pride ourselves on being on time, every time.</li>
          <li><strong>Affordability:</strong> Competitive and affordable rates.</li>
          <li><strong>Custom Solutions:</strong> Tailored transport solutions for groups of any size.</li>
        </ul>
      </section>

      <section>
        <h2 class="section-title">Commitment to Transformation</h2>
        <p>Black Pearl Consultancy (PTY) Ltd is a proud Vericom-rated Level 3 BEE Contributor. This status allows corporate clients to claim a portion of their procurement spend on bookings with us, making us not just a transport partner, but a strategic choice for your business.</p>
      </section>

    <section>
      <h2 className="section-title">Why Choose Us?</h2>
      <ul>
        <li><strong>Nationwide Coverage:</strong> Reliable services across the country.</li>
        <li><strong>Professional Drivers:</strong> Experienced and safety-focused drivers.</li>
        <li><strong>Diverse Fleet:</strong> Well-maintained vehicles for small groups up to full-size coaches.</li>
        <li><strong>Customer-Centric Approach:</strong> Simple booking and exceptional service from first inquiry to destination.</li>
      </ul>
      <p>Ready to experience reliable and luxurious transport? <a href="Quote.jsx">Get a Free Quote</a> or <a href="Contact.jsx">Contact Us</a> today.</p>
    </section>
  </article>
</div>



      {/* Floating chat icon */}
      <div className="chat-fab" title="Chat with us">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="3" fill="#fff"/>
          <circle cx="8.5" cy="10.3" r="1.1" fill="#666"/>
          <circle cx="15.5" cy="10.3" r="1.1" fill="#666"/>
          <rect x="9.5" y="13.6" width="5" height="1.3" rx="0.65" fill="#c1c1c1"/>
        </svg>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="wrap footer-inner">
          <div className="footer-block">
            <div className="logo-sm">BLACK PEARL COACH CHARTERS AND TOURS</div>
          </div>

          <div className="footer-block">
            <h3>QUICK LINKS</h3>
            <a href="Fleet.jsx">View Our Fleet</a>
            <a href="Gallery.jsx">Browse Gallery</a>
            <a href="Quote.jsx">Get A Quote</a>
            <a href="Contact.jsx">Contact Us</a>
          </div>

          <div className="footer-block">
            <h3>OUR SERVICES</h3>
            <a href="#">Airport Transfers</a>
            <a href="#">Conference Shuttle Hire</a>
            <a href="#">Sports Tours</a>
            <a href="#">Events & Leisure Travel</a>
          </div>
        </div>

        <div className="bottom-bar">2025 Black Pearl Coach Charters and Tours | All Rights Reserved</div>
      </footer>
    </>
  );
};

export default AboutPage;