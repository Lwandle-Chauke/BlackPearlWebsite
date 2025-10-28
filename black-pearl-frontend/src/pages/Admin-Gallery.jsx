import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import '../styles/admin.css';
import '../styles/admin-gallery.css';
import axios from 'axios';
import { API_BASE_URL, IMAGE_BASE_URL } from '../utils/config';

const AdminGallery = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [pendingImages, setPendingImages] = useState([]);
    const [approvedImages, setApprovedImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [altText, setAltText] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [imagePreview, setImagePreview] = useState(null); // New state for image preview
    const [testimonials, setTestimonials] = useState([]);

    useEffect(() => {
        fetchImages();
        fetchTestimonials();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleAltTextChange = (e) => {
        setAltText(e.target.value);
    };

    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setUploadError('Please select an image to upload.');
            return;
        }

        setUploading(true);
        setUploadError(null);
        setUploadSuccess(false);

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('altText', altText);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            };
            await axios.post(`${API_BASE_URL}/upload/images`, formData, config);
            setUploadSuccess(true);
            setSelectedFile(null);
            setAltText('');
            setImagePreview(null); // Clear image preview after successful upload
            fetchImages(); // Refresh images after upload
        } catch (err) {
            console.error('Error uploading image:', err);
            setUploadError(err.response?.data?.msg || 'Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    const fetchImages = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const pendingRes = await axios.get(`${API_BASE_URL}/images/pending`, config);
            setPendingImages(pendingRes.data);

            const approvedRes = await axios.get(`${API_BASE_URL}/images/approved`, config);
            setApprovedImages(approvedRes.data);

        } catch (err) {
            console.error('Error fetching images:', err);
            setError(err.response?.data?.msg || 'Failed to fetch images');
        } finally {
            setLoading(false);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this image?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            await axios.put(`${API_BASE_URL}/images/${id}/status`, { status }, config);
            alert(`Image ${status} successfully!`);
            fetchImages(); // Refresh images
        } catch (err) {
            console.error('Error updating image status:', err);
            alert(err.response?.data?.msg || 'Failed to update image status');
        }
    };

    const handleDeleteImage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            await axios.delete(`${API_BASE_URL}/images/${id}`, config);
            alert('Image deleted successfully!');
            fetchImages(); // Refresh images
        } catch (err) {
            console.error('Error deleting image:', err);
            alert(err.response?.data?.msg || 'Failed to delete image');
        }
    };

    const fetchTestimonials = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const res = await axios.get(`${API_BASE_URL}/reviews`, config);
            // Filter for approved reviews
            setTestimonials(res.data.data.filter(review => review.status === 'approved'));
        } catch (err) {
            console.error('Error fetching testimonials:', err);
        }
    };

    const getRandomTestimonial = () => {
        if (testimonials.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * testimonials.length);
        return testimonials[randomIndex];
    };

    const ImageCard = ({ image, type }) => {
        const testimonial = getRandomTestimonial();
        return (
            <div className="image-card">
                <img src={`${IMAGE_BASE_URL}${image.url}`} alt={image.altText} />
                <div className="image-info">
                    <p><strong>Alt Text:</strong> {image.altText}</p>
                    <p><strong>Status:</strong> <span className={`status-${image.status}`}>{image.status}</span></p>
                    {testimonial && (
                        <div className="testimonial-display">
                            <p><strong>Testimonial:</strong> "{testimonial.comment}"</p>
                            <p>- {testimonial.user?.name || 'Anonymous'}</p>
                        </div>
                    )}
                    <div className="image-actions">
                        {type === 'pending' && (
                            <>
                                <button className="btn-approve" onClick={() => handleStatusUpdate(image._id, 'approved')}>
                                    Approve
                                </button>
                                <button className="btn-decline" onClick={() => handleStatusUpdate(image._id, 'declined')}>
                                    Decline
                                </button>
                            </>
                        )}
                        {type === 'approved' && (
                            <button className="btn-delete" onClick={() => handleDeleteImage(image._id)}>
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <AdminSidebar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            <div id="content-wrapper">
                <AdminTopBar
                    pageTitle="Gallery Management"
                    toggleSidebar={toggleSidebar}
                />

                <main className="gallery-page-content">
                    <div className="main-content">
                        <div className="page-header">
                            <h2>Image Approval & Management</h2>
                        </div>

                        <section className="image-upload-section">
                            <h3>Upload New Image</h3>
                            <form onSubmit={handleImageUpload} className="image-upload-form">
                                <div className="form-group">
                                    <label htmlFor="imageFile">Select Image:</label>
                                    <input
                                        type="file"
                                        id="imageFile"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        required
                                    />
                                </div>
                                {imagePreview && (
                                    <div className="image-preview-container">
                                        <img src={imagePreview} alt="Image Preview" className="image-preview" />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label htmlFor="altText">Alt Text (for accessibility):</label>
                                    <input
                                        type="text"
                                        id="altText"
                                        value={altText}
                                        onChange={handleAltTextChange}
                                        placeholder="e.g., Black Pearl Sedan"
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn-upload" disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                </button>
                                {uploadError && <p className="message error-message">{uploadError}</p>}
                                {uploadSuccess && <p className="message success-message">Image uploaded successfully! Awaiting approval.</p>}
                            </form>
                        </section>

                        {loading ? (
                            <p className="message info-message">Loading images...</p>
                        ) : error ? (
                            <p className="message error-message">{error}</p>
                        ) : (
                            <>
                                <section className="pending-images-section">
                                    <h3>Pending Images ({pendingImages.length})</h3>
                                    {pendingImages.length === 0 ? (
                                        <p>No images awaiting approval.</p>
                                    ) : (
                                        <div className="image-grid">
                                            {pendingImages.map(image => (
                                                <ImageCard key={image._id} image={image} type="pending" />
                                            ))}
                                        </div>
                                    )}
                                </section>

                                <section className="approved-images-section">
                                    <h3>Approved Images ({approvedImages.length})</h3>
                                    {approvedImages.length === 0 ? (
                                        <p>No approved images.</p>
                                    ) : (
                                        <div className="image-grid">
                                            {approvedImages.map(image => (
                                                <ImageCard key={image._id} image={image} type="approved" />
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}
                    </div>
                </main>
            </div>

            <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
        </div>
    );
};

export default AdminGallery;
