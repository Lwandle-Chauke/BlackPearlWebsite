import React, { useState, useEffect } from "react"; 
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 
import './styles/style.css';

// =======================================================
// IMPORT ALL PAGES (using correct file paths from file structure)
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

// Admin Pages (Using the exact filenames from your file structure)
import AdminDashboard from "./pages/AdminDashboard";
import AdminMessages from "./pages/Admin-Messages"; // Corresponds to Admin-Messages.jsx
import AdminBookings from "./pages/Admin-Bookings"; // Corresponds to Admin-Bookings.jsx
import AdminGallery from "./pages/Admin-Gallery"; // Corresponds to Admin-Gallery.jsx
import AdminSettings from "./pages/Admin-Settings"; // Corresponds to Admin-Settings.jsx

// NEW: Quote Response Page for Email Links
import QuoteResponse from "./pages/QuoteResponse";

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

    // Function to refresh user data from backend
    const refreshUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('http://localhost:5000/api/auth/me', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('User data refreshed:', data.user);
                    setCurrentUser(data.user);
                    setUserRole(data.user.role || 'customer');
                    // Update localStorage with fresh data
                    localStorage.setItem('user', JSON.stringify(data.user));
                    return data.user;
                }
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };

    // Handle user update from child components
    const handleUserUpdate = (updatedUser) => {
        console.log('User data updated:', updatedUser);
        setCurrentUser(updatedUser);
        setUserRole(updatedUser.role || 'customer');
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
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
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
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

                {/* NEW: Quote Response Route (Public) */}
                <Route path="/quote-response/:quoteId/:action" element={
                    <QuoteResponse />
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
                                onUserUpdate={handleUserUpdate}
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
                                onUserUpdate={handleUserUpdate}
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
                                onUserUpdate={handleUserUpdate}
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
                                onUserUpdate={handleUserUpdate}
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