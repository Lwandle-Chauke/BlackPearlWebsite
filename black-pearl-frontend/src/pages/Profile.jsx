import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import '../styles/style.css';
import '../styles/profile.css';

const Profile = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const saveProfile = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <Header onSignInClick={openAuthModal} />
      
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />}

      {/* Profile Section */}
      <div className="profile-container">
        <div className="profile-header">
          <h2>My Profile</h2>
          <p>Manage your personal information and travel preferences</p>
        </div>

        <form className="profile-form" id="profileForm">
          <div>
            <label htmlFor="firstName">First Name</label>
            <input type="text" id="firstName" defaultValue="Ntokozo" />
          </div>

          <div>
            <label htmlFor="lastName">Last Name</label>
            <input type="text" id="lastName" defaultValue="Mhlanga" />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" defaultValue="ntokozo@example.com" />
          </div>

          <div>
            <label htmlFor="phone">Phone</label>
            <input type="text" id="phone" defaultValue="+27 82 123 4567" />
          </div>

          <div className="full-width">
            <label htmlFor="preferences">Travel Preferences</label>
            <input type="text" id="preferences" placeholder="e.g., Airport Transfers, Sports Tours" />
          </div>

          <div className="full-width">
            <label htmlFor="password">Change Password</label>
            <input type="password" id="password" placeholder="Enter new password" />
          </div>

          <button type="button" className="save-btn" onClick={saveProfile}>
            Save Changes
          </button>
        </form>

        <div className="stats-section">
          <div className="stat-card">
            <h3>12</h3>
            <p>Trips Completed</p>
          </div>
          <div className="stat-card">
            <h3>Gold</h3>
            <p>Membership Level</p>
          </div>
          <div className="stat-card">
            <h3>Jan 2024</h3>
            <p>Member Since</p>
          </div>
        </div>
      </div>

      {/* Toast Message */}
      {showToast && (
        <div id="toast" className="toast show">
          Profile updated successfully!
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

export default Profile;