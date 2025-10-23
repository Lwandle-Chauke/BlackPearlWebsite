// src/components/AuthModal.jsx
import React, { useState } from 'react';
import { authUtils } from '../utils/auth';

const AuthModal = ({ onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('signin');
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${authUtils.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        authUtils.setUser(data);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await fetch(`${authUtils.API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        authUtils.setUser(data);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      
      if (activeTab === 'signin') {
        result = await handleLogin(formData.email, formData.password);
      } else {
        // Registration validation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          setLoading(false);
          return;
        }

        result = await handleRegister(formData);
      }

      if (result.success) {
        onAuthSuccess();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <br />
        <div className="auth-tabs">
          <button 
            className={`tab ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => setActiveTab('signin')}
          >
            Sign In
          </button>
          <button 
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="error-message" style={{color: 'red', textAlign: 'center', margin: '10px 0'}}>
            {error}
          </div>
        )}

        {activeTab === 'signin' && (
          <form onSubmit={handleSubmit} className="auth-form active">
            <h2>Sign In</h2>
            <div className="form-group">
              <label htmlFor="signinEmail">Email Address</label>
              <input 
                type="email" 
                id="signinEmail" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email" 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="signinPassword">Password</label>
              <input 
                type="password" 
                id="signinPassword" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password" 
                required 
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>Register</h2>
            <div className="form-group">
              <label htmlFor="registerName">Name</label>
              <input 
                type="text" 
                id="registerName" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name" 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="registerSurname">Surname</label>
              <input 
                type="text" 
                id="registerSurname" 
                name="surname"
                value={formData.surname}
                onChange={handleInputChange}
                placeholder="Enter your surname" 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="registerEmail">Email Address</label>
              <input 
                type="email" 
                id="registerEmail" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email" 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="registerPhone">Phone Number</label>
              <input 
                type="tel" 
                id="registerPhone" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number" 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="registerPassword">Password</label>
              <input 
                type="password" 
                id="registerPassword" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter a password (min. 8 chars)" 
                minLength="8" 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="registerConfirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="registerConfirmPassword" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm password" 
                required 
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;