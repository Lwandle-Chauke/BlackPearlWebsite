import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
// Import the shared admin CSS (for base styles) and the bookings-specific CSS
import '../styles/admin.css'; 
import '../styles/admin-bookings.css'; 

const AdminBookings = () => {
    // State to manage the visibility of the sidebar on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Toggle function for the hamburger menu
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Data Array for the Bookings Table
    const bookingsData = [
        { id: '#2571Q', customer: 'John Doe', tour: 'Cape Point Tour', dateTime: '15 Sept 2025, 09:30AM', pickupDropoff: 'Sandton Hotel, Johannesburg to Cape Point', passengers: 8, price: 'R 1650', status: 'Completed' },
        { id: '#2731L', customer: 'Sarah Sheeper', tour: 'Airport Transfer', dateTime: '23 Sept 2025, 09:30 AM', pickupDropoff: 'OR Tambo to Rosebank Hotel', passengers: 5, price: 'R750', status: 'Completed' },
        { id: '#3132P', customer: 'Thabo Sulu', tour: 'Conference Shuttle Hire', dateTime: '3 Oct 2025, 12:00 PM', pickupDropoff: 'Sandton Convention Centre', passengers: 12, price: 'R1300', status: 'Pending' },
        { id: '#2580Q', customer: 'Latenya Bly', tour: 'Sports Tour', dateTime: '10 Oct 2025, 06:00 AM', pickupDropoff: 'Hotel to Cape Town Stadium', passengers: 20, price: 'R5250', status: 'Confirmed' },
    ];

    // Helper function to determine the CSS class for the status badge
    const getStatusClass = (status) => {
        switch (status) {
            case 'Completed':
                return 'status-completed';
            case 'Confirmed':
                return 'status-confirmed';
            case 'Pending':
                return 'status-pending';
            default:
                return '';
        }
    };

    // Placeholder actions
    const handleAction = (action, id) => {
        alert(`${action} booking ${id}`);
    };
    
    // Placeholder function for the 'Add Booking' button
    const handleAddBooking = () => {
        alert('Opening Add New Booking form...');
    };

    return (
        // 'sidebar-open' class is added when the menu is active on mobile
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            
            <AdminSidebar 
                isSidebarOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
            />
            
            <div id="content-wrapper">
                
                <AdminTopBar 
                    pageTitle="Bookings" 
                    toggleSidebar={toggleSidebar}
                />

                {/* The 'bookings-page-content' now only holds the main content */}
                <main className="bookings-page-content">
                    
                    {/* --- Main Content Area (Manage Bookings Table - now full width) --- */}
                    <div className="main-content">
                        <h2>Manage Bookings :</h2>
                        
                        {/* Add Booking Button at the top for better mobile UX */}
                        <button className="btn-add-booking-mobile" onClick={handleAddBooking}>
                            <i className="fas fa-plus"></i> Add Booking
                        </button>
                        
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Booking ID</th>
                                        <th>Customer ID</th>
                                        <th>Tour</th>
                                        <th>Date & Time</th>
                                        <th>Pickup/Dropoff</th>
                                        <th>Pass.</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookingsData.map((booking) => (
                                        <tr key={booking.id}>
                                            <td>{booking.id}</td>
                                            <td>{booking.customer}</td>
                                            <td>{booking.tour}</td>
                                            <td>{booking.dateTime}</td>
                                            <td>{booking.pickupDropoff}</td>
                                            <td>{booking.passengers}</td>
                                            <td>{booking.price}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="action-icons">
                                                <i 
                                                    className="fas fa-eye" 
                                                    title="View" 
                                                    onClick={() => handleAction('View', booking.id)}
                                                ></i> 
                                                <i 
                                                    className="fas fa-edit" 
                                                    title="Edit" 
                                                    onClick={() => handleAction('Edit', booking.id)}
                                                ></i> 
                                                <i 
                                                    className="fas fa-file-invoice" 
                                                    title="Invoice" 
                                                    onClick={() => handleAction('Invoice', booking.id)}
                                                ></i>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Add Booking Button (Desktop) */}
                        <button className="btn-add-booking-desktop" onClick={handleAddBooking}>
                            <i className="fas fa-plus"></i> Add Booking
                        </button>
                    </div>
                </main>
                
            </div> 
            

            {/* Overlay for mobile view when sidebar is open */}
            <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
        </div>
    );
};

export default AdminBookings;