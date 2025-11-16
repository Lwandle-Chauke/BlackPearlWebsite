

# **Black Pearl Coach Charters & Tours Website**

```md
<p align="center">
  <img src="https://i.postimg.cc/Y2m5Q4ZJ/Black-Pearl-Banner.png" alt="Black Pearl Project Banner" width="100%" />
</p>

<h1 align="center"> Black Pearl Coach Charters & Tours  
<br>Modern Booking Platform</h1>

<p align="center">
  A full full-stack booking platform built for Black Pearl Coach Charters & Tours.  
  Modern. Automated. Mobile-Ready. Fully Integrated with Real-Time Booking & Admin Management.
</p>

---

# Live System Links

| Service | URL |
|--------|-----|
| **Deployed Website** | https://blackpearlwebsite.onrender.com/ |
| **GitHub Repository** | https://github.com/Lwandle-Chauke/BlackPearlWebsite.git |
| **Scrum Board (Jira)** | https://blackpearltours.atlassian.net/jira/core/projects/BLAC |
| **CodeFactor Quality Report** | https://www.codefactor.io/repository/github/lwandle-chauke/blackpearlwebsite |
| **YouTube System Demo** | https://youtu.be/fok0IIWQR6A |
| **Backup Demo (Google Drive)** | https://drive.google.com/file/d/1kqEBXqV_ovh_OA06QGb9awyCsneNTszw/view |

---

# Project Overview

Black Pearl Coach Charters & Tours previously operated using an outdated, non-responsive, static website with **no booking system**. All bookings were processed manually through phone/email — causing delays, errors, and poor customer experience.

This project modernises their entire digital presence by creating a **fully automated booking platform**, including:

- Real booking workflows  
- Admin dashboards  
- Mobile-first UI  
- Real-time quote requests  
- Gallery, fleet & tour management  
- Secure user authentication  
- AI-powered chatbot  

The result is a **professional, scalable, automated, and user-friendly platform** suitable for a real tourism business.

---

# Features

### Customer Features
- Browse tours, fleet, gallery & testimonials  
- Register & log in  
- Request quotes  
- Book tours in real-time  
- Manage bookings  
- Update profile  
- Leave testimonials  
- AI Chatbot for instant responses  
- Mobile-first responsive UI  

### Admin Features
- Secure admin login  
- Manage bookings (view/approve/update/delete)  
- Manage tours (CRUD)  
- Manage fleet/vehicles  
- Manage testimonials  
- Manage gallery images  
- View analytics & system stats  

### System-Wide Features
- Full CRUD operations  
- JWT Authentication & role-based access  
- Cloud hosting (Render + MongoDB Atlas)  
- Continuous Deployment  
- Form validation & sanitisation  
- Professional UI/UX built using Figma wireframes  

---

# Tech Stack

### Frontend
- React.js  
- HTML5, CSS3  
- Axios (API communication)  
- Responsive UI components  

### Backend
- Node.js  
- Express.js  
- JWT Authentication  
- Mongoose ORM  
- Nodemailer (email system)  

### Database
- MongoDB Atlas (cloud-hosted)  

### DevOps
- GitHub Actions CI/CD  
- Render Hosting  
- CodeFactor Quality Analysis  

### Tools
- Jira (Scrum board)  
- Figma (UI/UX design)  
- Draw.io (architecture diagrams)  
- GitHub Version Control  

---

# System Architecture

### Three-Tier Architecture
```

Frontend (React)
↓
Backend API (Node.js + Express)
↓
Database (MongoDB Atlas)

```

### Deployment Diagram
```

User → React Frontend → Node/Express API → MongoDB Atlas Cluster

```

---

# Folder Structure

```

BlackPearlWebsite/
│
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   └── App.js
│   └── package.json
│
├── server/                     # Node.js Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
├── README.md
└── package.json

````

---

# User Roles

### 1️⃣ Guest
- View tours, gallery, fleet  
- Submit contact or quote forms  
- Use chatbot  

### 2️⃣ Registered User (Customer)
- Book tours  
- Manage personal bookings  
- Update user profile  
- Submit testimonials  

### 3️⃣ Admin
- Manage tours, bookings, testimonials, gallery  
- View stats  
- Full system access  

---

# JSON Schemas

