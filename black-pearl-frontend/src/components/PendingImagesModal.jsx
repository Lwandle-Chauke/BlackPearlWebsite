import React, { useEffect, useState } from 'react';
import galleryService from '../services/galleryService';

const AdminPendingModal = ({ onClose, token }) => {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch all pending images
  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const files = await galleryService.getPendingImages();
      setPendingFiles(files || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || 'Failed to load pending uploads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // Approve pending image
  const handleApproveFile = async (albumId, pendingId) => {
    try {
      await galleryService.approveImage(albumId, pendingId);
      setPendingFiles(p => p.filter(i => i._id !== pendingId));
      setSuccess('Image approved successfully.');
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      console.error(err);
      setError('Failed to approve image: ' + (err?.response?.data?.message || err.message));
    }
  };

  // Edit caption for pending image
  const handleEditCaption = async (albumId, pendingId, currentCaption) => {
    const newCaption = prompt('Edit caption:', currentCaption || '');
    if (newCaption === null) return;
    try {
      await galleryService.updateImage(albumId, pendingId, { caption: newCaption });
      setPendingFiles(p =>
        p.map(i => (i._id === pendingId ? { ...i, caption: newCaption } : i))
      );
      setSuccess('Caption updated successfully.');
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      console.error(err);
      setError('Failed to update caption: ' + (err?.response?.data?.message || err.message));
    }
  };

  // Delete pending image
  const handleDeleteFile = async (albumId, pendingId) => {
    if (!window.confirm('Delete this pending image?')) return;
    try {
      await galleryService.deleteImage(albumId, pendingId);
      setPendingFiles(p => p.filter(i => i._id !== pendingId));
      setSuccess('Image deleted.');
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      console.error(err);
      setError('Delete failed: ' + (err?.response?.data?.message || err.message));
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal large card-modal">
        <div className="card-header">
          <h3>Pending Gallery Approvals</h3>
          <button className="close" onClick={onClose}>×</button>
        </div>

        <div className="card-body">
          {loading && <p>Loading pending uploads...</p>}
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          {!loading && (
            <section className="pending-section">
              <h4>Pending File Uploads</h4>
              {pendingFiles.length === 0 ? (
                <p>No pending file uploads.</p>
              ) : (
                <div className="pending-items">
                  {pendingFiles.map(item => (
                    <div key={item._id} className="pending-item">
                      <img src={item.url} alt={item.caption || 'pending'} className="thumb" />
                      <div className="meta">
                        <strong>Album: {item.albumId?.albumName || item.albumId}</strong>
                        <p className="caption">{item.caption}</p>
                        <p className="by">
                          By: {item.uploadedBy?.name || 'Unknown'} ({item.uploadedBy?.email || ''})
                        </p>
                        <div className="actions">
                          <button
                            className="btn-action"
                            onClick={() => handleApproveFile(item.albumId?._id || item.albumId, item._id)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn-action"
                            onClick={() => handleEditCaption(item.albumId?._id || item.albumId, item._id, item.caption)}
                          >
                            Edit Caption
                          </button>
                          <button
                            className="btn-action"
                            onClick={() => handleDeleteFile(item.albumId?._id || item.albumId, item._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPendingModal;