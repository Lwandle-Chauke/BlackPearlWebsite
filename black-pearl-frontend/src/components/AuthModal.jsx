// components/AuthModal.jsx
import React, { useState } from "react";

// The modal now accepts an 'onClose' prop to hide itself
const AuthModal = ({ onClose }) => {
  const [tab, setTab] = useState("signin");
  // State for form data (basic example)
  const [formData, setFormData] = useState({}); 

  // Add a click handler for the overlay to close the modal if clicked outside
  const handleOverlayClick = (e) => {
      // Check if the click occurred directly on the overlay div itself
      if (e.target.id === 'authOverlay') {
          onClose();
      }
  };

  // The className 'auth-overlay' should typically handle displaying/hiding the modal,
  // but since About.jsx handles the conditional rendering, this component only focuses on its content.
  return (
    // Added onClick handler to the overlay
    <div id="authOverlay" className="auth-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        {/* Changed from ✖ to the more accessible &times; entity or text */}
        <button className="close-btn" id="closeAuth" onClick={onClose}>
          &times;
        </button>
        <br />
        <div className="auth-tabs">
          <button
            id="signinTab"
            className={`tab ${tab === "signin" ? "active" : ""}`}
            onClick={() => setTab("signin")}
          >
            Sign In
          </button>
          <button
            id="registerTab"
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
              {/* Added htmlFor and id */}
              <label htmlFor="signinEmail">Email Address</label>
              <input type="email" id="signinEmail" name="email" placeholder="Enter your email" required />
            </div>
            <div className="form-group">
              <label htmlFor="signinPassword">Password</label>
              <input type="password" id="signinPassword" name="password" placeholder="Enter your password" required />
            </div>
            <button type="submit" className="btn-auth">Sign In</button>
            <p id="signInMessage" className="error-message"></p> {/* Message placeholder */}
          </form>
        )}

        {/* Register Form */}
        {tab === "register" && (
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
              {/* Added minLength attribute in camelCase */}
              <input type="password" id="registerPassword" name="password" placeholder="Enter a password (min. 8 chars)" minLength="8" required /> 
            </div>
            <div className="form-group">
              <label htmlFor="registerConfirmPassword">Confirm Password</label>
              <input type="password" id="registerConfirmPassword" name="confirm_password" placeholder="Confirm password" required />
            </div>
            <button type="submit" className="btn-auth">Register</button>
            <p id="registerMessage" className="error-message"></p> {/* Message placeholder */}
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;