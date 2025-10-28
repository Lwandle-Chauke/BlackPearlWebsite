import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/style.css';
import '../styles/gallery.css';
import ChatWidget from "../chatbot/ChatWidget";
import axios from 'axios'; // Import axios

const Gallery = ({ onAuthClick, isLoggedIn, onSignOut, currentUser }) => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApprovedImages();
  }, []);

  const fetchApprovedImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/images/approved');
      setGalleryImages(res.data);
    } catch (err) {
      console.error('Error fetching approved images:', err);
      setError(err.response?.data?.msg || 'Failed to fetch gallery images');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        onAuthClick={onAuthClick}
        isLoggedIn={isLoggedIn}
        user={currentUser}
        onSignOut={onSignOut}
      />

      {/* Gallery Section */}
      <main className="gallery-section">
        <h1 className="gallery-title">GALLERY</h1>

        {loading ? (
          <p>Loading gallery images...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : galleryImages.length === 0 ? (
          <p>No images in the gallery yet.</p>
        ) : (
          <div className="gallery-grid">
            {galleryImages.map(item => (
              <div key={item._id} className="card">
                <img src={`http://localhost:5000${item.url}`} alt={item.altText} />
                {item.uploadedBy?.name && <p>Uploaded by: {item.uploadedBy.name}</p>}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating chat icon */}
      <Footer />

      <ChatWidget />

    </>
  );
};

export default Gallery;
