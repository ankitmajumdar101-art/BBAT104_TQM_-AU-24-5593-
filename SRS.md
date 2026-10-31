# Software Requirements Specification (SRS)
## Restaurant Billing & Surveillance System
### Course: BBAT104 — Fundamentals of Total Quality Management
### Quality Goal: Q01 — Improve Reliability & Multi-Stakeholder Operational Excellence

---

| Document Attribute | Specification Details |
| :--- | :--- |
| **Project Title** | Restaurant Billing & Surveillance System |
| **Course Code / Name** | BBAT104 — Fundamentals of Total Quality Management |
| **Quality Objective** | Q01: Improve Reliability, Mistake-Proofing (Poka-Yoke) & Traceability |
| **Student Name** | Ankit Majumdar |
| **Roll Number / Section** | 2410301003 / Section A |
| **Institution** | Amrapali University, Haldwani |
| **Academic Session** | 2026–2027 (Reviews 1 & 2) |
| **Version / Status** | Version 2.0 (Production Verified) |

---

## 1. Introduction & Executive Summary

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional, non-functional, security, and quality requirements for the **Restaurant Billing & Surveillance System**. The system is engineered to solve core operational vulnerabilities in traditional manual restaurant billing—such as mathematical calculation discrepancies, untracked order voids, cashier price tampering, unauthorized account modifications, and lack of business visibility for restaurant proprietors.

### 1.2 Core Quality Mandate (TQM Goal Q01)
Under the **Total Quality Management (TQM) Goal Q01: Improve Reliability**, this application establishes proactive process control mechanisms (Poka-Yoke) rather than relying on reactive post-billing inspection. The system guarantees:
* **Calculation Precision:** Zero mathematical discrepancies on customer invoices via server-enforced decimal arithmetic.
* **Non-Repudiation & Traceability:** Immutable audit logging of every login, menu change, billing event, and administrative action.
* **Role-Based Access Control (RBAC):** Strict boundaries separating Executive Surveillance (Owner), Operational Configuration (Admin), Point-of-Sale Billing (Cashier), and Food Preparation (Kitchen Staff).
* **Owner Protection Invariant:** Structural access control barriers preventing administrative accounts from deleting, deactivating, or demoting the Restaurant Owner account.
* **Disaster Recovery:** Point-in-time database snapshots and automated backups ensuring business continuity.

### 1.3 Scope of the Application
The application provides an end-to-end full-stack web platform comprising:
1. **Multi-Role Authentication:** Encrypted credential verification (BCrypt + JWT) routing users to dedicated portals.
2. **Executive Owner Portal:** Business KPI dashboards, sales reports (daily/weekly/monthly/yearly), operating expense logging, real-time Operating Profit & Loss (P&L) statements, and read-only bill surveillance.
3. **Operational Admin Portal:** Staff account lifecycle management, menu catalog CRUD with live stock availability toggles, on-demand MySQL database backup/restore, system error logs, and security audit exploration.
4. **Cashier POS Billing Terminal:** High-speed touch/keyboard bill creation, table selection, automatic 5% GST tax calculation (2.5% CGST + 2.5% SGST), discount validation, Cash settlement with change due calculation, dynamic UPI QR code generator, and 80mm thermal receipt printing.
5. **Kitchen Display System (KDS):** Real-time order preparation queue displaying dishes, quantities, and cooking notes with strictly controlled workflow status transitions (`New` → `Preparing` → `Ready for Service`), without exposing customer financial data.

---

## 2. Overall Description & Architectural Principles

