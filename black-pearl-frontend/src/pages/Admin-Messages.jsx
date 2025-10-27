import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import '../styles/admin.css';
import '../styles/admin-messages.css';

const AdminMessages = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [messagesData, setMessagesData] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'reviews'

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const fetchMessages = async () => {
        try {
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
        }
    };

    // Fetch feedback data for customer reviews
    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/feedback', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Transform feedback data to match reviews structure
                const transformedReviews = data.map(feedback => ({
                    _id: feedback._id,
                    rating: getRatingFromSubject(feedback.subject), // Fixed: removed 'this.'
                    comment: feedback.feedback,
                    user: {
                        name: feedback.name,
                        email: feedback.email
                    },
                    status: 'pending', // Default status for feedback
                    createdAt: feedback.createdAt,
                    subject: feedback.subject,
                    type: 'feedback'
                }));
                setReviews(transformedReviews);
            } else {
                console.error('Failed to fetch feedback');
                setReviews([]);
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to extract rating from subject
    const getRatingFromSubject = (subject) => {
        if (!subject) return 5; // Default rating

        // Extract number from subject like "User Feedback - 5 Stars"
        const match = subject.match(/(\d+)\s*Stars?/i);
        if (match && match[1]) {
            return parseInt(match[1]);
        }

        // Default fallback
        return 5;
    };

    useEffect(() => {
        if (activeTab === 'messages') {
            fetchMessages();
        } else if (activeTab === 'reviews') {
            fetchFeedback();
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

    const handleReviewAction = async (action, reviewId, responseText = '') => {
        try {
            const token = localStorage.getItem('token');

            // For feedback-based reviews, use the feedback endpoint
            let endpoint;
            let method = 'POST';

            switch (action) {
                case 'approve':
                case 'reject':
                    endpoint = `http://localhost:5000/api/feedback/${reviewId}/status`;
                    break;
                case 'respond':
                    endpoint = `http://localhost:5000/api/feedback/${reviewId}/respond`;
                    break;
                default:
                    endpoint = `http://localhost:5000/api/feedback/${reviewId}`;
            }

            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : undefined,
                    response: responseText
                })
            });

            if (response.ok) {
                fetchFeedback(); // Refresh the reviews list
                alert(`Review ${action}ed successfully`);
            } else {
                const errorData = await response.json();
                alert(`Failed to update review: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating review:', error);
            alert('Failed to update review. Please try again.');
        }
    };

    // Handle feedback deletion
    const handleFeedbackDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5000/api/feedback/${id}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                fetchFeedback(); // Refresh reviews table
                alert("Review deleted successfully");
            } catch (error) {
                console.error("Error deleting review:", error);
                alert("Failed to delete review. Please try again.");
            }
        }
    };

    // View message details
    const viewMessageDetails = (message) => {
        alert(`Message Details:\n\nFrom: ${message.name}\nEmail: ${message.email}\nSubject: ${message.subject}\nMessage: ${message.message}\nDate: ${new Date(message.createdAt).toLocaleString()}`);
    };

    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div id="content-wrapper">
                <AdminTopBar pageTitle={activeTab === 'messages' ? 'Messages' : 'Customer Reviews'} toggleSidebar={toggleSidebar} />
                <main className="messages-page-content">
                    <div className="main-content">
                        <div className="admin-tabs">
                            <button
                                className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
                                onClick={() => setActiveTab('messages')}
                            >
                                Contact Messages ({messagesData.length})
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                Customer Reviews ({reviews.length})
                            </button>
                        </div>

                        <h2>
                            {activeTab === 'messages'
                                ? `Manage Contact Messages (${messagesData.length})`
                                : `Manage Customer Reviews (${reviews.length})`}
                        </h2>

                        {activeTab === 'messages' && (
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
                        )}

                        {activeTab === 'reviews' && (
                            <div className="data-table-container">
                                {loading ? (
                                    <div className="loading">Loading reviews...</div>
                                ) : reviews.length === 0 ? (
                                    <div className="no-data-message">
                                        No customer reviews yet. Reviews from the feedback form will appear here.
                                    </div>
                                ) : (
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Rating</th>
                                                <th>Comment</th>
                                                <th>Subject</th>
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
                                                            <br />
                                                            <small>({review.rating} stars)</small>
                                                        </div>
                                                    </td>
                                                    <td className="review-comment">{review.comment}</td>
                                                    <td>
                                                        {review.subject || 'No subject'}
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
                                                        <i
                                                            className="fas fa-trash-alt"
                                                            title="Delete Review"
                                                            onClick={() => handleFeedbackDelete(review._id)}
                                                        ></i>
                                                    </td>
                                                </tr>
                                            ))}
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