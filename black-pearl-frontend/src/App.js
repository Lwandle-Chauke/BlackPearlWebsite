import React, { useState } from "react"; 
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 

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

// =======================================================
// MAIN APP COMPONENT
// =======================================================
function App() {
    /* *** TEMPORARY OVERRIDE FOR DEVELOPMENT ***
    Change 'admin' back to 'guest' when integrating with your backend 
    to enable normal login flow.
    */
    const [userRole, setUserRole] = useState('admin'); // <-- CHANGE THIS BACK TO 'guest' LATER

    // Helper to determine if the user is logged in at all
    const isLoggedIn = userRole !== 'guest';

    // 2. Define role-specific sign-in/sign-out handlers
    const handleCustomerSignIn = () => {
        // Placeholder for successful customer login logic
        setUserRole('customer');
    };
    
    const handleAdminSignIn = () => {
        // Placeholder for successful admin login logic
        setUserRole('admin');
    };

    const handleSignOut = () => {
        // Clears session and resets role to guest
        setUserRole('guest');
        alert('You have been logged out.'); 
    };
    
    // Object passed to Guest pages' authentication button/modal trigger
    const handleAuthClick = { 
        customer: handleCustomerSignIn,
        admin: handleAdminSignIn,
        signOut: handleSignOut
    };

    // 3. Helper component for protected routes based on required role
    const ProtectedRoute = ({ children, requiredRole }) => {
        const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        
        // If the current userRole is NOT in the list of allowed roles, redirect to home.
        if (!requiredRoles.includes(userRole)) {
            // Optional: You might redirect to a specific login page instead of home
            return <Navigate to="/" replace />;
        }
        return children;
    };


    return (
        <Router>
            <Routes>
                {/* ======================================================= */}
                {/* GUEST ROUTES (Publicly Accessible)                      */}
                {/* ======================================================= */}
                <Route path="/" element={<Home onAuthClick={handleAuthClick} isLoggedIn={isLoggedIn} />} />
                <Route path="/about" element={<About onAuthClick={handleAuthClick} isLoggedIn={isLoggedIn} />} />
                <Route path="/quote" element={<Quote onAuthClick={handleAuthClick} isLoggedIn={isLoggedIn} />} />
                <Route path="/contact" element={<Contact onAuthClick={handleAuthClick} isLoggedIn={isLoggedIn} />} />
                <Route path="/fleet" element={<Fleet onAuthClick={handleAuthClick} isLoggedIn={isLoggedIn} />} />
                <Route path="/gallery" element={<Gallery onAuthClick={handleAuthClick} isLoggedIn={isLoggedIn} />} />

                {/* ======================================================= */}
                {/* CUSTOMER ROUTES (Requires 'customer' or 'admin')        */}
                {/* ======================================================= */}
                {/* Admin user can access customer dashboards */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute requiredRole={['customer', 'admin']}>
                            {/* Note: Customer pages use handleSignOut, Admin pages manage logout internally via sidebar */}
                            <Dashboard onAuthClick={handleSignOut} isLoggedIn={true} />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/profile" 
                    element={
                        <ProtectedRoute requiredRole={['customer', 'admin']}>
                            <Profile onAuthClick={handleSignOut} isLoggedIn={true} />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/bookings" 
                    element={
                        <ProtectedRoute requiredRole={['customer', 'admin']}>
                            <Bookings onAuthClick={handleSignOut} isLoggedIn={true} />
                        </ProtectedRoute>
                    } 
                />

                {/* ======================================================= */}
                {/* ADMIN ROUTES (Requires 'admin')                        */}
                {/* ======================================================= */}
                
                {/* Admin Dashboard */}
                <Route 
                    path="/admin/dashboard" 
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Admin Messages */}
                <Route 
                    path="/admin/messages" 
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminMessages />
                        </ProtectedRoute>
                    } 
                />

                {/* Admin Bookings */}
                <Route 
                    path="/admin/bookings" 
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminBookings />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Admin Gallery */}
                <Route 
                    path="/admin/gallery" 
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminGallery />
                        </ProtectedRoute>
                    } 
                />

                {/* Admin Settings */}
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