### 2.1 Decoupled 4-Tier Architecture
The system enforces a strict separation of concerns across four distinct tiers:
```text
┌─────────────────────────────────────────────────────────────┐
│                 TIER 1: CLIENT PRESENTATION                 │
│ React 18 SPA (Vite) • Role Dashboards • POS Terminal • KDS │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON / Bearer JWT
┌──────────────────────────────▼──────────────────────────────┐
│             TIER 2: API GATEWAY & ROUTING LAYER             │
│ Express.js REST API • JWT Auth Guards • Route RBAC Barriers │
└──────────────────────────────┬──────────────────────────────┘
                               │ Controller Method Dispatch
┌──────────────────────────────▼──────────────────────────────┐
│          TIER 3: BUSINESS RULES & SECURITY SERVICES         │
│ Poka-Yoke Validation • GST Tax Calculator • Audit Logger    │
│ Atomic ACID Transactions • MySQL Dump Backup Engine         │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQL Queries / Connection Pool
┌──────────────────────────────▼──────────────────────────────┐
│           TIER 4: RELATIONAL DATABASE PERSISTENCE           │
│ MySQL / MariaDB • 10 Normalized Tables • Referential Integrity│
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Golden Architectural Invariant
> **The presentation layer must never execute SQL queries or directly access the database.**  
All business rules, discount limits, GST tax percentages (2.5% CGST + 2.5% SGST), and authorization checks reside exclusively in backend Express controllers and middleware.

---

## 3. Stakeholder Analysis & SIPOC Model

### 3.1 Stakeholder Matrix

| Stakeholder Role | Primary Purpose & Objectives | Key Functional Boundaries |
| :--- | :--- | :--- |
| **1. Restaurant Owner** | Executive surveillance of business performance, sales trends, expenses, and net profit. | Read-only bill surveillance. Strictly prohibited from editing or voiding daily billing transactions. |
| **2. Administrator** | Day-to-day operational administration of staff accounts, menu catalog, backups, and audit logs. | Operational management only. Strictly prohibited from deleting, deactivating, or demoting the Owner account. |
| **3. Cashier** | High-speed order creation, table billing, tax & discount calculation, payment settlement, and thermal receipt printing. | Front-desk billing only. Prohibited from changing menu pricing, managing staff accounts, or modifying finalized bills. |
| **4. Kitchen Staff (Chef)** | Timely preparation of ordered food items via Kitchen Display System (KDS). | Kitchen queue management only. Screen strictly hides customer pricing, discounts, and payment information. |
| **5. Dining Customer / Guest** | Receives fast service, accurate GST tax itemization, transparent discounts, and dynamic UPI QR payments. | End beneficiary of billing reliability and transparent receipt copies. |
| **6. Statutory / Tax Auditor** | Verifies legal tax compliance (5% GST), business audit trails, and financial record immutability. | External stakeholder auditing non-repudiation records and GSTIN compliance. |

### 3.2 SIPOC Process Model

```text
  [S] SUPPLIERS         [I] INPUTS            [P] PROCESS            [O] OUTPUTS           [C] CUSTOMERS
