import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const bookings = [
    {
      id: 1,
      title: "Airport Transfer",
      status: "confirmed",
      date: "22 Oct 2025",
      pickup: "OR Tambo Airport",
      dropoff: "Sandton Hotel",
      passengers: 3,
      price: "R850"
    },
    {
      id: 2,
      title: "Conference Shuttle",
      status: "pending",
      date: "25 Oct 2025",
      pickup: "Pretoria CBD",
      dropoff: "Gallagher Convention Centre",
      passengers: 6,
      price: "R1,400"
    },
    {
      id: 3,
      title: "Sports Tour",
      status: "cancelled",
      date: "5 Sep 2025",
      pickup: "Johannesburg Stadium",
      dropoff: "Durban Beachfront",
      passengers: 10,
      price: "R3,500"
    }
  ];

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filter === 'all' || booking.status === filter;
    const matchesSearch = booking.title.toLowerCase().includes(search.toLowerCase()) ||
                         booking.pickup.toLowerCase().includes(search.toLowerCase()) ||
                         booking.dropoff.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <Header onSignInClick={openAuthModal} />
      
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />}

      {/* Bookings Content */}
      <div className="bookings-container">
        <div className="bookings-header">
          <h2>My Bookings</h2>
          <p>View and manage your past and upcoming trips</p>
        </div>

        {/* Upcoming Booking Summary */}
        <div className="upcoming-card">
          <h3>Next Upcoming Trip</h3>
          <p><strong>Service:</strong> Airport Transfer</p>
          <p><strong>Date:</strong> 22 Oct 2025</p>
          <p><strong>Pickup:</strong> OR Tambo Airport → Sandton Hotel</p>
          <p><strong>Status:</strong> Confirmed ✅</p>
        </div>

        {/* Search and Filter */}
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search by destination or date..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Booking Cards */}
        <div id="bookings-list">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card" data-status={booking.status}>
              <div className="booking-header">
                <h3>{booking.title}</h3>
                <span className={`status ${booking.status}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
              <div className="booking-details">
                <p><strong>Date:</strong> {booking.date}</p>
                <p><strong>Pickup:</strong> {booking.pickup}</p>
                <p><strong>Drop-off:</strong> {booking.dropoff}</p>
                <p><strong>Passengers:</strong> {booking.passengers}</p>
                <p><strong>Price:</strong> {booking.price}</p>
              </div>
              <div className="booking-actions">
                {booking.status !== 'cancelled' && (
                  <button 
                    className="btn-cancel" 
                    onClick={() => showToastMessage('Booking cancelled successfully!')}
                  >
                    Cancel
                  </button>
                )}
                <button 
                  className="btn-rebook" 
                  onClick={() => showToastMessage('Trip rebooked!')}
                >
                  Rebook
                </button>
                <button 
                  className="btn-feedback" 
                  onClick={() => showToastMessage('Thank you for your feedback!')}
                >
                  Give Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast Message */}
      {showToast && (
        <div id="toast" className="toast show">
          {toastMessage}
        </div>
      )}

      {/* Floating chat icon */}
      <div className="chat-fab" title="Chat with us">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="3" fill="#fff"/>
          <circle cx="8.5" cy="10.3" r="1.1" fill="#666"/>
          <circle cx="15.5" cy="10.3" r="1.1" fill="#666"/>
          <rect x="9.5" y="13.6" width="5" height="1.3" rx="0.65" fill="#c1c1c1"/>
        </svg>
      </div>

      <Footer />
    </>
  );
};

export default Bookings;