import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ isLoggedIn, onLoginClick, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    closeMobileMenu();
  };

  const isActiveLink = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header>
      <div className="header-container">
        <div className="logo">
          <Link to="/">BLACK PEARL <span>TOURS</span></Link>
        </div>

        <nav className={isMobileMenuOpen ? 'active' : ''}>
          <ul>
            {isLoggedIn ? (
              <>
                <li><Link to="/dashboard" className={isActiveLink('/dashboard')}>Dashboard</Link></li>
                <li><Link to="/about" className={isActiveLink('/about')}>About Us</Link></li>
                <li><Link to="/fleet" className={isActiveLink('/fleet')}>Our Fleet</Link></li>
                <li><Link to="/gallery" className={isActiveLink('/gallery')}>Gallery</Link></li>
                <li><Link to="/bookings" className={isActiveLink('/bookings')}>Bookings</Link></li>
                <li><Link to="/quote" className={isActiveLink('/quote')}>Quote</Link></li>
                <li><Link to="/profile" className={isActiveLink('/profile')}>Profile</Link></li>
                <li><button onClick={handleLogout} className="btn-header-signin">Sign Out</button></li>
              </>
            ) : (
              <>
                <li><Link to="/" className={isActiveLink('/')}>Home</Link></li>
                <li><Link to="/about" className={isActiveLink('/about')}>About Us</Link></li>
                <li><Link to="/fleet" className={isActiveLink('/fleet')}>Our Fleet</Link></li>
                <li><Link to="/gallery" className={isActiveLink('/gallery')}>Gallery</Link></li>
                <li><Link to="/quote" className={isActiveLink('/quote')}>Quote</Link></li>
                <li><Link to="/contact" className={isActiveLink('/contact')}>Contact Us</Link></li>
                <li><button onClick={onLoginClick} className="btn-header-signin">Sign In</button></li>
              </>
            )}
          </ul>
        </nav>

        <div className="nav-actions">
          <button 
            className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        {isLoggedIn ? (
          <>
            <Link to="/dashboard" onClick={closeMobileMenu}>DASHBOARD</Link>
            <Link to="/about" onClick={closeMobileMenu}>ABOUT US</Link>
            <Link to="/fleet" onClick={closeMobileMenu}>OUR FLEET</Link>
            <Link to="/gallery" onClick={closeMobileMenu}>GALLERY</Link>
            <Link to="/bookings" onClick={closeMobileMenu}>BOOKINGS</Link>
            <Link to="/quote" onClick={closeMobileMenu}>QUOTE</Link>
            <Link to="/profile" onClick={closeMobileMenu}>PROFILE</Link>
            <hr />
            <button onClick={handleLogout} className="btn-sign">SIGN OUT</button>
          </>
        ) : (
          <>
            <Link to="/" onClick={closeMobileMenu}>HOME</Link>
            <Link to="/about" onClick={closeMobileMenu}>ABOUT US</Link>
            <Link to="/fleet" onClick={closeMobileMenu}>OUR FLEET</Link>
            <Link to="/gallery" onClick={closeMobileMenu}>GALLERY</Link>
            <Link to="/quote" onClick={closeMobileMenu}>QUOTE</Link>
            <Link to="/contact" onClick={closeMobileMenu}>CONTACT US</Link>
            <hr />
            <button onClick={onLoginClick} className="btn-sign">SIGN IN</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;