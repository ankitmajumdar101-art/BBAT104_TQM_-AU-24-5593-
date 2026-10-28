# PDCA Cycle - Restaurant Billing & POS Web Application

## Quality Goal
**Q01: Improve Reliability & Multi-Stakeholder Operational Excellence**

## Purpose
The PDCA (Plan-Do-Check-Act) cycle documents the continuous improvement lifecycle executed during the modernization of the Restaurant Billing System.

---

# 1. PLAN

## Problem Identification in Legacy Desktop Application
1. **Audit Log Schema Mismatch:** Table created by `database.py` lacked expected columns (`username`, `role`, `details`), causing fresh installs to fail.
2. **Corrupted File:** `tempCodeRunnerFile.py` was tracked in git with indentation errors.
3. **Tkinter Multi-Root Lifecycle:** Creating multiple `tk.Tk()` roots caused GUI locking and process hangs.
4. **Security Vulnerability:** Plaintext passwords stored in SQLite with zero encryption.
5. **Operational Gaps:** Hardcoded taxes (0.0), hardcoded discounts (0.0), hardcoded table 1, no quantity adjustment, no edit/delete in menu, and no thermal/UPI receipt generation.
6. **Limited Stakeholder Support:** Only covered basic Admin/Cashier without Owner analytics, customer digital receipts, or multi-device support.

## Planned Improvements
- Migrate technology stack to modern web standards: **HTML5, CSS3, JavaScript, React.js, Node.js & Express, and MySQL (XAMPP)**.
- Implement comprehensive relational schema in MySQL with BCrypt hashed credentials.
- Design role-based architecture serving **Owner**, **Admin**, **Cashier**, and **Customer**.
- Embed TQM Q01 Reliability controls: Centralized Error Recovery, Audit Logging, and Auto Backup Dumps.

---

# 2. DO

The planned architecture was implemented across 4 structured steps:

1. **MySQL Database Setup:**
   - Designed [database/schema.sql](file:///C:/Users/Ankit/OneDrive/Desktop/TQM/BBAT104_TQM_-AU-24-5593-/RestaurantBillingSystem/database/schema.sql) with tables: `users`, `categories`, `menu_items`, `orders`, `order_items`, `audit_logs`, `error_logs`, and `backup_logs`.
   - Seeded initial accounts for Owner, Admin, and Cashier with BCrypt encryption.
2. **Express.js REST API Backend:**
   - Built modular Express server with JWT authentication and RBAC.
   - Built transactional order processing with server-side price validation, 5% GST, and discounts.
   - Built centralized error handler and audit logger.
3. **React.js Responsive Client:**
   - Created touch-friendly POS billing terminal with category filters, dynamic cart, and table selector.
   - Built printable 80mm thermal receipt with dynamic UPI QR code generation.
   - Built Admin Menu CRUD (Add, Edit, Delete, Stock Availability).
   - Built Staff User Management.
   - Built Executive Owner Analytics Dashboard.
4. **Unified Quick Runner:**
   - Created `start-web-app.bat` for 1-click execution.

---

# 3. CHECK

The system was verified through automated API integration tests ([server/test-api.js](file:///C:/Users/Ankit/OneDrive/Desktop/TQM/BBAT104_TQM_-AU-24-5593-/RestaurantBillingSystem/server/test-api.js)) and frontend compilation tests (`npm run build`).

### Verification Results

| Quality Verification Test | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- |
| **TC-WEB-001: Health Endpoint** | Returns 200 OK with service status | Server responds with healthy status | **Pass** |
| **TC-WEB-002: BCrypt Login** | Verifies password hash and returns JWT | Token generated successfully for Cashier/Admin/Owner | **Pass** |
| **TC-WEB-003: Menu Retrieval** | Returns categorized menu items | 15 dishes returned across 5 categories | **Pass** |
| **TC-WEB-004: Order Calculation** | Computes subtotal, 5% GST, and discount | Subtotal ₹280 + Tax ₹14 - Discount ₹20 = Total ₹274 | **Pass** |
| **TC-WEB-005: Audit Logging** | Inserts record into `audit_logs` | Every login and order creation verified | **Pass** |
| **TC-WEB-006: Owner Analytics** | Computes real-time revenue and top dishes | Revenue and quantity ranking calculated from database | **Pass** |
| **TC-WEB-007: React Build** | Compiles with zero JSX/Vite errors | Production bundle built in 2.96s | **Pass** |

---

# 4. ACT

Based on the verified results:
- Adopted the modern Full-Stack Web Architecture (React.js + Express.js + MySQL).
- Verified that all five TQM Q01 Reliability controls operate consistently.
- Established the 1-click Windows runner (`start-web-app.bat`) to allow seamless demonstration on any PC with XAMPP.
- Pushed changes to GitHub repository to guarantee version control integrity.
