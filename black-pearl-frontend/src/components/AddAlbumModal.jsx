import React, { useState } from 'react';
import galleryService from '../services/galleryService';

const AddAlbumModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || name.trim() === '') return setError('Please enter an album name');
    setLoading(true);
    setError(null);
    try {
      await galleryService.createAlbum(name.trim());
      onCreated && onCreated();
      onClose && onClose();
    } catch (err) {
      console.error('Create album failed', err);
      setError(err?.response?.data?.message || err.message || 'Failed to create album');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal small card-modal">
        <div className="card-header">
          <h3>Create new album</h3>
          <button className="close" onClick={onClose}>×</button>
        </div>

        <form className="card-body" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Album name
              <input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Events and Leisure" />
            </label>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="card-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn" disabled={loading}>{loading ? 'Creating…' : 'Create Album'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAlbumModal;