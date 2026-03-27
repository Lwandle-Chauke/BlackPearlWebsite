import React from 'react';

const PendingImagesModal = ({ isOpen, onClose, images, onApprove, onReject }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Pending Images</h2>
                <div className="image-list">
                    {images.length === 0 ? (
                        <p>No pending images.</p>
                    ) : (
                        images.map((image) => (
                            <div key={image._id} className="image-item">
                                <img src={image.url} alt={image.name} />
                                <p>{image.name}</p>
                                <button onClick={() => onApprove(image._id)}>Approve</button>
                                <button onClick={() => onReject(image._id)}>Reject</button>
                            </div>
                        ))
                    )}
                </div>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default PendingImagesModal;
