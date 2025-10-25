import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
// Import the shared admin CSS (for base layout/hamburger logic) and the settings-specific CSS
import '../styles/admin.css'; 
import '../styles/admin-settings.css'; 

const AdminSettings = () => {
    // State to manage the visibility of the sidebar on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Toggle function for the hamburger menu
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // State management for form fields (Controlled Components)
    const [settings, setSettings] = useState({
        siteName: 'Black Pearl Coach Charters and Tours',
        contactEmail: 'admin@blackpearltours.co.za',
        timezone: 'SAST',
        quoteExpiry: 30,
        minBookingNotice: 3,
        adminPassword: '', // Password field is usually handled separately for security
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setSettings(prevSettings => ({
            ...prevSettings,
            [id]: id === 'quoteExpiry' || id === 'minBookingNotice' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real application, you would send the 'settings' object to an API here
        console.log('Settings Saved:', settings);
        alert('Settings saved successfully! (Simulated)');
        // Optionally clear the password field after submit attempt
        setSettings(prevSettings => ({ ...prevSettings, adminPassword: '' }));
    };
    
    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            
            <AdminSidebar 
                isSidebarOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
            />
            
            <div id="content-wrapper">
                
                <AdminTopBar 
                    pageTitle="Settings" 
                    toggleSidebar={toggleSidebar}
                />

                <main className="settings-page-content">
                    <div className="main-content">
                        <h2>System Configuration :</h2>
                        
                        {/* The form uses handleSubmit to manage submission */}
                        <form onSubmit={handleSubmit} className="settings-form">
                            
                            <div className="settings-section">
                                <h3>General Website Settings</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="siteName">Website Name</label>
                                        <input 
                                            type="text" 
                                            id="siteName" 
                                            value={settings.siteName} 
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="contactEmail">Default Contact Email</label>
                                        <input 
                                            type="email" 
                                            id="contactEmail" 
                                            value={settings.contactEmail} 
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="timezone">Timezone</label>
                                        <select 
                                            id="timezone"
                                            value={settings.timezone}
                                            onChange={handleChange}
                                        >
                                            <option value="SAST">SAST (UTC+2)</option>
                                            <option value="UTC">UTC</option>
                                            {/* Add more timezone options here */}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-section">
                                <h3>Booking & Quotes Settings</h3>
                                <div className="form-grid two-column">
                                    <div className="form-group">
                                        <label htmlFor="quoteExpiry">Quote Expiry Days</label>
                                        <input 
                                            type="number" 
                                            id="quoteExpiry" 
                                            value={settings.quoteExpiry}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="minBookingNotice">Minimum Booking Notice (Days)</label>
                                        <input 
                                            type="number" 
                                            id="minBookingNotice" 
                                            value={settings.minBookingNotice}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="settings-section">
                                <h3>Security</h3>
                                <div className="form-grid single-column">
                                    <div className="form-group">
                                        <label htmlFor="adminPassword">Change Admin Password</label>
                                        <input 
                                            type="password" 
                                            id="adminPassword" 
                                            placeholder="Enter new password"
                                            value={settings.adminPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-save">
                                <i className="fas fa-save"></i> Save Settings
                            </button>
                        </form>
                        
                        {/* Replaces the manual clear:both div and <br> */}
                        <div style={{ clear: 'both', height: '1.5rem' }}></div>
                        
                    </div>
                </main>
                
            </div> 
            
            {/* Overlay for mobile view when sidebar is open */}
            <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
        </div>
    );
};

export default AdminSettings;