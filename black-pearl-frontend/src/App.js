import React, { useState, useEffect } from "react"; 
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 

// =======================================================
// IMPORT ALL PAGES
// =======================================================
// Guest Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Quote from "./pages/Quote";
import Contact from "./pages/Contact";
import Fleet from "./pages/Fleet";
import Gallery from "./pages/Gallery";

// Customer Pages
import Profile from "./pages/Profile";
import Bookings from "./pages/Bookings";
import Dashboard from "./pages/Dashboard"; 

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminMessages from "./pages/Admin-Messages";
import AdminBookings from "./pages/Admin-Bookings";
import AdminGallery from "./pages/Admin-Gallery";
import AdminSettings from "./pages/Admin-Settings";

// Import AuthModal
import AuthModal from "./components/AuthModal";

// =======================================================
// MAIN APP COMPONENT
// =======================================================
function App() {
    const [userRole, setUserRole] = useState('guest');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing authentication on app load
    useEffect(() => {
        checkExistingAuth();
    }, []);

    const checkExistingAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            
            if (token && userData) {
                const user = JSON.parse(userData);
                setCurrentUser(user);
                setUserRole(user.role || 'customer');
                console.log('Existing user found:', user);
            }
        } catch (error) {
            console.error('Error checking existing auth:', error);
            // Clear invalid storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    // Helper to determine if the user is logged in at all
    const isLoggedIn = userRole !== 'guest';

    // Simple function to show auth modal
    const handleAuthClick = () => {
        console.log("Auth click triggered");
        setShowAuthModal(true);
    };

    // Handle successful authentication from AuthModal
    const handleAuthSuccess = (user) => {
  console.log('Auth successful for user:', user);
  setCurrentUser(user);
  setUserRole(user.role || 'customer');
  setShowAuthModal(false);
  
  // Redirect based on user role
  if (user.role === 'admin') {
    // Use window.location for immediate redirect to admin dashboard
    window.location.href = '/admin/dashboard';
  } else {
    // Show success message for regular users
    alert(`Welcome back, ${user.name}! You have been successfully signed in.`);
  }
};

    const handleSignOut = () => {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Reset state
        setUserRole('guest');
        setCurrentUser(null);
        setShowAuthModal(false);
        
        alert('You have been logged out.'); 
    };

    // Helper component for protected routes
    const ProtectedRoute = ({ children, requiredRole }) => {
        const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        
        if (!requiredRoles.includes(userRole)) {
            return <Navigate to="/" replace />;
        }
        return children;
    };

    // Show loading while checking authentication
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '18px'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <Router>
            {/* Auth Modal - Rendered at app level */}
            {showAuthModal && (
                <AuthModal 
                    onClose={() => setShowAuthModal(false)}
                    onAuthSuccess={handleAuthSuccess}
                />
            )}
            
            <Routes>
                {/* ======================================================= */}
                {/* GUEST ROUTES (Publicly Accessible)                     */}
                {/* ======================================================= */}
                <Route path="/" element={
                    <Home 
                        onAuthClick={handleAuthClick} 
                        isLoggedIn={isLoggedIn}
                        onSignOut={handleSignOut}
                        currentUser={currentUser}
                    />
                } />
                <Route path="/about" element={
                    <About 
                        onAuthClick={handleAuthClick} 
                        isLoggedIn={isLoggedIn}
                        onSignOut={handleSignOut}
                        currentUser={currentUser}
                    />
                } />
                <Route path="/quote" element={
                    <Quote 
                        onAuthClick={handleAuthClick} 
                        isLoggedIn={isLoggedIn}
                        onSignOut={handleSignOut}
                        currentUser={currentUser}
                    />
                } />
                <Route path="/contact" element={
                    <Contact 
                        onAuthClick={handleAuthClick} 
                        isLoggedIn={isLoggedIn}
                        onSignOut={handleSignOut}
                        currentUser={currentUser}
                    />
                } />
                <Route path="/fleet" element={
                    <Fleet 
                        onAuthClick={handleAuthClick} 
                        isLoggedIn={isLoggedIn}
                        onSignOut={handleSignOut}
                        currentUser={currentUser}
                    />
                } />
                <Route path="/gallery" element={
                    <Gallery 
                        onAuthClick={handleAuthClick} 
                        isLoggedIn={isLoggedIn}
                        onSignOut={handleSignOut}
                        currentUser={currentUser}
                    />
                } />

                {/* ======================================================= */}
                {/* CUSTOMER ROUTES (Requires 'customer' or 'admin')       */}
                {/* ======================================================= */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute requiredRole={['customer', 'admin']}>
                            <Dashboard 
                                onSignOut={handleSignOut} 
                                isLoggedIn={true} 
                                currentUser={currentUser}
                            />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/profile" 
                    element={
                        <ProtectedRoute requiredRole={['customer', 'admin']}>
                            <Profile 
                                onSignOut={handleSignOut} 
                                isLoggedIn={true} 
                                currentUser={currentUser}
                            />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/bookings" 
                    element={
                        <ProtectedRoute requiredRole={['customer', 'admin']}>
                            <Bookings 
                                onSignOut={handleSignOut} 
                                isLoggedIn={true} 
                                currentUser={currentUser}
                            />
                        </ProtectedRoute>
                    } 
                />

                {/* ======================================================= */}
                {/* ADMIN ROUTES (Requires 'admin')                        */}
                {/* ======================================================= */}
                <Route 
                    path="/admin/dashboard" 
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminDashboard 
                                onSignOut={handleSignOut} 
                                currentUser={currentUser}
                            />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/messages" 
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminMessages />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/bookings" 
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminBookings />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/gallery" 
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminGallery />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/settings" 
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminSettings />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Catch-all route for undefined paths */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;