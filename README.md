# Restaurant Billing & POS Web Application
## TQM Course Project (BBAT104 - AU-24-5593)

**Project:** Modern Restaurant Billing & POS Web Application  
**Quality Goal:** Q01 - Improve Reliability & Multi-Stakeholder Operations  
**GitHub Repository:** [https://github.com/ankitmajumdar101-art/BBAT104_TQM_-AU-24-5593-.git](https://github.com/ankitmajumdar101-art/BBAT104_TQM_-AU-24-5593-.git)

---

## 1. Project Directory Structure

The project is structured into modular top-level folders:

```text
BBAT104_TQM_-AU-24-5593-/
│
├── api/                        # Node.js & Express.js REST API Backend
│   ├── config/
│   │   └── db.js               # MySQL Connection Pool
│   ├── middleware/
│   │   ├── auth.js             # JWT & Role-Based Access Control (RBAC)
│   │   └── errorHandler.js     # Centralized Error Recovery (Q01)
│   ├── routes/
│   │   ├── analytics.js        # Owner KPI & revenue routes
│   │   ├── audit.js            # Audit & Error log routes
│   │   ├── auth.js             # Login & JWT session routes
│   │   ├── backup.js           # Database backup routes
│   │   ├── menu.js             # Menu Catalog CRUD routes
│   │   ├── orders.js           # Billing & Order processing routes
│   │   └── users.js            # User management routes
│   ├── utils/
│   │   └── auditLogger.js      # Audit log recorder
│   ├── .env                    # Environment variables
│   ├── package.json
│   ├── server.js               # Express application entrypoint
│   └── test-api.js             # Automated API integration test suite
│
├── client/                     # Modern React.js Frontend (HTML5, CSS3, JS, React)
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
│   ├── dist/                   # Production build files
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── database/                   # MySQL Relational Database Files
│   └── schema.sql              # Complete MySQL schema & seed data
│
├── backups/                    # Auto-generated database SQL dumps
│
├── docs/                       # TQM Course Documentation (BBAT104)
│   ├── testing/
│   │   └── TEST_PLAN.md
│   ├── tqm/
│   │   ├── CHECKSHEET.md
│   │   ├── CTQ.md
│   │   ├── DEFECT_LOG.md
│   │   ├── FISHBONE_ANALYSIS.md
│   │   ├── FMEA.md
│   │   ├── PARETO_ANALYSIS.md
│   │   ├── PDCA.md
│   │   ├── RELIABILITY_VERIFICATION.md
│   │   ├── SIPOC.md
│   │   └── SRS.md
│   ├── INSTALLATION_GUIDE.md
│   └── USER_MANUAL.md
│
├── start-web-app.bat           # 1-Click launcher to run MySQL, API & React frontend
├── package.json                # Root package configuration
├── README.md                   # Comprehensive project documentation
└── .gitignore                  # Git ignore rules
```

---

## 2. Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), React.js (Vite), Lucide Icons
- **Backend (`api/`):** Node.js, Express.js (REST API Architecture)
- **Database (`database/`):** MySQL / MariaDB (XAMPP Server on Port 3306)
- **Authentication & Security:** BCrypt Password Hashing, JSON Web Tokens (JWT)
- **Dynamic Payment:** Scannable Dynamic UPI QR Code Generation (`qrcode.react`)
- **Printing:** Standard 80mm/58mm Thermal Receipt CSS Media Printing (`window.print()`)

---

## 3. Stakeholder Architecture

| Stakeholder | Key Features & Responsibilities |
| :--- | :--- |
| **1. Restaurant Owner** | Executive analytics dashboard, real-time daily/total revenue, top-selling dishes ranking, payment breakdown (Cash, UPI, Card), staff account oversight. |
| **2. Admin** | Menu catalog administration (full CRUD: Add, Edit, Delete, Stock Availability toggle), staff user accounts and role permissions, system audit logs, database backups. |
| **3. Cashier** | High-speed billing desk, visual menu catalog with category filter pills and live search, dynamic cart (+ / - quantity adjustments), table selection, discount & tax calculations, thermal receipt printing, dynamic UPI QR payment. |
| **4. Customer** | Accurate itemized bill, transparent GST breakdown (2.5% CGST + 2.5% SGST), printed thermal receipt or digital QR payment. |
| **5. Developer / Maintainer** | Centralized error recovery middleware, structured MySQL schema, database automated backup dumps, non-breaking REST endpoints. |

---

## 4. Default Login Credentials

| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Restaurant Owner** | `owner` | `owner123` | Executive Analytics, POS Billing, Menu, Users, Audit Logs |
| **Admin** | `admin` | `admin123` | POS Billing, Bill History, Menu CRUD, Users, Audit Logs & Backups |
| **Cashier** | `cashier` | `cash123` | POS Billing & Bill History |

*(The login page also includes 1-click quick-fill buttons for instant evaluation and testing).*

---

## 5. How to Run

### 1-Click Launch (Recommended for Windows)
Double-click **`start-web-app.bat`** in this root directory. It will:
1. Verify XAMPP MySQL is running.
2. Launch the Express API and serve the React Web Application.
3. Automatically open `http://localhost:5000` in your browser.

### Manual Launch via Terminal
1. Ensure MySQL is running on port 3306.
2. Run backend API:
   ```bash
   cd api
   npm install
   npm start
   ```
3. Run React frontend in development mode:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Access at `http://localhost:3000` or production on `http://localhost:5000`.
