import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/style.css';
import '../styles/bookings.css';

const Bookings = ({ onAuthClick, isLoggedIn, currentUser, onSignOut }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    date: '',
    pickup: '',
    dropoff: '',
    passengers: 1,
    message: ''
  });

  const apiBase = 'http://localhost:5000/api/bookings'; // Backend URL

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Fetch bookings from backend
  const fetchBookings = async () => {
    try {
      let url = apiBase;
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };

      if (isLoggedIn && currentUser && currentUser.id) {
        // Fetch user-specific bookings if logged in
        url = `${apiBase}/user/${currentUser.id}`;
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // If not logged in, or no currentUser, fetch all bookings (if allowed by backend)
        // Or, if you want to restrict, you could set bookings to empty array here.
        // For now, we'll assume public access to all bookings if not logged in.
      }

      const res = await fetch(url, { headers });
      const result = await res.json();

      // Ensure data is an array before setting bookings
      setBookings(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]); // Set to empty array on error
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isLoggedIn, currentUser]); // Re-fetch when login status or user changes

  // Create new booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      showToastMessage('Please sign in to create a booking.');
      return;
    }

    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, userId: currentUser.id }) // Include userId
      });

      const data = await res.json();
      if (data._id) {
        setBookings((prev) => [...prev, data]);
        showToastMessage('Booking created successfully!');
        setFormData({
          name: '',
          email: '',
          service: '',
          date: '',
          pickup: '',
          dropoff: '',
          passengers: 1,
          message: ''
        });
      } else {
        showToastMessage(data.msg || 'Error creating booking!');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      showToastMessage('Error creating booking!');
    }
  };

  // Cancel a booking
  const handleCancel = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToastMessage('Please sign in to cancel a booking.');
      return;
    }

    try {
      const res = await fetch(`${apiBase}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b._id !== id));
        showToastMessage('Booking cancelled successfully!');
      } else {
        const errorData = await res.json();
        showToastMessage(errorData.msg || 'Error cancelling booking!');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showToastMessage('Error cancelling booking!');
    }
  };

  const filteredBookings = (Array.isArray(bookings) ? bookings : []).filter((booking) => {
    const matchesStatus = filter === 'all' || booking.status === filter;
    const matchesSearch =
      booking.service?.toLowerCase().includes(search.toLowerCase()) ||
      booking.pickup?.toLowerCase().includes(search.toLowerCase()) ||
      booking.dropoff?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <Header
        onAuthClick={onAuthClick}
        isLoggedIn={isLoggedIn}
        user={currentUser}
        onSignOut={onSignOut}
      />

      <div className="bookings-container">
        <div className="bookings-header">
          <h2>My Bookings</h2>
          <p>View and manage your past and upcoming trips, {currentUser?.name || "Guest"}</p>
        </div>

        {/* Booking Form */}
        <form className="booking-form" onSubmit={handleSubmit}>
          <h3>Create New Booking</h3>
          <input type="text" placeholder="Name" value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <input type="email" placeholder="Email" value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <input type="text" placeholder="Service" value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })} required />
          <input type="date" value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
          <input type="text" placeholder="Pickup Location" value={formData.pickup}
            onChange={(e) => setFormData({ ...formData, pickup: e.target.value })} required />
          <input type="text" placeholder="Drop-off Location" value={formData.dropoff}
            onChange={(e) => setFormData({ ...formData, dropoff: e.target.value })} required />
          <input type="number" placeholder="Passengers" value={formData.passengers}
            onChange={(e) => setFormData({ ...formData, passengers: e.target.value })} required />
          <textarea placeholder="Message (optional)" value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}></textarea>
          <button type="submit">Submit Booking</button>
        </form>

        {/* Search & Filter */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by destination or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Bookings List */}
        <div className="bookings-table-container">
          {filteredBookings.length === 0 ? (
            <div className="no-bookings">
              <p>No bookings found matching your criteria.</p>
              <button
                className="btn-primary"
                onClick={() => setFilter('all')}
              >
                Show All Bookings
              </button>
            </div>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Service</th>
                  <th>Route</th>
                  <th>Date & Time</th>
                  <th>Passengers</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>#{booking._id.slice(-6).toUpperCase()}</td>
                    <td>{booking.service}</td>
                    <td>
                      <div className="trip-details">
                        <div>{booking.pickup} → {booking.dropoff}</div>
                      </div>
                    </td>
                    <td>
                      {new Date(booking.date).toLocaleDateString()}
                      <br />
                      <small>{booking.time || 'N/A'}</small>
                    </td>
                    <td>{booking.passengers}</td>
                    <td>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                      </span>
                    </td>
                    <td>
                      {booking.status !== 'cancelled' && (
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancel(booking._id)}
                          title="Cancel Booking"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showToast && <div id="toast" className="toast show">{toastMessage}</div>}

      <Footer />
    </>
  );
};

export default Bookings;