┌────────────────┐    ┌────────────────┐    ┌─────────────────┐    ┌────────────────┐    ┌────────────────┐
│• Dining Guests │    │• Table Number  │    │ 1. Order Entry  │    │• 80mm GST Tax  │    │• Dining Guests │
│• Kitchen Store │───>│• Menu Items    │───>│ 2. Poka-Yoke Val│───>│   Invoice      │───>│• Cashiers      │
│• Cashier Desk  │    │• Item Rates    │    │ 3. KDS Dispatch │    │• KDS Prep Slip │    │• Kitchen Chefs │
│• Restaurant    │    │• Discounts     │    │ 4. Tax/Calc Math│    │• Realized Sales│    │• Admin / Owner │
│  Management    │    │• Credentials   │    │ 5. Settlement   │    │• Immutable Log │    │• Tax Authority │
└────────────────┘    └────────────────┘    └─────────────────┘    └────────────────┘    └────────────────┘
```

* **Suppliers (S):** Dining guests placing orders, kitchen inventory supplying ingredients, cashier operating the terminal, and management configuring menu items.
* **Inputs (I):** Table numbers, active menu items, customer contact, quantities, authorized discount rates, and role credentials.
* **Process (P):** POS Order Intake → Poka-Yoke Item Validation → Real-Time KDS Dispatch → Server-Side Tax/Discount Math → Payment Settlement → Receipt Printing & Audit Logging.
* **Outputs (O):** Legally compliant 80mm GST tax receipts, real-time KDS preparation tickets, updated inventory availability, realized revenue records, and immutable audit logs.
* **Customers (C):** Guests receiving meals and itemized bills, cashiers receiving payment confirmation, kitchen chefs receiving dish tickets, and the restaurant owner receiving verified financial intelligence.

---

## 4. Software Requirements Specification (SRS) Mapped to Stakeholders

### 4.1 Stakeholder 1 — Restaurant Owner Requirements

#### A. Executive Overview Dashboard
* **SRS-OWN-01:** The system shall display today's total gross sales, completed bills count, voided bills count, and average order value (AOV).
* **SRS-OWN-02:** The system shall display current month cumulative sales and allow selecting custom date ranges for retrospective analysis.
* **SRS-OWN-03:** The system shall display payment totals grouped by method (Cash, UPI, Card) and compare current sales with previous periods.
* **SRS-OWN-04:** Overview figures must be computed directly from finalized database records; the Owner shall not be able to edit bills through overview widgets.

#### B. Comprehensive Sales Reports
* **SRS-OWN-05:** The system shall provide Daily, Weekly, Monthly, and Yearly sales reports with custom date range filters.
* **SRS-OWN-06:** The system shall segment financial figures into Gross Sales, Promotional Discounts, Taxes Collected (5% GST), and Net Realized Sales.
* **SRS-OWN-07:** Cancelled and voided bills must be segregated from normal completed sales and displayed with distinct void loss figures.
* **SRS-OWN-08:** The system shall provide one-click export of sales reports to CSV format and formatted browser printing with official restaurant letterhead.

#### C. Operating Revenue & Expense Tracking
* **SRS-OWN-09:** The system shall allow the Owner to record operating expenses categorized by Raw Materials, Staff Salary, Utilities, Maintenance, Packaging, and Miscellaneous.
* **SRS-OWN-10:** Each recorded expense shall store the amount, expense date, category, description, and the recording user ID.

#### D. Estimated Profit & Loss (P&L) Statement
* **SRS-OWN-11:** The system shall compute Estimated Operating Profit & Loss using the formula:  
  $$\text{Operating Profit} = \text{Net Realized Sales} - \text{Total Recorded Expenses}$$
* **SRS-OWN-12:** The P&L view shall display the operating profit margin percentage and support date-range updates and CSV statement export.

#### E. Read-Only Bill Surveillance
* **SRS-OWN-13:** The system shall provide an audit surveillance table displaying all historical bills with customer names, table numbers, cashier associations, totals, and timestamps.
* **SRS-OWN-14:** **Zero-Tamper Mode:** The Owner shall be able to inspect full line items and print duplicate receipt copies, but shall have zero interface controls or API capabilities to modify, recalculate, or delete finalized bills.

---

### 4.2 Stakeholder 2 — Administrator (Admin) Requirements

#### A. Administrative Overview & Operations
* **SRS-ADM-01:** The system shall display operational summaries: active staff accounts, active menu items, total bills created today, and recent backup status.
* **SRS-ADM-02:** Overview widgets shall link directly to User Management, Menu Management, Database Backups, Audit Logs, and Error Logs.

#### B. Staff User Management & Access Control
* **SRS-ADM-03:** The Admin shall create, update, activate, and deactivate accounts for Cashier and Kitchen Staff roles.
* **SRS-ADM-04:** The system shall support secure temporary password generation and enforce a `must_change_password` challenge upon next login.
* **SRS-ADM-05:** **Owner Protection Invariant (Crucial Security Barrier):**  
  * The Admin is strictly blocked from deleting an account with `role === 'Owner'` (returns `HTTP 403 Forbidden`).
  * The Admin is strictly blocked from deactivating an Owner account or altering an Owner's role.
  * The Admin is strictly blocked from initiating force-resets on the Owner's password.
  * In the UI, Owner records display protected badges (`👑 Proprietor`), and action buttons are disabled.
* **SRS-ADM-06:** **Last Administrator Guard:** The system shall prevent an Admin from deleting or deactivating the last remaining active Administrator account.

#### C. Menu Item & Catalog Management
* **SRS-ADM-07:** The Admin shall create, edit, and delete food items with name, category, price, and description.
* **SRS-ADM-08:** The Admin shall toggle item availability (`is_available: 1/0`) in real time, immediately affecting Cashier POS billing options.
* **SRS-ADM-09:** All menu modifications shall be recorded in the system audit log with previous and updated values.

#### D. Database Backup, Recovery & Audit Logging
* **SRS-ADM-10:** The system shall generate on-demand, timestamped MySQL database dumps saved to the `backups/` archive.
* **SRS-ADM-11:** The Admin shall inspect centralized `audit_logs` capturing user ID, username, role, IP address, action, and timestamp.
* **SRS-ADM-12:** The Admin shall review `error_logs` with error messages, call stack traces, and context details for system maintenance.

---

### 4.3 Stakeholder 3 — Cashier Requirements

#### A. POS Billing Terminal
* **SRS-CSH-01:** The Cashier shall select dining table numbers (1–30), search active dishes, filter by food categories, and add items to the active bill cart.
* **SRS-CSH-02:** The Cashier shall increase or decrease quantities and remove items from unfinalized orders.
* **SRS-CSH-03:** **Poka-Yoke Availability Guard:** Unavailable items (`is_available = 0`) shall be disabled and blocked from cart insertion.

#### B. Server-Enforced Financial Calculations
* **SRS-CSH-04:** The system shall automatically calculate the subtotal, apply validated discount vouchers (percentage or fixed amount), and calculate statutory 5% GST (2.5% CGST + 2.5% SGST).
* **SRS-CSH-05:** All final amounts must be recalculated and verified on the server to prevent client-side price manipulation.

#### C. Payment Settlement & Thermal Invoicing
* **SRS-CSH-06:** The system shall support Cash payments with automatic change due calculation:  
  $$\text{Change Due} = \text{Amount Received} - \text{Grand Total}$$
* **SRS-CSH-07:** The system shall generate dynamic, scannable UPI QR codes on the screen and receipt encoding the exact bill number and payable amount.
* **SRS-CSH-08:** The system shall print standard 80mm thermal receipts rendered via an isolated print engine preventing modal clipping and dark background artifacts.
* **SRS-CSH-09:** Any reprint of a finalized bill shall display a bold watermark: `*** DUPLICATE COPY / REPRINT ***`.

---

### 4.4 Stakeholder 4 — Kitchen Staff (Chef) Requirements

#### A. Kitchen Display System (KDS)
* **SRS-KIT-01:** The system shall provide a dedicated KDS screen displaying incoming customer orders in real time.
* **SRS-KIT-02:** Kitchen cards shall show order number, table number, ordered dishes, quantities, order timestamp, and cooking notes.
* **SRS-KIT-03:** **Financial Information Hiding:** The KDS interface shall strictly hide item prices, subtotals, discounts, taxes, customer phone numbers, and payment modes.

#### B. Finite Workflow State Transitions
* **SRS-KIT-04:** Kitchen Staff shall transition order status strictly through authorized states:  
  $$\text{New (Pending)} \longrightarrow \text{Preparing} \longrightarrow \text{Ready for Service}$$
* **SRS-KIT-05:** **State Invariant Guard:** The system shall prevent invalid reverse transitions (e.g., an order marked `Ready` cannot be reverted to `New` via standard buttons).

---

## 5. Measurable Quality Requirements (TQM Reliability Metrics)

In compliance with TQM Quality Goal Q01, every quality commitment is mapped to an empirical target:

| Quality Dimension | Measurable Quality Metric | Target Benchmark | Verification & Audit Method |
| :--- | :--- | :--- | :--- |
| **Billing Accuracy** | Discrepancies between item rates, quantities, and bill grand total | **0 Discrepancies (100% Precision)** | Automated server-side unit tests and decimal arithmetic validation |
| **GST Tax Compliance** | Precision of 2.5% CGST and 2.5% SGST itemization on all saved bills | **100% Statutory Compliance** | Automated verification against Indian GST statutory rules |
| **RBAC Security Invariant** | Unauthorized attempts by Admin to delete/demote Owner | **0 Allowed (100% Blocked)** | Route-level JWT RBAC middleware returning `HTTP 403 Forbidden` |
| **Audit Traceability** | Critical events (logins, voids, resets, backups) logged with timestamp | **100% Event Coverage** | Continuous relational insertion into MySQL `audit_logs` |
| **KDS Dispatch Latency** | Time delay between cashier checkout and KDS screen queue appearance | **< 1.5 Seconds** | Optimized database indexing and lightweight REST fetch polling |
| **Disaster Recovery** | Verifiability and integrity of database backup SQL dump files | **100% Backup Verifiability** | Automated point-in-time SQL dump creation with file size check |
| **Poka-Yoke Input Protection** | Prevention of negative prices, empty item names, and invalid inputs | **100% Blocked at Entry** | Express validator middleware and database schema constraints |

---

## 6. Database Schema & Entity Relationship Model

The system utilizes a relational database (`restaurant_billing_db`) running on MySQL / MariaDB comprising 10 normalized tables:

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      users      │       │   categories    │       │   menu_items    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ PK  id          │       │ PK  id          │       │ PK  id          │
│     username    │       │     name        │<──────│ FK  category_id │
│     password    │       │     description │       │     name        │
│     role        │       └─────────────────┘       │     price       │
│     status      │                                 │     is_available│
└────────┬────────┘                                 └────────┬────────┘
         │                                                   │
         │ 1:N (created_by)                                  │ 1:N
         ▼                                                   ▼
┌─────────────────┐       1:N                       ┌─────────────────┐
│     orders      │────────────────────────────────>│   order_items   │
├─────────────────┤                                 ├─────────────────┤
│ PK  id          │                                 │ PK  id          │
│     bill_number │                                 │ FK  order_id    │
│     table_num   │                                 │ FK  menu_item_id│
│     subtotal    │                                 │     item_name   │
│     tax_amount  │                                 │     price       │
│     discount    │                                 │     quantity    │
│     total       │                                 │     subtotal    │
│     payment_mthd│                                 └─────────────────┘
│     order_status│
└─────────────────┘
         │
         ├─── 1:N ───> [audit_logs]          (user_id, action, details, timestamp)
         ├─── 1:N ───> [backup_logs]         (file_name, file_size, status, created_at)
         └─── 1:N ───> [expenses]            (category, amount, expense_date, recorded_by)

  Additional Independent Surveillance Tables:
  • [restaurant_settings] : (setting_key, setting_value) [GSTIN, Store Details, Tax Rates]
  • [error_logs]          : (error_message, stack_trace, context, timestamp)
```

