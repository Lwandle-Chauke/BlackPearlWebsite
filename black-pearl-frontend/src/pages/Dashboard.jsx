import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/style.css';
import '../styles/dashboard.css';
import ChatWidget from "../chatbot/ChatWidget";

const Dashboard = ({ user, onSignOut, isLoggedIn, currentUser, onUserUpdate }) => {
  const navigate = useNavigate();
  const [userBookings, setUserBookings] = useState([]);
  const [nextBooking, setNextBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Refresh user data function
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && onUserUpdate) {
          onUserUpdate(data.user);
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

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
        setUserBookings(data.data || []);

        // Find next upcoming booking
        const upcoming = data.data?.filter(booking =>
          booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'booked'
        ).sort((a, b) => new Date(a.tripDate) - new Date(b.tripDate))[0];

        setNextBooking(upcoming || null);
      } else {
        console.error('Failed to fetch user bookings');
        setUserBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setUserBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Customer accepts quote
  const handleAcceptQuote = async (quoteId) => {
    if (!window.confirm('Are you sure you want to accept this quote? This will create a booking.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}/customer-accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Quote accepted! Your booking has been created.');
        fetchUserBookings(); // Refresh the bookings
      } else {
        alert('Failed to accept quote: ' + data.error);
      }
    } catch (error) {
      console.error('Accept quote error:', error);
      alert('Failed to accept quote. Please try again.');
    }
  };

  // NEW: Customer declines quote
  const handleDeclineQuote = async (quoteId) => {
    const declineReason = prompt('Please provide a reason for declining this quote (optional):');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}/customer-decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ declineReason })
      });

      const data = await response.json();

      if (data.success) {
        alert('Quote declined successfully.');
        fetchUserBookings(); // Refresh the bookings
      } else {
        alert('Failed to decline quote: ' + data.error);
      }
    } catch (error) {
      console.error('Decline quote error:', error);
      alert('Failed to decline quote. Please try again.');
    }
  };

  // Calculate discount value based on loyalty points (same logic as loyaltyService)
  const calculateDiscountValue = (points) => {
    const discountAmount = Math.floor(points / 100) * 10;
    return Math.min(discountAmount, 500); // Max R500 discount
  };

  // Calculate real user data based on actual trips
  const calculateUserData = () => {
    const completedTrips = userBookings.filter(booking =>
      booking.status === 'completed'
    ).length;

    // Calculate total spent from completed trips
    const totalSpent = userBookings
      .filter(booking => booking.status === 'completed' && booking.finalPrice)
      .reduce((total, booking) => total + (booking.finalPrice || 0), 0);

    // Use actual user data from backend - ALWAYS use currentUser directly
    return {
      name: currentUser?.name || "Guest",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      loyaltyPoints: currentUser?.loyaltyPoints || 0,
      tripsCompleted: completedTrips,
      totalTrips: currentUser?.totalTrips || 0,
      totalSpent: totalSpent,
      tier: currentUser?.tier || 'bronze',
      memberSince: currentUser?.memberSince ? new Date(currentUser.memberSince).getFullYear().toString() : "2025",
      totalBookings: userBookings.length,
      upcomingTrips: userBookings.filter(booking =>
        booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'booked'
      ).length,
      availableDiscount: calculateDiscountValue(currentUser?.loyaltyPoints || 0)
    };
  };

  const userData = calculateUserData();

  // Personal highlights based on REAL user activity
  const getPersonalHighlights = () => {
    const highlights = [
      {
        badge: '🏅',
        stat: `${userData.tripsCompleted} Trips Completed`,
        desc: `You've completed ${userData.tripsCompleted} trips with us!`
      },
      {
        badge: '💰',
        stat: `${userData.loyaltyPoints} Points`,
        desc: `You have ${userData.loyaltyPoints} loyalty points to redeem.`
      },
      {
        badge: '⏱️',
        stat: `${userData.tripsCompleted * 3} Hours Saved`,
        desc: `You've saved ${userData.tripsCompleted * 3} hours of travel planning.`
      },
      {
        badge: '🧭',
        stat: `${userData.tripsCompleted * 240} km Traveled`,
        desc: `You've traveled ${userData.tripsCompleted * 240} km with us.`
      },
    ];

    // Add tier-based highlights
    const tierEmoji = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎'
    };

    highlights.push({
      badge: tierEmoji[userData.tier] || '🥉',
      stat: `${userData.tier.charAt(0).toUpperCase() + userData.tier.slice(1)} Member`,
      desc: `You are a ${userData.tier} level member with special benefits!`
    });

    // Add discount highlight
    if (userData.availableDiscount > 0) {
      highlights.push({
        badge: '💎',
        stat: `R ${userData.availableDiscount} Discount`,
        desc: `You have R ${userData.availableDiscount} available to use on your next trip!`
      });
    }

    // Add spending highlight
    if (userData.totalSpent > 0) {
      highlights.push({
        badge: '💳',
        stat: `R ${userData.totalSpent.toLocaleString()} Total`,
        desc: `You've spent R ${userData.totalSpent.toLocaleString()} on trips.`
      });
    }

    // Add VIP status if user has enough trips
    if (userData.tripsCompleted >= 5) {
      highlights.push({
        badge: '🎖️',
        stat: 'VIP Member',
        desc: "You are now a VIP member!"
      });
    }

    // Add booking milestone if applicable
    if (userData.totalBookings >= 10) {
      highlights.push({
        badge: '🌟',
        stat: 'Frequent Traveler',
        desc: `You've made ${userData.totalBookings} bookings with us!`
      });
    }

    return highlights;
  };

  const handleViewDetails = () => {
    if (nextBooking) {
      alert(`${nextBooking.tripType || nextBooking.title}\nDate: ${new Date(nextBooking.tripDate).toLocaleDateString()}\nStatus: ${nextBooking.status}\nPickup: ${nextBooking.pickupLocation}\nDropoff: ${nextBooking.dropoffLocation}`);
    } else {
      navigate('/bookings'); // Changed from /quote to /bookings
    }
  };

  const handleRequestQuote = () => {
    navigate('/bookings'); // Changed from /quote to /bookings
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const rating = e.target.rating.value;
    const feedbackText = e.target.testimonial.value.trim();

    if (!rating) {
      alert("Please choose a rating.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          name: currentUser?.name || "Anonymous",
          email: currentUser?.email || "anonymous@example.com",
          subject: `User Feedback - ${rating} Stars`,
          feedback: feedbackText
        })
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      alert(`Thanks for your feedback (${rating} stars).\n"${feedbackText}"`);
      e.target.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  const highlights = getPersonalHighlights();

  // Determine what to show in the booking card
  const getBookingCardContent = () => {
    if (loading) {
      return (
        <div className="booking-card fancy-card" role="region" aria-label="Your next booking">
          <div className="booking-info card-body">
            <div className="booking-label">Loading your trips...</div>
          </div>
        </div>
      );
    }

    if (nextBooking) {
      return (
        <div className="booking-card fancy-card" role="region" aria-label="Your next booking">
          <div className="booking-info card-body">
            <div className="booking-label">Your Next Booking:</div>
            <div className="booking-title">{nextBooking.tripType || nextBooking.title}</div>
            <div className="booking-meta">
              <span className="booking-date">
                {new Date(nextBooking.tripDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className={`booking-status status-${nextBooking.status}`}>
                {nextBooking.status.charAt(0).toUpperCase() + nextBooking.status.slice(1)}
              </span>
            </div>
            <div className="booking-location">
              {nextBooking.pickupLocation} → {nextBooking.dropoffLocation}
            </div>
          </div>
          <button className="view-btn" onClick={handleViewDetails}>VIEW DETAILS</button>
        </div>
      );
    }

    // No upcoming bookings
    return (
      <div className="booking-card fancy-card no-booking" role="region" aria-label="No upcoming trips">
        <div className="booking-info card-body">
          <div className="booking-label">No Upcoming Trips</div>
          <div className="booking-title">Ready for your next adventure?</div>
          <div className="booking-meta">
            <span className="booking-description">
              You don't have any upcoming trips. Start planning your next journey!
            </span>
          </div>
        </div>
        <button className="view-btn" onClick={handleViewDetails}>BOOK A TRIP</button>
      </div>
    );
  };

  // Get pending quotes for the customer
  const pendingQuotes = userBookings.filter(booking =>
    booking.quoteStatus === 'pending_customer'
  );

  return (
    <>
      <Header
        onAuthClick={onSignOut}
        isLoggedIn={isLoggedIn}
        user={currentUser}
        onSignOut={onSignOut}
      />

      {/* HERO SECTION */}
      <section className="hero-wrap">
        <div className="hero-overlay">
          <div className="container">
            <div className="hero-content">
              <div className="hero-title">Welcome Back, {userData.name}!</div>
              <div className="hero-sub">Ready for your next adventure?</div>

              <div className="booking-card-wrap">
                {getBookingCardContent()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PENDING QUOTES SECTION */}
      {pendingQuotes.length > 0 && (
        <section className="pending-quotes-section">
          <div className="container">
            <div className="section-title">Pending Quotes</div>
            <p className="section-subtitle">You have {pendingQuotes.length} quote(s) waiting for your response</p>
            <div className="pending-quotes-grid">
              {pendingQuotes.map(quote => (
                <div key={quote._id} className="pending-quote-card">
                  <div className="quote-header">
                    <h4>{quote.tripType}</h4>
                    <span className="quote-badge">Quote Sent</span>
                  </div>
                  <div className="quote-details">
                    <p><strong>Route:</strong> {quote.pickupLocation} → {quote.dropoffLocation}</p>
                    <p><strong>Vehicle:</strong> {quote.vehicleType}</p>
                    <p><strong>Date:</strong> {new Date(quote.tripDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {quote.tripTime}</p>
                    <p><strong>Final Price:</strong> R {quote.finalPrice || quote.estimatedPrice}</p>
                    {quote.adminNotes && (
                      <p><strong>Admin Notes:</strong> {quote.adminNotes}</p>
                    )}
                    {quote.sentToCustomerAt && (
                      <p className="quote-sent-date">
                        <small>Sent on: {new Date(quote.sentToCustomerAt).toLocaleDateString()}</small>
                      </p>
                    )}
                  </div>
                  <div className="quote-actions">
                    <button
                      className="btn-accept"
                      onClick={() => handleAcceptQuote(quote._id)}
                    >
                      Accept Quote
                    </button>
                    <button
                      className="btn-decline"
                      onClick={() => handleDeclineQuote(quote._id)}
                    >
                      Decline
                    </button>
                    <button
                      className="btn-view-details"
                      onClick={() => {
                        setSelectedQuote(quote);
                        setShowQuoteModal(true);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SERVICES */}
      <section className="services-area">
        <div className="services-row container">
          <div className="service-card">
            <h4>Airport Transfers</h4>
            <p>Enjoy hassle-free airport pick-ups and drop-offs with professional drivers and reliable, comfortable rides.</p>
          </div>
          <div className="service-card">
            <h4>Conference Shuttle Hire</h4>
            <p>Keep events running smoothly with daily shuttle services between venues and hotels — on time and comfortable.</p>
          </div>
          <div className="service-card">
            <h4>Sports Tours</h4>
            <p>Travel stress-free with transport for teams and supporters to stadiums and events. Safe and coordinated.</p>
          </div>
          <div className="service-card">
            <h4>Events & Leisure Travel</h4>
            <p>Whether weddings or private functions, we arrange travel that combines comfort, style and safety.</p>
          </div>
        </div>

        <div className="quote-cta-wrap">
          <button className="request-cta" onClick={handleRequestQuote}>REQUEST A QUOTE</button>
        </div>
      </section>

      {/* PERSONAL HIGHLIGHTS */}
      <section className="highlights">
        <div className="section-title">Personal Highlights</div>
        <table className="highlights-table" aria-describedby="highlights-desc">
          <thead>
            <tr>
              <th className="badge-col">BADGE</th>
              <th className="stat-col">STAT</th>
              <th>DESCRIPTION</th>
            </tr>
          </thead>
          <tbody>
            {highlights.map((item, index) => (
              <tr key={index}>
                <td className="badge-col">{item.badge}</td>
                <td className="stat-col">{item.stat}</td>
                <td>{item.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* RECENT TRIPS - Only show if user has trips */}
      {userBookings.length > 0 && (
        <section className="recent-trips">
          <div className="container">
            <div className="section-title">Your Recent Trips</div>
            <div className="trips-grid">
              {userBookings.slice(0, 3).map((booking, index) => (
                <div key={index} className="trip-card">
                  <div className="trip-type">{booking.tripType}</div>
                  <div className="trip-date">
                    {new Date(booking.tripDate).toLocaleDateString()}
                  </div>
                  <div className="trip-route">
                    {booking.pickupLocation} → {booking.dropoffLocation}
                  </div>
                  <div className={`trip-status status-${booking.status}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* REVIEWS */}
      <section className="reviews-wrap" aria-labelledby="reviewsTitle">
        <div className="container">
          <div id="reviewsTitle" className="section-title review-section-title">
            {userData.tripsCompleted > 0 ? 'Leave us a review' : 'Share your expectations'}
          </div>
          <p className="reviews-sub">
            {userData.tripsCompleted > 0
              ? 'How was your last trip?'
              : 'Tell us what you\'re looking forward to!'
            }
          </p>
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <select name="rating" required>
              <option value="">Rating...</option>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Okay</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Bad</option>
            </select>
            <textarea
              name="testimonial"
              placeholder={
                userData.tripsCompleted > 0
                  ? "Share your experience with your recent trip..."
                  : "What are you most excited about for your upcoming travel?"
              }
            ></textarea>
            <button type="submit" className="review-submit">SUBMIT {userData.tripsCompleted > 0 ? 'REVIEW' : 'FEEDBACK'}</button>
          </form>
        </div>
      </section>

      {/* Quote Details Modal */}
      {showQuoteModal && selectedQuote && (
        <div className="modal-overlay" onClick={() => setShowQuoteModal(false)}>
          <div className="modal-content quote-details-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Quote Details</h3>
            <div className="quote-full-details">
              <div className="detail-group">
                <h4>Trip Information</h4>
                <p><strong>Type:</strong> {selectedQuote.tripType}</p>
                <p><strong>Purpose:</strong> {selectedQuote.tripPurpose}</p>
                <p><strong>Destination:</strong> {selectedQuote.destination}</p>
                <p><strong>Route:</strong> {selectedQuote.pickupLocation} → {selectedQuote.dropoffLocation}</p>
                <p><strong>Vehicle:</strong> {selectedQuote.vehicleType}</p>
                <p><strong>Date:</strong> {new Date(selectedQuote.tripDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedQuote.tripTime}</p>
                <p><strong>Direction:</strong> {selectedQuote.isOneWay ? 'One Way' : 'Both Ways'}</p>
              </div>

              <div className="detail-group">
                <h4>Pricing</h4>
                <p><strong>Estimated Price:</strong> R {selectedQuote.estimatedPrice}</p>
                <p><strong>Final Price:</strong> R {selectedQuote.finalPrice || selectedQuote.estimatedPrice}</p>
                {selectedQuote.adminNotes && (
                  <>
                    <h4>Admin Notes</h4>
                    <p>{selectedQuote.adminNotes}</p>
                  </>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-accept"
                onClick={() => {
                  handleAcceptQuote(selectedQuote._id);
                  setShowQuoteModal(false);
                }}
              >
                Accept Quote
              </button>
              <button
                className="btn-decline"
                onClick={() => {
                  handleDeclineQuote(selectedQuote._id);
                  setShowQuoteModal(false);
                }}
              >
                Decline Quote
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowQuoteModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <ChatWidget />
    </>
  );
};

export default Dashboard;
