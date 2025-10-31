import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import '../styles/admin.css';
import '../styles/admin-bookings.css';

const AdminBookings = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddBookingModal, setShowAddBookingModal] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [showQuoteModal, setShowQuoteModal] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

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

    const updateQuoteStatus = async (quoteId, newStatus, finalPrice = null, adminNotes = '') => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    ...(finalPrice && { finalPrice }),
                    ...(adminNotes && { adminNotes })
                })
            });

            const data = await response.json();

            if (data.success) {
                setQuotes(prevQuotes =>
                    prevQuotes.map(quote =>
                        quote._id === quoteId ? { ...quote, status: newStatus, finalPrice, adminNotes } : quote
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

    const convertToBooking = async (quoteId, finalPrice, bookingNotes = '') => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}/convert-to-booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    finalPrice,
                    bookingNotes
                })
            });

            const data = await response.json();

            if (data.success) {
                setQuotes(prevQuotes =>
                    prevQuotes.map(quote =>
                        quote._id === quoteId ? { ...quote, status: 'booked', quoteStatus: 'converted', finalPrice, bookingNotes } : quote
                    )
                );
                alert('Quote converted to booking successfully!');
            } else {
                alert('Failed to convert to booking: ' + data.error);
            }
        } catch (error) {
            console.error('Convert to booking error:', error);
            alert('Failed to convert to booking. Please try again.');
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
                setQuotes(prevQuotes => prevQuotes.filter(quote => quote._id !== quoteId));
            } else {
                alert('Failed to delete quote: ' + data.error);
            }
        } catch (error) {
            console.error('Delete quote error:', error);
            alert('Failed to delete quote. Please try again.');
        }
    };

    const handleSendQuote = (quote) => {
        setSelectedQuote(quote);
        setShowQuoteModal(true);
    };

    const handleConfirmQuote = async () => {
        if (!selectedQuote) return;

        const finalPrice = document.getElementById('finalPrice').value;
        const adminNotes = document.getElementById('adminNotes').value;

        if (!finalPrice) {
            alert('Please enter a final price');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/quotes/${selectedQuote._id}/send-to-customer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    finalPrice: parseFloat(finalPrice),
                    adminNotes
                })
            });

            const data = await response.json();

            if (data.success) {
                if (selectedQuote.userId) {
                    alert('Quote sent to customer dashboard successfully!');
                } else {
                    alert('Quote sent to customer email successfully! The customer will receive an email with approval links.');
                }
                setShowQuoteModal(false);
                setSelectedQuote(null);
                fetchQuotes();
            } else {
                alert('Failed to send quote: ' + data.error);
            }
        } catch (error) {
            console.error('Send quote error:', error);
            alert('Failed to send quote. Please try again.');
        }
    };

    const handleConvertToBooking = () => {
        if (!selectedQuote) return;

        const finalPrice = document.getElementById('finalPrice').value;
        const bookingNotes = document.getElementById('adminNotes').value;

        if (!finalPrice) {
            alert('Please enter a final price');
            return;
        }

        convertToBooking(selectedQuote._id, parseFloat(finalPrice), bookingNotes);
        setShowQuoteModal(false);
        setSelectedQuote(null);
    };

    const handleSubmitManualBooking = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const bookingData = {
            customerName: formData.get('customerName'),
            customerEmail: formData.get('customerEmail'),
            customerPhone: formData.get('customerPhone'),
            customerCompany: formData.get('customerCompany'),
            vehicleType: formData.get('vehicleType'),
            pickupLocation: formData.get('pickupLocation'),
            dropoffLocation: formData.get('dropoffLocation'),
            tripDate: formData.get('tripDate'),
            tripTime: formData.get('tripTime'),
            finalPrice: parseFloat(formData.get('finalPrice')),
            tripPurpose: formData.get('tripPurpose') || 'Manual Booking',
            tripType: formData.get('tripType') || 'Manual Booking',
            destination: formData.get('destination') || 'Manual Booking',
            isOneWay: formData.get('isOneWay') === 'true'
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/quotes/manual-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Manual booking created successfully!');
                setShowAddBookingModal(false);
                fetchQuotes();
            } else {
                alert('Failed to create booking: ' + data.error);
            }
        } catch (error) {
            console.error('Create manual booking error:', error);
            alert('Failed to create manual booking. Please try again.');
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'completed': return 'status-completed';
            case 'confirmed': return 'status-confirmed';
            case 'booked': return 'status-booked';
            case 'pending': return 'status-pending';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-pending';
        }
    };

    const getQuoteStatusClass = (quoteStatus) => {
        switch (quoteStatus) {
            case 'pending_admin': return 'status-pending';
            case 'pending_customer': return 'status-pending-customer';
            case 'pending_email': return 'status-pending-email';
            case 'accepted': return 'status-accepted';
            case 'declined': return 'status-declined';
            case 'converted': return 'status-converted';
            default: return 'status-pending';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleAddBooking = () => {
        setShowAddBookingModal(true);
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
                        pageTitle="Bookings & Quotes"
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

    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>

            <AdminSidebar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            <div id="content-wrapper">

                <AdminTopBar
                    pageTitle="Bookings & Quotes"
                    toggleSidebar={toggleSidebar}
                />

                <main className="bookings-page-content">

                    <div className="main-content">
                        <h2>Manage Bookings & Quotes</h2>

                        {/* Stats Overview */}
                        <div className="bookings-stats">
                            <div className="stat-card">
                                <h3>Pending Admin</h3>
                                <span className="stat-number pending">
                                    {quotes.filter(q => q.quoteStatus === 'pending_admin').length}
                                </span>
                            </div>
                            <div className="stat-card">
                                <h3>Pending Customer</h3>
                                <span className="stat-number pending-customer">
                                    {quotes.filter(q => q.quoteStatus === 'pending_customer').length}
                                </span>
                            </div>
                            <div className="stat-card">
                                <h3>Booked</h3>
                                <span className="stat-number booked">
                                    {quotes.filter(q => q.status === 'booked').length}
                                </span>
                            </div>
                            <div className="stat-card">
                                <h3>Total Bookings</h3>
                                <span className="stat-number total">
                                    {quotes.length}
                                </span>
                            </div>
                        </div>

                        {/* Add Booking Button */}
                        <button className="btn-add-booking" onClick={handleAddBooking}>
                            <i className="fas fa-plus"></i> Add Manual Booking
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
                                        <th>Pricing</th>
                                        <th>Status</th>
                                        <th>Quote Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotes.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="no-data">
                                                No quote requests found
                                            </td>
                                        </tr>
                                    ) : (
                                        quotes.map((quote) => (
                                            <tr key={quote._id}>
                                                <td>#{quote._id.slice(-6).toUpperCase()}</td>
                                                <td>
                                                    <div className="customer-info">
                                                        <strong>{quote.customerName}</strong>
                                                        <div className="customer-details">
                                                            {quote.customerEmail}
                                                        </div>
                                                        <div className="customer-details">
                                                            {quote.customerPhone}
                                                        </div>
                                                        {quote.userId ? (
                                                            <span className="registered-badge">
                                                                Registered User
                                                            </span>
                                                        ) : (
                                                            <span className="guest-badge">
                                                                Guest User
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{quote.tripType}</td>
                                                <td>{quote.vehicleType}</td>
                                                <td>
                                                    <div className="datetime-info">
                                                        <div>{formatDate(quote.tripDate)}</div>
                                                        <div className="time">{quote.tripTime}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="location-info">
                                                        <div><strong>From:</strong> {quote.pickupLocation}</div>
                                                        <div><strong>To:</strong> {quote.dropoffLocation}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="pricing-info">
                                                        <div>Est: R {quote.estimatedPrice}</div>
                                                        {quote.finalPrice && (
                                                            <div className="final-price">Final: R {quote.finalPrice}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${getStatusClass(quote.status)}`}>
                                                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${getQuoteStatusClass(quote.quoteStatus)}`}>
                                                        {quote.quoteStatus ?
                                                            quote.quoteStatus.replace('_', ' ').charAt(0).toUpperCase() +
                                                            quote.quoteStatus.replace('_', ' ').slice(1)
                                                            : 'Pending'
                                                        }
                                                    </span>
                                                    {!quote.userId && quote.quoteStatus === 'pending_email' && (
                                                        <div className="email-badge">📧 Email Sent</div>
                                                    )}
                                                </td>
                                                <td className="action-buttons">
                                                    <button
                                                        className="btn-send-quote"
                                                        onClick={() => handleSendQuote(quote)}
                                                        title="Send Quote"
                                                        disabled={quote.quoteStatus === 'pending_customer' || quote.quoteStatus === 'pending_email'}
                                                    >
                                                        {quote.quoteStatus === 'pending_customer' || quote.quoteStatus === 'pending_email' ? 'Sent' : 'Send Quote'}
                                                    </button>
                                                    <select
                                                        value={quote.status}
                                                        onChange={(e) => updateQuoteStatus(quote._id, e.target.value)}
                                                        className="status-select"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="booked">Booked</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => deleteQuote(quote._id)}
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

            </div>

            {/* Quote Modal */}
            {showQuoteModal && selectedQuote && (
                <div className="modal-overlay" onClick={() => setShowQuoteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Send Quote to Customer</h3>
                        <div className="quote-details">
                            <p><strong>Customer:</strong> {selectedQuote.customerName}</p>
                            <p><strong>Email:</strong> {selectedQuote.customerEmail}</p>
                            <p><strong>Vehicle:</strong> {selectedQuote.vehicleType}</p>
                            <p><strong>Trip:</strong> {selectedQuote.pickupLocation} → {selectedQuote.dropoffLocation}</p>
                            <p><strong>Estimated Price:</strong> R {selectedQuote.estimatedPrice}</p>
                            <p><strong>User Type:</strong> {selectedQuote.userId ? 'Registered User' : 'Guest User'}</p>
                            {!selectedQuote.userId && (
                                <p className="email-notice">
                                    <small>📧 This quote will be sent via email with approval links</small>
                                </p>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="finalPrice">Final Price (R):</label>
                            <input
                                type="number"
                                id="finalPrice"
                                defaultValue={selectedQuote.finalPrice || selectedQuote.estimatedPrice}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="adminNotes">Notes to Customer:</label>
                            <textarea
                                id="adminNotes"
                                rows="3"
                                placeholder="Add any notes or terms for the customer..."
                                defaultValue={selectedQuote.adminNotes || ''}
                            ></textarea>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-confirm"
                                onClick={handleConfirmQuote}
                            >
                                {selectedQuote.userId ? 'Send to Dashboard' : 'Send via Email'}
                            </button>
                            <button
                                className="btn-book"
                                onClick={handleConvertToBooking}
                            >
                                Convert to Booking
                            </button>
                            <button
                                className="btn-cancel"
                                onClick={() => setShowQuoteModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Booking Modal */}
            {showAddBookingModal && (
                <div className="modal-overlay" onClick={() => setShowAddBookingModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Add Manual Booking</h3>
                        <form onSubmit={handleSubmitManualBooking}>
                            <div className="form-group">
                                <label>Customer Name:</label>
                                <input type="text" name="customerName" required />
                            </div>
                            <div className="form-group">
                                <label>Customer Email:</label>
                                <input type="email" name="customerEmail" required />
                            </div>
                            <div className="form-group">
                                <label>Customer Phone:</label>
                                <input type="tel" name="customerPhone" required />
                            </div>
                            <div className="form-group">
                                <label>Customer Company:</label>
                                <input type="text" name="customerCompany" />
                            </div>
                            <div className="form-group">
                                <label>Vehicle Type:</label>
                                <select name="vehicleType" required>
                                    <option value="">Select Vehicle</option>
                                    <option>4 Seater Sedan</option>
                                    <option>Mini Bus Mercedes Viano</option>
                                    <option>15 Seater Quantum</option>
                                    <option>17 Seater Luxury Sprinter</option>
                                    <option>22 Seater Luxury Coach</option>
                                    <option>28 Seater Semi Luxury</option>
                                    <option>39 Seater Luxury Coach</option>
                                    <option>60 Seater Semi Luxury</option>
                                    <option>70 Seater Semi Luxury</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Pickup Location:</label>
                                <input type="text" name="pickupLocation" required />
                            </div>
                            <div className="form-group">
                                <label>Dropoff Location:</label>
                                <input type="text" name="dropoffLocation" required />
                            </div>
                            <div className="form-group">
                                <label>Destination:</label>
                                <input type="text" name="destination" />
                            </div>
                            <div className="form-group">
                                <label>Trip Purpose:</label>
                                <input type="text" name="tripPurpose" />
                            </div>
                            <div className="form-group">
                                <label>Trip Type:</label>
                                <input type="text" name="tripType" />
                            </div>
                            <div className="form-group">
                                <label>Date:</label>
                                <input type="date" name="tripDate" required />
                            </div>
                            <div className="form-group">
                                <label>Time:</label>
                                <input type="time" name="tripTime" required />
                            </div>
                            <div className="form-group">
                                <label>Final Price (R) :</label>
                                <input type="number" name="finalPrice" step="0.01" min="0" required />
                            </div>
                            <div className="form-group">
                                <label>Trip Direction:</label>
                                <select name="isOneWay">
                                    <option value="false">Both Ways</option>
                                    <option value="true">One Way</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-confirm">
                                    Create Booking
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowAddBookingModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
        </div>
    );
};

export default AdminBookings;