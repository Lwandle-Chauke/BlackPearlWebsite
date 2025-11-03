import React, { useState, useEffect } from 'react';

const AlbumManagementModal = ({ isOpen, onClose, albums, onUpdateAlbum, onDeleteAlbum }) => {
    const [selectedAlbum, setSelectedAlbum] = useState('');
    const [newAlbumName, setNewAlbumName] = useState('');

    useEffect(() => {
        if (isOpen && albums.length > 0) {
            setSelectedAlbum(albums[0]._id);
            setNewAlbumName(albums[0].name);
        }
    }, [isOpen, albums]);

    if (!isOpen) return null;

    const handleAlbumChange = (e) => {
        const albumId = e.target.value;
        setSelectedAlbum(albumId);
        const album = albums.find((a) => a._id === albumId);
        if (album) {
            setNewAlbumName(album.name);
        }
    };

    const handleUpdate = () => {
        if (selectedAlbum && newAlbumName) {
            onUpdateAlbum(selectedAlbum, newAlbumName);
            onClose();
        } else {
            alert('Please select an album and enter a new name.');
        }
    };

    const handleDelete = () => {
        if (selectedAlbum && window.confirm('Are you sure you want to delete this album?')) {
            onDeleteAlbum(selectedAlbum);
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Manage Albums</h2>
                <select value={selectedAlbum} onChange={handleAlbumChange}>
                    {albums.map((album) => (
                        <option key={album._id} value={album._id}>
                            {album.name}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="New Album Name"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                />
                <button onClick={handleUpdate}>Update Album</button>
                <button onClick={handleDelete}>Delete Album</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default AlbumManagementModal;
