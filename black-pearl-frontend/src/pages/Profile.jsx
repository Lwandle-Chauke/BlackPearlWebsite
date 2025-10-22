import React, { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import "../styles/style.css";
import "../styles/profile.css";

// Placeholder image URL
const PLACEHOLDER_IMG = "https://placehold.co/120x120/000/fff?text=R"; 

const Profile = () => {
  const navigate = useNavigate(); // Hook for navigation
  const fileInputRef = useRef(null); // Reference to the hidden file input
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isLoggedIn = true; // Assume logged in for the profile page
  
  // State for profile picture, initialized with a placeholder
  const [profilePicture, setProfilePicture] = useState(PLACEHOLDER_IMG); 
  
  const [profileData, setProfileData] = useState({
    firstName: "Rae",
    lastName: "Smith",
    email: "rae@example.com",
    phone: "0123456789",
    company: "Black Pearl Tours",
    address: "123 Main Street",
    city: "Cape Town",
    postalCode: "8000",
    country: "South Africa",
    dob: "1995-05-20",
    loyaltyPoints: 1200,
    tripsCompleted: 5
  });

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // New logic to handle Sign In/Out click (Matching Bookings.jsx)
  const handleAuthClick = () => {
    if (isLoggedIn) {
      // Logic for signing out (In a real app: clear tokens, reset global state)
      alert("You have been signed out. Redirecting to the home page.");
      navigate('/'); // Redirect to the home page after sign out
    } else {
      openAuthModal();
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // In a real application, you would save the text data and upload the image file separately.
    alert("Profile updated successfully!");
  };
  
  // Function to handle image file selection and update the preview
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Revoke the previous object URL to avoid memory leaks
      if (profilePicture.startsWith('blob:')) {
        URL.revokeObjectURL(profilePicture);
      }
      // Create a new local URL for the image file
      const imageUrl = URL.createObjectURL(file);
      setProfilePicture(imageUrl);
    }
  };

  // Dummy data for bookings
  const upcomingBooking = {
    title: "Garden Route Adventure",
    date: "10 March 2026",
    status: "Confirmed"
  };
  
  const pastBookings = [
    { id: 1, destination: "Cape Town Peninsula Tour", date: "2024-01-15", cost: "R 2,500" },
    { id: 2, destination: "Winelands Day Trip", date: "2023-11-05", cost: "R 1,800" },
    { id: 3, destination: "Shark Cage Diving", date: "2023-08-22", cost: "R 3,200" },
  ];

  return (
    <>
      {/* Updated Header call to match the Bookings component */}
      <Header isLoggedIn={isLoggedIn} onAuthClick={handleAuthClick} />
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />}

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
              // Trigger the hidden file input when the image is clicked
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
          {/* END PROFILE PICTURE SECTION */}


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
          </div>

        </section>
      </main>

      <Footer />
    </>
  );
};

export default Profile;
