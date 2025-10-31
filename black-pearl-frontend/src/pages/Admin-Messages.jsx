import React, { useState, useEffect, useMemo } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import '../styles/admin.css';
import '../styles/admin-messages.css';

const AdminMessages = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [messagesData, setMessagesData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [timeFilter, setTimeFilter] = useState('30days');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [chartType, setChartType] = useState('overview');

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

    // Mark message as read
    const markAsRead = async (messageId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/messages/${messageId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ read: true })
            });

            // Update local state immediately for better UX
            setMessagesData(prev => prev.map(msg =>
                msg._id === messageId ? { ...msg, read: true } : msg
            ));

            if (selectedMessage && selectedMessage._id === messageId) {
                setSelectedMessage(prev => ({ ...prev, read: true }));
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    // View message details in modal
    const viewMessageDetails = async (message) => {
        setSelectedMessage(message);
        setShowReplyModal(true);

        // Mark as read if it's unread
        if (!message.read) {
            await markAsRead(message._id);
        }
    };

    // Close message detail modal
    const closeMessageModal = () => {
        setShowReplyModal(false);
        setSelectedMessage(null);
        setReplyContent('');
    };

    // Handle sending a reply
    const handleSendReply = async () => {
        if (!selectedMessage || !replyContent.trim()) {
            alert('Please select a message and enter a reply.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/messages/${selectedMessage._id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ replyContent })
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            alert('Reply sent successfully!');
            closeMessageModal();
            fetchMessages();
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Failed to send reply. Please try again.');
        }
    };

    // Handle message actions
    const handleMessageAction = async (action, messageId) => {
        try {
            const token = localStorage.getItem('token');

            if (action === "Delete") {
                if (window.confirm('Are you sure you want to delete this message?')) {
                    await fetch(`http://localhost:5000/api/messages/${messageId}`, {
                        method: "DELETE",
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    fetchMessages();

                    // Close modal if the deleted message was open
                    if (selectedMessage && selectedMessage._id === messageId) {
                        closeMessageModal();
                    }
                }
            }
        } catch (error) {
            console.error('Error performing message action:', error);
            alert('Failed to perform action. Please try again.');
        }
    };

    // Quick action to mark as read without opening modal
    const quickMarkAsRead = async (messageId, e) => {
        e.stopPropagation();
        await markAsRead(messageId);
    };

    // Calculate filtered data based on time filter
    const getFilteredData = () => {
        const now = new Date();
        let startDate = new Date();

        switch (timeFilter) {
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

        return messagesData.filter(message => new Date(message.createdAt) >= startDate);
    };

    // Comprehensive Message Analytics
    const messageAnalytics = useMemo(() => {
        const filteredMessages = getFilteredData();
        
        // Basic stats
        const total = filteredMessages.length;
        const unread = filteredMessages.filter(m => !m.read).length;
        const read = total - unread;
        const responseRate = total > 0 ? Math.round((read / total) * 100) : 0;

        // Daily average
        const daysInPeriod = timeFilter === '7days' ? 7 : timeFilter === '30days' ? 30 : timeFilter === '90days' ? 90 : 365;
        const dailyAverage = Math.round(total / daysInPeriod);

        // Response time analysis (assuming we have repliedAt field)
        const repliedMessages = filteredMessages.filter(m => m.repliedAt);
        const averageResponseTime = repliedMessages.length > 0 
            ? Math.round(repliedMessages.reduce((sum, msg) => {
                const responseTime = new Date(msg.repliedAt) - new Date(msg.createdAt);
                return sum + (responseTime / (1000 * 60 * 60)); // Convert to hours
            }, 0) / repliedMessages.length)
            : 0;

        // Subject distribution with enhanced categorization
        const subjectDistribution = filteredMessages.reduce((acc, message) => {
            const subject = message.subject?.toLowerCase() || 'no subject';
            let category = 'Other';

            if (subject.includes('quote') || subject.includes('pricing') || subject.includes('price')) {
                category = 'Pricing/Quotes';
            } else if (subject.includes('booking') || subject.includes('reservation')) {
                category = 'Bookings';
            } else if (subject.includes('service') || subject.includes('quality') || subject.includes('complaint')) {
                category = 'Service Quality';
            } else if (subject.includes('vehicle') || subject.includes('car') || subject.includes('bus')) {
                category = 'Vehicle Related';
            } else if (subject.includes('general') || subject.includes('inquiry') || subject.includes('info')) {
                category = 'General Inquiry';
            } else if (subject.includes('partnership') || subject.includes('corporate') || subject.includes('business')) {
                category = 'Business/Partnership';
            } else if (subject.includes('emergency') || subject.includes('urgent')) {
                category = 'Urgent/Emergency';
            }

            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        // Monthly trend data
        const monthlyData = filteredMessages.reduce((acc, message) => {
            const date = new Date(message.createdAt);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!acc[monthYear]) {
                acc[monthYear] = {
                    month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    messages: 0,
                    unread: 0,
                    replied: 0
                };
            }
            
            acc[monthYear].messages++;
            if (!message.read) acc[monthYear].unread++;
            if (message.repliedAt) acc[monthYear].replied++;
            
            return acc;
        }, {});

        const trendData = Object.values(monthlyData).sort((a, b) => {
            return new Date(a.month) - new Date(b.month);
        });

        // Time of day analysis
        const timeDistribution = filteredMessages.reduce((acc, message) => {
            const hour = new Date(message.createdAt).getHours();
            const timeSlot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
            acc[timeSlot] = (acc[timeSlot] || 0) + 1;
            return acc;
        }, { morning: 0, afternoon: 0, evening: 0 });

        return {
            basicStats: { total, unread, read, responseRate, dailyAverage, averageResponseTime },
            subjectDistribution: Object.entries(subjectDistribution)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count),
            trendData,
            timeDistribution: Object.entries(timeDistribution).map(([name, count]) => ({ name, count }))
        };
    }, [messagesData, timeFilter]);

    // Enhanced Simple Bar Chart component
    const SimpleBarChart = ({ data, title, color }) => {
        const maxValue = Math.max(...data.map(item => item.count || item.value || item.messages));
        
        return (
            <div className="simple-chart">
                <h4>{title}</h4>
                <div className="chart-bars">
                    {data.map((item, index) => (
                        <div key={index} className="chart-bar-item">
                            <div className="bar-label">{item.name || item.month}</div>
                            <div className="bar-container">
                                <div 
                                    className="bar-fill"
                                    style={{ 
                                        width: `${((item.count || item.value || item.messages) / maxValue) * 100}%`,
                                        background: color || `linear-gradient(90deg, hsl(${index * 60}, 70%, 50%), hsl(${index * 60}, 80%, 45%))`
                                    }}
                                >
                                    {Math.round(((item.count || item.value || item.messages) / maxValue) * 100)}%
                                </div>
                                <span className="bar-value">{item.count || item.value || item.messages}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const getStatusClass = (readStatus) => readStatus ? "status-read" : "status-unread";

    if (loading) {
        return (
            <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <div id="content-wrapper">
                    <AdminTopBar pageTitle="Message Analytics" toggleSidebar={toggleSidebar} />
                    <main className="messages-page-content">
                        <div className="loading">Loading message analytics...</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div id="content-wrapper">
                <AdminTopBar pageTitle="Comprehensive Message Analytics" toggleSidebar={toggleSidebar} />
                <main className="messages-page-content">
                    <div className="main-content">
                        <h2>Message Analytics & Management</h2>

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

                        {/* Advanced Message Stats */}
                        <div className="messages-stats advanced-stats">
                            <div className="stat-card total-card">
                                <div className="stat-icon">📨</div>
                                <h3>Total Messages</h3>
                                <span className="stat-number total">
                                    {messageAnalytics.basicStats.total}
                                </span>
                                <div className="stat-subtext">
                                    {messageAnalytics.basicStats.dailyAverage} avg/day
                                </div>
                            </div>
                            <div className="stat-card unread-card">
                                <div className="stat-icon">🔴</div>
                                <h3>Unread Messages</h3>
                                <span className="stat-number unread">
                                    {messageAnalytics.basicStats.unread}
                                </span>
                                <div className="stat-subtext">
                                    {Math.round((messageAnalytics.basicStats.unread / messageAnalytics.basicStats.total) * 100)}% of total
                                </div>
                            </div>
                            <div className="stat-card response-card">
                                <div className="stat-icon">📊</div>
                                <h3>Response Rate</h3>
                                <span className="stat-number response-rate">
                                    {messageAnalytics.basicStats.responseRate}%
                                </span>
                                <div className="stat-subtext">
                                    {messageAnalytics.basicStats.read} messages read
                                </div>
                            </div>
                            <div className="stat-card time-card">
                                <div className="stat-icon">⏱️</div>
                                <h3>Avg. Response Time</h3>
                                <span className="stat-number response-time">
                                    {messageAnalytics.basicStats.averageResponseTime}h
                                </span>
                                <div className="stat-subtext">
                                    Average reply time
                                </div>
                            </div>
                        </div>

                        {/* Advanced Analytics Charts */}
                        <div className="analytics-section">
                            <div className="chart-controls">
                                <h3>Message Analytics Dashboard</h3>
                                <select 
                                    value={chartType} 
                                    onChange={(e) => setChartType(e.target.value)}
                                    className="chart-type-select"
                                >
                                    <option value="overview">Overview</option>
                                    <option value="categories">Category Distribution</option>
                                    <option value="trends">Trend Analysis</option>
                                    <option value="timing">Time Analysis</option>
                                </select>
                            </div>

                            <div className="charts-grid">
                                <div className="chart-container main-chart">
                                    {chartType === 'overview' && (
                                        <SimpleBarChart 
                                            data={messageAnalytics.trendData}
                                            title="Messages Overview"
                                            color="linear-gradient(90deg, #3498db, #2980b9)"
                                        />
                                    )}
                                    {chartType === 'categories' && (
                                        <SimpleBarChart 
                                            data={messageAnalytics.subjectDistribution}
                                            title="Message Categories"
                                            color="linear-gradient(90deg, #9b59b6, #8e44ad)"
                                        />
                                    )}
                                    {chartType === 'trends' && (
                                        <SimpleBarChart 
                                            data={messageAnalytics.trendData.map(item => ({
                                                name: item.month,
                                                count: item.messages
                                            }))}
                                            title="Monthly Message Trends"
                                            color="linear-gradient(90deg, #27ae60, #219653)"
                                        />
                                    )}
                                    {chartType === 'timing' && (
                                        <SimpleBarChart 
                                            data={messageAnalytics.timeDistribution}
                                            title="Messages by Time of Day"
                                            color="linear-gradient(90deg, #e74c3c, #c0392b)"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions">
                            <h3>Quick Actions</h3>
                            <div className="action-buttons-grid">
                                <button 
                                    className="btn-mark-all-read"
                                    onClick={() => {
                                        messagesData.forEach(msg => {
                                            if (!msg.read) markAsRead(msg._id);
                                        });
                                    }}
                                >
                                    <i className="fas fa-envelope-open"></i> Mark All as Read
                                </button>
                                <button 
                                    className="btn-refresh"
                                    onClick={fetchMessages}
                                >
                                    <i className="fas fa-sync"></i> Refresh Data
                                </button>
                                <button 
                                    className="btn-export"
                                    onClick={() => alert('Export functionality to be implemented')}
                                >
                                    <i className="fas fa-download"></i> Export Analytics
                                </button>
                            </div>
                        </div>

                        {/* Messages Table */}
                        <div className="data-table-container">
                            <div className="table-header">
                                <h3>Message Details</h3>
                                <span className="table-count">
                                    Showing {getFilteredData().length} messages
                                </span>
                            </div>
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
                                            <th>Category</th>
                                            <th>Date Received</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getFilteredData().map((message) => (
                                            <tr
                                                key={message._id}
                                                onClick={() => viewMessageDetails(message)}
                                                className={!message.read ? 'unread-row' : ''}
                                            >
                                                <td>#{message._id?.slice(-4) || 'N/A'}</td>
                                                <td>
                                                    <div className="sender-info">
                                                        <strong>{message.name}</strong>
                                                        {message.phone && (
                                                            <div className="sender-phone">{message.phone}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <a href={`mailto:${message.email}`} onClick={(e) => e.stopPropagation()}>
                                                        {message.email}
                                                    </a>
                                                </td>
                                                <td>
                                                    <div className="subject-cell">
                                                        {message.subject}
                                                        {message.priority === 'high' && (
                                                            <span className="priority-badge high">URGENT</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="category-badge">
                                                        {messageAnalytics.subjectDistribution.find(cat => 
                                                            cat.name === (() => {
                                                                const subject = message.subject?.toLowerCase() || 'no subject';
                                                                if (subject.includes('quote')) return 'Pricing/Quotes';
                                                                if (subject.includes('booking')) return 'Bookings';
                                                                if (subject.includes('service')) return 'Service Quality';
                                                                if (subject.includes('vehicle')) return 'Vehicle Related';
                                                                if (subject.includes('general')) return 'General Inquiry';
                                                                return 'Other';
                                                            })()
                                                        )?.name || 'Other'}
                                                    </span>
                                                </td>
                                                <td>{new Date(message.createdAt).toLocaleString()}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusClass(message.read)}`}>
                                                        {message.read ? "READ" : "UNREAD"}
                                                    </span>
                                                </td>
                                                <td className="action-icons">
                                                    {!message.read && (
                                                        <i
                                                            className="fas fa-envelope-open"
                                                            title="Mark as Read"
                                                            onClick={(e) => quickMarkAsRead(message._id, e)}
                                                        ></i>
                                                    )}
                                                    <i
                                                        className="fas fa-reply"
                                                        title="Reply"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            viewMessageDetails(message);
                                                        }}
                                                        style={{ cursor: 'pointer', marginRight: '10px' }}
                                                    ></i>
                                                    <i
                                                        className="fas fa-trash-alt"
                                                        title="Delete"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMessageAction("Delete", message._id);
                                                        }}
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

            {/* Message Detail Modal */}
            {selectedMessage && showReplyModal && (
                <div className="modal-overlay" onClick={closeMessageModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Message Details & Reply</h3>
                            <button className="modal-close" onClick={closeMessageModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="message-detail-section">
                                <div className="message-field">
                                    <label>From:</label>
                                    <span>{selectedMessage.name}</span>
                                </div>
                                <div className="message-field">
                                    <label>Email:</label>
                                    <span>
                                        <a href={`mailto:${selectedMessage.email}`}>
                                            {selectedMessage.email}
                                        </a>
                                    </span>
                                </div>
                                <div className="message-field">
                                    <label>Subject:</label>
                                    <span className="message-subject">{selectedMessage.subject}</span>
                                </div>
                                <div className="message-field">
                                    <label>Date Received:</label>
                                    <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="message-field">
                                    <label>Status:</label>
                                    <span className={`status-badge ${getStatusClass(selectedMessage.read)}`}>
                                        {selectedMessage.read ? "READ" : "UNREAD"}
                                    </span>
                                </div>
                                <div className="message-field full-width">
                                    <label>Original Message:</label>
                                    <div className="message-content">
                                        {selectedMessage.message}
                                    </div>
                                </div>
                            </div>

                            <div className="reply-section">
                                <h4>Admin Reply</h4>
                                <textarea
                                    className="reply-textarea"
                                    placeholder="Type your professional reply here..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    rows="6"
                                ></textarea>
                                <div className="reply-tips">
                                    <small>💡 Tip: Be professional and address all customer concerns</small>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={closeMessageModal}
                            >
                                Close
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleSendReply}
                                disabled={!replyContent.trim()}
                            >
                                <i className="fas fa-paper-plane"></i> Send Reply
                            </button>
                            <button
                                className="btn-danger"
                                onClick={() => handleMessageAction("Delete", selectedMessage._id)}
                            >
                                <i className="fas fa-trash-alt"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
        </div>
    );
};

export default AdminMessages;