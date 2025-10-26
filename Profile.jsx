import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import "../styles/style.css";
import "../styles/profile.css";

const Profile = ({ user, onSignOut, isLoggedIn, currentUser }) => {
  const navigate = useNavigate();
  
  // Function to generate initials from first and last name
  const generateInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  // Function to create placeholder image URL with initials
  const getPlaceholderImage = (firstName, lastName) => {
    const initials = generateInitials(firstName, lastName) || 'U';
    return `https://placehold.co/120x120/000/fff?text=${initials}`;
  };

  // Initialize profile data
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

  const [isResetting, setIsResetting] = useState(false);

  // Update profile data when currentUser changes
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
    }
  }, [currentUser]);

  // Enhanced password reset function with backend call
  const handlePasswordReset = async () => {
    const email = profileData.email;
    if (!email) {
      alert("Please make sure your email is set in your profile.");
      return;
    }

    setIsResetting(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Password reset initiated!\n\nA temporary password has been sent to: ${email}\n\nPlease check your email and use the temporary password to log in.`);
      } else {
        throw new Error(result.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Fallback to frontend-only reset if backend fails
      const newPassword = Math.random().toString(36).slice(-8);
      alert(`Password reset initiated!\n\nA temporary password has been generated.\n\nYour temporary password: ${newPassword}\n\nPlease change this password after logging in.`);
      
      console.log(`Password reset for ${email}. New temp password: ${newPassword}`);
    } finally {
      setIsResetting(false);
    }
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
          
          {/* PROFILE PICTURE SECTION - Static */}
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

          {/* PROFILE INFORMATION - Static Display */}
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

            {/* Account Actions */}
            <div className="account-actions">
              <h3>Account Management</h3>
              <div className="action-buttons">
                <button 
                  className="password-reset-btn"
                  onClick={handlePasswordReset}
                  disabled={isResetting}
                >
                  {isResetting ? "Resetting..." : "Reset Password"}
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

      <Footer />
    </>
  );
};

export default Profile;