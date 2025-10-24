import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
// Import the shared admin CSS (for base layout/hamburger logic) and the gallery-specific CSS
import '../styles/admin.css'; 
import '../styles/admin-gallery.css'; 

// Component for an individual gallery item card
const GalleryItem = ({ item, handleAction }) => (
    <div className="gallery-item">
        
        {/* Image Container */}
        <div className="image-container">
            <img 
                src={item.imageUrl} 
                alt={item.albumName} 
            />
        </div>

        {/* Gallery Info & Actions (Main Column) */}
        <div className="gallery-info">
            <h3>{item.albumName}</h3>
            <p className="total-images">Total Images: {item.totalImages}</p>
            <div className="gallery-actions">
                <i 
                    className="fas fa-search" 
                    title="View Images" 
                    onClick={() => handleAction('View', item.id)}
                ></i>
                <i 
                    className="fas fa-trash-alt" 
                    title="Delete Album" 
                    onClick={() => handleAction('Delete', item.id)}
                ></i>
                <i 
                    className="fas fa-pencil-alt" 
                    title="Edit Album Name" 
                    onClick={() => handleAction('Edit', item.id)}
                ></i>
                <i 
                    className="fas fa-upload" 
                    title="Upload New Images" 
                    onClick={() => handleAction('Upload', item.id)}
                ></i>
            </div>
        </div>
        
        {/* Current Stats (Right Column, stacks on mobile) */}
        <div className="current-stats">
            <h4>Latest Tour Data</h4>
            <p>Tours: {item.totalImages}</p>
            <p className="stat-detail">{item.lastTourDate} | {item.lastTourTime}</p>
            <p className="stat-detail">Passengers: {item.lastTourPassengers}</p>
            <p className="stat-status">
                Status: <span className="status-confirmed">{item.lastTourStatus}</span>
            </p>
        </div>
    </div>
);


const AdminGallery = () => {
    // State to manage the visibility of the sidebar on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Toggle function for the hamburger menu
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Data Array for the Gallery Albums
    const galleryAlbums = [
        { 
            id: 1, 
            albumName: 'Events and Leisure Tour', 
            imageUrl: 'https://media.istockphoto.com/id/1384618716/photo/group-of-happy-friends-taking-selfie-pic-outside-happy-different-young-people-having-fun.webp?a=1&b=1&s=612x612&w=0&k=20&c=spTrAeU228i_64ikxrAsEs0HhN9Or88fQE7snJ8OfSw=', 
            totalImages: 43,
            lastTourDate: '15 Sept 2025',
            lastTourTime: '14:30',
            lastTourPassengers: 6,
            lastTourStatus: 'Confirmed'
        },
        { 
            id: 2, 
            albumName: 'Cape Point Tour', 
            imageUrl: 'https://plus.unsplash.com/premium_photo-1754265639366-1cc360b0da06?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Q2FwZSUyMFBvaW50JTIwVG91cnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600', 
            totalImages: 32,
            lastTourDate: '15 Sept 2025',
            lastTourTime: '08:30',
            lastTourPassengers: 6,
            lastTourStatus: 'Confirmed'
        },
        { 
            id: 3, 
            albumName: 'Table Mountain', 
            imageUrl: 'https://images.unsplash.com/photo-1606799955515-85468ee78c26?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1932', 
            totalImages: 13,
            lastTourDate: '15 Sept 2025',
            lastTourTime: '15:30',
            lastTourPassengers: 6,
            lastTourStatus: 'Confirmed'
        },
    ];

    // Handler for gallery actions
    const handleAction = (action, id) => {
        alert(`${action} album ID: ${id}`);
    };
    
    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            
            <AdminSidebar 
                isSidebarOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
            />
            
            <div id="content-wrapper">
                
                <AdminTopBar 
                    pageTitle="Gallery" 
                    toggleSidebar={toggleSidebar}
                />

                <main className="gallery-page-content">
                    <div className="main-content">
                        <h2>Manage Gallery :</h2>
                        
                        {/* Optional button to add new album, hidden in original HTML but useful */}
                        <button className="btn-add-album" onClick={() => handleAction('Add', 0)}>
                            <i className="fas fa-plus"></i> Add New Album
                        </button>
                        
                        <div className="gallery-list">
                            {galleryAlbums.map((album) => (
                                <GalleryItem 
                                    key={album.id} 
                                    item={album} 
                                    handleAction={handleAction} 
                                />
                            ))}
                        </div>
                    </div>
                </main>
                
            </div> 
            

            {/* Overlay for mobile view when sidebar is open */}
            <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
        </div>
    );
};

export default AdminGallery;