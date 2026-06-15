# Enterprise Employee Management System (EMS) & Workflow Engine

A production-ready Full-Stack Employee Management System (EMS) and Workflow Engine built to automate corporate administration processes. This project includes user session management (access & refresh tokens), a multi-level leave approval workflow, hardware asset inventory logs, email verifications, database triggers for change audit logs, and analytics reporting exports.

---

## 🚀 Key Features

*   **Authentication & Access Control**: 
    *   JWT Access & Refresh Token rotation.
    *   Password reset via email tokens and account activation.
    *   Role-based access verification (`Admin`, `HR`, `Manager`, `Employee`).
*   **Employee Profile Directory**: 
    *   Profile updates, cached skills selections, and department associations.
    *   Document attachments and profile picture uploads using **Multer**.
    *   Search, filter by department, and paginated directory tables.
*   **Leave Workflow Engine**: 
    *   Dates calculation, balance tracking, and transaction-bound approval chains (Employee $\rightarrow$ Manager $\rightarrow$ HR).
*   **Asset Catalog & Tracking**: 
    *   Hardware registry, allocation assignment, returned condition logs, and asset lifecycle tracking.
*   **Notification Engine**: 
    *   Real-time system feed and daily email reminders.
*   **Database Mutation Audit Logs**: 
    *   Automatic logging of inserts, updates, and deletes as JSONB datasets via PostgreSQL triggers.
*   **Reporting & Analytics Dashboard**: 
    *   Hiring trends, department distribution, and leave status graphs utilizing **Chart.js**.
    *   CSV exports for employees directory, leaves history, and asset inventory.

---

## 🛠️ Tech Stack

*   **Frontend**: React, Redux Toolkit (State Management), React Router v7, Chart.js, Vanilla CSS (Premium Glassmorphism styling).
*   **Backend**: Node.js, Express.js, PostgreSQL, Prisma ORM, Joi Validation, Winston Logging, Node-cron background backups.
*   **DevOps & Hosting**: Docker, Docker Compose, Nginx, Vercel (Frontend), Render (Backend), Neon PostgreSQL (Cloud DB).

---

## 📦 Project Directory Structure

```text
ems-project/
├── backend/
│   ├── prisma/             # Schema definition & database view models
│   ├── src/
│   │   ├── config/         # DB connection client
│   │   ├── controllers/    # API routes controllers
│   │   ├── middleware/     # Role auth guard, uploads, error handlers
│   │   ├── routes/         # Version 1 API routers
│   │   ├── utils/          # Mailers, loggers, caches, and cron jobs
│   │   ├── validators/     # Joi validation schemas
│   │   └── server.js       # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/             # Icons & favicons
│   ├── src/
│   │   ├── api/            # Axios interceptors
│   │   ├── components/     # Sidebars, Navbars, Route guards
│   │   ├── pages/          # Logins, Dashboards, Leaves, Audits
│   │   ├── store/          # Redux Toolkit config
│   │   ├── App.jsx         # App router
│   │   └── index.css       # Glassmorphism styling system
│   ├── Dockerfile
│   ├── nginx.conf          # SPA Nginx router rules
│   └── package.json
└── docker-compose.yml
```

---

## ⚙️ Local Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL Database instance

### 1. Database Setup
1. Create a PostgreSQL database named `loginapp`.
2. Seed the tables, triggers, and views using the SQL seed configuration.

### 2. Backend Config
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Create a `.env` file:
   ```env
   PORT=5001
   DATABASE_URL="postgresql://postgres:yourpassword@127.0.0.1:5432/loginapp?schema=public"
   JWT_SECRET="supersecretkey123"
   JWT_REFRESH_SECRET="supersecretrefreshkey123"
   ```
3. Install packages and generate the Prisma client:
   ```bash
   npm install
   npx prisma generate
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 3. Frontend Config
1. Navigate to `/frontend`:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch development server:
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment URLs

*   **Live Frontend**: [https://frontend-livid-sigma-59.vercel.app](https://frontend-livid-sigma-59.vercel.app)
*   **Live Backend API**: [Render Web Service URL]/api/v1 (e.g., `https://ems-backend-server.onrender.com/api/v1`)
*   **Cloud Database**: Managed via Neon PostgreSQL

---

## 🧑‍💻 Developer Details

*   **Developer Name**: [Your Name / Kritika Bairagi]
*   **Internship Program**: Full-Stack Development Training Program
*   **Company/Team**: Team i-SOFTZONE
