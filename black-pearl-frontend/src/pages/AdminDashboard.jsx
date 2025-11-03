import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import '../styles/admin.css';
import '../styles/admin-dashboard.css';

// Import Recharts components
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [analyticsData, setAnalyticsData] = useState({
        totalBookings: 0,
        pendingQuotes: 0,
        totalRevenue: 0,
        activeUsers: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeFilter, setTimeFilter] = useState('30days');

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');

            // Fetch quotes data
            const quotesResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/quotes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Fetch messages data
            const messagesResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!quotesResponse.ok || !messagesResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const quotesData = await quotesResponse.json();
            const messagesData = await messagesResponse.json();

            if (quotesData.success) {
                const quotes = quotesData.data;
                setQuotes(quotes);

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
            }

            if (messagesData) {
                setMessages(messagesData);
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

    // Calculate filtered data based on time filter
    const getFilteredData = () => {
        const now = new Date();
        let startDate = new Date();
        
        switch(timeFilter) {
            case '7days':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90days':
                startDate.setDate(now.getDate() - 90);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }
        
        return quotes.filter(quote => new Date(quote.createdAt) >= startDate);
    };

    // Generate booking trends data for charts
    const getBookingTrendsData = () => {
        const filteredData = getFilteredData();
        const trends = {};
        
        filteredData.forEach(quote => {
            const date = new Date(quote.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            if (!trends[date]) {
                trends[date] = {
                    date,
                    bookings: 0,
                    revenue: 0
                };
            }
            
            trends[date].bookings += 1;
            trends[date].revenue += (quote.finalPrice || quote.estimatedPrice || 0);
        });
        
        return Object.values(trends).sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    // Generate message trends data
    const getMessageTrendsData = () => {
        const now = new Date();
        let startDate = new Date();
        
        switch(timeFilter) {
            case '7days':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90days':
                startDate.setDate(now.getDate() - 90);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }
        
        const filteredMessages = messages.filter(message => new Date(message.createdAt) >= startDate);
        const trends = {};
        
        filteredMessages.forEach(message => {
            const date = new Date(message.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            if (!trends[date]) {
                trends[date] = {
                    date,
                    messages: 0
                };
            }
            
            trends[date].messages += 1;
        });
        
        return Object.values(trends).sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    // Get status distribution for pie chart
    const getStatusDistribution = () => {
        const filteredData = getFilteredData();
        const statusCounts = {};
        
        filteredData.forEach(quote => {
            const status = quote.status;
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    };

    // Get message status distribution
    const getMessageStatusDistribution = () => {
        const now = new Date();
        let startDate = new Date();
        
        switch(timeFilter) {
            case '7days':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90days':
                startDate.setDate(now.getDate() - 90);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }
        
        const filteredMessages = messages.filter(message => new Date(message.createdAt) >= startDate);
        const statusCounts = {
            UNREAD: 0,
            READ: 0
        };
        
        filteredMessages.forEach(message => {
            statusCounts[message.status] = (statusCounts[message.status] || 0) + 1;
        });
        
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    };

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

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
                        <div className="loading-state">
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
                        <div className="error-state">
                            <p>Error: {error}</p>
                            <button onClick={fetchDashboardData}>
                                Retry
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const bookingTrendsData = getBookingTrendsData();
    const messageTrendsData = getMessageTrendsData();
    const statusDistributionData = getStatusDistribution();
    const messageStatusDistributionData = getMessageStatusDistribution();

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
                    {/* Time Filter */}
                    <div className="time-filter-section">
                        <label htmlFor="timeFilter">Show data for: </label>
                        <select 
                            id="timeFilter"
                            value={timeFilter} 
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="time-filter-select"
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                        </select>
                    </div>

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
                        <div className="analytics-card">
                            <h3>{messages.length}</h3>
                            <p>Total Messages</p>
                        </div>
                        <div className="analytics-card">
                            <h3>{messages.filter(m => m.status === 'UNREAD').length}</h3>
                            <p>Unread Messages</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="charts-section">
                        <div className="chart-row">
                            {/* Booking Trends Chart */}
                            <div className="chart-card">
                                <h3>Booking Trends</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={bookingTrendsData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="bookings" stroke="#8884d8" activeDot={{ r: 8 }} />
                                        <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Message Trends Chart */}
                            <div className="chart-card">
                                <h3>Message Trends</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={messageTrendsData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="messages" stroke="#ff8042" activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="chart-row">
                            {/* Booking Status Distribution */}
                            <div className="chart-card">
                                <h3>Booking Status Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={statusDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {statusDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Message Status Distribution */}
                            <div className="chart-card">
                                <h3>Message Status Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={messageStatusDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {messageStatusDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#0088FE' : '#00C49F'} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Section */}
                    <section className="data-snippet-section">
                        <div className="stats-overview">
                            <h3>Quick Overview</h3>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-label">Today's Bookings:</span>
                                    <span className="stat-value">
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
                                <div className="stat-item">
                                    <span className="stat-label">This Week:</span>
                                    <span className="stat-value">
                                        {recentBookings.length} bookings
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Avg. Booking:</span>
                                    <span className="stat-value">
                                        R {analyticsData.totalBookings > 0 ?
                                            Math.round(analyticsData.totalRevenue / analyticsData.totalBookings) : 0}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Response Rate:</span>
                                    <span className="stat-value">
                                        {messages.length > 0 ? 
                                            Math.round((messages.filter(m => m.status === 'READ').length / messages.length) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Recent Bookings with REAL data */}
                    <section className="recent-section">
                        <div className="section-header">
                            <h2>Recent Bookings</h2>
                            <button onClick={fetchDashboardData} className="refresh-btn">
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
                                            <td colSpan="6" className="no-data">
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