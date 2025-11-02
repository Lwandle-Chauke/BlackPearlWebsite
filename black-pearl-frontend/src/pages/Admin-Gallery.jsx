import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import galleryService from '../services/galleryService.js';
import PendingImagesModal from '../components/PendingImagesModal';
import AdminUploadModal from '../components/AdminUploadModal';
import AddAlbumModal from '../components/AddAlbumModal';
import AlbumManagementModal from '../components/AlbumManagementModal'; // NEW
import '../styles/admin-gallery.css';
import '../styles/admin.css';

// ✅ Reusable gallery item card - UPDATED
const GalleryItem = ({ item, handleAction }) => (
    <div className="gallery-item">
        <div className="image-container">
            <img
                src={(item.images?.[0]?.url) || item.imageUrl || '/placeholder.jpg'}
                alt={item.albumName}
            />
        </div>

        <div className="gallery-info">
            <h3>{item.albumName}</h3>
            <p className="total-images">
                Total Images: {item.totalImages || item.images?.length || 0}
            </p>

            <div className="gallery-actions">
                <button
                    className="btn-action"
                    title="View & Manage Images"
                    onClick={() => handleAction('View', item)}
                >
                    <i className="fas fa-eye"></i> View
                </button>

                <button
                    className="btn-action"
                    title="Upload New Images"
                    onClick={() => handleAction('Upload', item._id || item.id)}
                >
                    <i className="fas fa-upload"></i> Upload
                </button>

                <button
                    className="btn-action"
                    title="Edit Album Name"
                    onClick={() => handleAction('Edit', item._id || item.id)}
                >
                    <i className="fas fa-pen"></i> Edit
                </button>

                <button
                    className="btn-action btn-delete"
                    title="Delete Album"
                    onClick={() => handleAction('Delete', item._id || item.id)}
                >
                    <i className="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>

        <div className="current-stats">
            <h4>Album Stats</h4>
            <p>Images: {item.totalImages || item.images?.length || 0}</p>
            <p>Approved: {(item.images || []).filter(img => img.approved).length}</p>
        </div>
    </div>
);

const AdminGallery = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals
    const [showUploadForAlbum, setShowUploadForAlbum] = useState(null);
    const [showPending, setShowPending] = useState(false);
    const [showAddAlbum, setShowAddAlbum] = useState(false);
    const [showManagement, setShowManagement] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // 🔄 Fetch albums
    const loadAlbums = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await galleryService.getAlbums();
            setAlbums(data || []);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to load albums');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlbums();
    }, []);

    // 🎯 Admin action handler - UPDATED
    const handleAction = async (action, itemOrId) => {
        switch (action) {
            case 'View':
                // Use the existing View button to open AlbumManagementModal
                setSelectedAlbum(itemOrId);
                setShowManagement(true);
                break;

            case 'Delete':
                if (!window.confirm('Delete this album and all its images?')) return;
                try {
                    await galleryService.deleteAlbum(itemOrId);
                    await loadAlbums();
                } catch (err) {
                    alert('Delete failed: ' + (err.response?.data?.message || err.message));
                }
                break;

            case 'Edit':
                const newName = window.prompt('Enter new album name:');
                if (newName) {
                    try {
                        await galleryService.updateAlbum(itemOrId, newName);
                        await loadAlbums();
                    } catch (err) {
                        alert('Rename failed: ' + (err.response?.data?.message || err.message));
                    }
                }
                break;

            case 'Upload':
                setShowUploadForAlbum(itemOrId);
                break;

            case 'Add':
                setShowAddAlbum(true);
                break;

            default:
                alert(`Action "${action}" not supported.`);
        }
    };

    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div id="content-wrapper">
                <AdminTopBar pageTitle="Gallery Management" toggleSidebar={toggleSidebar} />

                <main className="gallery-page-content">
                    <div className="main-content">
                        <div className="page-header">
                            <h2>Gallery Management</h2>
                            <p>Manage albums, upload images, and review pending submissions</p>
                        </div>

                        <div className="admin-actions">
                            <button
                                className="btn-add-album"
                                onClick={() => handleAction('Add')}
                            >
                                <i className="fas fa-plus"></i> Add New Album
                            </button>

                            <button
                                className="btn-pending"
                                onClick={() => setShowPending(true)}
                            >
                                <i className="fas fa-clock"></i> Review Pending Images
                            </button>

                            <button
                                className="btn-refresh"
                                onClick={loadAlbums}
                            >
                                <i className="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>

                        {loading && (
                            <div className="loading-state">
                                <i className="fas fa-spinner fa-spin"></i>
                                <p>Loading albums…</p>
                            </div>
                        )}
                        
                        {error && (
                            <div className="error-state">
                                <i className="fas fa-exclamation-triangle"></i>
                                <p>{error}</p>
                                <button onClick={loadAlbums}>Try Again</button>
                            </div>
                        )}

                        {!loading && !error && albums.length === 0 && (
                            <div className="empty-state">
                                <i className="fas fa-images"></i>
                                <h3>No Albums Found</h3>
                                <p>Create your first album to get started!</p>
                                <button 
                                    className="btn-add-album"
                                    onClick={() => handleAction('Add')}
                                >
                                    <i className="fas fa-plus"></i> Create First Album
                                </button>
                            </div>
                        )}

                        {!loading && !error && albums.length > 0 && (
                            <div className="gallery-stats">
                                <div className="stat-card">
                                    <h4>Total Albums</h4>
                                    <span className="stat-number">{albums.length}</span>
                                </div>
                                <div className="stat-card">
                                    <h4>Total Images</h4>
                                    <span className="stat-number">
                                        {albums.reduce((total, album) => total + (album.images?.length || 0), 0)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="gallery-list">
                            {albums.map(album => (
                                <GalleryItem
                                    key={album._id || album.id}
                                    item={album}
                                    handleAction={handleAction}
                                />
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Sidebar overlay */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
                onClick={toggleSidebar}
            ></div>

            {/* ✅ Modals */}
            {showUploadForAlbum && (
                <AdminUploadModal
                    albums={albums}
                    initialAlbum={showUploadForAlbum}
                    onClose={() => setShowUploadForAlbum(null)}
                    onUploaded={loadAlbums}
                />
            )}

            {showPending && (
                <PendingImagesModal
                    onClose={() => setShowPending(false)}
                    onApproved={loadAlbums}
                />
            )}

            {showAddAlbum && (
                <AddAlbumModal
                    onClose={() => setShowAddAlbum(false)}
                    onCreated={loadAlbums}
                />
            )}

            {/* Album Management Modal - triggered by View button */}
            {showManagement && selectedAlbum && (
                <AlbumManagementModal
                    album={selectedAlbum}
                    onClose={() => {
                        setShowManagement(false);
                        setSelectedAlbum(null);
                    }}
                    onUpdate={loadAlbums}
                />
            )}
        </div>
    );
};

export default AdminGallery;