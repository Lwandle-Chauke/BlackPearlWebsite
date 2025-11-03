import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import '../styles/style.css';
import '../styles/gallery.css';

// Static gallery data - can be moved to separate file if needed
const GALLERY_ITEMS = [
  { 
    id: 1, 
    image: "https://media.istockphoto.com/id/1479501686/photo/tourist-bus-moves-along-a-country-road.webp?a=1&b=1&s=612x612&w=0&k=20&c=6l8LMBoe50pWoS-nUUQl9RFYDX79yPwuEqG_vzhTiZs=", 
    alt: "Large tourist bus parked on road", 
    text: '"Made our holiday stress-free from start to finish." – Lerato M' 
  },
  { 
    id: 2, 
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2071&auto=format&fit=crop", 
    alt: "Modern charter bus at sunset", 
    text: '"Turned our group trip into a real adventure." – Priya S.' 
  },
  { 
    id: 3, 
    image: "https://images.unsplash.com/photo-1759355070708-89e91a3ed525?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fEdyb3VwJTIwdG91ciUyMGxvb2tpbmclMjBhdCUyMGNpdHklMjBzaWdodHN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600", 
    alt: "Group tour looking at city sights", 
    text: '"Made sightseeing in Johannesburg so easy." – David N.' 
  },
  { 
    id: 4, 
    image: "https://media.istockphoto.com/id/1264725041/photo/no-need-to-worry-about-carrying-our-own-luggage.webp?a=1&s=612x612&w=0&k=20&c=a1QsT-7fXba671CK2C1kAJoFoGj9UobaDY9Q8Yhns6k=", 
    alt: "People loading luggage onto a coach bus", 
    text: '"Traveling to the game was half the fun!" – Jason L.' 
  },
  { 
    id: 5, 
    image: "https://media.istockphoto.com/id/2181324518/photo/glove-compartment-of-a-luxury-car-with-a-sleek-handle-on-a-minimalist-dashboard.webp?a=1&s=612x612&w=0&k=20&c=FrbGntMTSaoBRSuP19bJnqIwf1efL67HnCUXIGtJn8U=", 
    alt: "Bus interior with comfortable seats", 
    text: '"Relaxing by the ocean never felt this good!" – Amara P.' 
  },
  { 
    id: 6, 
    image: "https://plus.unsplash.com/premium_photo-1755004626143-acacce304696?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDV8fGJ1cyUyMG9uJTIwaGlnaHdheXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600", 
    alt: "Modern white tour bus on a coastal highway", 
    text: '"The mountain views were breathtaking. Highly recommend!" – Sipho K.' 
  },
  { 
    id: 7, 
    image: "https://images.unsplash.com/photo-1552561018-5fea54c08479?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fEx1eHVyeSUyMGNvYWNoJTIwaW50ZXJpb3IlMjB3aXRoJTIwdHJheSUyMHRhYmxlc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600", 
    alt: "Luxury coach interior with tray tables", 
    text: '"Our kids loved every moment of the trip!" – Johan D.' 
  },
  { 
    id: 8, 
    image: "https://media.istockphoto.com/id/2148955990/photo/game-drive-at-sunset.webp?a=1&b=1&s=612x612&w=0&k=20&c=-afcy9oMVe2hAJQashsMOhIiICrYpnCZj9j-qT5SfKg=", 
    alt: "Bus driving on a wide open road during a safari", 
    text: '"Seeing wildlife up close was an unforgettable experience." – Lebo M.' 
  },
  { 
    id: 9, 
    image: "https://plus.unsplash.com/premium_photo-1749063013691-bfcd5567e3e5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEyfHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600", 
    alt: "Overhead view of a charter bus", 
    text: '"Exploring the city was effortless and fun." – Thandi R.' 
  }
];

const Gallery = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <Header onSignInClick={() => setIsAuthModalOpen(true)} />
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}

      {/* Gallery Section */}
      <main className="gallery-section">
        <h1 className="gallery-title">GALLERY</h1>

        <div className="gallery-grid">
          {GALLERY_ITEMS.map(item => (
            <div key={item.id} className="card">
              <img 
                src={item.image} 
                alt={item.alt} 
                loading="lazy"
              />
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