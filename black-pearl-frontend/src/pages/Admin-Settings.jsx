import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme hook
// Import the shared admin CSS (for base layout/hamburger logic) and the settings-specific CSS
import '../styles/admin.css';
import '../styles/admin-settings.css';

const AdminSettings = () => {
    // State to manage the visibility of the sidebar on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const themeContext = useTheme();
    const isDarkMode = themeContext ? themeContext.isDarkMode : false;
    const toggleDarkMode = themeContext ? themeContext.toggleDarkMode : () => { };
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const [settings, setSettings] = useState({
        siteName: '',
        contactEmail: '',
        timezone: 'SAST',
        quoteExpiry: 30,
        minBookingNotice: 3,
        adminPassword: '',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Simulate API call to fetch settings
                setLoading(true);
                setError(null);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
                const fetchedSettings = {
                    siteName: 'Black Pearl Coach Charters and Tours',
                    contactEmail: 'admin@blackpearltours.co.za',
                    timezone: 'SAST',
                    quoteExpiry: 30,
                    minBookingNotice: 3,
                };
                setSettings(prevSettings => ({ ...prevSettings, ...fetchedSettings }));
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch settings.');
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setSettings(prevSettings => ({
            ...prevSettings,
            [id]: id === 'quoteExpiry' || id === 'minBookingNotice' ? Number(value) : value,
        }));
    };

    const validateSettings = () => {
        const newErrors = {};
        if (!settings.siteName.trim()) {
            newErrors.siteName = 'Website Name cannot be empty.';
        }
        if (!settings.contactEmail.trim()) {
            newErrors.contactEmail = 'Contact Email cannot be empty.';
        } else if (!/\S+@\S+\.\S+/.test(settings.contactEmail)) {
            newErrors.contactEmail = 'Invalid email format.';
        }
        if (settings.quoteExpiry <= 0) {
            newErrors.quoteExpiry = 'Quote Expiry must be a positive number.';
        }
        if (settings.minBookingNotice <= 0) {
            newErrors.minBookingNotice = 'Minimum Booking Notice must be a positive number.';
        }
        // Password validation would be more complex and handled on the backend
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage(null);
        setError(null);

        const validationErrors = validateSettings();
        if (Object.keys(validationErrors).length > 0) {
            setError(Object.values(validationErrors).join(' '));
            return;
        }

        try {
            setLoading(true);
            // Simulate API call to save settings
            console.log('Attempting to save settings:', settings);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
            // Simulate a successful save
            setSuccessMessage('Settings saved successfully!');
            console.log('Settings Saved:', settings);
            // Optionally clear the password field after submit attempt
            setSettings(prevSettings => ({ ...prevSettings, adminPassword: '' }));
        } catch (err) {
            setError('Failed to save settings. Please try again.');
            console.error('Error saving settings:', err);
        } finally {
            setLoading(false);
        }
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

                        {loading && <p className="loading-message">Loading settings...</p>}
                        {error && <p className="error-message">{error}</p>}
                        {successMessage && <p className="success-message">{successMessage}</p>}

                        {/* The form uses handleSubmit to manage submission */}
                        <form onSubmit={handleSubmit} className="settings-form">

                            <div className="settings-section">
                                <h3>Display Settings</h3>
                                <div className="form-grid">
                                    <div className="form-group switch-group">
                                        <label htmlFor="darkModeToggle">Dark Mode</label>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                id="darkModeToggle"
                                                checked={isDarkMode}
                                                onChange={toggleDarkMode}
                                                disabled={loading || !themeContext}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>

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
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="contactEmail">Default Contact Email</label>
                                        <input
                                            type="email"
                                            id="contactEmail"
                                            value={settings.contactEmail}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="timezone">Timezone</label>
                                        <select
                                            id="timezone"
                                            value={settings.timezone}
                                            onChange={handleChange}
                                            disabled={loading}
                                        >
                                            <option value="SAST">SAST (UTC+2)</option>
                                            <option value="UTC">UTC</option>
                                            <option value="GMT">GMT (UTC+0)</option>
                                            <option value="EST">EST (UTC-5)</option>
                                            <option value="PST">PST (UTC-8)</option>
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
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="minBookingNotice">Minimum Booking Notice (Days)</label>
                                        <input
                                            type="number"
                                            id="minBookingNotice"
                                            value={settings.minBookingNotice}
                                            onChange={handleChange}
                                            disabled={loading}
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
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save"></i> Save Settings
                                    </>
                                )}
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
