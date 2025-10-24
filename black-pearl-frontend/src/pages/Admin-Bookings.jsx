< !DOCTYPE html >
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Bookings - Black Pearl Admin</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="quote.css" />
                <link rel="stylesheet" href="style.css">
                    <script src="script.js" defer></script>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

                        <!-- Favicon setup -->
                        <link rel="icon" type="image/x-icon" href="/favicon.ico">
                            <link rel="icon" type="image/png" sizes="16x16" href="/favicon_16x16.png">
                                <link rel="icon" type="image/png" sizes="32x32" href="/favicon_32x32.png">
                                    <link rel="icon" type="image/png" sizes="48x48" href="/favicon_48x48.png">
                                        <link rel="icon" type="image/png" sizes="64x64" href="/favicon_64x64.png">
                                            <link rel="icon" type="image/png" sizes="128x128" href="/favicon_128x128.png">
                                                <link rel="icon" type="image/png" sizes="256x256" href="/favicon_256x256.png">

                                                    <style>
/* ==========================================================
                                                        COLOR VARIABLES (Match Admin Screenshot Colors)
                                                        ========================================================== */
                                                        :root {
                                                            --white: #ffffff;
                                                        --dark-gray: #4a4a4a;
                                                        --light-gray: #f8f8f8;
                                                        --primary-blue: #3498db;
                                                        --text-dark: #333;
                                                        --silver: #aaa;
                                                        --success: #2ecc71;
                                                        --pending: #f39c12;
                                                        --completed: #2c3e50;
}

                                                        /* ==========================================================
                                                           BASE & LAYOUT STYLES (Vertical Layout)
                                                           ========================================================== */
                                                        body {
                                                            font - family: "Poppins", sans-serif;
                                                        margin: 0;
                                                        background: var(--light-gray);
                                                        color: var(--text-dark);
                                                        display: flex;
                                                        min-height: 100vh;
}
                                                        header nav, .nav-actions, .mobile-menu {display: none !important; }

                                                        /* Main Content Area */
                                                        #content-wrapper {
                                                            flex - grow: 1;
                                                        padding: 20px;
                                                        margin-left: 250px;
                                                        padding-top: 80px;
                                                        transition: margin-left 0.3s;
                                                        display: flex;
                                                        gap: 20px;
}

                                                        /* ==========================================================
                                                           SIDEBAR NAVIGATION & TOP BAR (Copied from admin.html)
                                                           ========================================================== */
                                                        .sidebar {width: 250px; position: fixed; top: 0; left: 0; bottom: 0; background: var(--dark-gray); color: white; padding-top: 20px; z-index: 1000; }
                                                        .sidebar-header {display: flex; align-items: center; padding: 0 20px 20px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px; }
                                                        .sidebar-logo {width: 100%; text-align: center; }
                                                        .sidebar-logo img {max - width: 100%; height: auto; filter: grayscale(100%) brightness(150%); }
                                                        .sidebar ul {list - style: none; padding: 0; margin: 0; }
                                                        .sidebar ul li a {display: flex; align-items: center; padding: 15px 20px; color: #ccc; text-decoration: none; font-weight: 500; transition: background 0.2s, color 0.2s; }
                                                        .sidebar ul li a i {font - size: 1.2rem; margin-right: 15px; }
                                                        .sidebar ul li a:hover {background: #3c3c3c; color: white; }
                                                        .sidebar ul li a.active {background: white; color: var(--text-dark); font-weight: 600; border-right: 4px solid var(--primary-blue); }

                                                        .top-bar {position: fixed; top: 0; right: 0; left: 250px; height: 60px; background: var(--white); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); z-index: 999; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
                                                        .page-title h1 {margin: 0; font-size: 1.8rem; font-weight: 600; color: var(--text-dark); }
                                                        .admin-info {display: flex; align-items: center; font-size: 1rem; color: var(--text-dark); }
                                                        .admin-info i {margin - left: 10px; font-size: 1.2rem; }

                                                        /* ==========================================================
                                                           BOOKINGS CONTENT STYLES
                                                           ========================================================== */
                                                        .main-content {
                                                            flex: 3; /* Takes up 3/4 of the available width */
                                                        background: white;
                                                        padding: 20px;
                                                        border-radius: 6px;
                                                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

                                                        .secondary-content {
                                                            flex: 1; /* Takes up 1/4 of the available width */
                                                        background: var(--light-gray);
                                                        padding: 20px;
                                                        border-radius: 6px;
}

                                                        .main-content h2, .secondary-content h2 {
                                                            font - size: 1.5rem;
                                                        margin-top: 0;
                                                        margin-bottom: 20px;
                                                        color: var(--dark-gray);
}

                                                        /* Table Styles */
                                                        .data-table-container {
                                                            overflow - x: auto;
}
                                                        .data-table {
                                                            width: 100%;
                                                        border-collapse: collapse;
}
                                                        .data-table th, .data-table td {
                                                            padding: 12px 8px;
                                                        text-align: left;
                                                        border-bottom: 1px solid #eee;
                                                        font-size: 0.85rem;
                                                        color: var(--text-dark);
}
                                                        .data-table th {
                                                            font - weight: 600;
                                                        color: #666;
                                                        text-transform: uppercase;
}
                                                        .data-table tr:last-child td {
                                                            border - bottom: none;
}

                                                        /* Status Badges */
                                                        .status-badge {
                                                            padding: 4px 8px;
                                                        border-radius: 4px;
                                                        font-size: 0.75rem;
                                                        font-weight: 600;
                                                        display: inline-block;
}
                                                        .status-completed {background: var(--completed); color: white; }
                                                        .status-confirmed {background: var(--success); color: white; }
                                                        .status-pending {background: var(--pending); color: white; }

                                                        /* Action Icons */
                                                        .action-icons i {
                                                            cursor: pointer;
                                                        margin-right: 5px;
                                                        color: var(--dark-gray);
                                                        transition: color 0.2s;
}
                                                        .action-icons i:hover {color: var(--primary-blue); }

                                                        .btn-add-booking {
                                                            background: var(--primary-blue);
                                                        color: white;
                                                        border: none;
                                                        padding: 8px 15px;
                                                        border-radius: 4px;
                                                        cursor: pointer;
                                                        font-weight: 600;
                                                        margin-top: 15px;
                                                        display: block;
                                                        float: right;
}
                                                        .btn-add-booking:hover {background: #2980b9; }

                                                        /* Recent Updates Sidebar */
                                                        .update-block {
                                                            margin - bottom: 25px;
                                                        padding-bottom: 15px;
                                                        border-bottom: 1px solid #ddd;
}
                                                        .update-block:last-child {border - bottom: none; margin-bottom: 0; }
                                                        .update-block h3 {
                                                            font - size: 1rem;
                                                        color: var(--text-dark);
                                                        margin-bottom: 5px;
                                                        font-weight: 600;
}
                                                        .update-block p {
                                                            font - size: 0.85rem;
                                                        color: #555;
                                                        margin: 0;
}


                                                        /* Simplified Footer Styles */
                                                        .footer {padding: 0; background: var(--light-gray); color: var(--silver); margin-left: 250px; }
                                                        .footer-inner {display: none; }
                                                        .bottom-bar {width: auto; text-align: center; background: var(--light-gray); padding: 20px 0; color: var(--silver); font-size: 0.8rem; }

                                                        /* Responsive adjustments */
                                                        @media (max-width: 992px) {
    .sidebar {width: 60px; }
                                                        .sidebar span {display: none; }
                                                        .sidebar ul li a {justify - content: center; padding: 15px 0; }
                                                        #content-wrapper, .top-bar, .footer {margin - left: 60px; left: 60px; }
                                                        .main-content {flex: 1; }
                                                        .secondary-content {display: none; } /* Hide updates sidebar on small screen */
}
                                                    </style>
                                                </head>
                                                <body>

                                                    <div class="sidebar">
                                                        <div class="sidebar-header">
                                                            <div class="sidebar-logo">
                                                                <img src="https://i.imgur.com/your-black-pearl-logo.png" alt="Black Pearl Tours Admin" style="max-width: 150px; filter: grayscale(100%) brightness(150%);">
                                                            </div>
                                                        </div>
                                                        <ul>
                                                            <li><a href="admin.html"><i class="fas fa-tachometer-alt"></i> <span>Dashboard</span></a></li>
                                                            <li><a href="admin-messages.html"><i class="fas fa-envelope"></i> <span>Messages</span></a></li>
                                                            <li><a href="admin-bookings.html" class="active"><i class="fas fa-calendar-alt"></i> <span>Bookings</span></a></li>
                                                            <li><a href="admin-tours.html"><i class="fas fa-route"></i> <span>Tours</span></a></li>
                                                            <li><a href="admin-gallery.html"><i class="fas fa-images"></i> <span>Gallery</span></a></li>
                                                            <li><a href="admin-settings.html"><i class="fas fa-cog"></i> <span>Settings</span></a></li>
                                                            <li><a href="index.html" onclick="alert('Logged out.');"><i class="fas fa-sign-out-alt"></i> <span>Logout</span></a></li>
                                                        </ul>
                                                    </div>

                                                    <div id="content-wrapper">

                                                        <div class="top-bar">
                                                            <div class="page-title">
                                                                <h1>Bookings</h1>
                                                            </div>
                                                            <div class="admin-info">
                                                                Admin <i class="fas fa-user-circle"></i>
                                                            </div>
                                                        </div>

                                                        <div class="main-content">
                                                            <h2>Manage Bookings :</h2>
                                                            <div class="data-table-container">
                                                                <table class="data-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Booking ID</th>
                                                                            <th>Customer ID</th>
                                                                            <th>Tour</th>
                                                                            <th>Date & Time</th>
                                                                            <th>Pickup/Dropoff</th>
                                                                            <th>Passengers</th>
                                                                            <th>Price</th>
                                                                            <th>Status</th>
                                                                            <th>Actions</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>#2571Q</td>
                                                                            <td>John Doe</td>
                                                                            <td>Cape Point Tour</td>
                                                                            <td>15 Sept 2025, 09:30AM</td>
                                                                            <td>Sandton Hotel, Johannesburg to Cape Point</td>
                                                                            <td>8</td>
                                                                            <td>R 1650</td>
                                                                            <td><span class="status-badge status-completed">Completed</span></td>
                                                                            <td class="action-icons"><i class="fas fa-eye"></i> <i class="fas fa-edit"></i> <i class="fas fa-file-invoice"></i></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>#2731L</td>
                                                                            <td>Sarah Sheeper</td>
                                                                            <td>Airport Transfer</td>
                                                                            <td>23 Sept 2025, 09:30 AM</td>
                                                                            <td>OR Tambo to Rosebank Hotel</td>
                                                                            <td>5</td>
                                                                            <td>R750</td>
                                                                            <td><span class="status-badge status-completed">Completed</span></td>
                                                                            <td class="action-icons"><i class="fas fa-eye"></i> <i class="fas fa-edit"></i> <i class="fas fa-file-invoice"></i></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>#3132P</td>
                                                                            <td>Thabo Sulu</td>
                                                                            <td>Conference Shuttle Hire</td>
                                                                            <td>3 Oct 2025, 12:00 PM</td>
                                                                            <td>Sandton Convention Centre</td>
                                                                            <td>12</td>
                                                                            <td>R1300</td>
                                                                            <td><span class="status-badge status-pending">Pending</span></td>
                                                                            <td class="action-icons"><i class="fas fa-eye"></i> <i class="fas fa-edit"></i> <i class="fas fa-file-invoice"></i></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>#2580Q</td>
                                                                            <td>Latenya Bly</td>
                                                                            <td>Sports Tour</td>
                                                                            <td>10 Oct 2025, 06:00 AM</td>
                                                                            <td>Hotel to Cape Town Stadium</td>
                                                                            <td>20</td>
                                                                            <td>R5250</td>
                                                                            <td><span class="status-badge status-confirmed">Confirmed</span></td>
                                                                            <td class="action-icons"><i class="fas fa-eye"></i> <i class="fas fa-edit"></i> <i class="fas fa-file-invoice"></i></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <button class="btn-add-booking"><i class="fas fa-plus"></i> Add Booking</button>
                                                        </div>

                                                        <div class="secondary-content">
                                                            <h2>Recent Updates</h2>

                                                            <div class="update-block">
                                                                <h3>New quote request.</h3>
                                                                <p>"New quote request: Daniel Mokoena – Events & Leisure (Pretoria → Sun City, 15 passengers)."</p>
                                                            </div>

                                                            <div class="update-block">
                                                                <h3>Customer inquiry submitted.</h3>
                                                                <p>"Support request: Pickup location change for booking #2071Q."</p>
                                                            </div>

                                                            <div class="update-block">
                                                                <h3>Vehicle assigned/unavailable.</h3>
                                                                <p>"Mercedes Sprinter #V-1003 assigned to Airport Transfer. Warning: Minibus #V-1010 unavailable (scheduled maintenance)."</p>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </body>
                                            </html>