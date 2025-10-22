// components/App.jsx

import React, { useState } from "react"; // 1. Import useState
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // 2. Import Navigate for protected routes

// Import your pages
import Home from "./pages/Home";
import About from "./pages/About";
import Quote from "./pages/Quote";
import Contact from "./pages/Contact";
import Fleet from "./pages/Fleet";
import Gallery from "./pages/Gallery";
import Profile from "./pages/Profile";
import Bookings from "./pages/Bookings";
// 3. Assume Dashboard is imported
import Dashboard from "./pages/Dashboard"; 

function App() {
  // 🔑 1. Define the global login state
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // 2. Define handler functions
  const handleSignIn = () => {
    // In a real app, this would involve API calls and token storage
    setIsLoggedIn(true);
    // You might also want to navigate to the dashboard here: navigate('/dashboard');
  };

  const handleSignOut = () => {
    // In a real app, this would involve clearing tokens/cookies
    setIsLoggedIn(false);
    // The Header's onAuthClick (passed to non-guest pages) will handle the alert and redirect
  };
  
  // 3. Helper component for protected routes
  // This is a common pattern to protect routes that require a logged-in user.
  const ProtectedRoute = ({ children }) => {
    // If not logged in, redirect them to the home page (or login page)
    if (!isLoggedIn) {
      return <Navigate to="/" replace />;
    }
    return children;
  };


  return (
    <Router>
      <Routes>
        {/* ======================================================= */}
        {/* GUEST ROUTES                        */}
        {/* ======================================================= */}
        {/* These pages need the signIn handler for their Header's button */}
        <Route path="/" element={<Home onAuthClick={handleSignIn} isLoggedIn={isLoggedIn} />} />
        <Route path="/about" element={<About onAuthClick={handleSignIn} isLoggedIn={isLoggedIn} />} />
        
        {/* Shared Routes - These need BOTH handlers in a real app, but 
           the pages themselves are structured to only call the sign-in modal 
           when isLoggedIn is false. We pass the sign-in handler here: */}
        <Route path="/quote" element={<Quote onAuthClick={handleSignIn} isLoggedIn={isLoggedIn} />} />
        <Route path="/contact" element={<Contact onAuthClick={handleSignIn} isLoggedIn={isLoggedIn} />} />
        <Route path="/fleet" element={<Fleet onAuthClick={handleSignIn} isLoggedIn={isLoggedIn} />} />
        <Route path="/gallery" element={<Gallery onAuthClick={handleSignIn} isLoggedIn={isLoggedIn} />} />

        {/* ======================================================= */}
        {/* CUSTOMER ROUTES                      */}
        {/* ======================================================= */}
        {/* Dashboard is the new landing page after sign-in. It needs the signOut handler. */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {/* Dashboard page is passed the signOut handler, as it assumes the user is logged in */}
              <Dashboard onAuthClick={handleSignOut} isLoggedIn={true} />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Routes: Only accessible if logged in */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile onAuthClick={handleSignOut} isLoggedIn={true} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bookings" 
          element={
            <ProtectedRoute>
              <Bookings onAuthClick={handleSignOut} isLoggedIn={true} />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all route for undefined paths */}
        {/* Note: In a real app, you'd likely render a 404 page here, not Home. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;