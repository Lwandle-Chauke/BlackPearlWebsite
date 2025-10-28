import React from 'react';
import '../styles/image-skeleton-loader.css'; // Create this CSS file next

const ImageSkeletonLoader = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-text-line"></div>
        </div>
    );
};

export default ImageSkeletonLoader;
