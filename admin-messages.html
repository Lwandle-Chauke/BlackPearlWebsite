<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Messages - Black Pearl Admin</title>
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
    --dark-gray: #4a4a4a; /* Dark background color for header/sidebar */
    --light-gray: #f8f8f8; /* Background for main content area */
    --primary-blue: #3498db; /* Accent blue (used sparingly) */
    --text-dark: #333;
    --silver: #aaa; 
    --unread: #e74c3c; /* Red for Unread */
    --read: #2ecc71; /* Green for Read */
}

/* ==========================================================
   BASE & LAYOUT STYLES (Vertical Layout)
   ========================================================== */
body { 
    font-family: "Poppins", sans-serif; 
    margin: 0; 
    background: var(--light-gray); 
    color: var(--text-dark); 
    display: flex; 
    min-height: 100vh;
}
header nav, .nav-actions, .mobile-menu { display: none !important; }

/* Main Content Area */
#content-wrapper {
    flex-grow: 1; 
    padding: 20px;
    margin-left: 250px; 
    padding-top: 80px; 
    transition: margin-left 0.3s;
}

/* ==========================================================
   SIDEBAR NAVIGATION & TOP BAR (Shared Styles)
   ========================================================== */
.sidebar { width: 250px; position: fixed; top: 0; left: 0; bottom: 0; background: var(--dark-gray); color: white; padding-top: 20px; z-index: 1000; }
.sidebar-header { display: flex; align-items: center; padding: 0 20px 20px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px; }
.sidebar-logo { width: 100%; text-align: center; }
.sidebar-logo img { max-width: 100%; height: auto; filter: grayscale(100%) brightness(150%); }
.sidebar ul { list-style: none; padding: 0; margin: 0; }
.sidebar ul li a { display: flex; align-items: center; padding: 15px 20px; color: #ccc; text-decoration: none; font-weight: 500; transition: background 0.2s, color 0.2s; }
.sidebar ul li a i { font-size: 1.2rem; margin-right: 15px; }
.sidebar ul li a:hover { background: #3c3c3c; color: white; }
.sidebar ul li a.active { background: white; color: var(--text-dark); font-weight: 600; border-right: 4px solid var(--primary-blue); }

.top-bar { position: fixed; top: 0; right: 0; left: 250px; height: 60px; background: var(--white); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); z-index: 999; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
.page-title h1 { margin: 0; font-size: 1.8rem; font-weight: 600; color: var(--text-dark); }
.admin-info { display: flex; align-items: center; font-size: 1rem; color: var(--text-dark); }
.admin-info i { margin-left: 10px; font-size: 1.2rem; }

/* ==========================================================
   MESSAGES CONTENT STYLES
   ========================================================== */
.main-content {
    width: 100%;
    background: white;
    padding: 20px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.main-content h2 { font-size: 1.5rem; margin-top: 0; margin-bottom: 20px; color: var(--dark-gray); }

/* Table Styles */
.data-table-container {
    overflow-x: auto;
}
.data-table {
    width: 100%;
    border-collapse: collapse;
}
.data-table th, .data-table td {
    padding: 12px 10px;
    text-align: left;
    border-bottom: 1px solid #eee;
    font-size: 0.9rem;
    color: var(--text-dark);
}
.data-table th {
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
}
.data-table tr:last-child td {
    border-bottom: none;
}

/* Status Badges */
.status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-block;
}
.status-unread { background: var(--unread); color: white; }
.status-read { background: var(--read); color: white; }

/* Action Icons */
.action-icons i {
    cursor: pointer;
    margin-right: 5px;
    color: var(--dark-gray);
    transition: color 0.2s;
}
.action-icons i:hover { color: var(--primary-blue); }


/* ==========================================================
   SIMPLIFIED FOOTER
   ========================================================== */
.footer { 
    padding: 0; 
    background: var(--light-gray); 
    color: var(--silver); 
    margin-left: 250px;
}
.footer-inner { display: none; }
.bottom-bar { 
    width: auto; 
    text-align: center; 
    background: var(--light-gray); 
    padding: 20px 0; 
    color: var(--silver); 
    font-size: 0.8rem; 
}

/* ==========================================================
   RESPONSIVE
   ========================================================== */
@media (max-width: 992px) {
    .sidebar { width: 60px; }
    .sidebar span { display: none; }
    .sidebar ul li a { justify-content: center; padding: 15px 0; }
    #content-wrapper, .top-bar, .footer { margin-left: 60px; left: 60px; }
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
        <li><a href="admin-messages.html" class="active"><i class="fas fa-envelope"></i> <span>Messages</span></a></li>
        
        <li><a href="admin-bookings.html"><i class="fas fa-calendar-alt"></i> <span>Bookings</span></a></li>
        <li><a href="admin-tours.html"><i class="fas fa-route"></i> <span>Tours</span></a></li>
        <li><a href="admin-gallery.html"><i class="fas fa-images"></i> <span>Gallery</span></a></li>
        <li><a href="admin-settings.html"><i class="fas fa-cog"></i> <span>Settings</span></a></li>
        <li><a href="index.html" onclick="alert('Logged out.');"><i class="fas fa-sign-out-alt"></i> <span>Logout</span></a></li>
    </ul>
</div>

<div id="content-wrapper">

    <div class="top-bar">
        <div class="page-title">
            <h1>Messages</h1>
        </div>
        <div class="admin-info">
            Admin <i class="fas fa-user-circle"></i>
        </div>
    </div>

    <div class="main-content">
        <h2>Manage Contact Messages :</h2>
        
        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Sender Name</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Date Received</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#504</td>
                        <td>Nomusa Dlamini</td>
                        <td>nomusa.d@mail.com</td>
                        <td>Urgent Inquiry: Quote Follow-up</td>
                        <td>2025-10-15 14:05</td>
                        <td><span class="status-badge status-unread">UNREAD</span></td>
                        <td class="action-icons"><i class="fas fa-eye" title="View Message"></i> <i class="fas fa-trash-alt" title="Delete"></i></td>
                    </tr>
                    <tr>
                        <td>#503</td>
                        <td>Samantha Jones</td>
                        <td>sam@example.com</td>
                        <td>General Inquiry</td>
                        <td>2025-10-15 09:30</td>
                        <td><span class="status-badge status-unread">UNREAD</span></td>
                        <td class="action-icons"><i class="fas fa-eye" title="View Message"></i> <i class="fas fa-trash-alt" title="Delete"></i></td>
                    </tr>
                    <tr>
                        <td>#502</td>
                        <td>Mark Van Der Westhuizen</td>
                        <td>mark.vw@email.co.za</td>
                        <td>Website Feedback</td>
                        <td>2025-10-14 17:10</td>
                        <td><span class="status-badge status-read">READ</span></td>
                        <td class="action-icons"><i class="fas fa-eye" title="View Message"></i> <i class="fas fa-trash-alt" title="Delete"></i></td>
                    </tr>
                    <tr>
                        <td>#501</td>
                        <td>David King</td>
                        <td>david.k@hotmail.com</td>
                        <td>Complaint About Service</td>
                        <td>2025-10-14 10:05</td>
                        <td><span class="status-badge status-read">READ</span></td>
                        <td class="action-icons"><i class="fas fa-eye" title="View Message"></i> <i class="fas fa-trash-alt" title="Delete"></i></td>
                    </tr>
                    </tbody>
            </table>
        </div>
    </div>
<br>
</div> 
</body>
</html>