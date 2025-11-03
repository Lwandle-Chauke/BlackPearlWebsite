import React, { useState, useEffect } from 'react';
import galleryService from '../services/galleryService.js';

const AlbumManagementModal = ({ album, onClose, onUpdate }) => {
const [images, setImages] = useState([]);
const [loading, setLoading] = useState(true);
const [message, setMessage] = useState('');

useEffect(() => {
fetchAlbumImages();
}, [album]);

const fetchAlbumImages = async () => {
try {
setLoading(true);
const albums = await galleryService.getAlbums();
const currentAlbum = albums.find(a => a._id === album._id);
if (currentAlbum && currentAlbum.images) {
// Only approved images
const approvedImages = currentAlbum.images.filter(img => img.approved);
setImages(approvedImages.map(img => ({
...img,
url: img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`
})));
} else {
setImages([]);
}
} catch (err) {
console.error('Failed to fetch album images:', err);
setMessage('Failed to load album images.');
} finally {
setLoading(false);
}
};

const handleDeleteImage = async (imageId) => {
if (!window.confirm('Are you sure you want to delete this image?')) return;
try {
setMessage('Deleting...');
// Only delete approved images from album
await galleryService.deleteImage(album._id, imageId);
setImages(prev => prev.filter(img => img._id !== imageId));
setMessage('✅ Image deleted successfully');
onUpdate && onUpdate();
} catch (err) {
console.error('Delete failed:', err);
setMessage('❌ Failed to delete image: ' + (err.response?.data?.message || err.message));
}
};

const handleImageError = (e) => {
e.target.src = '[https://via.placeholder.com/300x200/cccccc/969696?text=Image+Not+Found](https://via.placeholder.com/300x200/cccccc/969696?text=Image+Not+Found)';
};

return ( <div className="modal-backdrop">
<div className="modal card-modal smooth-modal" style={{ maxWidth: '1000px' }}> <div className="card-header"> <h3>📁 Managing: {album.albumName}</h3> <button className="close" onClick={onClose}>×</button> </div>

```
    <div className="card-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
      <p>Manage images in this album below:</p>
      {message && <p className="status-message">{message}</p>}

      {loading ? (
        <p>Loading images...</p>
      ) : images.length === 0 ? (
        <div>No approved images in this album yet.</div>
      ) : (
        <div className="management-grid">
          {images.map((image) => (
            <div key={image._id} className="management-card">
              <div className="management-image-wrapper">
                <img
                  src={image.url}
                  alt={image.caption || 'Image'}
                  className="management-image"
                  onError={handleImageError}
                />
                <div className="management-overlay">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteImage(image._id)}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
              {image.caption && <p>{image.caption}</p>}
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="card-actions">
      <button className="btn btn-secondary" onClick={onClose}>Close</button>
    </div>
  </div>
</div>


);
};

export default AlbumManagementModal;
