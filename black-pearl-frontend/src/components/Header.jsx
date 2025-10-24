import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = ({ isLoggedIn, onAuthClick, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };
  
  const handleLinkClick = () => setMenuOpen(false);

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
  const guestNavLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About Us" },
    { path: "/gallery", label: "Gallery" },
    { path: "/fleet", label: "Our Fleet" },
    { path: "/quote", label: "Quote" },
    { path: "/contact", label: "Contact Us" }
  ];

  const customerNavLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/bookings", label: "Bookings" },
    { path: "/quote", label: "Quote" },
    { path: "/gallery", label: "Gallery" },
    { path: "/fleet", label: "Our Fleet" },
    { path: "/profile", label: "Profile" }
  ];

  const navLinks = isLoggedIn ? customerNavLinks : guestNavLinks;
  const authButtonText = isLoggedIn ? "Sign Out" : "Sign In";
  const logoLinkPath = isLoggedIn ? "/dashboard" : "/";

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <header>
      <div className="header-container">
        <div className="logo">
          <Link to={logoLinkPath} onClick={handleLogoClick}>
            BLACK PEARL <span>TOURS</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav>
          <ul>
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className={isActive(link.path) ? "active" : ""}
                  onClick={handleLinkClick}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            
            {/* Show user name when logged in */}
            {isLoggedIn && user && (
              <li className="user-welcome">
                <span style={{color: 'white', marginRight: '15px'}}>Welcome, {user.name}</span>
              </li>
            )}
            
            {/* Sign In/Out button */}
            <li>
              <button 
                className="btn-header-signin" 
                onClick={() => {
                  onAuthClick();
                  handleLinkClick();
                }}
                style={{
                  background: 'black',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {authButtonText}
              </button>
            </li>
          </ul>
        </nav>
        
        {/* Navigation Actions */}
        <div className="nav-actions">
          {/* Mobile hamburger */}
          <button
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu active" id="mobileMenu">
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
          
          {/* Show user name when logged in */}
          {isLoggedIn && user && (
            <div className="mobile-user-welcome" style={{
              color: 'white', 
              padding: '10px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              Welcome, {user.name}
            </div>
          )}
          
          <hr style={{margin: '10px 20px'}} />
          
          {/* Sign In/Out button for mobile */}
          <button 
            className="btn-sign" 
            onClick={() => {
              onAuthClick();
              handleLinkClick();
            }}
            style={{
              background: 'black',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            {authButtonText.toUpperCase()}
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;