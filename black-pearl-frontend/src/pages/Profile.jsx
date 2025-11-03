import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChangePasswordModal from '../components/ChangePasswordModal';
import "../styles/style.css";
import "../styles/profile.css";

const Profile = ({ user, onSignOut, isLoggedIn, currentUser, onUserUpdate }) => {
  const navigate = useNavigate();

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [userQuotes, setUserQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    memberSince: "2025",
    profilePicture: ""
  });

  const generateInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  const getPlaceholderImage = (firstName, lastName) => {
    const initials = generateInitials(firstName, lastName) || 'U';
    return `https://placehold.co/120x120/000/fff?text=${initials}`;
  };

  // Fetch quotes and calculate data
  useEffect(() => {
    if (!currentUser) return;

    // Set basic profile info
    setProfileData(prev => ({
      ...prev,
      firstName: currentUser.name || "",
      lastName: currentUser.surname || "",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
      profilePicture: currentUser.profilePicture || "",
      memberSince: currentUser.memberSince || "2025"
    }));

    fetchUserQuotes();
  }, [currentUser]);

  const fetchUserQuotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/quotes/my-quotes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setUserQuotes(data.data);
        
        // Calculate REAL trips completed
        const completedTrips = data.data.filter(booking => 
          booking.status === 'completed'
        ).length;

        // Calculate total spent from completed trips
        const totalSpent = data.data
          .filter(booking => booking.status === 'completed' && booking.finalPrice)
          .reduce((total, booking) => total + (booking.finalPrice || 0), 0);

        // Update profile data with REAL calculated values
        setProfileData(prev => ({
          ...prev,
          tripsCompleted: completedTrips,
          totalSpent: totalSpent
        }));
      } else {
        console.error('Failed to fetch quotes:', data.error);
      }
    } catch (err) {
      console.error('Error fetching quotes:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleChangePasswordClick = () => setShowChangePasswordModal(true);
  const handlePasswordChangeSuccess = () => setShowChangePasswordModal(false);

  const handleDownloadQuote = (quote) => {
    const pdfContent = `
BLACK PEARL TOURS - QUOTATION
==============================

Quote ID: ${quote._id}
Date: ${new Date(quote.createdAt).toLocaleDateString()}

CUSTOMER DETAILS:
Name: ${quote.customerName}
Email: ${quote.customerEmail}
Phone: ${quote.customerPhone}
${quote.customerCompany ? `Company: ${quote.customerCompany}` : ''}

TRIP DETAILS:
Purpose: ${quote.tripPurpose}
Type: ${quote.tripType}
Destination: ${quote.destination}
${quote.customDestination ? `Custom Destination: ${quote.customDestination}` : ''}
Pickup: ${quote.pickupLocation}
Drop-off: ${quote.dropoffLocation}
Vehicle: ${quote.vehicleType}
Trip: ${quote.isOneWay ? 'One Way' : 'Both Ways'}
Date: ${new Date(quote.tripDate).toLocaleDateString()}
Time: ${quote.tripTime}

PRICING:
Estimated Price: R ${quote.estimatedPrice}
${quote.finalPrice ? `Final Price: R ${quote.finalPrice}` : 'Status: Pending'}

Status: ${quote.status.toUpperCase()}
${quote.adminNotes ? `Admin Notes: ${quote.adminNotes}` : ''}

Thank you for choosing Black Pearl Tours!
`;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quote-${quote._id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate real stats from quotes data
  const completedTrips = userQuotes.filter(quote => quote.status === 'completed').length;
  const totalBookings = userQuotes.length;
  const upcomingTrips = userQuotes.filter(quote => 
    quote.status === 'confirmed' || quote.status === 'pending' || quote.status === 'booked'
  ).length;

  const profilePicture = profileData.profilePicture || getPlaceholderImage(profileData.firstName, profileData.lastName);

  return (
    <>
      <Header 
        onAuthClick={onSignOut} 
        isLoggedIn={isLoggedIn} 
        user={currentUser}
      />

      <main className="profile-page">
        <section className="profile-container">
          <div className="profile-header">
            <h2>My Profile</h2>
            <p>View your personal details and account information</p>
          </div>

          <div className="profile-pic-section">
            <img src={profilePicture} alt={`${profileData.firstName}'s Profile`} className="profile-pic" />
            <div className="profile-name">{profileData.firstName} {profileData.lastName}</div>
          </div>

          <div className="profile-info-static">
            <div className="info-section">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item"><label>First Name</label><div className="info-value">{profileData.firstName || "Not set"}</div></div>
                <div className="info-item"><label>Last Name</label><div className="info-value">{profileData.lastName || "Not set"}</div></div>
                <div className="info-item"><label>Email</label><div className="info-value">{profileData.email || "Not set"}</div></div>
                <div className="info-item"><label>Phone</label><div className="info-value">{profileData.phone || "Not set"}</div></div>
              </div>
            </div>

            <div className="info-section">
              <h3>My Quote Requests</h3>
              {loadingQuotes ? (
                <div>Loading your quotes...</div>
              ) : userQuotes.length === 0 ? (
                <div>
                  <p>You haven't requested any quotes yet.</p>
                  <button className="btn-primary" onClick={() => navigate('/quote')}>Request Your First Quote</button>
                </div>
              ) : (
                <div className="quotes-table-container">
                  <table className="quotes-table">
                    <thead>
                      <tr>
                        <th>Quote ID</th>
                        <th>Trip Details</th>
                        <th>Vehicle</th>
                        <th>Date</th>
                        <th>Estimated Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userQuotes.map(quote => (
                        <tr key={quote._id}>
                          <td>#{quote._id.slice(-6).toUpperCase()}</td>
                          <td className="trip-details">
                            <strong>{quote.tripType}</strong><br />
                            {quote.pickupLocation} → {quote.dropoffLocation}<br />
                            <small>{quote.destination}</small>
                          </td>
                          <td>{quote.vehicleType}</td>
                          <td>{new Date(quote.tripDate).toLocaleDateString()}<br /><small>{quote.tripTime}</small></td>
                          <td>R {quote.estimatedPrice}{quote.finalPrice && <div><small>Final: R {quote.finalPrice}</small></div>}</td>
                          <td><span className={`status-badge status-${quote.status}`}>{quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}</span></td>
                          <td><button className="btn-download" onClick={() => handleDownloadQuote(quote)}>📄 Download</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Account Actions */}
            <div className="account-actions">
              <h3>Account Management</h3>
              <div className="action-buttons">
                <button 
                  className="password-reset-btn"
                  onClick={handleChangePasswordClick}
                >
                  Change Password
                </button>
                <button 
                  className="contact-support-btn"
                  onClick={() => alert("Please email support@blackpearltours.com for profile changes.")}
                >
                  Request Profile Changes
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section - Using REAL calculated data */}
          <div className="stats-section">
            <div className="stat-card">
              <h3>{completedTrips}</h3>
              <p>Trips Completed</p>
            </div>
            <div className="stat-card">
              <h3>{totalBookings}</h3>
              <p>Total Bookings</p>
            </div>
            <div className="stat-card">
              <h3>{upcomingTrips}</h3>
              <p>Upcoming Trips</p>
            </div>
            <div className="stat-card">
              <h3>{profileData.memberSince}</h3>
              <p>Member Since</p>
            </div>
          </div>

        </section>
      </main>

      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
          onPasswordChange={handlePasswordChangeSuccess}
        />
      )}

      <Footer />
    </>
  );
};

export default Profile;