// src/components/AlbumManagementModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AlbumManagementModal = ({ album, onClose, onUpdate }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAlbumImages();
  }, [album]);

  const fetchAlbumImages = async () => {
    try {
      setLoading(true);
      // Get the full album data with images
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/gallery`);
      const currentAlbum = res.data.find(a => a._id === album._id);
      
      if (currentAlbum && currentAlbum.images) {
        // Ensure image URLs are absolute
        const imagesWithAbsoluteUrls = currentAlbum.images.map(image => ({
          ...image,
          url: image.url.startsWith('http') 
            ? image.url 
            : `${process.env.REACT_APP_API_URL}${image.url}`
        }));
        setImages(imagesWithAbsoluteUrls);
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error('Failed to fetch album images:', err);
      setMessage('Failed to load album images');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      setMessage('Deleting...');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/gallery/${album._id}/images/${imageId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setMessage('✅ Image deleted successfully');
      // Remove image from local state
      setImages(prev => prev.filter(img => img._id !== imageId));
      onUpdate(); // Refresh parent component
    } catch (err) {
      console.error('Delete failed:', err);
      setMessage('❌ Failed to delete image');
    }
  };

  // Function to handle image loading errors
  const handleImageError = (e) => {
    console.log('Image failed to load:', e.target.src);
    e.target.src = '/placeholder.jpg'; // Fallback image
  };

  return (
    <div className="modal-backdrop">
      <div className="modal card-modal smooth-modal" style={{ maxWidth: '1000px' }}>
        <div className="card-header">
          <h3>📁 Managing: {album.albumName}</h3>
          <button className="close" onClick={onClose}>×</button>
        </div>

        <div className="card-body">
          <p className="modal-description">
            View and manage images in this album. Click the delete button to remove any image.
          </p>

          {message && <p className="status-message">{message}</p>}

          {loading ? (
            <p className="status-text">Loading images...</p>
          ) : images.length === 0 ? (
            <div className="empty-message">No images in this album yet.</div>
          ) : (
            <div className="management-grid">
              {images.map((image, index) => (
                <div key={image._id || index} className="management-card">
                  <div className="management-image-wrapper">
                    <img 
                      src={image.url} 
                      alt={image.caption || `Image ${index + 1}`}
                      className="management-image"
                      onError={handleImageError}
                      loading="lazy"
                    />
                    <div className="management-overlay">
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteImage(image._id)}
                        title="Delete image"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  {image.caption && (
                    <p className="management-caption">{image.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlbumManagementModal;