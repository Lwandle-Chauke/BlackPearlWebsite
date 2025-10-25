import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import '../styles/admin.css'; 
import '../styles/admin-bookings.css'; 

const AdminBookings = () => {
    // State to manage the visibility of the sidebar on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Toggle function for the hamburger menu
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Fetch quotes from backend
    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/quotes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setQuotes(data.data);
            } else {
                setError(data.error);
            }
        } catch (error) {
            console.error('Fetch quotes error:', error);
            setError('Failed to fetch quotes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateQuoteStatus = async (quoteId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (data.success) {
                // Update local state
                setQuotes(prevQuotes => 
                    prevQuotes.map(quote => 
                        quote._id === quoteId ? { ...quote, status: newStatus } : quote
                    )
                );
            } else {
                alert('Failed to update status: ' + data.error);
            }
        } catch (error) {
            console.error('Update status error:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    const deleteQuote = async (quoteId) => {
        if (!window.confirm('Are you sure you want to delete this quote?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                // Remove from local state
                setQuotes(prevQuotes => prevQuotes.filter(quote => quote._id !== quoteId));
            } else {
                alert('Failed to delete quote: ' + data.error);
            }
        } catch (error) {
            console.error('Delete quote error:', error);
            alert('Failed to delete quote. Please try again.');
        }
    };

    // Helper function to determine the CSS class for the status badge
    const getStatusClass = (status) => {
        switch (status) {
            case 'completed':
                return 'status-completed';
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

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Placeholder function for the 'Add Booking' button
    const handleAddBooking = () => {
        alert('Opening Add New Booking form...');
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
                        pageTitle="Bookings" 
                        toggleSidebar={toggleSidebar}
                    />
                    <main className="bookings-page-content">
                        <div className="main-content">
                            <div className="loading">Loading quotes...</div>
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
                        pageTitle="Bookings" 
                        toggleSidebar={toggleSidebar}
                    />
                    <main className="bookings-page-content">
                        <div className="main-content">
                            <div className="error-message">Error: {error}</div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        // 'sidebar-open' class is added when the menu is active on mobile
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            
            <AdminSidebar 
                isSidebarOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
            />
            
            <div id="content-wrapper">
                
                <AdminTopBar 
                    pageTitle="Bookings" 
                    toggleSidebar={toggleSidebar}
                />

                {/* The 'bookings-page-content' now only holds the main content */}
                <main className="bookings-page-content">
                    
                    {/* --- Main Content Area (Manage Bookings Table - now full width) --- */}
                    <div className="main-content">
                        <h2>Manage Bookings & Quotes</h2>
                        
                        {/* Stats Overview */}
                        <div className="bookings-stats" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '1rem',
                            marginBottom: '2rem'
                        }}>
                            <div style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                textAlign: 'center'
                            }}>
                                <h3 style={{color: '#666', fontSize: '0.9rem', margin: '0 0 0.5rem 0'}}>Total Quotes</h3>
                                <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea'}}>{quotes.length}</span>
                            </div>
                            <div style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                textAlign: 'center'
                            }}>
                                <h3 style={{color: '#666', fontSize: '0.9rem', margin: '0 0 0.5rem 0'}}>Pending</h3>
                                <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107'}}>
                                    {quotes.filter(q => q.status === 'pending').length}
                                </span>
                            </div>
                            <div style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                textAlign: 'center'
                            }}>
                                <h3 style={{color: '#666', fontSize: '0.9rem', margin: '0 0 0.5rem 0'}}>Confirmed</h3>
                                <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745'}}>
                                    {quotes.filter(q => q.status === 'confirmed').length}
                                </span>
                            </div>
                        </div>
                        
                        {/* Add Booking Button at the top for better mobile UX */}
                        <button className="btn-add-booking-mobile" onClick={handleAddBooking}>
                            <i className="fas fa-plus"></i> Add Booking
                        </button>
                        
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Quote ID</th>
                                        <th>Customer</th>
                                        <th>Trip Type</th>
                                        <th>Vehicle</th>
                                        <th>Date & Time</th>
                                        <th>Pickup/Dropoff</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotes.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
                                                No quote requests found
                                            </td>
                                        </tr>
                                    ) : (
                                        quotes.map((quote) => (
                                            <tr key={quote._id}>
                                                <td>#{quote._id.slice(-6).toUpperCase()}</td>
                                                <td>
                                                    <div>
                                                        <strong>{quote.customerName}</strong>
                                                        <div style={{fontSize: '0.8rem', color: '#666'}}>
                                                            {quote.customerEmail}
                                                        </div>
                                                        <div style={{fontSize: '0.8rem', color: '#666'}}>
                                                            {quote.customerPhone}
                                                        </div>
                                                        {quote.userId && (
                                                            <span style={{
                                                                background: '#e7f3ff',
                                                                color: '#0066cc',
                                                                padding: '0.1rem 0.4rem',
                                                                borderRadius: '8px',
                                                                fontSize: '0.6rem',
                                                                fontWeight: '600'
                                                            }}>
                                                                Registered User
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{quote.tripType}</td>
                                                <td>{quote.vehicleType}</td>
                                                <td>
                                                    <div>
                                                        <div>{formatDate(quote.tripDate)}</div>
                                                        <div style={{fontSize: '0.8rem', color: '#666'}}>
                                                            {quote.tripTime}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{maxWidth: '200px'}}>
                                                        <div><strong>From:</strong> {quote.pickupLocation}</div>
                                                        <div><strong>To:</strong> {quote.dropoffLocation}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${getStatusClass(quote.status)}`}>
                                                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="action-icons">
                                                    <select 
                                                        value={quote.status}
                                                        onChange={(e) => updateQuoteStatus(quote._id, e.target.value)}
                                                        style={{
                                                            padding: '0.25rem',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            fontSize: '0.8rem',
                                                            marginRight: '0.5rem'
                                                        }}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                    <i 
                                                        className="fas fa-trash" 
                                                        title="Delete" 
                                                        onClick={() => deleteQuote(quote._id)}
                                                        style={{color: '#dc3545', cursor: 'pointer'}}
                                                    ></i>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Add Booking Button (Desktop) */}
                        <button className="btn-add-booking-desktop" onClick={handleAddBooking}>
                            <i className="fas fa-plus"></i> Add Booking
                        </button>
                    </div>
                </main>
                
            </div> 
            

            {/* Overlay for mobile view when sidebar is open */}
            <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
        </div>
    );
};

export default AdminBookings;