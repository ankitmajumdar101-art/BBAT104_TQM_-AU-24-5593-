# Restaurant Billing & POS Web Application
## TQM Course Project (BBAT104)

**Project:** Modern Restaurant Billing & POS Web Application  
**Quality Goal:** Q01 - Improve Reliability & Multi-Stakeholder Operations  
**GitHub Repository:** [https://github.com/ankitmajumdar101-art/BBAT104_TQM_-AU-24-5593-.git](https://github.com/ankitmajumdar101-art/BBAT104_TQM_-AU-24-5593-.git)

---

## 1. Project Overview

The objective of this project is to develop a real-time, commercial-grade, web-based Restaurant Billing & Point of Sale (POS) application designed to streamline dining operations, customer checkout, menu administration, and business revenue analytics while enforcing software reliability standards.

### Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), React.js (Vite), Lucide Icons
- **Backend:** Node.js, Express.js (REST API Architecture)
- **Database:** MySQL / MariaDB (XAMPP Server on Port 3306)
- **Authentication & Security:** BCrypt Password Hashing, JSON Web Tokens (JWT)
- **Dynamic Payment:** Scannable Dynamic UPI QR Code Generation (`qrcode.react`)
- **Printing:** Standard 80mm/58mm Thermal Receipt CSS Media Printing (`window.print()`)

---

## 2. Stakeholder Architecture

The application is tailored to address the operational and strategic requirements of key food & beverage stakeholders:

| Stakeholder | Key Features & Responsibilities |
| :--- | :--- |
| **1. Restaurant Owner** | Executive analytics dashboard, real-time daily/total revenue, top-selling dishes ranking, payment breakdown (Cash, UPI, Card), staff account oversight. |
| **2. Admin** | Menu catalog administration (full CRUD: Add, Edit, Delete, Stock Availability toggle), staff user accounts and role permissions, system audit logs, database backups. |
| **3. Cashier** | High-speed billing desk, visual menu catalog with category filter pills and live search, dynamic cart (+ / - quantity adjustments), table selection, discount & tax calculations, thermal receipt printing, dynamic UPI QR payment. |
| **4. Customer** | Accurate itemized bill, transparent GST breakdown (2.5% CGST + 2.5% SGST), printed thermal receipt or digital QR payment. |
| **5. Developer / Maintainer** | Centralized error recovery middleware, structured MySQL schema, database automated backup dumps, non-breaking REST endpoints. |

---

## 3. TQM Quality Features (Goal: Q01 - Improve Reliability)

1. **Auto Backup (`/api/backup`):** One-click MySQL database dump generation saving timestamped `.sql` backups in the `backups/` directory with file size verification and audit tracking.
2. **Audit Logging (`audit_logs`):** Automatic recording of every critical system transaction (logins, invoice generation, menu edits, role changes, and backups) with user ID, role, action, and timestamp.
3. **Input Validation & Server Pricing Integrity:** Server-side recalculation of subtotal and taxes to prevent client-side price tampering; strict validation of menu inputs and staff credentials.
4. **Error Recovery Middleware:** Centralized Express error handler catching unhandled exceptions, storing stack traces in `error_logs`, and delivering safe, non-crashing recovery guidance to users.
5. **Role-Based Access Control (RBAC):** Strict JWT middleware restricting sensitive administrative and analytical routes exclusively to `Admin` and `Owner` roles.

---

## 4. Default Login Credentials

| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Restaurant Owner** | `owner` | `owner123` | Executive Analytics, POS Billing, Menu, Users, Audit Logs |
| **Admin** | `admin` | `admin123` | POS Billing, Bill History, Menu CRUD, Users, Audit Logs & Backups |
| **Cashier** | `cashier` | `cash123` | POS Billing & Bill History |

*(Note: The login page also features 1-click demo buttons for instant access during presentations and evaluation).*

---

## 5. How to Run the Application

### Option A: One-Click Runner (Windows)
Double-click `start-web-app.bat` in the project root. It will:
1. Verify that MySQL (XAMPP) is running.
2. Launch the backend server on `http://localhost:5000`.
3. Open the application directly in your web browser.

### Option B: Manual Setup

1. **Start MySQL Server:**
   Ensure MySQL is running via the XAMPP Control Panel on port 3306.

2. **Initialize Database (if not already done):**
   ```bash
   mysql -u root < database/schema.sql
   ```

3. **Start the Backend Server:**
   ```bash
   cd server
   npm install
   npm start
   ```
   Server will start at `http://localhost:5000`.

4. **Start the React Frontend (Development Mode):**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Frontend will run at `http://localhost:3000` (proxied to port 5000).

*(In production, `server.js` serves the pre-compiled React build directly from `client/dist` on `http://localhost:5000`).*

---

## 6. Project Structure

```text
RestaurantBillingSystem/
│
├── database/
│   └── schema.sql              # MySQL schema (users, menu_items, orders, audit_logs)
│
├── server/
│   ├── config/
│   │   └── db.js               # MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js             # JWT & Role-Based Access Control
│   │   └── errorHandler.js     # Centralized Error Recovery (Q01)
│   ├── routes/
│   │   ├── auth.js             # Login & JWT session routes
│   │   ├── menu.js             # Menu Catalog CRUD routes
│   │   ├── orders.js           # Billing & Order processing routes
│   │   ├── users.js            # User management routes
│   │   ├── analytics.js        # Owner KPI & revenue routes
│   │   ├── audit.js            # Audit & Error log routes
│   │   └── backup.js           # Database backup routes
│   ├── utils/
│   │   └── auditLogger.js      # Audit log recorder
│   ├── package.json
│   ├── server.js               # Express application entrypoint
│   └── test-api.js             # Automated API integration test suite
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header with role badge & navigation
│   │   │   ├── Login.jsx           # Sign-in with 1-click test credentials
│   │   │   ├── POSBilling.jsx      # Cashier Billing terminal & active cart
│   │   │   ├── ReceiptModal.jsx    # Thermal print receipt & dynamic UPI QR
│   │   │   ├── BillHistory.jsx     # Past bills & invoice reprinting
│   │   │   ├── AdminMenu.jsx       # Menu item CRUD & stock availability
│   │   │   ├── AdminUsers.jsx      # Staff accounts & permissions
│   │   │   ├── OwnerAnalytics.jsx  # Revenue charts & best-selling dishes
│   │   │   └── AuditLogs.jsx       # Audit explorer & backup manager
│   │   ├── App.jsx                 # Main state & view coordinator
│   │   ├── index.css               # Modern POS theme & 80mm print stylesheet
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backups/                    # Auto-generated database SQL dumps
├── docs/                       # TQM and testing documentation
├── start-web-app.bat           # 1-click Windows quick launcher
└── README.md
```
