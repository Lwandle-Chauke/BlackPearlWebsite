import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
// Import the shared admin CSS (for base layout/hamburger logic) and the messages-specific CSS
import '../styles/admin.css'; 
import '../styles/admin-messages.css'; 

const AdminMessages = () => {
    // State to manage the visibility of the sidebar on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Toggle function for the hamburger menu
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Data Array for the Messages Table
    const messagesData = [
        { id: '#504', name: 'Nomusa Dlamini', email: 'nomusa.d@mail.com', subject: 'Urgent Inquiry: Quote Follow-up', date: '2025-10-15 14:05', status: 'UNREAD' },
        { id: '#503', name: 'Samantha Jones', email: 'sam@example.com', subject: 'General Inquiry', date: '2025-10-15 09:30', status: 'UNREAD' },
        { id: '#502', name: 'Mark Van Der Westhuizen', email: 'mark.vw@email.co.za', subject: 'Website Feedback', date: '2025-10-14 17:10', status: 'READ' },
        { id: '#501', name: 'David King', email: 'david.k@hotmail.com', subject: 'Complaint About Service', date: '2025-10-14 10:05', status: 'READ' },
    ];

    // Helper function to determine the CSS class for the status badge
    const getStatusClass = (status) => {
        return status === 'UNREAD' ? 'status-unread' : 'status-read';
    };

    // Placeholder actions
    const handleAction = (action, id) => {
        alert(`${action} message ${id}`);
        // In a real app, 'View' would open the message content, and 'Delete' would call an API.
    };
    
    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            
            <AdminSidebar 
                isSidebarOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
            />
            
            <div id="content-wrapper">
                
                <AdminTopBar 
                    pageTitle="Messages" 
                    toggleSidebar={toggleSidebar}
                />

                <main className="messages-page-content">
                    <div className="main-content">
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
                    </div>
                </main>
            </div> 
            
            {/* Overlay for mobile view when sidebar is open */}
            <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
        </div>
    );
};

export default AdminMessages;