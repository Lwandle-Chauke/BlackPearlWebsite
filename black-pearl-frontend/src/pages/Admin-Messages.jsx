import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import '../styles/admin.css';
import '../styles/admin-messages.css';

const AdminMessages = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [messagesData, setMessagesData] = useState([]);
    const [feedbackData, setFeedbackData] = useState([]);
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'feedback'

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

    useEffect(() => {
        fetchMessages();
        fetchFeedback();
    }, []);

    const getStatusClass = (status) => status === "UNREAD" ? "status-unread" : "status-read";

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

    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div id="content-wrapper">
                <AdminTopBar pageTitle="Messages & Feedback" toggleSidebar={toggleSidebar} />
                <main className="messages-page-content">
                    <div className="main-content">
                        <div className="tabs">
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
                        </div>

                        {activeTab === 'messages' && (
                            <>
                                <h2>Manage Contact Messages :</h2>
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
                                <h2>Manage User Feedback :</h2>
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
                    </div>
                </main>
            </div>
            <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
        </div>
    );
};

export default AdminMessages;
