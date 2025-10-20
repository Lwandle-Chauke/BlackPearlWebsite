import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ onSignInClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 720);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 720);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Helper function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header>
      <div className="header-container">
        <div className="logo">
          <Link to="/">BLACK PEARL <span>TOURS</span></Link>
        </div>

        {/* Desktop navigation */}
        {!isMobile && (
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
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div className="mobile-menu">
          <Link to="/" className={isActive("/") ? "active" : ""} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" className={isActive("/about") ? "active" : ""} onClick={() => setMenuOpen(false)}>About Us</Link>
          <Link to="/fleet" className={isActive("/fleet") ? "active" : ""} onClick={() => setMenuOpen(false)}>Our Fleet</Link>
          <Link to="/gallery" className={isActive("/gallery") ? "active" : ""} onClick={() => setMenuOpen(false)}>Gallery</Link>
          <Link to="/quote" className={isActive("/quote") ? "active" : ""} onClick={() => setMenuOpen(false)}>Quote</Link>
          <Link to="/contact" className={isActive("/contact") ? "active" : ""} onClick={() => setMenuOpen(false)}>Contact Us</Link>
          <hr />
          <button className="btn-sign" onClick={() => {
            onSignInClick();
            setMenuOpen(false);
          }}>Sign In</button>
        </div>
      )}
    </header>
  );
};

export default Header;