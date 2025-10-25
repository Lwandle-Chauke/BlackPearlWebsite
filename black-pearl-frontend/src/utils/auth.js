// src/utils/auth.js
export const authUtils = {
  // Save user data to localStorage
  setUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  },

  // Get user data from localStorage
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  // API base URL
  API_BASE_URL: 'http://localhost:5000/api'
};