import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import '../styles/admin.css';
import '../styles/admin-dashboard.css';

const AdminDashboard = () => {
    const location = useLocation(); // Keep useLocation from HEAD
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [analyticsData, setAnalyticsData] = useState({
        totalBookings: 0,
        pendingQuotes: 0,
        totalRevenue: 0,
        activeUsers: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); // Use string for error from Anele

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(''); // Clear previous errors
            const token = localStorage.getItem('token');

            // Fetch quotes data
            const quotesResponse = await fetch('http://localhost:5000/api/quotes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!quotesResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const quotesData = await quotesResponse.json();

            if (quotesData.success) {
                const quotes = quotesData.data;

                // Calculate analytics from real data
                const totalBookings = quotes.filter(q =>
                    q.status === 'booked' || q.status === 'completed' || q.status === 'confirmed'
                ).length;

                const pendingQuotes = quotes.filter(q =>
                    q.quoteStatus === 'pending_admin'
                ).length;

                const totalRevenue = quotes
                    .filter(q => q.finalPrice && (q.status === 'booked' || q.status === 'completed'))
                    .reduce((sum, quote) => sum + (quote.finalPrice || 0), 0);

                // Get unique users from quotes
                const uniqueUsers = new Set(
                    quotes.filter(q => q.userId).map(q => q.userId?.toString())
                ).size;

                setAnalyticsData({
                    totalBookings,
                    pendingQuotes,
                    totalRevenue: Math.round(totalRevenue),
                    activeUsers: uniqueUsers
                });

                // Get recent bookings (last 5)
                const recent = quotes
                    .filter(q => q.status === 'booked' || q.status === 'completed' || q.status === 'confirmed')
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
                    .map(quote => ({
                        id: `#${quote._id?.slice(-6).toUpperCase() || 'N/A'}`,
                        client: quote.customerName,
                        dest: quote.dropoffLocation,
                        date: new Date(quote.tripDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }),
                        status: quote.status.charAt(0).toUpperCase() + quote.status.slice(1),
                        price: quote.finalPrice ? `R ${quote.finalPrice}` : 'Pending'
                    }));

                setRecentBookings(recent);
            } else {
                setError('Failed to load dashboard data');
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            setError('Failed to connect to server. Please check if backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'status-completed';
            case 'booked':
            case 'confirmed':
                return 'status-confirmed';
            case 'pending':
                return 'status-pending';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return 'status-pending';
        }
    };

    if (loading) {
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
                        <div className="loading-state" style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: '#666'
                        }}>
                            <p>Loading dashboard data...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (error) {
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
                        <div className="error-state" style={{
                            background: '#fff',
                            padding: '2rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            boxShadow: '0 3px 8px rgba(0,0,0,0.05)'
                        }}>
                            <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>Error: {error}</p>
                            <button
                                onClick={fetchDashboardData}
                                style={{
                                    background: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Retry
                            </button>
                        </div>
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
                    {/* Analytics cards with REAL data */}
                    <div className="analytics-grid">
                        <div className="analytics-card">
                            <h3>{analyticsData.totalBookings}</h3>
                            <p>Total Bookings</p>
                        </div>
                        <div className="analytics-card">
                            <h3>{analyticsData.pendingQuotes}</h3>
                            <p>Pending Quotes</p>
                        </div>
                        <div className="analytics-card">
                            <h3>R {analyticsData.totalRevenue}</h3>
                            <p>Total Revenue</p>
                        </div>
                        <div className="analytics-card">
                            <h3>{analyticsData.activeUsers}</h3>
                            <p>Active Users</p>
                        </div>
                    </div>

                    {/* Quick Stats Section */}
                    <section className="data-snippet-section">
                        <div className="stats-overview">
                            <h3 style={{
                                marginBottom: '1rem',
                                color: 'var(--dark-gray)',
                                fontSize: '1.2rem'
                            }}>
                                Quick Overview
                            </h3>
                            <div className="stats-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem'
                            }}>
                                <div className="stat-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '0.5rem 0',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    <span className="stat-label" style={{ color: '#666' }}>Today's Bookings:</span>
                                    <span className="stat-value" style={{ fontWeight: 'bold' }}>
                                        {recentBookings.filter(booking => {
                                            const today = new Date().toDateString();
                                            return booking.date === new Date().toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            });
                                        }).length}
                                    </span>
                                </div>
                                <div className="stat-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '0.5rem 0',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    <span className="stat-label" style={{ color: '#666' }}>This Week:</span>
                                    <span className="stat-value" style={{ fontWeight: 'bold' }}>
                                        {recentBookings.length} bookings
                                    </span>
                                </div>
                                <div className="stat-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '0.5rem 0',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    <span className="stat-label" style={{ color: '#666' }}>Avg. Booking:</span>
                                    <span className="stat-value" style={{ fontWeight: 'bold' }}>
                                        R {analyticsData.totalBookings > 0 ?
                                            Math.round(analyticsData.totalRevenue / analyticsData.totalBookings) : 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Recent Bookings with REAL data */}
                    <section className="recent-section">
                        <div className="section-header" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem'
                        }}>
                            <h2>Recent Bookings</h2>
                            <button
                                onClick={fetchDashboardData}
                                style={{
                                    background: '#27ae60',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <i className="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Client</th>
                                        <th>Service</th>
                                        <th>Date</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{
                                                textAlign: 'center',
                                                color: '#666',
                                                padding: '2rem'
                                            }}>
                                                No recent bookings found
                                            </td>
                                        </tr>
                                    ) : (
                                        recentBookings.map((booking) => (
                                            <tr key={booking.id}>
                                                <td>{booking.id}</td>
                                                <td>{booking.client}</td>
                                                <td>{booking.dest}</td>
                                                <td>{booking.date}</td>
                                                <td>{booking.price}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
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
