import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = ({ isSidebarOpen, toggleSidebar, onSignOut }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const navLinks = [
        { path: "/admin/dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
        { path: "/admin/messages", label: "Messages", icon: "fas fa-envelope" },
        { path: "/admin/bookings", label: "Bookings", icon: "fas fa-calendar-alt" },
    ];

    const handleLogout = async (e) => {
        e.preventDefault();
        console.log('Logging out...');

        // Show browser confirmation dialog
        const confirmLogout = window.confirm('localhost:3000 says:\n\nAre you sure you want to log out?');

        if (!confirmLogout) {
            return; // User cancelled logout
        }

        try {
            // Clear all authentication data from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');

            // Clear sessionStorage as well
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('currentUser');
            sessionStorage.removeItem('isLoggedIn');

            // Clear any cookies (if used)
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            // Call the parent's sign out function to update global state
            if (onSignOut && typeof onSignOut === 'function') {
                onSignOut();
            }

            // Force a hard redirect to home page to ensure complete reset
            window.location.href = '/';

            // Alternative: Use navigate with reload
            // navigate('/', { replace: true });
            // window.location.reload();

        } catch (error) {
            console.error('Logout error:', error);
            // Fallback: force redirect anyway
            window.location.href = '/';
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header"></div>

            <ul>
                {navLinks.map((link) => (
                    <li key={link.path}>
                        <Link
                            to={link.path}
                            className={location.pathname === link.path ? "active" : ""}
                            onClick={toggleSidebar}
                        >
                            <i className={link.icon}></i> <span>{link.label}</span>
                        </Link>
                    </li>
                ))}
                <li>
                    <a href="#logout" onClick={handleLogout} className="logout-link">
                        <i className="fas fa-sign-out-alt"></i> <span>Logout</span>
                    </a>
                </li>
            </ul>
        </aside>
    );
};

export default AdminSidebar;
