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

  // Replaced local paths with royalty-free image URLs from Unsplash
  const galleryItems = [
    { 
      id: 1, 
      image: "https://images.unsplash.com/photo-1510257321683-1628d05542a9?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      alt: "Large tourist bus parked on road", 
      text: '"Made our holiday stress-free from start to finish." – Lerato M' 
    },
    { 
      id: 2, 
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      alt: "Modern charter bus at sunset", 
      text: '"Turned our group trip into a real adventure." – Priya S.' 
    },
    { 
      id: 3, 
      image: "https://images.unsplash.com/photo-1590494056286-904c600f1359?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      alt: "Group tour looking at city sights", 
      text: '"Made sightseeing in Johannesburg so easy." – David N.' 
    },
    { 
      id: 4, 
      image: "https://images.unsplash.com/photo-1598501235123-53d9e7284f22?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      alt: "People loading luggage onto a coach bus", 
      text: '"Traveling to the game was half the fun!" – Jason L.' 
    },
    { 
      id: 5, 
      image: "https://images.unsplash.com/photo-1595034606137-9750d512a849?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      alt: "Bus interior with comfortable seats", 
      text: '"Relaxing by the ocean never felt this good!" – Amara P.' 
    },
    { 
      id: 6, 
      image: "https://images.unsplash.com/photo-1620898516104-51b666710471?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      alt: "Modern white tour bus on a coastal highway", 
      text: '"The mountain views were breathtaking. Highly recommend!" – Sipho K.' 
    },
    { 
      id: 7, 
      image: "https://images.unsplash.com/photo-1577777174668-3e582be6c043?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      alt: "Overhead view of a charter bus", 
      text: '"Exploring the city was effortless and fun." – Thandi R.' 
    },
    { 
      id: 8, 
      image: "https://images.unsplash.com/photo-1620898516147-380d39e31ffb?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      alt: "Luxury coach interior with tray tables", 
      text: '"Our kids loved every moment of the trip!" – Johan D.' 
    },
    { 
      id: 9, 
      image: "https://images.unsplash.com/photo-1502444330042-cdc735711680?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      alt: "Bus driving on a wide open road during a safari", 
      text: '"Seeing wildlife up close was an unforgettable experience." – Lebo M.' 
    },
    { 
      id: 10, 
      image: "https://images.unsplash.com/photo-1620898516244-c7ec073b6473?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
      alt: "Bus parked with a view of a sunset", 
      text: '"Sunset on the water made the evening magical." – Aisha T.' 
    }
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