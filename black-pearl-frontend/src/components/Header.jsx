// components/components/Header.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

// Added isLoggedIn prop
const Header = ({ isLoggedIn, onAuthClick }) => {
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

  // Close the menu if the screen resizes to desktop size
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth >= 768 && menuOpen) {
            setMenuOpen(false);
        }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  // Define Navigation Links based on login status
  // ----------------------------------------------

  // GUEST VIEW: home, about, gallery, fleet, quote, contact
  const guestNavLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About Us" },
    { path: "/gallery", label: "Gallery" }, // Shared
    { path: "/fleet", label: "Our Fleet" }, // Shared
    { path: "/quote", label: "Quote" }, // Shared
    { path: "/contact", label: "Contact Us" }
  ];

  // CUSTOMER VIEW: dashboard, quote, contact, gallery, fleet, bookings, profile
  const customerNavLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/bookings", label: "Bookings" },
    { path: "/quote", label: "Quote" }, // Shared
    { path: "/gallery", label: "Gallery" }, // Shared
    { path: "/fleet", label: "Our Fleet" }, // Shared
    { path: "/profile", label: "Profile" }
  ];

  // Use the appropriate set of links
  const navLinks = isLoggedIn ? customerNavLinks : guestNavLinks;
  
  // Text for the primary action button
  const authButtonText = isLoggedIn ? "Sign Out" : "Sign In";

  // The link path for the logo when logged in should probably be the dashboard
  const logoLinkPath = isLoggedIn ? "/dashboard" : "/";
  // ----------------------------------------------


  return (
    <header>
      <div className="header-container">
        <div className="logo">
          {/* LOGO FIX: Using Link makes it clickable */}
          <Link to={logoLinkPath}>BLACK PEARL <span>TOURS</span></Link>
        </div>

        {/* Desktop navigation - Rendered unconditionally, hidden by CSS on mobile */}
        <nav>
          <ul>
            {/* Render dynamic links */}
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className={isActive(link.path) ? "active" : ""}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            
            {/* Sign In/Out button */}
            <li>
              <button 
                className="btn-header-signin" 
                onClick={onAuthClick} // Now handles both Sign In and Sign Out
              >
                {authButtonText}
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
          {/* Render dynamic links for mobile */}
          {navLinks.map((link) => (
            <Link 
              key={`mobile-${link.path}`}
              to={link.path} 
              className={isActive(link.path) ? "active" : ""} 
              onClick={handleLinkClick}
            >
              {link.label.toUpperCase()}
            </Link>
          ))}
          
          <hr />
          
          {/* Sign In/Out button for mobile */}
          <button className="btn-sign" onClick={() => {
            onAuthClick(); // Now handles both Sign In and Sign Out
            handleLinkClick();
          }}>
            {authButtonText.toUpperCase()}
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;