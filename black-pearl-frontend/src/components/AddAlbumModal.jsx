import React, { useState } from 'react';

const AddAlbumModal = ({ isOpen, onClose, onAddAlbum }) => {
    const [albumName, setAlbumName] = useState('');

    if (!isOpen) return null;

    const handleAdd = () => {
        if (albumName) {
            onAddAlbum(albumName);
            setAlbumName('');
            onClose();
        } else {
            alert('Please enter an album name.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add New Album</h2>
                <input
                    type="text"
                    placeholder="Album Name"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                />
                <button onClick={handleAdd}>Add Album</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default AddAlbumModal;