---

## 7. Non-Functional & Operational Requirements

### 7.1 Reliability & Fault Tolerance
* **ACID Transactions:** Orders and order line items are inserted within database transactions (`START TRANSACTION`, `COMMIT`, `ROLLBACK`). If any line item insertion fails, the entire bill is rolled back to prevent orphaned records.
* **Graceful Degradation:** If the thermal receipt printer is offline or disconnected, the transaction remains safely committed in the database, allowing subsequent reprint copy generation.

### 7.2 Security & Authentication
* **Password Hashing:** Passwords are encrypted using BCrypt with a work factor of 10. Passwords are never stored or transmitted in plain text.
* **Token Authentication:** Stateless JSON Web Tokens (JWT) containing user ID and role are required in the `Authorization: Bearer <token>` header for all protected API endpoints.
* **Input Sanitization:** Parameterized SQL queries via `mysql2/promise` eliminate SQL injection vulnerabilities.

### 7.3 Portability & Deployment
* **Client Compatibility:** Runs in all modern web browsers (Google Chrome, Microsoft Edge, Mozilla Firefox) with zero client-side installation.
* **Platform Independence:** Runs on Windows, macOS, or Linux using standard Node.js and MySQL runtime environments.

---

## 8. Verification & Traceability Matrix

| SRS Requirement Code | Implementation File / Component | Verification Method |
| :--- | :--- | :--- |
| **SRS-OWN-01 to 04** | `client/src/components/owner/OwnerOverview.jsx` | Integration test verifying aggregated SQL metrics |
| **SRS-OWN-05 to 08** | `client/src/components/owner/OwnerSalesReports.jsx` | Verified CSV export and letterhead print formatting |
| **SRS-OWN-09 to 12** | `client/src/components/owner/OwnerProfitLoss.jsx` | Mathematical verification of Sales minus Expenses |
| **SRS-OWN-13 to 14** | `client/src/components/owner/OwnerBillHistory.jsx` | Read-only audit verification; no edit/delete endpoints |
| **SRS-ADM-03 to 06** | `api/routes/users.js` & `AdminUsers.jsx` | Automated test asserting `HTTP 403` on Owner delete |
| **SRS-ADM-07 to 09** | `api/routes/menu.js` & `AdminMenu.jsx` | Menu CRUD testing with real-time stock toggling |
| **SRS-ADM-10 to 12** | `api/routes/backup.js` & `AuditLogs.jsx` | Execution test verifying generated `.sql` backup files |
| **SRS-CSH-01 to 05** | `client/src/components/POSBilling.jsx` | Poka-Yoke cart test blocking out-of-stock items |
| **SRS-CSH-06 to 09** | `client/src/utils/printReceipt.js` | 80mm thermal receipt iframe printing verification |
| **SRS-KIT-01 to 05** | `client/src/components/kitchen/KitchenKDS.jsx` | Live queue state transition test (`New` → `Prep` → `Ready`) |

---

## 9. Conclusion
This Software Requirements Specification establishes a rigorous, mistake-proof foundation for the **Restaurant Billing & Surveillance System**. By embedding TQM reliability principles directly into software architecture—through strict multi-role access control, immutable audit trails, server-side mathematical validation, and complete stakeholder mapping—the system eliminates human billing error, prevents revenue leakage, and ensures total operational transparency.
