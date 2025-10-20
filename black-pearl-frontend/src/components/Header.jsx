import React, { useState, useEffect } from "react";
import AuthModal from "./AuthModal"; // optional, if you want modal here
import { Link } from "react-router-dom"; // use if you use react-router

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 720);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 720);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header>
      <div className="header-container">
        <div className="logo">BLACK PEARL <span>TOURS</span></div>

        {/* Desktop navigation */}
        {!isMobile && (
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about" className="active">About Us</Link></li>
              <li><Link to="/fleet">Our Fleet</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/quote">Quote</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><button className="btn-header-signin">Sign In</button></li>
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
          <Link to="/">Home</Link>
          <Link to="/about" className="active">About Us</Link>
          <Link to="/fleet">Our Fleet</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/quote">Quote</Link>
          <Link to="/contact">Contact Us</Link>
          <hr />
          <button className="btn-sign">Sign In</button>
        </div>
      )}
    </header>
  );
};

export default Header;
