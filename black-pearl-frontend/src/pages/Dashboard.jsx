import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/style.css'; 
import '../styles/dashboard.css';

const Dashboard = ({ user, onSignOut, isLoggedIn, currentUser }) => {
  const navigate = useNavigate();
  const [userBookings, setUserBookings] = useState([]);
  const [nextBooking, setNextBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user's bookings when component mounts or currentUser changes
  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchUserBookings();
    }
  }, [currentUser]);

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/user/${currentUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserBookings(data.data || []);
        
        // Find next upcoming booking
        const upcoming = data.data?.filter(booking => 
          booking.status === 'confirmed' || booking.status === 'pending'
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

  // Calculate real user data based on actual trips
  const calculateUserData = () => {
    const completedTrips = userBookings.filter(booking => 
      booking.status === 'completed'
    ).length;

    // Calculate loyalty points: 100 points per completed trip + 50 points per pending/confirmed trip
    const basePoints = completedTrips * 100;
    const upcomingTrips = userBookings.filter(booking => 
      booking.status === 'confirmed' || booking.status === 'pending'
    ).length;
    const bonusPoints = upcomingTrips * 50;
    
    const totalLoyaltyPoints = (currentUser?.loyaltyPoints || 0) + basePoints + bonusPoints;

    return {
      name: currentUser?.name || "Guest",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      loyaltyPoints: totalLoyaltyPoints,
      tripsCompleted: completedTrips,
      memberSince: currentUser?.memberSince || "2025",
      totalBookings: userBookings.length,
      upcomingTrips: upcomingTrips
    };
  };

  const userData = calculateUserData();

  // Personal highlights based on REAL user activity
  const getPersonalHighlights = () => {
    const highlights = [
      { 
        badge: '🏅', 
        stat: `${userData.tripsCompleted} Trips Completed`, 
        desc: `You've completed ${userData.tripsCompleted} trips with Black Pearl Tours!` 
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
      { 
        badge: '📅', 
        stat: `${userData.upcomingTrips} Upcoming Trips`, 
        desc: `You have ${userData.upcomingTrips} trips planned with us.` 
      },
    ];

    // Add VIP status if user has enough trips
    if (userData.tripsCompleted >= 5) {
      highlights.push({ 
        badge: '🎖️', 
        stat: 'VIP Member', 
        desc: "You are now a VIP member of Black Pearl Tours!" 
      });
    }

    // Add loyalty points highlight
    highlights.push({ 
      badge: '💰', 
      stat: `${userData.loyaltyPoints} Points`, 
      desc: `You have ${userData.loyaltyPoints} loyalty points to redeem.` 
    });

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
      navigate('/quote');
    }
  };

  const handleRequestQuote = () => {
    navigate('/quote');
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const rating = e.target.rating.value;
    const text = e.target.testimonial.value.trim();
    
    if (!rating) {
      alert("Please choose a rating."); 
      return; 
    }

    // In a real app, you would submit this to your backend
    console.log('Review submitted:', { rating, text, userId: currentUser?.id });
    
    alert(`Thanks for your feedback (${rating} stars).\n"${text}"`);
    e.target.reset();
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

export default Dashboard;