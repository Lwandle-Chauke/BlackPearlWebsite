import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import '../styles/admin.css';
import '../styles/admin-dashboard.css';

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
    const [chartType, setChartType] = useState('performance');

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

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
            case '1year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }
        
        return quotes.filter(quote => new Date(quote.createdAt) >= startDate);
    };

    // Comprehensive Analytics Calculations
    const analytics = useMemo(() => {
        const filteredData = getFilteredData();
        
        // Revenue calculations
        const totalRevenue = filteredData
            .filter(q => q.finalPrice && (q.status === 'booked' || q.status === 'completed'))
            .reduce((sum, q) => sum + (q.finalPrice || 0), 0);

        const potentialRevenue = filteredData
            .filter(q => q.estimatedPrice && (q.status === 'pending' || q.status === 'confirmed'))
            .reduce((sum, q) => sum + (q.estimatedPrice || 0), 0);

        // Status counts
        const statusCounts = {
            pending: filteredData.filter(q => q.status === 'pending').length,
            confirmed: filteredData.filter(q => q.status === 'confirmed').length,
            booked: filteredData.filter(q => q.status === 'booked').length,
            completed: filteredData.filter(q => q.status === 'completed').length,
            cancelled: filteredData.filter(q => q.status === 'cancelled').length,
        };

        // Quote status counts
        const quoteStatusCounts = {
            pending_admin: filteredData.filter(q => q.quoteStatus === 'pending_admin').length,
            pending_customer: filteredData.filter(q => q.quoteStatus === 'pending_customer').length,
            pending_email: filteredData.filter(q => q.quoteStatus === 'pending_email').length,
            accepted: filteredData.filter(q => q.quoteStatus === 'accepted').length,
            declined: filteredData.filter(q => q.quoteStatus === 'declined').length,
            converted: filteredData.filter(q => q.quoteStatus === 'converted').length,
        };

        // Vehicle type analysis
        const vehicleStats = filteredData.reduce((acc, quote) => {
            const vehicle = quote.vehicleType || 'Unknown';
            if (!acc[vehicle]) {
                acc[vehicle] = { count: 0, revenue: 0 };
            }
            acc[vehicle].count++;
            if (quote.finalPrice && (quote.status === 'booked' || quote.status === 'completed')) {
                acc[vehicle].revenue += quote.finalPrice;
            }
            return acc;
        }, {});

        // Monthly revenue data for charts
        const monthlyData = filteredData.reduce((acc, quote) => {
            const date = new Date(quote.createdAt);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!acc[monthYear]) {
                acc[monthYear] = {
                    month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    revenue: 0,
                    bookings: 0,
                    quotes: 0,
                    messages: 0
                };
            }
            
            acc[monthYear].quotes++;
            if (quote.status === 'booked' || quote.status === 'completed') {
                acc[monthYear].bookings++;
                acc[monthYear].revenue += (quote.finalPrice || 0);
            }
            
            return acc;
        }, {});

        const chartData = Object.values(monthlyData).sort((a, b) => {
            return new Date(a.month) - new Date(b.month);
        });

        // Conversion rates
        const totalQuotes = filteredData.length;
        const convertedQuotes = quoteStatusCounts.converted + quoteStatusCounts.accepted;
        const conversionRate = totalQuotes > 0 ? (convertedQuotes / totalQuotes) * 100 : 0;

        // Customer type analysis
        const registeredUsers = filteredData.filter(q => q.userId).length;
        const guestUsers = filteredData.filter(q => !q.userId).length;

        // Message analytics
        const messageStats = {
            total: messages.length,
            unread: messages.filter(m => !m.read).length,
            read: messages.filter(m => m.read).length,
            responseRate: messages.length > 0 ? Math.round((messages.filter(m => m.read).length / messages.length) * 100) : 0
        };

        return {
            totalRevenue,
            potentialRevenue,
            statusCounts,
            quoteStatusCounts,
            vehicleStats,
            chartData,
            conversionRate,
            registeredUsers,
            guestUsers,
            totalQuotes,
            convertedQuotes,
            messageStats
        };
    }, [quotes, messages, timeFilter]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');

            // Fetch quotes data
            const quotesResponse = await fetch('http://localhost:5000/api/quotes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Fetch messages data
            const messagesResponse = await fetch('http://localhost:5000/api/messages', {
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
                        price: quote.finalPrice ? `R ${quote.finalPrice}` : 'Pending',
                        originalData: quote
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0
        }).format(amount);
    };

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

    // Enhanced Simple Bar Chart component
    const SimpleBarChart = ({ data, title, color }) => {
        const maxValue = Math.max(...data.map(item => item.value));
        
        return (
            <div className="simple-chart">
                <h4>{title}</h4>
                <div className="chart-bars">
                    {data.map((item, index) => (
                        <div key={index} className="chart-bar-item">
                            <div className="bar-label">{item.name}</div>
                            <div className="bar-container">
                                <div 
                                    className="bar-fill"
                                    style={{ 
                                        width: `${(item.value / maxValue) * 100}%`,
                                        background: color || `linear-gradient(90deg, hsl(${index * 60}, 70%, 50%), hsl(${index * 60}, 80%, 45%))`
                                    }}
                                >
                                    {Math.round((item.value / maxValue) * 100)}%
                                </div>
                                <span className="bar-value">{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Enhanced Simple Pie Chart component
    const SimplePieChart = ({ data, title }) => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#d35400'];
        
        let currentAngle = 0;
        const segments = data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const segment = {
                ...item,
                percentage,
                startAngle: currentAngle,
                endAngle: currentAngle + (percentage * 3.6),
                color: colors[index % colors.length]
            };
            currentAngle += percentage * 3.6;
            return segment;
        });

        return (
            <div className="simple-pie-chart">
                <h4>{title}</h4>
                <div className="pie-container">
                    <div className="pie-chart">
                        {segments.map((segment, index) => (
                            <div 
                                key={index}
                                className="pie-segment"
                                style={{
                                    background: `conic-gradient(${segment.color} 0deg ${segment.endAngle}deg, transparent ${segment.endAngle}deg 360deg)`
                                }}
                            ></div>
                        ))}
                    </div>
                    <div className="pie-legend">
                        {segments.map((segment, index) => (
                            <div key={index} className="legend-item" style={{ borderLeftColor: segment.color }}>
                                <div 
                                    className="legend-color"
                                    style={{ backgroundColor: segment.color }}
                                ></div>
                                <span>{segment.name}: {segment.value} ({Math.round(segment.percentage)}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
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
                        pageTitle="Dashboard Analytics"
                        toggleSidebar={toggleSidebar}
                    />
                    <main className="dashboard-page-content">
                        <div className="loading-state" style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: '#666'
                        }}>
                            <p>Loading comprehensive dashboard analytics...</p>
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
                        pageTitle="Dashboard Analytics"
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

    const filteredData = getFilteredData();

    // Prepare chart data
    const performanceChartData = analytics.chartData.map(item => ({
        name: item.month,
        bookings: item.bookings,
        revenue: item.revenue
    }));

    const statusChartData = Object.entries(analytics.statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }));

    const vehicleChartData = Object.entries(analytics.vehicleStats).map(([name, stats]) => ({
        name,
        value: stats.count
    })).slice(0, 6);

    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <AdminSidebar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            <div id="content-wrapper">
                <AdminTopBar
                    pageTitle="Comprehensive Dashboard Analytics"
                    toggleSidebar={toggleSidebar}
                />

                <main className="dashboard-page-content">
                    {/* Time Filter */}
                    <div className="time-filter-section">
                        <label htmlFor="timeFilter">Analytics Period: </label>
                        <select 
                            id="timeFilter"
                            value={timeFilter} 
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="time-filter-select"
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                            <option value="1year">Last 1 Year</option>
                        </select>
                    </div>

                    {/* Advanced Analytics Cards */}
                    <div className="analytics-grid advanced-analytics">
                        <div className="analytics-card revenue-card">
                            <div className="card-icon">💰</div>
                            <div className="card-content">
                                <h3>{formatCurrency(analytics.totalRevenue)}</h3>
                                <p>Total Revenue</p>
                                <div className="card-subtext">
                                    From {analytics.convertedQuotes} completed bookings
                                </div>
                            </div>
                        </div>
                        <div className="analytics-card bookings-card">
                            <div className="card-icon">📊</div>
                            <div className="card-content">
                                <h3>{analyticsData.totalBookings}</h3>
                                <p>Total Bookings</p>
                                <div className="card-subtext">
                                    {analytics.statusCounts.completed} completed
                                </div>
                            </div>
                        </div>
                        <div className="analytics-card quotes-card">
                            <div className="card-icon">📋</div>
                            <div className="card-content">
                                <h3>{analyticsData.pendingQuotes}</h3>
                                <p>Pending Quotes</p>
                                <div className="card-subtext">
                                    {analytics.totalQuotes} total quotes
                                </div>
                            </div>
                        </div>
                        <div className="analytics-card conversion-card">
                            <div className="card-icon">🔄</div>
                            <div className="card-content">
                                <h3>{analytics.conversionRate.toFixed(1)}%</h3>
                                <p>Conversion Rate</p>
                                <div className="card-subtext">
                                    {analytics.convertedQuotes}/{analytics.totalQuotes} converted
                                </div>
                            </div>
                        </div>
                        <div className="analytics-card users-card">
                            <div className="card-icon">👥</div>
                            <div className="card-content">
                                <h3>{analyticsData.activeUsers}</h3>
                                <p>Active Users</p>
                                <div className="card-subtext">
                                    {analytics.registeredUsers} registered, {analytics.guestUsers} guest
                                </div>
                            </div>
                        </div>
                        <div className="analytics-card messages-card">
                            <div className="card-icon">📧</div>
                            <div className="card-content">
                                <h3>{analytics.messageStats.total}</h3>
                                <p>Total Messages</p>
                                <div className="card-subtext">
                                    {analytics.messageStats.unread} unread
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Charts Section */}
                    <div className="charts-section advanced-charts">
                        <div className="chart-controls">
                            <h3>Business Performance Analytics</h3>
                            <select 
                                value={chartType} 
                                onChange={(e) => setChartType(e.target.value)}
                                className="chart-type-select"
                            >
                                <option value="performance">Performance Overview</option>
                                <option value="revenue">Revenue Analytics</option>
                                <option value="bookings">Bookings Trend</option>
                                <option value="status">Status Distribution</option>
                                <option value="vehicles">Vehicle Performance</option>
                            </select>
                        </div>

                        <div className="charts-grid">
                            <div className="main-chart">
                                {chartType === 'performance' && (
                                    <SimpleBarChart 
                                        data={performanceChartData.map(item => ({
                                            name: item.name,
                                            value: item.bookings
                                        }))}
                                        title="Bookings Trend"
                                        color="linear-gradient(90deg, #3498db, #2980b9)"
                                    />
                                )}
                                {chartType === 'revenue' && (
                                    <SimpleBarChart 
                                        data={performanceChartData.map(item => ({
                                            name: item.name,
                                            value: Math.round(item.revenue / 1000)
                                        }))}
                                        title="Revenue Trend (in thousands)"
                                        color="linear-gradient(90deg, #27ae60, #219653)"
                                    />
                                )}
                                {chartType === 'bookings' && (
                                    <SimpleBarChart 
                                        data={performanceChartData.map(item => ({
                                            name: item.name,
                                            value: item.bookings
                                        }))}
                                        title="Monthly Bookings"
                                        color="linear-gradient(90deg, #9b59b6, #8e44ad)"
                                    />
                                )}
                                {chartType === 'status' && (
                                    <SimplePieChart 
                                        data={statusChartData}
                                        title="Booking Status Distribution"
                                    />
                                )}
                                {chartType === 'vehicles' && (
                                    <SimpleBarChart 
                                        data={vehicleChartData}
                                        title="Top Vehicle Types"
                                        color="linear-gradient(90deg, #e74c3c, #c0392b)"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats & Distribution */}
                    <div className="stats-distribution-grid">
                        <div className="status-distribution-card">
                            <h4>Booking Status Distribution</h4>
                            <div className="status-bars">
                                {Object.entries(analytics.statusCounts).map(([status, count]) => (
                                    <div key={status} className="status-bar">
                                        <div className="status-info">
                                            <span className="status-name">{status}</span>
                                            <span className="status-count">{count}</span>
                                        </div>
                                        <div className="status-progress">
                                            <div 
                                                className={`status-fill ${getStatusClass(status)}`}
                                                style={{ 
                                                    width: `${(count / filteredData.length) * 100}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="quick-actions-card">
                            <h4>Quick Actions</h4>
                            <div className="action-buttons">
                                <Link to="/admin/bookings" className="action-btn primary">
                                    <i className="fas fa-calendar-alt"></i>
                                    Manage Bookings
                                </Link>
                                <Link to="/admin/messages" className="action-btn secondary">
                                    <i className="fas fa-envelope"></i>
                                    View Messages
                                </Link>
                                <button className="action-btn success" onClick={fetchDashboardData}>
                                    <i className="fas fa-sync"></i>
                                    Refresh Data
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recent Bookings with REAL data */}
                    <section className="recent-section">
                        <div className="section-header">
                            <h2>Recent Bookings & Activity</h2>
                            <span className="section-subtitle">
                                Showing {recentBookings.length} most recent bookings
                            </span>
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
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="no-data">
                                                No recent bookings found
                                            </td>
                                        </tr>
                                    ) : (
                                        recentBookings.map((booking) => (
                                            <tr key={booking.id}>
                                                <td>{booking.id}</td>
                                                <td>
                                                    <div className="client-info">
                                                        <strong>{booking.client}</strong>
                                                        {booking.originalData.customerEmail && (
                                                            <div className="client-email">
                                                                {booking.originalData.customerEmail}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="service-info">
                                                        <div>{booking.originalData.vehicleType}</div>
                                                        <div className="service-route">
                                                            {booking.originalData.pickupLocation} → {booking.dest}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{booking.date}</td>
                                                <td>
                                                    <strong>{booking.price}</strong>
                                                    {booking.originalData.estimatedPrice && !booking.originalData.finalPrice && (
                                                        <div className="estimated-price">
                                                            Est: R {booking.originalData.estimatedPrice}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="btn-view"
                                                            onClick={() => {/* Add view functionality */}}
                                                            title="View Details"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button 
                                                            className="btn-edit"
                                                            onClick={() => {/* Add edit functionality */}}
                                                            title="Edit Booking"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                    </div>
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