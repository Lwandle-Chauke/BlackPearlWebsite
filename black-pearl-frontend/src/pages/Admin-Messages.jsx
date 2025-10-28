import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import '../styles/admin.css';
import '../styles/admin-messages.css';

// Import Recharts components
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminMessages = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [messagesData, setMessagesData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [timeFilter, setTimeFilter] = useState('30days'); // '7days', '30days', '90days'

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch("http://localhost:5000/api/messages", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            setMessagesData(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
            setMessagesData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

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
        
        const filteredMessages = messagesData.filter(message => new Date(message.createdAt) >= startDate);
        const trends = {};
        
        filteredMessages.forEach(message => {
            const date = new Date(message.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            if (!trends[date]) {
                trends[date] = {
                    date,
                    messages: 0,
                    unread: 0
                };
            }
            
            trends[date].messages += 1;
            if (message.status === 'UNREAD') {
                trends[date].unread += 1;
            }
        });
        
        return Object.values(trends).sort((a, b) => new Date(a.date) - new Date(b.date));
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
        
        const filteredMessages = messagesData.filter(message => new Date(message.createdAt) >= startDate);
        const statusCounts = {
            UNREAD: 0,
            READ: 0
        };
        
        filteredMessages.forEach(message => {
            statusCounts[message.status] = (statusCounts[message.status] || 0) + 1;
        });
        
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    };

    // Get subject distribution
    const getSubjectDistribution = () => {
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
        
        const filteredMessages = messagesData.filter(message => new Date(message.createdAt) >= startDate);
        const subjectCounts = {};
        
        filteredMessages.forEach(message => {
            // Group similar subjects
            const subject = message.subject.toLowerCase();
            let category = 'Other';
            
            if (subject.includes('quote') || subject.includes('pricing') || subject.includes('price')) {
                category = 'Pricing/Quotes';
            } else if (subject.includes('booking') || subject.includes('reservation')) {
                category = 'Bookings';
            } else if (subject.includes('service') || subject.includes('quality')) {
                category = 'Service Quality';
            } else if (subject.includes('vehicle') || subject.includes('car') || subject.includes('bus')) {
                category = 'Vehicle Related';
            } else if (subject.includes('general') || subject.includes('inquiry') || subject.includes('info')) {
                category = 'General Inquiry';
            }
            
            subjectCounts[category] = (subjectCounts[category] || 0) + 1;
        });
        
        return Object.entries(subjectCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    };

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const getStatusClass = (status) => status === "UNREAD" ? "status-unread" : "status-read";

    const handleMessageAction = async (action, id, currentStatus) => {
        try {
            const token = localStorage.getItem('token');

            if (action === "View") {
                await fetch(`http://localhost:5000/api/messages/${id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: currentStatus === "UNREAD" ? "READ" : "UNREAD" })
                });
            } else if (action === "Delete") {
                await fetch(`http://localhost:5000/api/messages/${id}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            fetchMessages(); // Refresh messages table
        } catch (error) {
            console.error('Error performing message action:', error);
            alert('Failed to perform action. Please try again.');
        }
    };

    // View message details
    const viewMessageDetails = (message) => {
        alert(`Message Details:\n\nFrom: ${message.name}\nEmail: ${message.email}\nSubject: ${message.subject}\nMessage: ${message.message}\nDate: ${new Date(message.createdAt).toLocaleString()}`);
    };

    const messageTrendsData = getMessageTrendsData();
    const messageStatusDistributionData = getMessageStatusDistribution();
    const subjectDistributionData = getSubjectDistribution();

    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div id="content-wrapper">
                <AdminTopBar pageTitle="Contact Messages" toggleSidebar={toggleSidebar} />
                <main className="messages-page-content">
                    <div className="main-content">
                        <h2>Manage Contact Messages ({messagesData.length})</h2>

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

                        {/* Message Stats */}
                        <div className="messages-stats">
                            <div className="stat-card">
                                <h3>Total Messages</h3>
                                <span className="stat-number total">
                                    {messagesData.length}
                                </span>
                            </div>
                            <div className="stat-card">
                                <h3>Unread Messages</h3>
                                <span className="stat-number unread">
                                    {messagesData.filter(m => m.status === 'UNREAD').length}
                                </span>
                            </div>
                            <div className="stat-card">
                                <h3>Response Rate</h3>
                                <span className="stat-number response-rate">
                                    {messagesData.length > 0 ? 
                                        Math.round((messagesData.filter(m => m.status === 'READ').length / messagesData.length) * 100) : 0}%
                                </span>
                            </div>
                            <div className="stat-card">
                                <h3>Avg. Daily</h3>
                                <span className="stat-number daily">
                                    {messageTrendsData.length > 0 ? 
                                        Math.round(messagesData.length / messageTrendsData.length) : 0}
                                </span>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="charts-section">
                            <div className="chart-row">
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
                                            <Line type="monotone" dataKey="messages" stroke="#8884d8" activeDot={{ r: 8 }} />
                                            <Line type="monotone" dataKey="unread" stroke="#ff8042" />
                                        </LineChart>
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

                            <div className="chart-row">
                                {/* Subject Distribution */}
                                <div className="chart-card">
                                    <h3>Message Categories</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={subjectDistributionData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Response Time Analysis (Placeholder) */}
                                <div className="chart-card">
                                    <h3>Message Analytics</h3>
                                    <div className="message-analytics">
                                        <div className="analytics-item">
                                            <span className="label">Avg. Response Time:</span>
                                            <span className="value">2.4 hours</span>
                                        </div>
                                        <div className="analytics-item">
                                            <span className="label">Busiest Day:</span>
                                            <span className="value">Monday</span>
                                        </div>
                                        <div className="analytics-item">
                                            <span className="label">Peak Hour:</span>
                                            <span className="value">10:00 AM</span>
                                        </div>
                                        <div className="analytics-item">
                                            <span className="label">Most Common Topic:</span>
                                            <span className="value">{subjectDistributionData[0]?.name || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="data-table-container">
                            {messagesData.length === 0 ? (
                                <div className="no-data-message">
                                    No contact messages yet. Messages from the contact form will appear here.
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Sender Name</th>
                                            <th>Email</th>
                                            <th>Subject</th>
                                            <th>Date Received</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {messagesData.map((message) => (
                                            <tr key={message._id}>
                                                <td>#{message._id?.slice(-4) || 'N/A'}</td>
                                                <td>{message.name}</td>
                                                <td>{message.email}</td>
                                                <td>{message.subject}</td>
                                                <td>{new Date(message.createdAt).toLocaleString()}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusClass(message.status)}`}>
                                                        {message.status}
                                                    </span>
                                                </td>
                                                <td className="action-icons">
                                                    <i
                                                        className="fas fa-eye"
                                                        title="View Message"
                                                        onClick={() => viewMessageDetails(message)}
                                                    ></i>
                                                    <i
                                                        className="fas fa-trash-alt"
                                                        title="Delete"
                                                        onClick={() => handleMessageAction("Delete", message._id)}
                                                    ></i>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
        </div>
    );
};

export default AdminMessages;