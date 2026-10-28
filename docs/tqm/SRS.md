# Software Requirements Specification (SRS)

## 1. Project Title
Restaurant Billing & POS Web Application - Quality Goal: Q01 - Improve Reliability

## 2. Quality Goal
**Q01: Improve Reliability & Multi-Stakeholder Operational Excellence**

## 3. Project Objective
The objective of the system is to provide a real-time, responsive, web-based Point of Sale (POS) and restaurant billing application that guarantees transactional accuracy, operational reliability, and role-based access for restaurant staff and management.

## 4. Scope
The web application supports restaurant operations across the full dining lifecycle:
- Menu catalog and stock availability management
- Touch-friendly billing desk with dynamic cart, table selection, and discount/tax calculations
- Instant thermal receipt printing (80mm/58mm) and dynamic UPI QR code payments
- Executive Owner analytics covering real-time revenue, top-selling dishes, and payment distribution
- Staff user management with encrypted authentication (BCrypt)
- Continuous reliability assurance via audit logging, error recovery, and automated database backups

The project specifically enforces software reliability through five quality features:
1. **Auto Backup:** Automated MySQL database dumps to timestamped `.sql` files.
2. **Audit Logging:** Centralized tracking of every financial and administrative transaction in `audit_logs`.
3. **Input Validation:** Strict server-side and client-side sanitization, preventing invalid or tampering inputs.
4. **Error Recovery:** Centralized Express middleware intercepting exceptions and recording traces in `error_logs`.
5. **Role-Based Access Control (RBAC):** Strict JWT verification separating Owner, Admin, and Cashier functions.

## 5. Target Stakeholders

### 1. Restaurant Owner
- Views executive performance KPIs: Today's Revenue, Total Gross Revenue, Invoices Count, and Average Order Value.
- Analyzes top-selling dishes and revenue breakdowns by payment method (Cash, UPI, Card).
- Oversees staff accounts and operational reliability.

### 2. Admin
- Manages food menu items (Add, Edit prices, Delete, and live Out-of-Stock toggles).
- Manages staff user accounts and permissions.
- Inspects comprehensive audit logs and triggers database backups.

### 3. Cashier
- Operates the real-time POS billing terminal.
- Searches dishes and selects items with category filter pills.
- Adjusts quantities, assigns tables, inputs customer mobile numbers, and applies discounts.
- Generates bills, presents dynamic UPI QR codes, and prints itemized tax receipts.

### 4. Customer
- Receives transparent, itemized bills with legal GST tax breakdowns (2.5% CGST + 2.5% SGST).
- Receives printed 80mm thermal receipts or digital QR payments.

### 5. Developer / Maintainer
- Manages REST endpoints, database integrity, error logs, and automated test suites.

## 6. Functional Requirements
The system shall:
1. Authenticate users using encrypted BCrypt passwords and issue JWT session tokens.
2. Provide role-based dashboards tailored to Owner, Admin, and Cashier permissions.
3. Allow Cashiers to select food items, adjust quantities, choose tables, and compute 5% GST and discounts.
4. Enforce server-side pricing recalculation to eliminate client-side price tampering.
5. Provide live, scannable dynamic UPI QR codes directly on receipts for instant payment.
6. Support browser printing for standard 80mm/58mm thermal receipt printers.
7. Record all bill creations, logins, menu modifications, and backups in MySQL `audit_logs`.
8. Provide full CRUD capabilities for menu management (Add, Edit, Delete, Stock Availability).
9. Provide User Management capabilities (Create, Edit roles, Deactivate, Delete).
10. Generate full MySQL database backups on demand with file verification.

## 7. Non-Functional Requirements
- **Reliability:** Centralized error recovery ensures unexpected exceptions are caught, logged, and surfaced gracefully without crashing the server.
- **Data Integrity:** ACID-compliant MySQL transactions (`START TRANSACTION`, `COMMIT`, `ROLLBACK`) protect order and line-item creation.
- **Security:** Passwords salted and hashed with BCrypt (cost factor 10); API endpoints protected via JWT headers.
- **Maintainability:** Decoupled architecture with React.js frontend, Express.js REST API, and relational MySQL database.

## 8. Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), React.js (Vite), Lucide Icons, `qrcode.react`
- **Backend:** Node.js, Express.js (REST API Architecture)
- **Database:** MySQL / MariaDB (XAMPP Server on Port 3306)
- **Security:** BCrypt, JSON Web Tokens (JWT), CORS
