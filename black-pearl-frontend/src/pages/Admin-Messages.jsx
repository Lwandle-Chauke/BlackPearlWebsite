import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import '../styles/admin.css'; 
import '../styles/admin-messages.css'; 

const AdminMessages = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'reviews'
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Fetch reviews from backend
    const fetchReviews = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/reviews', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setReviews(data.data || []);
            } else {
                console.error('Failed to fetch reviews');
                setReviews([]);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'reviews') {
            fetchReviews();
        }
    }, [activeTab]);

    // Review actions
    const handleReviewAction = async (action, reviewId, responseText = '') => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: responseText ? JSON.stringify({ response: responseText }) : undefined
            });

            if (response.ok) {
                fetchReviews(); // Refresh the list
                alert(`Review ${action}ed successfully`);
            } else {
                alert('Failed to update review');
            }
        } catch (error) {
            console.error('Error updating review:', error);
            alert('Failed to update review');
        }
    };

    // Messages data (your existing data)
    const messagesData = [
        { id: '#504', name: 'Nomusa Dlamini', email: 'nomusa.d@mail.com', subject: 'Urgent Inquiry: Quote Follow-up', date: '2025-10-15 14:05', status: 'UNREAD' },
        { id: '#503', name: 'Samantha Jones', email: 'sam@example.com', subject: 'General Inquiry', date: '2025-10-15 09:30', status: 'UNREAD' },
        { id: '#502', name: 'Mark Van Der Westhuizen', email: 'mark.vw@email.co.za', subject: 'Website Feedback', date: '2025-10-14 17:10', status: 'READ' },
        { id: '#501', name: 'David King', email: 'david.k@hotmail.com', subject: 'Complaint About Service', date: '2025-10-14 10:05', status: 'READ' },
    ];

    const getStatusClass = (status) => {
        return status === 'UNREAD' ? 'status-unread' : 'status-read';
    };

    const getReviewStatusClass = (status) => {
        const statusMap = {
            'pending': 'status-unread',
            'approved': 'status-read',
            'rejected': 'status-rejected'
        };
        return statusMap[status] || 'status-read';
    };

    const handleAction = (action, id) => {
        alert(`${action} message ${id}`);
    };

    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            
            <AdminSidebar 
                isSidebarOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
            />
            
            <div id="content-wrapper">
                
                <AdminTopBar 
                    pageTitle={activeTab === 'messages' ? 'Messages' : 'Customer Reviews'} 
                    toggleSidebar={toggleSidebar}
                />

                <main className="messages-page-content">
                    <div className="main-content">
                        {/* Tab Navigation */}
                        <div className="admin-tabs">
                            <button 
                                className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
                                onClick={() => setActiveTab('messages')}
                            >
                                Contact Messages
                            </button>
                            <button 
                                className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                Customer Reviews
                            </button>
                        </div>

                        <h2>
                            {activeTab === 'messages' 
                                ? 'Manage Contact Messages:' 
                                : 'Manage Customer Reviews:'}
                        </h2>
                        
                        {activeTab === 'messages' ? (
                            /* Messages Table */
                            <div className="data-table-container">
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
                                            <tr key={message.id}>
                                                <td>{message.id}</td>
                                                <td>{message.name}</td>
                                                <td>{message.email}</td>
                                                <td>{message.subject}</td>
                                                <td>{message.date}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusClass(message.status)}`}>
                                                        {message.status}
                                                    </span>
                                                </td>
                                                <td className="action-icons">
                                                    <i 
                                                        className="fas fa-eye" 
                                                        title="View Message" 
                                                        onClick={() => handleAction('View', message.id)}
                                                    ></i> 
                                                    <i 
                                                        className="fas fa-trash-alt" 
                                                        title="Delete" 
                                                        onClick={() => handleAction('Delete', message.id)}
                                                    ></i> 
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Reviews Table */
                            <div className="data-table-container">
                                {loading ? (
                                    <div className="loading">Loading reviews...</div>
                                ) : (
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Rating</th>
                                                <th>Comment</th>
                                                <th>Photo</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reviews.map((review) => (
                                                <tr key={review._id}>
                                                    <td>
                                                        <div className="user-info">
                                                            <strong>{review.user?.name || 'Unknown User'}</strong>
                                                            <br />
                                                            <small>{review.user?.email || 'No email'}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="rating-stars">
                                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                        </div>
                                                    </td>
                                                    <td className="review-comment">{review.comment}</td>
                                                    <td>
                                                        {review.photo ? (
                                                            <img 
                                                                src={`http://localhost:5000${review.photo}`} 
                                                                alt="Review" 
                                                                className="review-photo-thumb"
                                                                onClick={() => window.open(`http://localhost:5000${review.photo}`, '_blank')}
                                                            />
                                                        ) : (
                                                            <span className="no-photo">No Photo</span>
                                                        )}
                                                    </td>
                                                    <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`status-badge ${getReviewStatusClass(review.status)}`}>
                                                            {review.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="action-icons">
                                                        <i 
                                                            className="fas fa-check" 
                                                            title="Approve Review" 
                                                            onClick={() => handleReviewAction('approve', review._id)}
                                                        ></i>
                                                        <i 
                                                            className="fas fa-times" 
                                                            title="Reject Review" 
                                                            onClick={() => handleReviewAction('reject', review._id)}
                                                        ></i>
                                                        <i 
                                                            className="fas fa-reply" 
                                                            title="Respond to Review" 
                                                            onClick={() => {
                                                                const response = prompt('Enter your response to this review:');
                                                                if (response) {
                                                                    handleReviewAction('respond', review._id, response);
                                                                }
                                                            }}
                                                        ></i>
                                                    </td>
                                                </tr>
                                            ))}
                                            {reviews.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                                        No reviews yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div> 
            
            <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
        </div>
    );
};

export default AdminMessages;