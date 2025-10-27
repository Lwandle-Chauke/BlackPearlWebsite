import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/style.css';
import '../styles/bookings.css';

const Bookings = ({ user, onSignOut, isLoggedIn, currentUser }) => {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextBooking, setNextBooking] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    tripType: 'airport',
    pickupLocation: '',
    dropoffLocation: '',
    tripDate: '',
    tripTime: '',
    passengerCount: 1,
    vehicleType: 'sedan',
    tripPurpose: '',
    specialRequests: ''
  });

  // Fetch user's bookings when component mounts or currentUser changes
  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchUserBookings();
    }
  }, [currentUser]);

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/quotes/my-quotes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userBookings = data.data || [];
        setBookings(userBookings);

        // Find next upcoming booking
        const upcoming = userBookings.filter(booking =>
          booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'booked'
        ).sort((a, b) => new Date(a.tripDate) - new Date(b.tripDate))[0];

        setNextBooking(upcoming || null);
      } else {
        console.error('Failed to fetch user bookings');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle new booking submission
  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/quotes/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          customerId: currentUser?.id,
          customerName: currentUser?.name,
          customerEmail: currentUser?.email,
          customerPhone: currentUser?.phone
        })
      });

      const data = await response.json();

      if (data.success) {
        showToastMessage('Booking request submitted successfully!');
        setShowBookingForm(false);
        setFormData({
          tripType: 'airport',
          pickupLocation: '',
          dropoffLocation: '',
          tripDate: '',
          tripTime: '',
          passengerCount: 1,
          vehicleType: 'sedan',
          tripPurpose: '',
          specialRequests: ''
        });
        fetchUserBookings(); // Refresh bookings
      } else {
        showToastMessage('Failed to submit booking: ' + data.error);
      }
    } catch (error) {
      console.error('Submit booking error:', error);
      showToastMessage('Failed to submit booking. Please try again.');
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        showToastMessage('Booking cancelled successfully!');
        fetchUserBookings(); // Refresh the bookings
      } else {
        showToastMessage('Failed to cancel booking: ' + data.error);
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      showToastMessage('Failed to cancel booking. Please try again.');
    }
  };

  // Handle booking deletion
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        showToastMessage('Booking deleted successfully!');
        fetchUserBookings(); // Refresh the bookings
      } else {
        showToastMessage('Failed to delete booking: ' + data.error);
      }
    } catch (error) {
      console.error('Delete booking error:', error);
      showToastMessage('Failed to delete booking. Please try again.');
    }
  };

  // Filter bookings based on status and search
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filter === 'all' || booking.status === filter;
    const matchesSearch =
      booking.tripType?.toLowerCase().includes(search.toLowerCase()) ||
      booking.pickupLocation?.toLowerCase().includes(search.toLowerCase()) ||
      booking.dropoffLocation?.toLowerCase().includes(search.toLowerCase()) ||
      booking.destination?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate booking statistics
  const calculateStats = () => {
    return {
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      total: bookings.length
    };
  };

  const stats = calculateStats();

  // Format price display
  const formatPrice = (booking) => {
    return `R ${booking.finalPrice || booking.estimatedPrice || '0'}`;
  };

  // Render next upcoming trip card
  const renderNextUpcomingTrip = () => {
    if (loading) {
      return (
        <div className="upcoming-card loading">
          <h3>Next Upcoming Trip</h3>
          <p>Loading your upcoming trips...</p>
        </div>
      );
    }

    if (nextBooking) {
      return (
        <div className="upcoming-card">
          <div className="upcoming-card-header">
            <h3>Next Upcoming Trip</h3>
            <span className="upcoming-badge">UPCOMING</span>
          </div>
          <div className="upcoming-card-content">
            <p><strong>Service:</strong> {nextBooking.tripType}</p>
            <p><strong>Date:</strong> {new Date(nextBooking.tripDate).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}</p>
            <p><strong>Time:</strong> {nextBooking.tripTime}</p>
            <p><strong>Route:</strong> {nextBooking.pickupLocation} → {nextBooking.dropoffLocation}</p>
            <p><strong>Status:</strong>
              <span className={`status ${nextBooking.status}`}>
                {nextBooking.status.charAt(0).toUpperCase() + nextBooking.status.slice(1)}
              </span>
            </p>
            <p><strong>Price:</strong> {formatPrice(nextBooking)}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="upcoming-card no-upcoming">
        <h3>No Upcoming Trips</h3>
        <p>You don't have any upcoming trips scheduled.</p>
        <button
          className="btn-primary"
          onClick={() => setShowBookingForm(true)}
        >
          <i className="fas fa-plus"></i>
          Book Your First Trip
        </button>
      </div>
    );
  };

  return (
    <>
      <Header
        onAuthClick={onSignOut}
        isLoggedIn={isLoggedIn}
        user={currentUser}
        onSignOut={onSignOut}
      />

      <div className="bookings-container">
        <div className="bookings-header">
          <h2>My Bookings</h2>
          <p>View and manage your past and upcoming trips, {currentUser?.name || "Guest"}</p>
          <button
            className="btn-new-booking"
            onClick={() => setShowBookingForm(!showBookingForm)}
          >
            <i className="fas fa-plus"></i>
            {showBookingForm ? 'Cancel New Booking' : 'Add New Booking'}
          </button>
        </div>

        {/* New Booking Form */}
        {showBookingForm && (
          <div className="booking-form-section">
            <div className="booking-form-card">
              <h3>Create New Booking</h3>
              <form onSubmit={handleSubmitBooking}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Trip Type</label>
                    <select
                      name="tripType"
                      value={formData.tripType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="airport">Airport Transfer</option>
                      <option value="conference">Conference Shuttle</option>
                      <option value="sports">Sports Tour</option>
                      <option value="events">Events & Leisure</option>
                      <option value="corporate">Corporate Travel</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="sedan">Sedan (1-4 passengers)</option>
                      <option value="suv">SUV (1-6 passengers)</option>
                      <option value="minivan">Minivan (1-8 passengers)</option>
                      <option value="minibus">Minibus (1-15 passengers)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pickup Location</label>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleInputChange}
                      placeholder="Enter pickup address"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Drop-off Location</label>
                    <input
                      type="text"
                      name="dropoffLocation"
                      value={formData.dropoffLocation}
                      onChange={handleInputChange}
                      placeholder="Enter destination"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Trip Date</label>
                    <input
                      type="date"
                      name="tripDate"
                      value={formData.tripDate}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label>Trip Time</label>
                    <input
                      type="time"
                      name="tripTime"
                      value={formData.tripTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Passengers</label>
                    <input
                      type="number"
                      name="passengerCount"
                      value={formData.passengerCount}
                      onChange={handleInputChange}
                      min="1"
                      max="15"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Trip Purpose</label>
                  <input
                    type="text"
                    name="tripPurpose"
                    value={formData.tripPurpose}
                    onChange={handleInputChange}
                    placeholder="Business meeting, vacation, etc."
                  />
                </div>

                <div className="form-group">
                  <label>Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Any special requirements or notes..."
                    rows="3"
                  />
                </div>

                <button type="submit" className="btn-submit-booking">
                  <i className="fas fa-paper-plane"></i>
                  Submit Booking Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Upcoming Booking Summary */}
        {renderNextUpcomingTrip()}

        {/* User Booking Stats */}
        <div className="booking-stats">
          <div className="stat-item total">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
          <div className="stat-item confirmed">
            <span className="stat-number">{stats.confirmed}</span>
            <span className="stat-label">Confirmed</span>
          </div>
          <div className="stat-item pending">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item completed">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="search-filter-section">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by service, pickup, or destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        <div id="bookings-list">
          {loading ? (
            <div className="loading-message">
              <i className="fas fa-spinner fa-spin"></i>
              Loading your bookings...
            </div>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking._id} className="booking-card" data-status={booking.status}>
                <div className="booking-card-header">
                  <div className="booking-title-section">
                    <h3>{booking.tripType}</h3>
                    <span className="booking-date">
                      {new Date(booking.tripDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`status ${booking.status}`}>
                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                  </span>
                </div>

                <div className="booking-card-content">
                  <div className="booking-details">
                    <div className="detail-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <div>
                        <strong>From:</strong> {booking.pickupLocation}
                      </div>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-flag-checkered"></i>
                      <div>
                        <strong>To:</strong> {booking.dropoffLocation}
                      </div>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-clock"></i>
                      <div>
                        <strong>Time:</strong> {booking.tripTime}
                      </div>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-car"></i>
                      <div>
                        <strong>Vehicle:</strong> {booking.vehicleType}
                      </div>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-users"></i>
                      <div>
                        <strong>Passengers:</strong> {booking.passengerCount || 'Not specified'}
                      </div>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-tag"></i>
                      <div>
                        <strong>Price:</strong> {formatPrice(booking)}
                      </div>
                    </div>
                  </div>

                  <div className="booking-actions">
                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        <i className="fas fa-times"></i>
                        Cancel
                      </button>
                    )}
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteBooking(booking._id)}
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                    {booking.quoteStatus === 'pending_customer' && (
                      <div className="quote-actions">
                        <button className="btn-accept">
                          <i className="fas fa-check"></i>
                          Accept
                        </button>
                        <button className="btn-decline">
                          <i className="fas fa-times"></i>
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-bookings-message">
              <i className="fas fa-calendar-times"></i>
              <h3>No Bookings Found</h3>
              <p>
                {search || filter !== 'all' ?
                  'No bookings match your search criteria.' :
                  'You haven\'t made any bookings yet.'
                }
              </p>
              <button
                className="btn-primary"
                onClick={() => setShowBookingForm(true)}
              >
                <i className="fas fa-plus"></i>
                Create Your First Booking
              </button>
            </div>
          )}
        </div>
      </div>

      {showToast && <div id="toast" className="toast show">{toastMessage}</div>}

      <Footer />
    </>
  );
};

export default Bookings;
