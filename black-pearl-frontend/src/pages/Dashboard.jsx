// components/pages/Dashboard.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
// Assuming AuthModal is a reusable component for sign-in/register
import AuthModal from '../components/AuthModal'; 
import '../styles/style.css'; 
import '../styles/dashboard.css'; // New CSS file

const Dashboard = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // --- Dynamic Data (Replaces the inline <script> in HTML) ---
  const [userData, setUserData] = useState({
    name: "Rae",
    nextBooking: {
      title: "Cape Town Tours",
      date: "15 September 2025",
      status: "Confirmed"
    }
  });

  const handleViewDetails = () => {
    alert(`${userData.nextBooking.title}\nDate: ${userData.nextBooking.date}\nStatus: ${userData.nextBooking.status}`);
  };

  const handleRequestQuote = () => {
    const name = prompt("Enter your name to request a quote:", userData.name || "");
    if(name) alert(`Thanks ${name}! We'll contact you about a quote.`);
    // In a real app, you would redirect to the quote page: navigate('/quote');
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const rating = e.target.rating.value;
    const text = e.target.testimonial.value.trim();
    
    if(!rating){ 
      alert("Please choose a rating."); 
      return; 
    }
    alert(`Thanks for your feedback (${rating} stars).\n"${text}"`);
    e.target.reset();
  };

  const highlights = [
    { badge: '🏅', stat: '5 Trips Completed', desc: "You've completed 5 trips with Black Pearl Tours!" },
    { badge: '⏱️', stat: '15 Hours Saved', desc: "You've saved 15 hours of travel planning." },
    { badge: '🧭', stat: '1,200 km Traveled', desc: "This year, you've traveled 1,200 km with us." },
    { badge: '⭐', stat: '4.9 / 5 Rating', desc: "Your average feedback score from past trips." },
    { badge: '🎖️', stat: 'VIP Member', desc: "You are now a VIP member of Black Pearl Tours!" }
  ];

  return (
    <>
      <Header onSignInClick={openAuthModal} />
      
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />}

      {/* HERO */}
      <section className="hero-wrap">
        <div className="hero-overlay">
          <div className="container">
            <div className="hero-content">
              <div className="hero-title">Welcome Back, {userData.name}</div>
              <div className="hero-sub">Ready for your next adventure?</div>

              {/* Booking card (dynamic placeholders) */}
              <div className="booking-card-wrap">
                <div className="booking-card" role="region" aria-label="Your next booking">
                  <div className="booking-info">
                    <div className="booking-label">Your Next Booking:</div>
                    <div className="booking-title">{userData.nextBooking.title}</div>
                    <div className="booking-date">{userData.nextBooking.date}</div>
                    <div className="booking-status">{userData.nextBooking.status}</div>
                  </div>
                  <button className="view-btn" onClick={handleViewDetails}>VIEW DETAILS</button>
                </div>
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
        <div className="section-title">PERSONAL HIGHLIGHTS</div>
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

      {/* REVIEWS */}
      <section className="reviews-wrap" aria-labelledby="reviewsTitle">
        <div className="container">
          <div id="reviewsTitle" className="section-title review-section-title">REVIEWS</div>
          <p className="reviews-sub">How was your last trip?</p>
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <select name="rating" required>
              <option value="">Rating...</option>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Okay</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Bad</option>
            </select>
            <textarea name="testimonial" placeholder="Your Testimonial"></textarea>
            <button type="submit" className="review-submit">SUBMIT REVIEW</button>
          </form>
        </div>
      </section>

      {/* Floating chat icon (Assuming it is defined in Header/Footer or globally) */}
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