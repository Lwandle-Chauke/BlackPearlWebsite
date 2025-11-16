# **Black Pearl Coach Charters & Tours Website**

<p align="center">
  <img src="https://i.postimg.cc/Y2m5Q4ZJ/Black-Pearl-Banner.png" alt="Black Pearl Project Banner" width="100%" />
</p>

<h1 align="center">Black Pearl Coach Charters & Tours  
<br>Modern Booking Platform</h1>

<p align="center">
  A full full-stack booking platform built for Black Pearl Coach Charters & Tours.<br>
  Modern. Automated. Mobile-Ready. Fully Integrated with Real-Time Booking & Admin Management.
</p>

---

# **Live System Links**

| Service                        | URL                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Deployed Website**           | [https://blackpearlwebsite.onrender.com/](https://blackpearlwebsite.onrender.com/)                                                                           |
| **GitHub Repository**          | [https://github.com/Lwandle-Chauke/BlackPearlWebsite.git](https://github.com/Lwandle-Chauke/BlackPearlWebsite.git)                                           |
| **Scrum Board (Jira)**         | [https://blackpearltours.atlassian.net/jira/core/projects/BLAC](https://blackpearltours.atlassian.net/jira/core/projects/BLAC)                               |
| **CodeFactor Quality Report**  | [https://www.codefactor.io/repository/github/lwandle-chauke/blackpearlwebsite](https://www.codefactor.io/repository/github/lwandle-chauke/blackpearlwebsite) |
| **YouTube System Demo**        | [https://youtu.be/fok0IIWQR6A](https://youtu.be/fok0IIWQR6A)                                                                                                 |
| **Backup Demo (Google Drive)** | [https://drive.google.com/file/d/1kqEBXqV_ovh_OA06QGb9awyCsneNTszw/view](https://drive.google.com/file/d/1kqEBXqV_ovh_OA06QGb9awyCsneNTszw/view)             |

---

# **Project Overview**

Black Pearl Coach Charters & Tours previously operated using an outdated, non-responsive, static website with **no booking system**.

This project modernises their digital presence by creating a **fully automated booking platform**, including:

* Real booking workflows
* Admin dashboards
* Mobile-first UI
* Real-time quote requests
* Gallery, fleet & tour management
* Secure authentication
* AI-powered chatbot

The result is a **professional, scalable, automated, and user-friendly platform**.

---

# **Features**

## **Customer Features**

* Browse tours, fleet, gallery & testimonials
* Register & log in
* Request quotes
* Book tours
* Manage bookings
* Update profile
* Leave testimonials
* AI chatbot
* Mobile responsive

## **Admin Features**

* Secure admin login
* Manage bookings (approve/update/delete)
* Manage tours (CRUD)
* Manage fleet
* Manage gallery
* Manage testimonials
* View analytics

## **System-Wide Features**

* Full CRUD operations
* JWT Authentication
* Cloud hosting (Render + MongoDB Atlas)
* CI/CD
* Professional UI/UX

---

# **Tech Stack**

## **Frontend**

* React.js
* HTML5, CSS3
* Axios

## **Backend**

* Node.js
* Express.js
* JWT
* Nodemailer

## **Database**

* MongoDB Atlas

## **DevOps**

* GitHub Actions
* Render Hosting
* CodeFactor

## **Tools**

* Jira
* Figma
* Draw.io
* GitHub

---

# **System Architecture**

### **Three-Tier Architecture**

```
Frontend (React)
↓
Backend API (Node.js + Express)
↓
Database (MongoDB Atlas)
```

### **Deployment Diagram**

```
User → React Frontend → Node/Express API → MongoDB Atlas Cluster
```

---

# **Folder Structure**

```
BlackPearlWebsite/
│
├── client/             
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   └── App.js
│   └── package.json
│
├── server/             
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
├── README.md
└── package.json
```

---

# **User Roles**

### **Guest**

* View tours, gallery, fleet
* Submit quote form
* Use chatbot

### **Registered User**

* Book tours
* Manage bookings
* Update profile
* Submit testimonials

### **Admin**

* Manage tours, bookings, testimonials, gallery
* Access analytics
* Full control

---

# **JSON Schemas**

### **User Schema**

```json
{
  "name": "string",
  "email": "string",
  "password": "hashed-string",
  "role": "customer | admin"
}
```

### **Booking Schema**

```json
{
  "userId": "ObjectId",
  "tourId": "ObjectId",
  "date": "string",
  "passengers": "number",
  "status": "Pending | Approved | Cancelled"
}
```

### **Tour Schema**

```json
{
  "title": "string",
  "description": "string",
  "price": "number",
  "images": ["string"]
}
```

---

# **Security Features**

* JWT Authentication
* Encrypted passwords (bcrypt)
* Role-based access
* HTTPS
* Input sanitisation
* NoSQL injection prevention
* Dependency scanning

---

# **Installation & Setup**

### **1. Clone Repo**

```bash
git clone https://github.com/Lwandle-Chauke/BlackPearlWebsite.git
cd BlackPearlWebsite
```

### **2. Install Dependencies**

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

### **3. Add Environment Variables**

Create `/server/.env`:

```
MONGO_URI=your_cluster_uri
JWT_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

### **4. Start Backend**

```bash
npm start
```

### **5. Start Frontend**

```bash
npm run dev
```

---

# **Deployment (CI/CD)**

1. Push to GitHub
2. GitHub Actions builds & tests
3. Auto deployment to Render

---

# **Agile / Scrum Workflow**

* Jira board
* GitHub version control
* WhatsApp stand-ups
* Sprint planning + retrospectives
* Client feedback loops

---

# **Contributors**

<p align="center">

  <img src="https://img.shields.io/badge/Anele%20Ndukuya-Backend%20Lead-0A66C2?style=for-the-badge&logo=github" />

  <img src="https://img.shields.io/badge/Lauren%20Moses-Product%20Owner-2E8B57?style=for-the-badge&logo=github" />

  <img src="https://img.shields.io/badge/Ntokozo%20Mhlanga-AI%20%2F%20Security%20Lead-8A2BE2?style=for-the-badge&logo=github" />

  <img src="https://img.shields.io/badge/Olebogeng%20Mokaleng-Frontend%20Developer-FF8C00?style=for-the-badge&logo=github" />

  <img src="https://img.shields.io/badge/Lwandle%20Chauke-Frontend%20Lead-1E90FF?style=for-the-badge&logo=github" />

</p>

---

# **License**

Licensed under the **MIT License**.

---

# **Thank You**

This system was developed as a full WIL project for:
**Black Pearl Coach Charters & Tours (2025)**
Designed, coded, tested, and documented by **Team 9**.

