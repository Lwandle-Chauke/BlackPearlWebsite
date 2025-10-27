// pages/AdminDashboard.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import '../styles/admin.css';
import '../styles/admin-dashboard.css';

const AdminDashboard = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return 'status-confirmed';
            case 'pending':
                return 'status-pending';
            case 'completed':
                return 'status-completed';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token'); // Assuming admin token is stored here
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch total bookings
            const bookingsRes = await fetch("http://localhost:5000/api/bookings", { headers });
            const bookingsData = await bookingsRes.json();
            const totalBookings = Array.isArray(bookingsData.data) ? bookingsData.data.length : 0;
            const recentBookingsData = Array.isArray(bookingsData.data) ? bookingsData.data.slice(0, 3) : [];

            // Fetch total messages and pending messages
            const messagesRes = await fetch("http://localhost:5000/api/messages", { headers });
            const messagesData = await messagesRes.json();
            const pendingMessages = Array.isArray(messagesData) ? messagesData.filter(msg => msg.status === 'UNREAD').length : 0;

            // Fetch total feedback
            const feedbackRes = await fetch("http://localhost:5000/api/feedback", { headers });
            const feedbackData = await feedbackRes.json();
            const totalFeedback = Array.isArray(feedbackData) ? feedbackData.length : 0;

            // Placeholder for total users (if you have a user endpoint)
            // const usersRes = await fetch("http://localhost:5000/api/users", { headers });
            // const usersData = await usersRes.json();
            // const totalUsers = Array.isArray(usersData) ? usersData.length : 0;
            const usersRes = await fetch("http://localhost:5000/api/users", { headers });
            const usersData = await usersRes.json();
            const totalUsers = Array.isArray(usersData.data) ? usersData.data.length : 0;

            setAnalyticsData([
                { value: totalBookings, label: "Total Bookings" },
                { value: pendingMessages, label: "Pending Messages" },
                { value: totalFeedback, label: "Total Feedback" },
                { value: totalUsers, label: "Total Users" },
            ]);
            setRecentBookings(recentBookingsData);

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Failed to load dashboard data.");
            setAnalyticsData([
                { value: "N/A", label: "Total Bookings" },
                { value: "N/A", label: "Pending Messages" },
                { value: "N/A", label: "Total Feedback" },
                { value: "N/A", label: "Total Users" },
            ]);
            setRecentBookings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <div id="content-wrapper">
                    <AdminTopBar pageTitle="Dashboard" toggleSidebar={toggleSidebar} />
                    <main className="dashboard-page-content">
                        <div className="loading-message">Loading dashboard data...</div>
                    </main>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <div id="content-wrapper">
                    <AdminTopBar pageTitle="Dashboard" toggleSidebar={toggleSidebar} />
                    <main className="dashboard-page-content">
                        <div className="error-message">{error}</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <AdminSidebar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            <div id="content-wrapper">
                <AdminTopBar
                    pageTitle="Dashboard"
                    toggleSidebar={toggleSidebar}
                />

                <main className="dashboard-page-content">
                    <div className="analytics-grid">
                        {analyticsData.map((data, index) => (
                            <div key={index} className="analytics-card">
                                <h3>{data.value}</h3>
                                <p>{data.label}</p>
                            </div>
                        ))}
                    </div>

                    <section className="data-snippet-section">
                        <p className="snippet-title">Visitors Overview & Data Snippet (Placeholder)</p>
                        <p className="snippet-text">This area mimics the circle chart and conversation data seen in the screenshot.</p>
                    </section>

                    <section className="recent-section">
                        <h2>Recent Bookings</h2>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Client</th>
                                        <th>Service</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBookings.length > 0 ? (
                                        recentBookings.map((booking) => (
                                            <tr key={booking._id}>
                                                <td>#{booking._id.slice(-4)}</td>
                                                <td>{booking.name}</td>
                                                <td>{booking.service}</td>
                                                <td>{new Date(booking.date).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="no-data-message">No recent bookings found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>

            <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
        </div>
    );
};

export default AdminDashboard;
