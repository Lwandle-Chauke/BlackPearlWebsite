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
  const [refreshing, setRefreshing] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    loyaltyPoints: 0,
    tripsCompleted: 0,
    memberSince: "2025",
    profilePicture: "",
    discountEarned: 0,
    tier: ""
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

  // Refresh user data
  const refreshUserData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && onUserUpdate) {
          onUserUpdate(data.user); // Update parent component
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fixLoyaltyPoints = async () => {
  try {
    setRefreshing(true);
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/quotes/fix-loyalty-points', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.success) {
      alert(`✅ Loyalty points fixed!\nNew points: ${result.data.pointsAdded}\nNew tier: ${result.data.newTier}`);
      
      // Update local state so the UI reflects new values immediately
      const updatedProfile = {
        ...profileData,
        loyaltyPoints: result.data.newPoints,
        tier: result.data.newTier
      };
      setProfileData(updatedProfile);
    } else {
      alert('❌ Failed to fix points: ' + result.error);
    }
  } catch (error) {
    console.error('Fix points error:', error);
    alert('❌ Error fixing points: ' + error.message);
  } finally {
    setRefreshing(false);
  }
};


  // Auto-fix loyalty points if they don't match completed trips
  useEffect(() => {
    if (currentUser && userQuotes.length > 0) {
      const completedTrips = userQuotes.filter(quote => quote.status === 'completed').length;
      const hasCompletedTrips = completedTrips > 0;
      const hasNoPoints = currentUser.loyaltyPoints === 0;
      
      if (hasCompletedTrips && hasNoPoints) {
        // Auto-fix if user has completed trips but zero points
        fixLoyaltyPoints();
      }
    }
  }, [currentUser, userQuotes]);

  // Fetch quotes and calculate REAL data like Dashboard does
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
      loyaltyPoints: currentUser.loyaltyPoints || 0,
      memberSince: currentUser.memberSince || "2025",
      tier: currentUser.tier || "bronze"
    }));

    fetchUserQuotes();
  }, [currentUser]);

  const fetchUserQuotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/quotes/my-quotes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setUserQuotes(data.data);
        
        // Calculate REAL trips completed exactly like Dashboard does
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
          discountEarned: calculateDiscountValue(prev.loyaltyPoints),
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

  // Calculate discount value based on loyalty points (same logic as loyaltyService)
  const calculateDiscountValue = (points) => {
    const discountAmount = Math.floor(points / 100) * 10;
    return Math.min(discountAmount, 500); // Max R500 discount
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

  // Calculate real stats from quotes data (like Dashboard does)
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
            {refreshing && <div style={{color: '#666', fontSize: '0.9rem'}}>Updating loyalty points...</div>}
          </div>

          <div className="profile-pic-section">
            <img src={profilePicture} alt={`${profileData.firstName}'s Profile`} className="profile-pic" />
            <div className="profile-name">{profileData.firstName} {profileData.lastName}</div>
            <div className="profile-tier">{profileData.tier.charAt(0).toUpperCase() + profileData.tier.slice(1)} Member</div>
          </div>

          <div className="profile-info-static">
            <div className="info-section">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item"><label>First Name</label><div className="info-value">{profileData.firstName || "Not set"}</div></div>
                <div className="info-item"><label>Last Name</label><div className="info-value">{profileData.lastName || "Not set"}</div></div>
                <div className="info-item"><label>Email</label><div className="info-value">{profileData.email || "Not set"}</div></div>
                <div className="info-item"><label>Phone</label><div className="info-value">{profileData.phone || "Not set"}</div></div>
                <div className="info-item">
  <label>Member Since</label>
  <div className="info-value">{profileData.memberSince}</div>
</div>
<div className="info-item">
  <label>Membership Tier</label>
  <div className="info-value">
    {profileData.tier.charAt(0).toUpperCase() + profileData.tier.slice(1)}
  </div>
</div>

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
                  disabled={refreshing}
                >
                  Change Password
                </button>
                <button 
                  className="contact-support-btn"
                  onClick={() => alert("Please email support@blackpearltours.com for profile changes.")}
                  disabled={refreshing}
                >
                  Request Profile Changes
                </button>
                {/* Manual fix button for testing */}
                <button 
                  className="password-reset-btn"
                  onClick={fixLoyaltyPoints}
                  disabled={refreshing}
                  style={{background: '#ff6b35'}}
                >
                  {refreshing ? 'Fixing...' : 'Calculate Loyalty Points'}
                </button>
              </div>
            </div>
          </div>

          
          {/* Stats Section - Using REAL calculated data */}
<div className="stats-section">
  <div className="stat-card">
    <h3>{profileData?.loyaltyPoints || 0}</h3>
    <p>Loyalty Points</p>
  </div>
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
    <h3>R {calculateDiscountValue(profileData?.loyaltyPoints || 0).toFixed(0)}</h3>
    <p>Available Discount</p>
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