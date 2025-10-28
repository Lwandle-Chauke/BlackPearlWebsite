import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/style.css';
import '../styles/gallery.css';
import ChatWidget from "../chatbot/ChatWidget";
import axios from 'axios';
import { API_BASE_URL, IMAGE_BASE_URL } from '../utils/config';
import ImageSkeletonLoader from '../components/ImageSkeletonLoader';

const Gallery = ({ onAuthClick, isLoggedIn, onSignOut, currentUser }) => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchApprovedImages();
  }, []);

  const openLightbox = (image) => {
    setSelectedImage(image);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
  };

  const navigateLightbox = (direction) => {
    const currentIndex = galleryImages.findIndex(img => img._id === selectedImage._id);
    let newIndex = currentIndex + direction;
    if (newIndex < 0) {
      newIndex = galleryImages.length - 1;
    } else if (newIndex >= galleryImages.length) {
      newIndex = 0;
    }
    setSelectedImage(galleryImages[newIndex]);
  };

  const fetchApprovedImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/images/approved`);
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
          <div className="gallery-grid">
            {[...Array(6)].map((_, index) => ( // Show 6 skeleton loaders
              <ImageSkeletonLoader key={index} />
            ))}
          </div>
        ) : error ? (
          <p className="message error-message">{error}</p>
        ) : galleryImages.length === 0 ? (
          <p className="message info-message">No images in the gallery yet.</p>
        ) : (
          <div className="gallery-grid">
            {galleryImages.map(item => (
              <div key={item._id} className="card" onClick={() => openLightbox(item)}>
                <img src={`${IMAGE_BASE_URL}${item.url}`} alt={item.altText} />
              </div>
            ))}
          </div>
        )}
      </main>

      {lightboxOpen && selectedImage && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
            <button className="lightbox-nav prev" onClick={() => navigateLightbox(-1)}>&#10094;</button>
            <img src={`${IMAGE_BASE_URL}${selectedImage.url}`} alt={selectedImage.altText} className="lightbox-image" />
            <button className="lightbox-nav next" onClick={() => navigateLightbox(1)}>&#10095;</button>
            {selectedImage.altText && <p className="lightbox-alt-text">{selectedImage.altText}</p>}
          </div>
        </div>
      )}

      {/* Floating chat icon */}
      <Footer />

      <ChatWidget />

    </>
  );
};

export default Gallery;
