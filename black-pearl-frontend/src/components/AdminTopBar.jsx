import React from 'react';

// Note: This component now accepts the toggle function for the hamburger button
const AdminTopBar = ({ pageTitle, toggleSidebar }) => {
    return (
        <header className="top-bar">
            {/* Hamburger Menu Icon (Visible on Mobile via CSS) */}
            <button className="hamburger-menu" onClick={toggleSidebar}>
                <i className="fas fa-bars"></i>
            </button>
            
            <div className="page-title">
                <h1>{pageTitle}</h1>
            </div>
            <div className="admin-info">
                Admin <i className="fas fa-user-circle"></i>
            </div>
        </header>
    );
};

export default AdminTopBar;