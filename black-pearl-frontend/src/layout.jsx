// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';
import { authUtils } from '../utils/auth';

const Layout = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on component mount
    const checkAuthStatus = () => {
      const loggedIn = authUtils.isLoggedIn();
      const userData = authUtils.getUser();
      setIsLoggedIn(loggedIn);
      setUser(userData);
    };

    checkAuthStatus();
  }, []);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setIsLoggedIn(true);
    setUser(authUtils.getUser());
    // Redirect to dashboard after successful authentication
    navigate('/dashboard');
  };

  const handleLogout = () => {
    authUtils.logout();
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  return (
    <div className="app">
      <Header 
        isLoggedIn={isLoggedIn} 
        onLoginClick={() => setShowAuthModal(true)} 
        onLogout={handleLogout}
        user={user}
      />
      
      <main>
        {children}
      </main>

      <Footer />

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default Layout;