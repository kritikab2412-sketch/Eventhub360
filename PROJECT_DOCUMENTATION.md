# Project Documentation - Enterprise Employee Management System (EMS)

## 1. Project Overview
The **Enterprise Employee Management System (EMS) & Workflow Engine** is an end-to-end full-stack ERP web portal designed to streamline human resource processes, manage corporate hardware inventories, track employee leaves using a multi-level department approval workflow, and maintain strict database mutation logs for auditing. 

This application provides structured role-based views for **Administrators**, **HR Representatives**, **Department Managers**, and **Employees**, ensuring granular security constraints across all operations.

---

## 2. System Architecture
The application is structured into distinct layers using a **Controller-Service-Repository** clean architecture:
*   **Database (PostgreSQL)**: The relational database engine containing 16 tables, 3 database views, and trigger functions for audit tracking.
*   **ORM (Prisma & PG Pool)**: Leverages Prisma Client JS alongside `@prisma/adapter-pg` driver pool to manage safe transactions and query compiling.
*   **Backend REST API (Express.js)**: Implements Winston logging, Joi request validation schema checking, token authorization guards, and custom error middleware.
*   **Frontend Client (React & Redux)**: A modular React single-page application utilizing Redux Toolkit for centralized state sync, Axios response interceptors for JWT access/refresh token rotation, and Chart.js for visualization dashboards.

---

## 3. Database Schema Design
The system uses a highly normalized relational database design to maintain data integrity.

### Core Tables
1.  **`users`**: Manages credentials, verification state, system role, and session tokens.
2.  **`employee_profiles`**: Linked to `users` via 1-to-1 relationship. Houses designation, salary, phone, address, and department keys.
3.  **`departments`**: Master list of organizational departments.
4.  **`skills`**: Master list of technical skill sets.
5.  **`employee_skills`**: Many-to-Many join table linking profiles to multiple skills.
6.  **`employee_images`**: Document repository linking profile pictures, resumes, and certificates.
7.  **`leave_types`**: Master leave configurations (Casual Leave, Sick Leave, etc.) with default days.
8.  **`leave_balance`**: Tracking remaining days for each employee profile.
9.  **`leave_applications`**: Individual requests with dates ranges, reason, and status.
10. **`approval_history`**: Audit records of workflow status transitions (applied, approved, rejected).
11. **`assets`**: Hardware asset registry and availability state.
12. **`asset_allocations`**: Active and historical assignments of hardware items to profiles.
13. **`asset_history`**: Lifecycle log for assets modifications.
14. **`notifications`**: System notifications.
15. **`audit_logs`**: Mutation audit logs storing before/after JSONB changes.

---

## 4. API Endpoints
All endpoints are versioned under `/api/v1` and require header `Authorization: Bearer <token>` unless public.

### Authentication Endpoints (`/auth`)
*   `POST /signup`: Register new account (Public)
*   `GET /verify-email/:token`: Activate account (Public)
*   `POST /login`: Generate access & refresh tokens (Public)
*   `POST /refresh-token`: Renew access token (Public)
*   `POST /forgot-password`: Request email reset token (Public)
*   `POST /reset-password`: Update password (Public)
*   `GET /profile`: Fetch active profile details

### Employee Directory Endpoints (`/employees`)
*   `GET /`: List paginated employees (with search, sort, and department filters)
*   `GET /:id`: View full employee profile details (including skills, documents)
*   `PUT /:id`: Update employee details (Restricted to Admin/HR/Manager)
*   `DELETE /:id`: Remove employee account (Restricted to Admin)
*   `POST /:id/upload`: Attach profile files or certificates
*   `GET /stats`: Fetch dashboard quick statistics
*   `GET /departments`: Fetch departments list
*   `GET /skills`: Fetch skills list

### Leave Workflow Endpoints (`/leaves`)
*   `GET /types`: List configured leave types
*   `GET /balances`: Fetch current user's remaining leave days
*   `POST /apply`: File a new leave application
*   `GET /requests`: List queue of pending approvals (Filtered by role permissions)
*   `PUT /review/:id`: Approve or reject application (Restricted to Admin/HR/Manager)

### Asset Catalog Endpoints (`/assets`)
*   `GET /`: List all assets (Restricted to Admin/HR/Manager)
*   `GET /my`: View current user's allocated items
*   `GET /:id`: View asset log and details
*   `POST /`: Add new hardware item (Restricted to Admin/HR)
*   `PUT /:id`: Edit asset metadata (Restricted to Admin/HR)
*   `DELETE /:id`: Delete asset (Restricted to Admin)
*   `POST /allocate`: Assign asset to employee profile
*   `POST /:id/return`: Record hardware return and log condition state

### Reports & Audits Endpoints (`/reports`)
*   `GET /stats`: Fetch Chart.js aggregates (Leave trends, hiring trends, departments)
*   `GET /export/employees`: Export employee directory as CSV
*   `GET /export/leaves`: Export leave requests history as CSV
*   `GET /export/assets`: Export asset list as CSV
*   `GET /audit-logs`: Paginated view of audit changes (Restricted to Admin)

---

## 5. Deployment Architecture
*   **Vercel**: Hosts the static compiled Vite-React SPA. All routes are mapped to index.html using `nginx.conf` fallback rules.
*   **Render**: Runs the backend server Node.js process linked to a PostgreSQL database.
*   **Neon / Render Postgres**: Provisions the cloud database instance containing tables, views, and change triggers.

---

## 6. Future Enhancements
*   **Active Directory Integration (LDAP/SSO)**: Supporting Single Sign-On for enterprise users.
*   **Automated Payroll System**: Incorporating salary disbursements based on employee profiles.
*   **Advanced Analytics Engine**: Projecting resource capacity and absenteeism trends using machine learning models.
