// components/pages/Gallery.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import '../styles/style.css';
import '../styles/gallery.css';

const Gallery = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // NOTE: Your original HTML header links suggest a logged-in dashboard view (Dashboard, Bookings, Profile).
  // I'm assuming you still want the Gallery content to render for now, but ensure your Header component
  // is providing the correct navigation links based on user state (logged in vs. logged out).

  const galleryItems = [
    { id: 1, image: "/images/vacation1.jpg", alt: "Holiday group", text: '"Made our holiday stress-free from start to finish." – Lerato M' },
    { id: 2, image: "/images/vacation2.jpg", alt: "Group adventure", text: '"Turned our group trip into a real adventure." – Priya S.' },
    { id: 3, image: "/images/vacation3.jpg", alt: "Sightseeing", text: '"Made sightseeing in Johannesburg so easy." – David N.' },
    { id: 4, image: "/images/vacation4.jpg", alt: "Bus to the game", text: '"Traveling to the game was half the fun!" – Jason L.' },
    { id: 5, image: "/images/vacation5.jpg", alt: "Beach trip", text: '"Relaxing by the ocean never felt this good!" – Amara P.' },
    { id: 6, image: "/images/vacation6.jpg", alt: "Mountain hike", text: '"The mountain views were breathtaking. Highly recommend!" – Sipho K.' },
    { id: 7, image: "/images/vacation7.jpg", alt: "City tour", text: '"Exploring the city was effortless and fun." – Thandi R.' },
    { id: 8, image: "/images/vacation8.jpg", alt: "Family trip", text: '"Our kids loved every moment of the trip!" – Johan D.' },
    { id: 9, image: "/images/vacation9.jpg", alt: "Safari adventure", text: '"Seeing wildlife up close was an unforgettable experience." – Lebo M.' },
    { id: 10, image: "/images/vacation10.jpg", alt: "Sunset cruise", text: '"Sunset on the water made the evening magical." – Aisha T.' }
  ];

  return (
    <>
      <Header onSignInClick={openAuthModal} />
      
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />}

      {/* Gallery Section */}
      <main className="gallery-section">
        <h1 className="gallery-title">GALLERY</h1> {/* Class added to h1 */}
        <div className="search-bar">
          <input type="text" placeholder="Search" disabled />
          <span className="close-btn">&times;</span> {/* Changed × to &times; entity */}
        </div>
        <div className="gallery-grid">
          {galleryItems.map(item => (
            <div key={item.id} className="card">
              <img src={item.image} alt={item.alt} />
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </main>

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

export default Gallery;