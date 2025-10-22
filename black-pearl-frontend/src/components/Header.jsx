import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ onSignInClick }) => {
  // We only need state to control the visibility of the mobile *dropdown* menu
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Helper function to check if a path is active
  const isActive = (path) => {
    // Correctly handle the root path ("/")
    if (path === "/") {
        return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };
  
  // Use a click handler that closes the menu after navigation/action
  const handleLinkClick = () => setMenuOpen(false);

  // Close the menu if the screen resizes to desktop size (768px for consistency)
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth >= 768 && menuOpen) {
            setMenuOpen(false);
        }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  return (
    <header>
      <div className="header-container">
        <div className="logo">
          {/* LOGO FIX: Using Link makes it clickable */}
          <Link to="/">BLACK PEARL <span>TOURS</span></Link>
        </div>

        {/* Desktop navigation - Rendered unconditionally, hidden by CSS on mobile */}
        <nav>
          <ul>
            <li><Link to="/" className={isActive("/") ? "active" : ""}>Home</Link></li>
            <li><Link to="/about" className={isActive("/about") ? "active" : ""}>About Us</Link></li>
            <li><Link to="/fleet" className={isActive("/fleet") ? "active" : ""}>Our Fleet</Link></li>
            <li><Link to="/gallery" className={isActive("/gallery") ? "active" : ""}>Gallery</Link></li>
            <li><Link to="/quote" className={isActive("/quote") ? "active" : ""}>Quote</Link></li>
            <li><Link to="/contact" className={isActive("/contact") ? "active" : ""}>Contact Us</Link></li>
            <li>
              <button className="btn-header-signin" onClick={onSignInClick}>
                Sign In
              </button>
            </li>
          </ul>
        </nav>
        
        {/* Navigation Actions container, needed for hamburger alignment */}
        <div className="nav-actions">
            {/* Mobile hamburger - Rendered unconditionally, hidden by CSS on desktop */}
            <button
              id="hamburger"
              className={`hamburger ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
            </button>
        </div>
      </div>

      {/* Mobile menu - Conditionally rendered based on state */}
      {menuOpen && (
        // The .active class is critical for CSS to display the menu
        <div className="mobile-menu active" id="mobileMenu" aria-hidden="false">
          <Link to="/" className={isActive("/") ? "active" : ""} onClick={handleLinkClick}>HOME</Link>
          <Link to="/about" className={isActive("/about") ? "active" : ""} onClick={handleLinkClick}>ABOUT US</Link>
          <Link to="/fleet" className={isActive("/fleet") ? "active" : ""} onClick={handleLinkClick}>OUR FLEET</Link>
          <Link to="/gallery" className={isActive("/gallery") ? "active" : ""} onClick={handleLinkClick}>GALLERY</Link>
          <Link to="/quote" className={isActive("/quote") ? "active" : ""} onClick={handleLinkClick}>QUOTE</Link>
          <Link to="/contact" className={isActive("/contact") ? "active" : ""} onClick={handleLinkClick}>CONTACT US</Link>
          <hr />
          <button className="btn-sign" onClick={() => {
            onSignInClick();
            handleLinkClick();
          }}>SIGN IN</button>
        </div>
      )}
    </header>
  );
};

export default Header;