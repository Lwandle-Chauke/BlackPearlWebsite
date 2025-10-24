import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import "../styles/style.css";
import "../styles/profile.css";

// Placeholder image URL
const PLACEHOLDER_IMG = "https://placehold.co/120x120/000/fff?text=R"; 

const Profile = ({ user, onSignOut, isLoggedIn, currentUser }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // State for profile picture, initialized with a placeholder
  const [profilePicture, setProfilePicture] = useState(PLACEHOLDER_IMG); 
  
  // Initialize profile data with currentUser data
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "Black Pearl Tours",
    address: "123 Main Street",
    city: "Cape Town",
    postalCode: "8000",
    country: "South Africa",
    dob: "1995-05-20",
    loyaltyPoints: 1200,
    tripsCompleted: 5,
    memberSince: "2024"
  });

  // Update profile data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileData(prev => ({
        ...prev,
        firstName: currentUser.name || "",
        lastName: currentUser.surname || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        loyaltyPoints: currentUser.loyaltyPoints || 1200,
        tripsCompleted: currentUser.tripsCompleted || 5,
        memberSince: currentUser.memberSince || "2024"
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Profile updated successfully!");
  };
  
  // Function to handle image file selection and update the preview
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (profilePicture.startsWith('blob:')) {
        URL.revokeObjectURL(profilePicture);
      }
      const imageUrl = URL.createObjectURL(file);
      setProfilePicture(imageUrl);
    }
  };

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
            <p>Manage your personal details and account preferences</p>
          </div>
          
          {/* PROFILE PICTURE SECTION */}
          <div className="profile-pic-section">
            <img 
              src={profilePicture} 
              alt={`${profileData.firstName}'s Profile`} 
              className="profile-pic"
              onClick={() => fileInputRef.current?.click()} 
              role="button"
              tabIndex="0"
            />
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }} 
            />
            <button 
              type="button" 
              className="upload-btn" 
              onClick={() => fileInputRef.current?.click()}
            >
              Change Picture
            </button>
          </div>

          <form className="profile-form" onSubmit={handleSave}>
            {/* Name */}
            <div className="input-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profileData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Contact */}
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* Company / DOB */}
            <div className="input-group">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                value={profileData.company}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={profileData.dob}
                onChange={handleChange}
              />
            </div>

            {/* Address */}
            <div className="input-group full-width">
              <label htmlFor="address">Street Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={profileData.address}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={profileData.city}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="postalCode">Postal Code</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={profileData.postalCode}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={profileData.country}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="save-btn">Save Changes</button>
          </form>

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
              <h3>R {profileData.loyaltyPoints * 0.1}</h3>
              <p>Discount Value</p>
            </div>
            <div className="stat-card">
              <h3>{profileData.memberSince}</h3>
              <p>Member Since</p>
            </div>
          </div>

          {/* Sign Out Button in Profile */}
          <div className="profile-actions">
            <button 
              className="sign-out-btn" 
              onClick={onSignOut}
              style={{
                background: '#ff4444',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: '"Poppins", sans-serif',
                marginTop: '20px',
                width: '100%'
              }}
            >
              Sign Out
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Profile;