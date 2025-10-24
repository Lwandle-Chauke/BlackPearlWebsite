// components/pages/Bookings.jsx

import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import '../styles/style.css';
import '../styles/bookings.css';

const Bookings = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  const isLoggedIn = true; // mock login
  const apiBase = 'http://localhost:5000/api/bookings'; // Backend URL

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ✅ 1. Fetch all bookings from backend
  const fetchBookings = async () => {
    try {
      const res = await fetch(apiBase);
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ✅ 2. Create new booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      showToastMessage('Error creating booking!');
    }
  };

  // ✅ 3. Cancel a booking
  const handleCancel = async (id) => {
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b._id !== id));
        showToastMessage('Booking cancelled successfully!');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = filter === 'all' || booking.status === filter;
    const matchesSearch =
      booking.service?.toLowerCase().includes(search.toLowerCase()) ||
      booking.pickup?.toLowerCase().includes(search.toLowerCase()) ||
      booking.dropoff?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />}

      <div className="bookings-container">
        <div className="bookings-header">
          <h2>My Bookings</h2>
          <p>View and manage your past and upcoming trips</p>
        </div>

        {/* ✅ Booking Form */}
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

        {/* ✅ Search & Filter */}
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
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* ✅ Bookings List */}
        <div id="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="booking-card" data-status={booking.status}>
              <div className="booking-header">
                <h3>{booking.service}</h3>
                <span className={`status ${booking.status}`}>
                  {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                </span>
              </div>
              <div className="booking-details">
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Pickup:</strong> {booking.pickup}</p>
                <p><strong>Drop-off:</strong> {booking.dropoff}</p>
                <p><strong>Passengers:</strong> {booking.passengers}</p>
                <p><strong>Email:</strong> {booking.email}</p>
                <p><strong>Message:</strong> {booking.message || 'N/A'}</p>
              </div>
              <div className="booking-actions">
                {booking.status !== 'cancelled' && (
                  <button className="btn-cancel" onClick={() => handleCancel(booking._id)}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showToast && <div id="toast" className="toast show">{toastMessage}</div>}

      <Footer />
    </>
  );
};

export default Bookings;
