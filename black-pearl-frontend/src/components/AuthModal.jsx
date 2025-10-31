
import React, { useState, useEffect } from 'react';

const AuthModal = ({ onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('signin');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
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
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

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

  const handleForgotPasswordEmailChange = (e) => {
    setForgotPasswordEmail(e.target.value);
    setForgotPasswordMessage('');
  };

  // Forgot Password Function
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordMessage('');
    setForgotPasswordSuccess(false);

    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('Please enter your email address');
      setForgotPasswordLoading(false);
      return;
    }

    try {
      console.log('Forgot password request for:', forgotPasswordEmail);
      
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const responseText = await response.text();
      console.log('Raw forgot password response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        setForgotPasswordMessage('Invalid response from server');
        setForgotPasswordLoading(false);
        return;
      }

      console.log('Forgot password response:', data);

      if (response.ok && data.success) {
        setForgotPasswordSuccess(true);
        setForgotPasswordMessage(`Temporary password sent to: ${forgotPasswordEmail}\n\nYour temporary password: ${data.temporaryPassword}\n\nPlease use this password to log in and change it immediately.`);
      } else {
        setForgotPasswordMessage(data.error || data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Forgot password network error:', error);
      setForgotPasswordMessage('Network error. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
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

      // Use the response format from your backend
      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { 
          success: true, 
          user: data.user,
          token: data.token
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

      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user, token: data.token };
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
        console.log('User data:', result.user);
        
        // Safely call onAuthSuccess if provided
        if (onAuthSuccess && typeof onAuthSuccess === 'function') {
          try {
            onAuthSuccess(result.user);
          } catch (callbackError) {
            console.error('Error in onAuthSuccess callback:', callbackError);
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
    setForgotPasswordEmail('');
    setForgotPasswordMessage('');
    setForgotPasswordSuccess(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsForgotPassword(false);
    resetForm();
  };

  const handleBackToSignIn = () => {
    setIsForgotPassword(false);
    setForgotPasswordEmail('');
    setForgotPasswordMessage('');
    setForgotPasswordSuccess(false);
    // Pre-fill the email in signin form if we have it from forgot password
    if (forgotPasswordEmail) {
      setFormData(prev => ({
        ...prev,
        email: forgotPasswordEmail
      }));
    }
  };

  const handleUseTemporaryPassword = () => {
    setIsForgotPassword(false);
    // Pre-fill the email in signin form
    if (forgotPasswordEmail) {
      setFormData(prev => ({
        ...prev,
        email: forgotPasswordEmail
      }));
    }
    // Focus on password field for user to enter the temporary password
    setTimeout(() => {
      const passwordInput = document.getElementById('signinPassword');
      if (passwordInput) {
        passwordInput.focus();
      }
    }, 100);
  };

  return (
    <div className="auth-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        {!isForgotPassword ? (
          <>
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
              
              {/* Forgot Password Link */}
              <div className="forgot-password-link">
                <button 
                  type="button" 
                  className="forgot-password-btn"
                  onClick={() => setIsForgotPassword(true)}
                  disabled={loading}
                >
                  Forgot your password?
                </button>
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
          </>
        ) : (
          /* Forgot Password Form */
          <div className="forgot-password-form">
            <h2>Forgot Password</h2>
            
            {!forgotPasswordSuccess ? (
              <>
                <p>Enter your email address and we'll send you a temporary password.</p>
                
                {forgotPasswordMessage && (
                  <div className="forgot-password-message error">
                    {forgotPasswordMessage}
                  </div>
                )}

                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <label htmlFor="forgotPasswordEmail">Email Address</label>
                    <input 
                      type="email" 
                      id="forgotPasswordEmail" 
                      value={forgotPasswordEmail}
                      onChange={handleForgotPasswordEmailChange}
                      placeholder="Enter your email address" 
                      required 
                      disabled={forgotPasswordLoading}
                    />
                  </div>

                  <div className="forgot-password-actions">
                    <button 
                      type="button" 
                      className="back-to-signin-btn"
                      onClick={handleBackToSignIn}
                      disabled={forgotPasswordLoading}
                    >
                      Back to Sign In
                    </button>
                    <button 
                      type="submit" 
                      className="btn-auth"
                      disabled={forgotPasswordLoading}
                    >
                      {forgotPasswordLoading ? 'Sending...' : 'Send Temporary Password'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success State after sending temporary password */
              <div className="forgot-password-success">
                <div className="success-icon">✓</div>
                <div className="forgot-password-message success">
                  {forgotPasswordMessage.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
                
                <div className="forgot-password-success-actions">
                  <button 
                    type="button" 
                    className="btn-auth primary"
                    onClick={handleUseTemporaryPassword}
                  >
                    Use Temporary Password to Sign In
                  </button>
                  <button 
                    type="button" 
                    className="back-to-signin-btn"
                    onClick={handleBackToSignIn}
                  >
                    Back to Regular Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
