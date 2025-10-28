import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/style.css';
import '../styles/dashboard.css';
import ChatWidget from "../chatbot/ChatWidget";
import axios from 'axios'; // Import axios

const Dashboard = ({ user, onSignOut, isLoggedIn, currentUser, onUserUpdate }) => {
  const navigate = useNavigate();
  const [userBookings, setUserBookings] = useState([]);
  const [nextBooking, setNextBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false); // New state for upload modal
  const [selectedFiles, setSelectedFiles] = useState([]); // New state for selected files
  const [altText, setAltText] = useState(''); // New state for alt text
  const [uploading, setUploading] = useState(false); // New state for upload status

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

  // Handle image file selection
  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });
    formData.append('altText', altText);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      };
      const res = await axios.post('http://localhost:5000/api/images/upload', formData, config);
      alert(res.data.msg);
      setSelectedFiles([]);
      setAltText('');
      setShowUploadModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Image upload failed');
    } finally {
      setUploading(false);
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

  // Calculate real user data based on actual trips
  const calculateUserData = () => {
    const completedTrips = userBookings.filter(booking =>
      booking.status === 'completed'
    ).length;

    // Calculate total spent from completed trips
    const totalSpent = userBookings
      .filter(booking => booking.status === 'completed' && booking.finalPrice)
      .reduce((total, booking) => total + (booking.finalPrice || 0), 0);

    // Use actual user data from backend
    return {
      name: currentUser?.name || "Guest",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      tripsCompleted: completedTrips,
      totalSpent: totalSpent,
      memberSince: currentUser?.memberSince ? new Date(currentUser.memberSince).getFullYear().toString() : "2025",
      totalBookings: userBookings.length,
      upcomingTrips: userBookings.filter(booking =>
        booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'booked'
      ).length
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
      navigate('/quote');
    }
  };

  const handleRequestQuote = () => {
    navigate('/quote');
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
        {isLoggedIn && (
          <div className="upload-image-section">
            <button className="btn-upload-image" onClick={() => setShowUploadModal(true)}>
              <i className="fas fa-cloud-upload-alt"></i> Upload Gallery Images
            </button>
          </div>
        )}
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

      {/* Image Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content upload-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Upload Images to Gallery</h3>
            <form onSubmit={handleImageUpload}>
              <div className="form-group">
                <label htmlFor="image-files">Select Images:</label>
                <input
                  type="file"
                  id="image-files"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="alt-text">Alt Text (optional):</label>
                <input
                  type="text"
                  id="alt-text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe your images"
                  disabled={uploading}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-upload" disabled={selectedFiles.length === 0 || uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setShowUploadModal(false)} disabled={uploading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <ChatWidget />
    </>
  );
};

export default Dashboard;
