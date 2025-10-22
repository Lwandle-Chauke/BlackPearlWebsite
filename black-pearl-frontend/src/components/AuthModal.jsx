// components/AuthModal.jsx
import React, { useState, useEffect } from "react";

const AuthModal = ({ onClose }) => {
  const [tab, setTab] = useState("signin");
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // 1. MANAGE BODY SCROLL LOCK
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Cleanup function runs on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []); 

  // Add a click handler for the overlay to close the modal if clicked outside
  const handleOverlayClick = (e) => {
    if (e.target.id === 'authOverlay') {
      onClose();
    }
  };

  return (
    <div id="authOverlay" className="auth-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <br />
        <div className="auth-tabs">
          <button
            className={`tab ${tab === "signin" ? "active" : ""}`}
            onClick={() => setTab("signin")}
          >
            Sign In
          </button>
          <button
            className={`tab ${tab === "register" ? "active" : ""}`}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>

        {/* Sign In Form */}
        {tab === "signin" && (
          <form id="signinForm" className="auth-form active">
            <h2>Sign In</h2>
            <div className="form-group">
              <label htmlFor="signinEmail">Email Address</label>
              <input 
                type="email" 
                id="signinEmail" 
                name="email" 
                placeholder="Enter your email" 
                required 
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="signinPassword">Password</label>
              <input 
                type="password" 
                id="signinPassword" 
                name="password" 
                placeholder="Enter your password" 
                required 
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn-auth">Sign In</button>
            <p id="signInMessage" className="error-message"></p>
          </form>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <form id="registerForm" className="auth-form active">
            <h2>Register</h2>
            <div className="form-group">
              <label htmlFor="registerName">Name</label>
              <input type="text" id="registerName" name="name" placeholder="Enter your name" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="registerSurname">Surname</label>
              <input type="text" id="registerSurname" name="surname" placeholder="Enter your surname" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="registerEmail">Email Address</label>
              <input type="email" id="registerEmail" name="email" placeholder="Enter your email" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="registerPhone">Phone Number</label>
              <input type="tel" id="registerPhone" name="phone" placeholder="Enter your phone number" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="registerPassword">Password</label>
              <input type="password" id="registerPassword" name="password" placeholder="Enter a password (min. 8 chars)" minLength="8" required onChange={handleChange} /> 
            </div>
            <div className="form-group">
              <label htmlFor="registerConfirmPassword">Confirm Password</label>
              <input type="password" id="registerConfirmPassword" name="confirm_password" placeholder="Confirm password" required onChange={handleChange} />
            </div>
            <button type="submit" className="btn-auth">Register</button>
            <p id="registerMessage" className="error-message"></p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;