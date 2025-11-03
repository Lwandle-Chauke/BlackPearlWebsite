// src/pages/Gallery.jsx
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/style.css';
import '../styles/gallery.css';
import ChatWidget from "../chatbot/ChatWidget";
import galleryService from '../services/galleryService.js';
import UserUploadModal from '../components/UserUploadModal';

const Gallery = ({ onAuthClick, isLoggedIn, onSignOut, currentUser }) => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchAlbums = () => {
    setLoading(true);
    galleryService.getAlbums()
      .then(data => {
        console.log('📸 Albums loaded:', data);
        setAlbums(data || []);
      })
      .catch(err => {
        console.error('Gallery load error:', err);
        setError(err?.message || 'Failed to load gallery');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetchAlbums(); 
  }, []);

  const handleUploaded = () => {
    console.log('🔄 Refreshing gallery after upload...');
    fetchAlbums();
  };

  return (
    <>
      <Header onAuthClick={onAuthClick} isLoggedIn={isLoggedIn} user={currentUser} onSignOut={onSignOut} />

      <main className="gallery-section">
        <div className="gallery-header">
          <h1 className="gallery-title">Our Travel Gallery</h1>
          {isLoggedIn && (
            <button className="upload-btn" onClick={() => setShowUpload(true)}>+ Share Your Memory</button>
          )}
        </div>

        {loading && <p className="status-text">Loading gallery…</p>}
        {error && <p className="status-text error">{error}</p>}
        {(!loading && albums.length === 0) && <div className="empty-message">No albums available yet.</div>}

        {/* ✅ FIXED: Show ALL images without approval filtering */}
        {albums.map(album => {
          const displayImages = album.images || [];
          
          if (displayImages.length === 0) return null;
          
          return (
            <section key={album._id} className="album-section">
              <h2 className="album-title">{album.albumName}</h2>
              <div className="gallery-grid">
                {displayImages.map((item, index) => {
                  // Build the correct image URL
                  let imageUrl = item.url;
                  
                  // If it's a relative path, make it absolute
                  if (imageUrl && imageUrl.startsWith('/uploads/')) {
                    imageUrl = `http://localhost:5000${imageUrl}`;
                  }
                  
                  return (
                    <div key={item._id || `${album._id}-${index}`} className="gallery-card">
                      <div className="image-wrapper">
                        <img 
                          src={imageUrl} 
                          alt={item.caption || album.albumName} 
                          className="gallery-image"
                          onError={(e) => {
                            console.log('❌ Image failed to load:', imageUrl);
                            e.target.src = 'https://via.placeholder.com/300x200/cccccc/969696?text=Image+Not+Found';
                          }}
                          onLoad={() => console.log('✅ Image loaded:', imageUrl)}
                        />
                      </div>
                      {item.caption && <p className="testimonial">"{item.caption}"</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      <Footer />
      <ChatWidget />

      {showUpload && (
        <UserUploadModal
          albums={albums}
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploaded}
        />
      )}
    </>
  );
};

export default Gallery;