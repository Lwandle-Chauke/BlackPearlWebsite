import React, { useState, useEffect } from 'react';

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

  const API_BASE_URL = 'http://localhost:5000/api';

  // Manage body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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
      console.log('Login attempt:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // First, get the raw response text to see what we're receiving
      const responseText = await response.text();
      console.log('Raw login response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        return { 
          success: false, 
          error: 'Invalid response format from server' 
        };
      }

      console.log('Parsed login data:', data);
      console.log('Response status:', response.status);

      if (!response.ok) {
        return { 
          success: false, 
          error: data.message || data.error || `Login failed with status ${response.status}`
        };
      }

      // Flexible response handling - check for common success indicators
      const token = data.token || data.accessToken;
      const user = data.user || data.userData || data.userInfo;
      
      if (token) {
        localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          // If no user object, create a basic one from the data we have
          localStorage.setItem('user', JSON.stringify({
            email: email,
            name: data.name || ''
          }));
        }
        return { 
          success: true, 
          user: user || { email: email, name: data.name || '' } 
        };
      } else {
        return { 
          success: false, 
          error: data.message || data.error || 'No authentication token received'
        };
      }
    } catch (error) {
      console.error('Login network error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const handleRegister = async (userData) => {
    try {
      console.log('Sending registration data:', { 
        ...userData, 
        password: '***', // Hide password in logs
        confirmPassword: '***' 
      });
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const responseText = await response.text();
      console.log('Raw registration response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        return { 
          success: false, 
          error: 'Invalid response format from server' 
        };
      }

      console.log('Registration response:', data);

      if (!response.ok) {
        return { 
          success: false, 
          error: data.message || data.error || `Registration failed with status ${response.status}`
        };
      }

      if (data.success || data.token) {
        const token = data.token || data.accessToken;
        const user = data.user || data.userData;
        
        localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        return { success: true, user: user || userData };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration network error:', error);
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
        if (!formData.email || !formData.password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }

        result = await handleLogin(formData.email, formData.password);
      } else {
        if (!formData.name || !formData.surname || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }

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

        const registerData = {
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        };

        result = await handleRegister(registerData);
      }

      console.log('Authentication result:', result);

      if (result.success) {
        console.log('Authentication successful, calling onAuthSuccess...');
        
        // Safely call onAuthSuccess if provided
        if (onAuthSuccess && typeof onAuthSuccess === 'function') {
          try {
            onAuthSuccess(result.user);
          } catch (callbackError) {
            console.error('Error in onAuthSuccess callback:', callbackError);
            // Continue with closing even if callback fails
          }
        } else {
          console.warn('onAuthSuccess not provided or not a function');
        }
        
        onClose();
      } else {
        setError(result.error || 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected error in handleSubmit:', error);
      setError('An unexpected error occurred. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('auth-overlay')) {
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <div className="auth-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div className="auth-tabs">
          <button 
            className={`tab ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => handleTabChange('signin')}
          >
            Sign In
          </button>
          <button 
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabChange('register')}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        <form 
          onSubmit={handleSubmit} 
          className={`auth-form ${activeTab === 'signin' ? 'active' : ''}`}
        >
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

        {/* Register Form */}
        <form 
          onSubmit={handleSubmit} 
          className={`auth-form ${activeTab === 'register' ? 'active' : ''}`}
        >
          <h2>Register</h2>
          <div className="form-group">
            <label htmlFor="registerName">First Name</label>
            <input 
              type="text" 
              id="registerName" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your first name" 
              required 
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="registerSurname">Last Name</label>
            <input 
              type="text" 
              id="registerSurname" 
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              placeholder="Enter your last name" 
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
      </div>
    </div>
  );
};

export default AuthModal;