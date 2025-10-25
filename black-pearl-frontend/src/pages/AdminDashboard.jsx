// pages/AdminDashboard.jsx

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom"; 
// Assuming shared components are available in a 'components' directory
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar'; 

// Import the shared admin CSS (for base layout/hamburger logic) and the dashboard-specific CSS
import '../styles/admin.css'; 
import '../styles/admin-dashboard.css'; // <-- Dedicated CSS for this page

const AdminDashboard = () => {
    const location = useLocation();
    // State to manage the visibility of the sidebar on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Toggle function for the hamburger menu
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Helper to determine active link (optional if the sidebar component handles its own state)
    // const isActive = (path) => location.pathname === path;

    // Helper function for logout
    const handleLogout = (e) => {
        e.preventDefault();
        console.log("Logged out.");
        // In a real app, this would dispatch a logout action and redirect
    }

    // Function to determine CSS class for table status (for display/styling)
    const getStatusClass = (status) => {
        switch (status) {
            case 'Confirmed':
                return 'status-confirmed'; 
            case 'Pending':
                return 'status-pending';
            case 'Completed':
                return 'status-completed';
            default:
                return '';
        }
    }

    // Placeholder data for analytics
    const analyticsData = [
        { value: "42", label: "Total Bookings" },
        { value: "15", label: "Pending Messages" },
        { value: "120", label: "Total Tours" },
        { value: "7", label: "Active Admins" },
    ];
    
    // Placeholder data for recent bookings
    const recentBookings = [
        { id: "#001", client: "John Smith", dest: "Cape Town", date: "2025-10-20", status: "Confirmed" },
        { id: "#002", client: "Sarah Brown", dest: "Durban", date: "2025-10-21", status: "Pending" },
        { id: "#003", client: "Michael Green", dest: "Johannesburg", date: "2025-10-22", status: "Completed" },
    ];


    return (
        // 'sidebar-open' class is added when the menu is active on mobile
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            
            <AdminSidebar 
                isSidebarOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
            />

            {/* Main Content Wrapper */}
            <div id="content-wrapper">
                
                <AdminTopBar 
                    pageTitle="Dashboard" 
                    toggleSidebar={toggleSidebar}
                />

                <main className="dashboard-page-content">
                    {/* Analytics cards */}
                    <div className="analytics-grid">
                        {analyticsData.map((data, index) => (
                            <div key={index} className="analytics-card">
                                <h3>{data.value}</h3>
                                <p>{data.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Placeholder for Chart/Snippet section (from HTML) */}
                    <section className="data-snippet-section">
                        <p className="snippet-title">Visitors Overview & Data Snippet (Placeholder)</p>
                        <p className="snippet-text">This area mimics the circle chart and conversation data seen in the screenshot.</p>
                    </section>

                    {/* Recent Bookings */}
                    <section className="recent-section">
                        <h2>Recent Bookings</h2>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Client</th>
                                        <th>Destination</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td>{booking.id}</td>
                                            <td>{booking.client}</td>
                                            <td>{booking.dest}</td>
                                            <td>{booking.date}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
            
            {/* Overlay for mobile view when sidebar is open */}
            <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
        </div>
    );
};

export default AdminDashboard;