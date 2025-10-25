import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChangePasswordModal from '../components/ChangePasswordModal';
import "../styles/style.css";
import "../styles/profile.css";

const Profile = ({ user, onSignOut, isLoggedIn, currentUser }) => {
  const navigate = useNavigate();
  
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [userQuotes, setUserQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);

  const generateInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  const getPlaceholderImage = (firstName, lastName) => {
    const initials = generateInitials(firstName, lastName) || 'U';
    return `https://placehold.co/120x120/000/fff?text=${initials}`;
  };

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    loyaltyPoints: 0,
    tripsCompleted: 0,
    memberSince: "2025",
    profilePicture: ""
  });

  // Fetch user's quotes
  useEffect(() => {
    if (currentUser) {
      const firstName = currentUser.name || "";
      const lastName = currentUser.surname || "";
      
      setProfileData({
        firstName: firstName,
        lastName: lastName,
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        loyaltyPoints: currentUser.loyaltyPoints || 0,
        tripsCompleted: currentUser.tripsCompleted || 0,
        memberSince: currentUser.memberSince || "2025",
        profilePicture: currentUser.profilePicture || ""
      });

      fetchUserQuotes();
    }
  }, [currentUser]);

  const fetchUserQuotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/quotes/my-quotes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUserQuotes(data.data);
      } else {
        console.error('Failed to fetch quotes:', data.error);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleChangePasswordClick = () => {
    setShowChangePasswordModal(true);
  };

  const handlePasswordChangeSuccess = () => {
    setShowChangePasswordModal(false);
  };

  const handleDownloadQuote = (quote) => {
    // Create PDF content
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

    // Create blob and download
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

  const profilePicture = currentUser?.profilePicture || getPlaceholderImage(profileData.firstName, profileData.lastName);

  return (
    <>
      <Header 
        onAuthClick={onSignOut} 
        isLoggedIn={isLoggedIn} 
        user={currentUser}
        onSignOut={onSignOut}
      />

      <main className="profile-page">
        <section className="profile-container">
          <div className="profile-header">
            <h2>My Profile</h2>
            <p>View your personal details and account information</p>
          </div>
          
          {/* PROFILE PICTURE SECTION */}
          <div className="profile-pic-section">
            <img 
              src={profilePicture} 
              alt={`${profileData.firstName}'s Profile`} 
              className="profile-pic"
            />
            <div className="profile-name">
              {profileData.firstName} {profileData.lastName}
            </div>
          </div>

          {/* PROFILE INFORMATION */}
          <div className="profile-info-static">
            <div className="info-section">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>First Name</label>
                  <div className="info-value">{profileData.firstName || "Not set"}</div>
                </div>
                <div className="info-item">
                  <label>Last Name</label>
                  <div className="info-value">{profileData.lastName || "Not set"}</div>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <div className="info-value">{profileData.email || "Not set"}</div>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <div className="info-value">{profileData.phone || "Not set"}</div>
                </div>
              </div>
            </div>

            {/* QUOTE REQUESTS SECTION */}
            <div className="info-section">
              <h3>My Quote Requests</h3>
              {loadingQuotes ? (
                <div className="loading-quotes">Loading your quotes...</div>
              ) : userQuotes.length === 0 ? (
                <div className="no-quotes">
                  <p>You haven't requested any quotes yet.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => navigate('/quote')}
                  >
                    Request Your First Quote
                  </button>
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
                          <td>
                            <div className="trip-details">
                              <strong>{quote.tripType}</strong>
                              <div>{quote.pickupLocation} → {quote.dropoffLocation}</div>
                              <small>{quote.destination}</small>
                            </div>
                          </td>
                          <td>{quote.vehicleType}</td>
                          <td>
                            {new Date(quote.tripDate).toLocaleDateString()}
                            <br />
                            <small>{quote.tripTime}</small>
                          </td>
                          <td>
                            <strong>R {quote.estimatedPrice}</strong>
                            {quote.finalPrice && (
                              <div>
                                <small>Final: R {quote.finalPrice}</small>
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge status-${quote.status}`}>
                              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn-download"
                              onClick={() => handleDownloadQuote(quote)}
                              title="Download Quote"
                            >
                              📄 Download
                            </button>
                          </td>
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

          {/* Loyalty Stats */}
          <div className="stats-section">
            <div className="stat-card">
              <h3>{profileData.loyaltyPoints}</h3>
              <p>Loyalty Points</p>
            </div>
            <div className="stat-card">
              <h3>{profileData.tripsCompleted}</h3>
              <p>Trips Completed</p>
            </div>
            <div className="stat-card">
              <h3>R {(profileData.loyaltyPoints * 0.01).toFixed(2)}</h3>
              <p>Discount Value</p>
            </div>
            <div className="stat-card">
              <h3>{profileData.memberSince}</h3>
              <p>Member Since</p>
            </div>
          </div>
        </section>
      </main>

      {/* Change Password Modal */}
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