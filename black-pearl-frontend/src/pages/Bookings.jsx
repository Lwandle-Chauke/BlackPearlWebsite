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
  const [isEditing, setIsEditing] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // New state for loading actions
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    tripType: 'Airport Transfers',
    tripPurpose: 'Personal Use',
    destination: '',
    pickupLocation: '',
    dropoffLocation: '',
    vehicleType: '4 Seater Sedan',
    isOneWay: true,
    tripDate: '',
    tripTime: '',
    passengerCount: 1,
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

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Enhanced form validation
  const validateForm = () => {
    const errors = {};
    const today = new Date().toISOString().split('T')[0];
    const selectedDate = new Date(formData.tripDate);

    // Required fields validation
    if (!formData.pickupLocation.trim()) errors.pickupLocation = 'Pickup location is required';
    if (!formData.dropoffLocation.trim()) errors.dropoffLocation = 'Drop-off location is required';
    if (!formData.tripDate) errors.tripDate = 'Trip date is required';
    if (!formData.tripTime) errors.tripTime = 'Trip time is required';
    if (!formData.passengerCount || formData.passengerCount < 1) errors.passengerCount = 'Valid passenger count is required';
    if (!formData.destination.trim()) errors.destination = 'Destination is required';

    // Date validation
    if (formData.tripDate && selectedDate < new Date(today)) {
      errors.tripDate = 'Trip date cannot be in the past';
    }

    // Passenger count validation based on vehicle type
    const passengerLimits = {
      '4 Seater Sedan': 4,
      'Mini Bus Mercedes Viano': 6,
      '15 Seater Quantum': 15,
      '17 Seater Luxury Sprinter': 17,
      '22 Seater Luxury Coach': 22,
      '28 Seater Luxury Coach': 28,
      '39 Seater Luxury Coach': 39,
      '60 Seater Semi Luxury': 60,
      '70 Seater Semi Luxury': 70
    };

    if (formData.passengerCount > passengerLimits[formData.vehicleType]) {
      errors.passengerCount = `Passenger count exceeds ${formData.vehicleType} capacity (max: ${passengerLimits[formData.vehicleType]})`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle new booking submission - USING CORRECT ENDPOINT
  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      showToastMessage('Please fix the form errors before submitting.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Prepare submission data matching the Quote page structure
      const submissionData = {
        tripPurpose: formData.tripPurpose,
        tripType: formData.tripType,
        destination: formData.destination,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        vehicleType: formData.vehicleType,
        isOneWay: true, // Default to one-way for simplicity
        tripDate: formData.tripDate,
        tripTime: formData.tripTime,
        passengerCount: parseInt(formData.passengerCount),
        specialRequests: formData.specialRequests,
        // Customer info
        customerName: currentUser?.name,
        customerEmail: currentUser?.email,
        customerPhone: currentUser?.phone,
        customerCompany: '',
        // User reference
        userId: currentUser?.id
      };

      console.log('Submitting booking data:', submissionData);
      // If we're editing an existing booking, call the edit endpoint
      let response;
      if (isEditing && editingBookingId) {
        response = await fetch(`http://localhost:5000/api/quotes/${editingBookingId}/edit`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(submissionData)
        });
      } else {
        response = await fetch('http://localhost:5000/api/quotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(submissionData)
        });
      }

      const data = await response.json();

      if (data.success) {
        showToastMessage(isEditing ? 'Booking updated successfully!' : 'Booking request submitted successfully! We will contact you shortly.');
        setShowBookingForm(false);
        // Reset form
        setFormData({
          tripType: 'Airport Transfers',
          tripPurpose: 'Personal Use',
          destination: '',
          pickupLocation: '',
          dropoffLocation: '',
          vehicleType: '4 Seater Sedan',
          tripDate: '',
          tripTime: '',
          passengerCount: 1,
          specialRequests: ''
        });
        setFormErrors({});
        setIsEditing(false);
        setEditingBookingId(null);
        fetchUserBookings(); // Refresh bookings
      } else {
        showToastMessage('Failed to submit booking: ' + (data.error || 'Please try again.'));
      }
    } catch (error) {
      console.error('Submit booking error:', error);
      showToastMessage('Failed to submit booking. Please check your connection and try again.');
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    const bookingToCancel = bookings.find(b => b._id === bookingId);
    const confirmed = window.confirm(
      `Are you sure you want to cancel this ${bookingToCancel?.tripType} booking?\n\n` +
      `From: ${bookingToCancel?.pickupLocation}\n` +
      `To: ${bookingToCancel?.dropoffLocation}\n` +
      `Date: ${new Date(bookingToCancel?.tripDate).toLocaleDateString()}\n\n` +
      `This action can be undone by contacting support.`
    );

    if (!confirmed) return;

    setActionLoading(bookingId);
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
    } finally {
      setActionLoading(null);
    }
  };

  // Open edit form for a pending booking
  const openEditBooking = (booking) => {
    // Only allow editing pending bookings
    if (booking.status !== 'pending') {
      showToastMessage('Only pending bookings can be edited.');
      return;
    }

    setFormData({
      tripType: booking.tripType || 'Airport Transfers',
      tripPurpose: booking.tripPurpose || 'Personal Use',
      destination: booking.destination || '',
      pickupLocation: booking.pickupLocation || '',
      dropoffLocation: booking.dropoffLocation || '',
      vehicleType: booking.vehicleType || '4 Seater Sedan',
      isOneWay: booking.isOneWay !== undefined ? booking.isOneWay : true,
      tripDate: booking.tripDate ? booking.tripDate.split('T')[0] : '',
      tripTime: booking.tripTime || '',
      passengerCount: booking.passengerCount || 1,
      specialRequests: booking.specialRequests || ''
    });

    setIsEditing(true);
    setEditingBookingId(booking._id);
    setShowBookingForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle booking deletion
  const handleDeleteBooking = async (bookingId) => {
    const bookingToDelete = bookings.find(b => b._id === bookingId);
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${bookingToDelete?.tripType} booking?\n\n` +
      `From: ${bookingToDelete?.pickupLocation}\n` +
      `To: ${bookingToDelete?.dropoffLocation}\n` +
      `Date: ${new Date(bookingToDelete?.tripDate).toLocaleDateString()}\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) return;

    setActionLoading(bookingId);
    try {
      const token = localStorage.getItem('token');

      // Since your bookings come from /api/quotes/my-quotes, use quotes endpoint
      const response = await fetch(`http://localhost:5000/api/quotes/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          showToastMessage('Booking deleted successfully!');
          // Remove from local state immediately
          setBookings(prev => prev.filter(booking => booking._id !== bookingId));
          // Update next booking if needed
          if (nextBooking && nextBooking._id === bookingId) {
            // Find the new next booking
            const newUpcoming = bookings
              .filter(b => b._id !== bookingId)
              .filter(b => ['confirmed', 'pending', 'booked'].includes(b.status))
              .sort((a, b) => new Date(a.tripDate) - new Date(b.tripDate))[0];
            setNextBooking(newUpcoming || null);
          }
        } else {
          showToastMessage('Failed to delete booking: ' + (data.error || 'Unknown error'));
        }
      } else if (response.status === 401) {
        // If unauthorized, try cancelling instead of deleting
        await handleCancelBooking(bookingId);
      } else {
        showToastMessage('Failed to delete booking. Please try again.');
      }
    } catch (error) {
      console.error('Delete booking error:', error);
      showToastMessage('Failed to delete booking. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle quote acceptance
  const handleAcceptQuote = async (bookingId) => {
    const bookingToAccept = bookings.find(b => b._id === bookingId);
    const confirmed = window.confirm(
      `Are you sure you want to accept this quote for a ${bookingToAccept?.tripType} trip?\n\n` +
      `From: ${bookingToAccept?.pickupLocation}\n` +
      `To: ${bookingToAccept?.dropoffLocation}\n` +
      `Date: ${new Date(bookingToAccept?.tripDate).toLocaleDateString()}\n\n` +
      `Accepting will confirm your booking.`
    );

    if (!confirmed) return;

    setActionLoading(bookingId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/quotes/${bookingId}/customer-accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        showToastMessage('Quote accepted successfully!');
        fetchUserBookings(); // Refresh the bookings
      } else {
        showToastMessage('Failed to accept quote: ' + data.error);
      }
    } catch (error) {
      console.error('Accept quote error:', error);
      showToastMessage('Failed to accept quote. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle quote decline
  const handleDeclineQuote = async (bookingId) => {
    const bookingToDecline = bookings.find(b => b._id === bookingId);
    const confirmed = window.confirm(
      `Are you sure you want to decline this quote for a ${bookingToDecline?.tripType} trip?\n\n` +
      `From: ${bookingToDecline?.pickupLocation}\n` +
      `To: ${bookingToDecline?.dropoffLocation}\n` +
      `Date: ${new Date(bookingToDecline?.tripDate).toLocaleDateString()}\n\n` +
      `You will be asked to provide a reason.`
    );

    if (!confirmed) return;

    const declineReason = prompt('Please provide a reason for declining this quote (optional):');

    setActionLoading(bookingId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/quotes/${bookingId}/customer-decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ declineReason })
      });

      const data = await response.json();

      if (data.success) {
        showToastMessage('Quote declined successfully.');
        fetchUserBookings(); // Refresh the bookings
      } else {
        showToastMessage('Failed to decline quote: ' + data.error);
      }
    } catch (error) {
      console.error('Decline quote error:', error);
      showToastMessage('Failed to decline quote. Please try again.');
    } finally {
      setActionLoading(null);
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

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

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
                    <label>Trip Type *</label>
                    <select
                      name="tripType"
                      value={formData.tripType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Airport Transfers">Airport Transfers</option>
                      <option value="Conference Shuttles">Conference Shuttles</option>
                      <option value="Sports Travel">Sports Travel</option>
                      <option value="Events & Leisure">Events & Leisure</option>
                      <option value="Corporate Travel">Corporate Travel</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Trip Purpose *</label>
                    <select
                      name="tripPurpose"
                      value={formData.tripPurpose}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Personal Use">Personal Use</option>
                      <option value="Business / Corporate">Business / Corporate</option>
                      <option value="School or University Trip">School or University Trip</option>
                      <option value="Event / Wedding">Event / Wedding</option>
                      <option value="Tourism or Sightseeing">Tourism or Sightseeing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Vehicle Type *</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="4 Seater Sedan">4 Seater Sedan</option>
                      <option value="Mini Bus Mercedes Viano">Mini Bus Mercedes Viano</option>
                      <option value="15 Seater Quantum">15 Seater Quantum</option>
                      <option value="17 Seater Luxury Sprinter">17 Seater Luxury Sprinter</option>
                      <option value="22 Seater Luxury Coach">22 Seater Luxury Coach</option>
                      <option value="28 Seater Luxury Coach">28 Seater Luxury Coach</option>
                      <option value="39 Seater Luxury Coach">39 Seater Luxury Coach</option>
                      <option value="60 Seater Semi Luxury">60 Seater Semi Luxury</option>
                      <option value="70 Seater Semi Luxury">70 Seater Semi Luxury</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Passengers *</label>
                    <input
                      type="number"
                      name="passengerCount"
                      value={formData.passengerCount}
                      onChange={handleInputChange}
                      min="1"
                      max="70"
                      required
                      className={formErrors.passengerCount ? 'error' : ''}
                    />
                    {formErrors.passengerCount && (
                      <span className="error-message">{formErrors.passengerCount}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pickup Location *</label>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleInputChange}
                      placeholder="Enter pickup address"
                      required
                      className={formErrors.pickupLocation ? 'error' : ''}
                    />
                    {formErrors.pickupLocation && (
                      <span className="error-message">{formErrors.pickupLocation}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Drop-off Location *</label>
                    <input
                      type="text"
                      name="dropoffLocation"
                      value={formData.dropoffLocation}
                      onChange={handleInputChange}
                      placeholder="Enter destination"
                      required
                      className={formErrors.dropoffLocation ? 'error' : ''}
                    />
                    {formErrors.dropoffLocation && (
                      <span className="error-message">{formErrors.dropoffLocation}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Destination *</label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="City or main destination"
                      required
                      className={formErrors.destination ? 'error' : ''}
                    />
                    {formErrors.destination && (
                      <span className="error-message">{formErrors.destination}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Trip Date *</label>
                    <input
                      type="date"
                      name="tripDate"
                      value={formData.tripDate}
                      onChange={handleInputChange}
                      required
                      min={today}
                      className={formErrors.tripDate ? 'error' : ''}
                    />
                    {formErrors.tripDate && (
                      <span className="error-message">{formErrors.tripDate}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Trip Time *</label>
                    <input
                      type="time"
                      name="tripTime"
                      value={formData.tripTime}
                      onChange={handleInputChange}
                      required
                      className={formErrors.tripTime ? 'error' : ''}
                    />
                    {formErrors.tripTime && (
                      <span className="error-message">{formErrors.tripTime}</span>
                    )}
                  </div>
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
                    {booking.destination && (
                      <div className="detail-item">
                        <i className="fas fa-map-pin"></i>
                        <div>
                          <strong>Destination:</strong> {booking.destination}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="booking-actions">
                    {/* Show cancel button for active bookings */}
                    {['pending', 'confirmed', 'booked'].includes(booking.status) && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={actionLoading === booking._id}
                      >
                        <i className={`fas ${actionLoading === booking._id ? 'fa-spinner fa-spin' : 'fa-times'}`}></i>
                        {actionLoading === booking._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}

                    {/* Show edit button for pending bookings (owner) */}
                    {booking.status === 'pending' && (booking.userId?.toString() === currentUser?.id || !booking.userId) && (
                      <button
                        className="btn-edit"
                        onClick={() => openEditBooking(booking)}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                    )}

                    {/* Show delete button only for admins */}
                    {currentUser?.role === 'admin' && !['pending', 'confirmed', 'booked'].includes(booking.status) && (
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteBooking(booking._id)}
                        disabled={actionLoading === booking._id}
                      >
                        <i className={`fas ${actionLoading === booking._id ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
                        {actionLoading === booking._id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}

                    {/* Show quote actions for pending customer quotes */}
                    {booking.quoteStatus === 'pending_customer' && (
                      <div className="quote-actions">
                        <button
                          className="btn-accept"
                          onClick={() => handleAcceptQuote(booking._id)}
                          disabled={actionLoading === booking._id}
                        >
                          <i className={`fas ${actionLoading === booking._id ? 'fa-spinner fa-spin' : 'fa-check'}`}></i>
                          {actionLoading === booking._id ? 'Accepting...' : 'Accept Quote'}
                        </button>
                        <button
                          className="btn-decline"
                          onClick={() => handleDeclineQuote(booking._id)}
                          disabled={actionLoading === booking._id}
                        >
                          <i className={`fas ${actionLoading === booking._id ? 'fa-spinner fa-spin' : 'fa-times'}`}></i>
                          {actionLoading === booking._id ? 'Declining...' : 'Decline'}
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
