import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import '../styles/admin.css';
import '../styles/admin-messages.css';

const AdminMessages = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [messagesData, setMessagesData] = useState([]);
    const [feedbackData, setFeedbackData] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('messages'); // 'messages', 'feedback', or 'reviews'

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const fetchMessages = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/messages");
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            setMessagesData(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
            setMessagesData([]);
        }
    };

    const fetchFeedback = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/feedback");
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            setFeedbackData(data);
        } catch (error) {
            console.error("Error fetching feedback:", error);
            setFeedbackData([]);
        }
    };

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
        fetchMessages();
        fetchFeedback();
        if (activeTab === 'reviews') {
            fetchReviews();
        }
    }, [activeTab]);

    const getStatusClass = (status) => status === "UNREAD" ? "status-unread" : "status-read";

    const getReviewStatusClass = (status) => {
        const statusMap = {
            'pending': 'status-unread',
            'approved': 'status-read',
            'rejected': 'status-rejected'
        };
        return statusMap[status] || 'status-read';
    };

    const handleMessageAction = async (action, id, currentStatus) => {
        if (action === "View") {
            await fetch(`http://localhost:5000/api/messages/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: currentStatus === "UNREAD" ? "READ" : "UNREAD" })
            });
        } else if (action === "Delete") {
            await fetch(`http://localhost:5000/api/messages/${id}`, { method: "DELETE" });
        }
        fetchMessages(); // Refresh messages table
    };

    const handleFeedbackDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this feedback?")) {
            try {
                const res = await fetch(`http://localhost:5000/api/feedback/${id}`, {
                    method: "DELETE",
                });
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                fetchFeedback(); // Refresh feedback table
            } catch (error) {
                console.error("Error deleting feedback:", error);
                alert("Failed to delete feedback. Please try again.");
            }
        }
    };

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

    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div id="content-wrapper">
                <AdminTopBar pageTitle={activeTab === 'messages' ? 'Messages' : activeTab === 'feedback' ? 'User Feedback' : 'Customer Reviews'} toggleSidebar={toggleSidebar} />
                <main className="messages-page-content">
                    <div className="main-content">
                        <div className="admin-tabs">
                            <button
                                className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
                                onClick={() => setActiveTab('messages')}
                            >
                                Contact Messages
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'feedback' ? 'active' : ''}`}
                                onClick={() => setActiveTab('feedback')}
                            >
                                User Feedback
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
                                : activeTab === 'feedback'
                                    ? 'Manage User Feedback:'
                                    : 'Manage Customer Reviews:'}
                        </h2>

                        {activeTab === 'messages' && (
                            <>
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
                                                <tr key={message._id}>
                                                    <td>#{message._id.slice(-4)}</td>
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
                                                            onClick={() => handleMessageAction("View", message._id, message.status)}
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
                                </div>
                            </>
                        )}

                        {activeTab === 'feedback' && (
                            <>
                                <div className="data-table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Sender Name</th>
                                                <th>Email</th>
                                                <th>Subject</th>
                                                <th>Feedback</th>
                                                <th>Date Received</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {feedbackData.map((feedback) => (
                                                <tr key={feedback._id}>
                                                    <td>#{feedback._id.slice(-4)}</td>
                                                    <td>{feedback.name}</td>
                                                    <td>{feedback.email}</td>
                                                    <td>{feedback.subject}</td>
                                                    <td>{feedback.feedback}</td>
                                                    <td>{new Date(feedback.createdAt).toLocaleString()}</td>
                                                    <td className="action-icons">
                                                        <i
                                                            className="fas fa-trash-alt"
                                                            title="Delete Feedback"
                                                            onClick={() => handleFeedbackDelete(feedback._id)}
                                                        ></i>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {activeTab === 'reviews' && (
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
