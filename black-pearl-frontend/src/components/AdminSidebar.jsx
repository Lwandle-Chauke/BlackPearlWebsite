import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Note: This component now accepts a prop to determine its visual state
const AdminSidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const location = useLocation();

    const navLinks = [
        { path: "/admin/dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
        { path: "/admin/messages", label: "Messages", icon: "fas fa-envelope" },
        { path: "/admin/bookings", label: "Bookings", icon: "fas fa-calendar-alt" },
        { path: "/admin/gallery", label: "Gallery", icon: "fas fa-images" },
        { path: "/admin/settings", label: "Settings", icon: "fas fa-cog" },
    ];

    const handleLogout = (e) => {
        e.preventDefault();
        console.log('Logged out.'); 
        // In a real app, this would call an authentication context/redux action to sign out.
    };

    return (
        // The isSidebarOpen class is controlled by the parent layout
        <aside className="sidebar">
            {/* Sidebar header can remain empty or contain a title if desired */}
            <div className="sidebar-header"></div>

            <ul>
                {navLinks.map((link) => (
                    <li key={link.path}>
                        {/* Closing the sidebar on link click for mobile UX */}
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
                    <Link to="/" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i> <span>Logout</span>
                    </Link>
                </li>
            </ul>
        </aside>
    );
};

export default AdminSidebar;
