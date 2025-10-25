import React, { useState } from 'react';
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
  const [bookings, setBookings] = useState([]); // Keep this for potential future backend integration

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // User-specific bookings data (mock data)
  const userBookings = [
    {
      id: 1,
      title: "Airport Transfer",
      status: "confirmed",
      date: "2024-10-22",
      pickup: "OR Tambo Airport",
      dropoff: "Sandton Hotel",
      passengers: currentUser?.name ? 2 : 1,
      price: "R850",
      customer: currentUser?.name || "Guest",
      service: "Airport Transfer" // Added service for filtering
    },
    {
      id: 2,
      title: "Conference Shuttle",
      status: "pending",
      date: "2024-10-25",
      pickup: "Pretoria CBD",
      dropoff: "Gallagher Convention Centre",
      passengers: currentUser?.name ? 4 : 2,
      price: "R1,400",
      customer: currentUser?.name || "Guest",
      service: "Conference Shuttle" // Added service for filtering
    },
    {
      id: 3,
      title: "Sports Tour",
      status: "completed",
      date: "2024-09-05",
      pickup: "Johannesburg Stadium",
      dropoff: "Durban Beachfront",
      passengers: currentUser?.name ? 8 : 4,
      price: "R3,500",
      customer: currentUser?.name || "Guest",
      service: "Sports Tour" // Added service for filtering
    }
  ];

  const filteredBookings = userBookings.filter(booking => {
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
        onAuthClick={onSignOut} 
        isLoggedIn={isLoggedIn} 
        user={currentUser}
        onSignOut={onSignOut}
      />

      <div className="bookings-container">
        <div className="bookings-header">
          <h2>My Bookings</h2>
          <p>View and manage your past and upcoming trips, {currentUser?.name || "Guest"}</p>
        </div>

        {/* Upcoming Booking Summary */}
        <div className="upcoming-card">
          <h3>Next Upcoming Trip</h3>
          <p><strong>Service:</strong> Airport Transfer</p>
          <p><strong>Date:</strong> 22 Oct 2024</p>
          <p><strong>Pickup:</strong> OR Tambo Airport → Sandton Hotel</p>
          <p><strong>Status:</strong> Confirmed ✅</p>
          <p><strong>Booked by:</strong> {currentUser?.name || "Guest"}</p>
        </div>

        {/* User Booking Stats */}
        <div className="booking-stats">
          <div className="stat-item">
            <span className="stat-number">{userBookings.filter(b => b.status === 'confirmed').length}</span>
            <span className="stat-label">Confirmed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{userBookings.filter(b => b.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{userBookings.filter(b => b.status === 'completed').length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

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
        <div id="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-card" data-status={booking.status}>
              <div className="booking-header">
                <h3>{booking.title}</h3>
                <span className={`status ${booking.status}`}>
                  {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                </span>
              </div>
              <div className="booking-details">
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Pickup:</strong> {booking.pickup}</p>
                <p><strong>Drop-off:</strong> {booking.dropoff}</p>
                <p><strong>Passengers:</strong> {booking.passengers}</p>
                <p><strong>Price:</strong> {booking.price}</p>
                <p><strong>Customer:</strong> {booking.customer}</p>
              </div>
              <div className="booking-actions">
                {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                  <button 
                    className="btn-cancel" 
                    onClick={() => showToastMessage('Booking cancelled successfully!')}
                  >
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
