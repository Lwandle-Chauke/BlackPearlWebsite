import React, { useState } from 'react';

const AdminUploadModal = ({ isOpen, onClose, onUpload }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [album, setAlbum] = useState('');

    if (!isOpen) return null;

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = () => {
        if (selectedFile && album) {
            onUpload(selectedFile, album);
            setSelectedFile(null);
            setAlbum('');
            onClose();
        } else {
            alert('Please select a file and an album.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Upload Image</h2>
                <input type="file" onChange={handleFileChange} />
                <input
                    type="text"
                    placeholder="Album Name"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                />
                <button onClick={handleUpload}>Upload</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default AdminUploadModal;