### User Schema
```json
{
  "name": "string",
  "email": "string",
  "password": "hashed-string",
  "role": "customer | admin"
}
````

### Booking Schema

```json
{
  "userId": "ObjectId",
  "tourId": "ObjectId",
  "date": "string",
  "passengers": "number",
  "status": "Pending | Approved | Cancelled"
}
```

### Tour Schema

```json
{
  "title": "string",
  "description": "string",
  "price": "number",
  "images": ["string"]
}
```

---

# Security Features

* JWT Authentication
* Encrypted passwords (bcrypt)
* Role-based route protection
* HTTPS enforcement
* Input sanitisation & validation
* Prevention against NoSQL injection
* Automated dependency scanning

---

# Installation & Setup

### 1. Clone the Repo

```bash
git clone https://github.com/Lwandle-Chauke/BlackPearlWebsite.git
cd BlackPearlWebsite
```

### 2. Install Dependencies

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd client
npm install
```

### 3. Add Environment Variables

Create `/server/.env`:

```
MONGO_URI=your_cluster_uri
JWT_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

### 4. Start Backend

```bash
npm start
```

### 5. Start Frontend

```bash
npm run dev
```

---

# Deployment (CI/CD)

This project uses **automatic deployment**:

1. Commit pushed to GitHub
2. GitHub Actions runs build & tests
3. If successful → Auto deployment to Render

This ensures the live website is always up to date.

---

# Agile / Scrum Workflow

### Tools:

* Jira Scrum Board
* Trello (initial sprint tracking)
* GitHub version control
* WhatsApp stand-ups
* Sprint planning, review & retrospective
* Client feedback incorporated after each sprint

---

# Contributors

Thanks to the talented team behind this project:

<p align="center">

  <img src="https://img.shields.io/badge/Anele%20Ndukuya-Backend%20Lead-0A66C2?style=for-the-badge&logo=github" />

  <img src="https://img.shields.io/badge/Lauren%20Moses-Product%20Owner-2E8B57?style=for-the-badge&logo=github" />

  <img src="https://img.shields.io/badge/Ntokozo%20Mhlanga-AI%20%2F%20Security%20Lead-8A2BE2?style=for-the-badge&logo=github" />

  <img src="https://img.shields.io/badge/Olebogeng%20Mokaleng-Frontend%20Developer-FF8C00?style=for-the-badge&logo=github" />

  <img src="https://img.shields.io/badge/Lwandle%20Chauke-Frontend%20Lead-1E90FF?style=for-the-badge&logo=github" />

</p>

---

# 📸 Screenshots

*Add your screenshots here*

```
![Home Page](<img width="1888" height="891" alt="image" src="https://github.com/user-attachments/assets/a64378b2-0f78-4f3e-be7a-abdf101c2a04" />
<img width="1882" height="892" alt="image" src="https://github.com/user-attachments/assets/86add39c-f047-4f98-b171-d7babd399622" />
<img width="1896" height="895" alt="image" src="https://github.com/user-attachments/assets/ab1294cd-8c11-427a-b520-a9497b11171d" />
<img width="1901" height="892" alt="image" src="https://github.com/user-attachments/assets/d63d174a-7ad3-45d1-8447-ae738cd97fa5" />
)
![Booking Page](<img width="1814" height="892" alt="image" src="https://github.com/user-attachments/assets/bb68ba9c-f126-4b51-ad4b-5a9e16ccc653" />
<img width="1838" height="893" alt="image" src="https://github.com/user-attachments/assets/50ba1f46-d352-42f9-8575-581eb1023ccf" />
)
![Admin Dashboard](<img width="1896" height="890" alt="image" src="https://github.com/user-attachments/assets/bb77069e-33a5-41d3-9cfe-fe2baec6771a" />
<img width="1896" height="893" alt="image" src="https://github.com/user-attachments/assets/9c6944f1-b6b3-42b0-b640-ba96f0747cc5" />
<img width="1895" height="892" alt="image" src="https://github.com/user-attachments/assets/2f15fa24-3e05-4bcc-b30b-2ceb3d76b43d" />
)
![Fleet Page](<img width="1778" height="888" alt="image" src="https://github.com/user-attachments/assets/c2420165-eda2-489a-934e-f9563cd825ce" />
<img width="1838" height="893" alt="image" src="https://github.com/user-attachments/assets/a778136c-e71f-442c-b9a1-01985576b8fb" />
<img width="1867" height="894" alt="image" src="https://github.com/user-attachments/assets/861a67fc-0d30-45af-bcce-6d0455aafe45" />
)
![Gallery Page](<img width="1879" height="893" alt="image" src="https://github.com/user-attachments/assets/88aaebc7-4afa-4463-be2a-621bd2e5b273" />
<img width="1848" height="892" alt="image" src="https://github.com/user-attachments/assets/436e0853-1721-4384-aab8-77679f4d684b" />
)
```

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 🎉 Thank You

This system was developed as a full WIL project for:
**Black Pearl Coach Charters & Tours (2025)**
Designed, coded, tested, and documented by **Team 9**.


Just tell me!
```
