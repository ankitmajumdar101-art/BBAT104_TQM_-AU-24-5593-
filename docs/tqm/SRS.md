# Software Requirements Specification (SRS)
## Restaurant Billing & Surveillance System
### Total Quality Management (TQM) Quality Goal Q01: Improve Reliability

---

| Document Attribute | Specification Details |
| :--- | :--- |
| **Project Title** | Restaurant Billing & Surveillance System |
| **Course Code & Title** | BBAT104 — Total Quality Management (TQM) |
| **Quality Objective** | Q01: Improve Reliability & Mistake-Proofing (Poka-Yoke) |
| **Author / Candidate** | Ankit Kumar |
| **Roll Number / Section** | 2410301003 / Section A |
| **Document Version** | 2.1.0 (Production Release — Owner Commercial Governance & Strict Admin RBAC) |
| **Status** | Approved & Fully Verified |
| **Date** | 2026-11-12 |

---

## 1. Introduction & Executive Summary

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional, non-functional, security, and quality requirements for the **Restaurant Billing & Surveillance System**. The system is engineered to solve core operational vulnerabilities in traditional manual restaurant billing—such as mathematical calculation discrepancies, untracked order voids, cashier price tampering, unauthorized account modifications, lack of table seating status tracking, and lack of business visibility for restaurant proprietors.

### 1.2 Core Quality Mandate (TQM Goal Q01)
Under the **Total Quality Management (TQM) Goal Q01: Improve Reliability**, this application establishes proactive process control mechanisms (Poka-Yoke) rather than relying on reactive post-billing inspection. The system guarantees:
* **Calculation Precision:** Zero mathematical discrepancies on customer invoices via server-enforced decimal arithmetic.
* **Non-Repudiation & Traceability:** Immutable audit logging of every login, menu change, promotional offer, billing event, waiter order, kitchen ticket update, and administrative action.
* **Role-Based Access Control (RBAC):** Strict boundaries separating Commercial & Pricing Governance (Owner), System & Staff Infrastructure Administration (Admin), Point-of-Sale Billing (Cashier), Floor & Table Service (Waiter), and Food Preparation (Kitchen Staff).
* **Owner Protection & Separation of Duties Invariant:** Structural access control barriers preventing administrative accounts from deleting, deactivating, or demoting the Restaurant Owner account, while simultaneously barring administrators from commercial menu pricing, customer discounts, and tax/billing configuration.
* **Closed-Loop Workflow Coordination:** End-to-end synchronized order progression: Waiter order taking $\longrightarrow$ Cashier bill calculation $\longrightarrow$ Kitchen Chef cooking $\longrightarrow$ Real-time Waiter ready notification $\longrightarrow$ Table food delivery.
* **Disaster Recovery:** Point-in-time database snapshots and automated backups ensuring business continuity.

### 1.3 Scope of the Application
The application provides an end-to-end full-stack web platform comprising:
1. **Multi-Role Authentication:** Encrypted credential verification (BCrypt + JWT) routing users to dedicated role-based portals.
2. **Executive Owner Portal:** Commercial & financial governance, business KPI dashboards, sales reports (daily/weekly/monthly/yearly), operating expense logging, real-time Operating Profit & Loss (P&L) statements, read-only bill surveillance, full Menu & Categories Catalog management with promotional discounts/offers, and Statutory Tax & Invoicing configuration (CGST, SGST, discount ceiling, bill headers).
3. **Operational Admin Portal:** IT system infrastructure administration—staff account lifecycle management (Cashier, Waiter, Kitchen Chef), on-demand MySQL database backup/restore, system error logs, and security audit exploration. (Strictly barred from commercial menu catalog, pricing, and tax configuration).
4. **Cashier POS Billing Terminal & Waiter Billing Queue:** High-speed touch/keyboard bill creation, incoming waiter orders queue calculation, automatic 5% GST tax calculation (2.5% CGST + 2.5% SGST), discount validation, Cash/Card/UPI settlement, and 80mm thermal receipt printing.
5. **Waiter Service & Table Management Station:** Real-time customer table sitting system (Available, Seated, Order Sent, Bill Ready, Food Ready, Served), menu catalog with dish prices and promotional discounts, table order submission, bill delivery to customer, and kitchen ready alerts.
6. **Kitchen Display System (KDS):** Real-time order preparation queue displaying dishes, quantities, waiter attribution, and cooking notes with strictly controlled workflow status transitions (`New` → `Preparing` → `Ready for Service`), without exposing customer financial data.

---

## 2. Overall Description & Architectural Principles

### 2.1 Decoupled 4-Tier Architecture
The system enforces a strict separation of concerns across four distinct tiers:
```text
┌─────────────────────────────────────────────────────────────────────────┐
│                       TIER 1: CLIENT PRESENTATION                       │
│ React 18 SPA (Vite) • Role Dashboards • POS Terminal • Waiter UI • KDS │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS / JSON / Bearer JWT
┌────────────────────────────────────▼────────────────────────────────────┐
│                   TIER 2: API GATEWAY & ROUTING LAYER                   │
│ Express.js REST API • JWT Auth Guards • Route RBAC Security Barriers    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Controller Method Dispatch
┌────────────────────────────────────▼────────────────────────────────────┐
│                TIER 3: BUSINESS RULES & SECURITY SERVICES               │
│ Poka-Yoke Validation • GST Tax Calculator • Audit Logger • Table Manager│
│ Atomic ACID Transactions • MySQL Dump Backup Engine                     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ SQL Queries / Connection Pool
┌────────────────────────────────────▼────────────────────────────────────┐
│                 TIER 4: RELATIONAL DATABASE PERSISTENCE                 │
│ MySQL / MariaDB • 11 Normalized Tables • Foreign Keys & Constraints     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Golden Architectural Invariant
> **The presentation layer must never execute SQL queries or directly access the database.**  
All business rules, table state updates, discount limits, GST tax percentages (2.5% CGST + 2.5% SGST), and authorization checks reside exclusively in backend Express controllers and middleware.

---

## 3. Stakeholder Analysis & SIPOC Model

### 3.1 Stakeholder Matrix

| Stakeholder Role | Primary Purpose & Objectives | Key Functional Boundaries |
| :--- | :--- | :--- |
| **1. Restaurant Owner** | Executive commercial surveillance of business performance, sales trends, expenses, net profit, menu catalog curation, customer promotional discounts/offers, and statutory tax/billing rules. | Commercial & pricing governance. Read-only historical bill surveillance (strictly prohibited from editing or voiding finalized billing transactions). |
| **2. Administrator** | IT system infrastructure administration—staff account lifecycle (RBAC), database backup & disaster recovery snapshots, audit trail review, and error log monitoring. | System infrastructure administration only. Strictly prohibited from deleting, deactivating, or demoting the Owner account, and strictly barred from menu item management, promotional offers, or tax/billing policies. |
| **3. Cashier** | High-speed bill creation, waiter order calculation, tax & discount application, payment settlement, and thermal receipt printing. | Front-desk billing only. Prohibited from changing menu pricing, managing staff accounts, or modifying finalized bills. |
| **4. Floor Waiter** | Customer table seating management, menu browsing with active discounts, order taking and submission to cashier, providing bills to guests, and serving food. | Floor table service & order creation only. Prohibited from configuring menu pricing, approving refunds, or managing user accounts. |
| **5. Kitchen Staff (Chef)** | Timely preparation of ordered food items via Kitchen Display System (KDS) and notifying waiters when food is ready. | Kitchen queue management only. Screen strictly hides customer pricing, discounts, and payment information. |
| **6. Dining Customer / Guest** | Receives fast service, accurate GST tax itemization, transparent discounts, and dynamic UPI QR payments. | End beneficiary of billing reliability and transparent receipt copies. |
| **7. Statutory / Tax Auditor** | Verifies legal tax compliance (5% GST), business audit trails, and financial record immutability. | External stakeholder auditing non-repudiation records and GSTIN compliance. |

### 3.2 SIPOC Process Model

```text
  [S] SUPPLIERS         [I] INPUTS            [P] PROCESS            [O] OUTPUTS           [C] CUSTOMERS
┌────────────────┐    ┌────────────────┐    ┌─────────────────┐    ┌────────────────┐    ┌────────────────┐
│• Dining Guests │    │• Table Number  │    │ 1. Table Seating│    │• 80mm GST Tax  │    │• Dining Guests │
│• Kitchen Store │───>│• Customer Info │───>│ 2. Order Intake │───>│   Invoice      │───>│• Cashiers      │
│• Cashier Desk  │    │• Menu Items    │    │ 3. Cashier Bill │    │• KDS Prep Slip │    │• Kitchen Chefs │
│• Floor Waiters │    │• Item Rates    │    │ 4. Kitchen Prep │    │• Ready Alerts  │    │• Floor Waiters │
│• Owner Mgt     │    │• Discounts     │    │ 5. Table Service│    │• Immutable Log │    │• Admin / Owner │
└────────────────┘    └────────────────┘    └─────────────────┘    └────────────────┘    └────────────────┘
```

* **Suppliers (S):** Dining guests, floor waiters taking orders, cashier calculating bills, kitchen staff preparing dishes, and restaurant owner configuring menus and pricing policies.
* **Inputs (I):** Table seating numbers, customer details, selected dishes with prices & discounts, cooking instructions, payment methods, and role credentials.
* **Process (P):** Table Seating Assignment $\longrightarrow$ Waiter Order Intake $\longrightarrow$ Dispatch to Cashier $\longrightarrow$ Cashier Bill Calculation $\longrightarrow$ KDS Kitchen Preparation $\longrightarrow$ Chef Ready Alert $\longrightarrow$ Waiter Food Delivery $\longrightarrow$ Table Clearing.
* **Outputs (O):** Legally compliant 80mm GST tax receipts, real-time KDS tickets with waiter attribution, live table status indicators, realized sales records, and immutable audit logs.
* **Customers (C):** Guests enjoying meals, waiters receiving ready alerts, cashiers receiving payment, kitchen chefs receiving food slips, and the owner monitoring business health.

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
* **SRS-OWN-14:** **Zero-Tamper Mode & Visual Bill Audit:** The Owner shall be able to inspect full itemized receipts with dish thumbnails beside item names and print duplicate receipt copies, but shall have zero interface controls or API capabilities to modify, recalculate, or delete finalized bills.

#### F. Food Menu Catalog & Category Management
* **SRS-OWN-15:** **Menu Catalog & Visual Food Identification:** The system shall grant the Restaurant Owner exclusive commercial authority to create, view, update, and remove categories and dishes in the restaurant menu catalog. The menu management table shall prominently display 46x46 high-resolution dish thumbnails beside every dish name, alongside category, standard price, and discount percentage. Add/Edit dish modals shall provide live image preview and 1-click curated preset food photos with 100% authentic food matching.
* **SRS-OWN-16:** The Owner shall be able to toggle real-time dish availability (`available = 0/1`) to prevent orders of out-of-stock items across POS and Waiter stations.

#### G. Customer Promotional Offers & Discount Management
* **SRS-OWN-17:** The Owner shall have exclusive authority to configure promotional discount percentages (`discount_percent` from 0% to 100%) per dish or apply 1-click offer presets (0%, 5%, 10%, 15%, 20%, 25% OFF).
* **SRS-OWN-18:** The system shall calculate real-time offer prices and display customer savings, seamlessly propagating promotional discounts and dish images to Waiter menu ordering and Cashier POS billing.

#### H. Statutory Tax & Invoicing Rule Configuration
* **SRS-OWN-19:** The Owner shall be the sole authority to configure Indian GST statutory rates (CGST %, SGST %, and combined GST preview), invoice receipt prefixes, and receipt header/footer messages.
* **SRS-OWN-20:** The Owner shall have authority to enforce a maximum allowable bill discount percentage threshold (Poka-Yoke cap) preventing unauthorized cashier revenue leakage.

#### I. Dining Rooms & Seating Arrangement Management
* **SRS-OWN-21: Multi-Floor & Room Infrastructure Management:** The Restaurant Owner shall have full authority to create, view, update, and manage dining rooms or floor sections (e.g., Ground Floor Main Dining Hall, First Floor Family AC Hall, Rooftop Garden Lounge). Each room record shall record name, floor number, description, and status. When creating a room, the Owner can specify the initial table count (default 10 tables) and default chair capacity per table (default 4 chairs).
* **SRS-OWN-22: Configurable Table Sizing & Spatial Visual Seating Map:** The Owner shall be able to add tables to any room with custom chair capacity (e.g., 2, 4, 6, 8, or 10 chairs) to match physical restaurant table sizes. The Owner dashboard shall provide an interactive visual floor plan layout rendering every table surrounded by realistic perimeter chairs (color-coded by live status: Available, Seated, Order Placed, Food Ready), enabling the Owner to analyze seating arrangement aesthetics, spatial capacity, and live occupancy rates at a glance.

---

### 4.2 Stakeholder 2 — Administrator Requirements

#### A. Staff Account Lifecycle Management
* **SRS-ADM-01:** The system shall provide user management allowing the Admin to create, view, update, deactivate, and reset passwords for Cashier, Waiter, and Kitchen Staff accounts.
* **SRS-ADM-02:** **Owner Protection Invariant (Security Poka-Yoke):** The system shall programmatically prevent any administrator from deleting, deactivating, or demoting the Restaurant Owner account. Any such attempt must return `HTTP 403 Forbidden` and record a security violation in `audit_logs`.

#### B. Commercial Privilege Guard (Separation of Duties)
* **SRS-ADM-03:** **Commercial Privilege Exclusion (Structural Barrier):** The system shall strictly prevent System Administrators from accessing or mutating the food menu catalog, pricing, customer discounts, or tax/billing policies. All menu and billing configuration mutation endpoints shall return `HTTP 403 Forbidden` if invoked by an Admin. The Admin dashboard shall contain zero menu or billing configuration interfaces.

#### C. Database Backup & Disaster Recovery
* **SRS-ADM-04:** The system shall allow the Admin to generate full MySQL database backup snapshots on demand.
* **SRS-ADM-05:** The system shall verify generated backup file sizes and log execution outcomes to `backup_logs`.

#### D. System Security Audit & Error Exploration
* **SRS-ADM-06:** The system shall provide an immutable audit trail interface displaying all user actions, logins, menu updates, billing events, and security violations with timestamps and IP addresses.
* **SRS-ADM-07:** The system shall provide a dedicated system error logs interface allowing administrators to inspect application exceptions and stack traces for operational reliability.

---

### 4.3 Stakeholder 3 — Cashier Requirements

#### A. POS Billing Terminal
* **SRS-CSH-01:** **POS Billing Terminal with Visual Selection & Cart:** The system shall provide a rapid POS bill generation terminal with table selection, customer details, dish search, and visual dish selection cards in the menu catalog AND 38x38 dish thumbnails in the right-hand active order cart beside each item name, unit price, quantity, and line total.
* **SRS-CSH-02:** Subtotals, 5% GST tax (2.5% CGST + 2.5% SGST), authorized discounts, and grand totals shall be calculated exclusively on the backend server.
* **SRS-CSH-03:** The system shall support Cash, Card, and UPI payment methods with change due calculation, dynamic UPI payment QR codes, and itemized customer receipt modal featuring dish thumbnails.

#### B. Waiter Incoming Orders Billing Queue
* **SRS-CSH-04:** **Waiter Incoming Orders Queue with Visual Dish Identification:** The system shall provide a dedicated **Waiter Orders Queue** displaying incoming table orders submitted by floor waiters with status `Pending_Cashier`, itemized with 30x30 dish thumbnails alongside food names, quantities, and line totals for rapid, distraction-free cashier calculation.
* **SRS-CSH-05:** The Cashier shall be able to review ordered items with visual dish confirmation, apply payment methods, calculate GST and discounts, and finalize the bill.
* **SRS-CSH-06:** Upon finalization by Cashier, the system shall transition the order to `Completed`, forward the food ticket to Kitchen Chef (`kitchen_status: 'New'`), and flag the bill as ready for Waiter delivery.

---

### 4.4 Stakeholder 4 — Floor Waiter Requirements

#### A. Customer Table Sitting System with Rooms/Floors & 4-Chair Layout
* **SRS-WTR-01: Hierarchical Dining Room & Floor Selector:** The Table Seating Map shall feature a dedicated Room/Floor selector at the top (e.g., Ground Floor Main Dining Hall, First Floor Family AC Hall, Rooftop Garden Lounge). Selecting a room shall filter and display its corresponding tables (configured with 10 tables per room by default, with 4 chairs per table).
* **SRS-WTR-01b: 4-Chair Interactive Seating Matrix:** Each table card shall render a visual 4-chair layout displaying the seating status and active orders per chair base, allowing the waiter to see at a glance which chair ordered which dish and click any chair to initiate order taking for that seat.
* **SRS-WTR-01c:** Each table card shall display live operational statuses:
  * 🟢 **Available:** Table is clean and 4 chairs ready for seating.
  * 🟡 **Seated:** Guests are seated and reviewing the menu.
  * 🔵 **Order Placed:** Waiter has submitted order to Cashier for billing calculation.
  * 🟣 **Bill Ready:** Cashier has finalized bill; ready for waiter to print/hand to customer.
  * 🟠 **Food Preparing:** Kitchen Chef is actively preparing food.
  * 🟢 **Food Ready:** Kitchen Chef has completed cooking; blinking ready alert.
  * ✅ **Served / Dining:** Dishes delivered to table; guests dining.
* **SRS-WTR-02:** The Waiter shall be able to assign/seat guests at an available table by recording customer name, phone number, and guest count.
* **SRS-WTR-03:** The Waiter shall be able to clear/free a table once dining is concluded, resetting the table to `Available`.

#### B. Customer Menu Cards with Real-Time Prices & Discounts
* **SRS-WTR-04:** The system shall present the full restaurant menu categorized by Starters, Main Course, Fast Food, Beverages, Desserts, and Chef Specials.
* **SRS-WTR-05:** **Customer Visual Attraction & Authentic Dish Matching (Zero Mismatch Policy):** Each menu card shall prominently display a high-resolution, 100% authentic photograph of the exact dish (e.g., *Butter Naan* displays golden blistered tandoor-baked Indian flatbread glazed with butter accompanied by pickled onions and lemon; *Tandoori Stuffed Soya Chaap* displays sizzling skewers of marinated spicy tandoori soya chunks with charred onions and peppers; *Paneer Tikka* displays charred marinated grilled paneer cubes; *Veg Spring Rolls* displays crisp golden fried rolls; *Cold Coffee* displays tall chilled iced coffee frappe; *Gulab Jamun* displays golden-brown sweet milk dumplings in sugar syrup). Non-matching imagery (such as meat for vegetarian dishes or non-food objects like fish tanks) is strictly prohibited across all modules (Waiter, Cashier POS, Owner Menu, KDS Chef Queue, and itemized customer receipts) so customers and staff see exactly what the food looks like.
* **SRS-WTR-05b:** **WhatsApp-Style Interactive Full-Screen Image Lightbox (Big Size Zoom):** When a user or staff member clicks on any dish photograph across any dashboard or section (Waiter menu cards, customer order tray, live order tracker, POS billing cards, cashier waiter queue, kitchen KDS tickets, owner menu catalog, live preview modal, or itemized customer receipts), the system shall open an interactive full-screen WhatsApp-style media viewer modal rendered via React Portal directly into `document.body`. The lightbox shall provide:
  * Full-screen blurred backdrop overlay (`rgba(5, 10, 20, 0.94)`, `backdrop-filter: blur(12px)`, $z\text{-index}: 999999$) eliminating parent overflow or clipping restrictions.
  * Prominent high-definition image display centered at up to 1400px resolution with fit-to-screen and 100% full-resolution toggle zoom.
  * Top media header showing category emoji, dish title, category pill, real-time price badge, promotional discount badge, zoom toggle button, WhatsApp-style download/save photo button, and a dedicated close button with `[Esc]` keyboard shortcut support.
  * Bottom caption strip displaying dish title, culinary description, and keyboard/touch navigation tips.
  * Event propagation stoppage (`e.stopPropagation()`) ensuring clicking a dish photo to inspect it never inadvertently triggers order selection, card clicks, or cart actions.
* **SRS-WTR-06:** Only dishes marked `available = 1` by kitchen/management shall be selectable for order entry.

#### C. Order Taking & Dispatch to Cashier
* **SRS-WTR-07: Strict 4-Step Progressive Stepper (`Room/Floor -> Table -> Chair -> Take Order`):** The Waiter order-taking workflow shall enforce a 4-step progressive selection:
  $$\text{Room / Floor} \longrightarrow \text{Table} \longrightarrow \text{Chair (Seat 1-4 or Shared)} \longrightarrow \text{Take Order}$$
* **SRS-WTR-07b: Chair-Based Order Allocation & Tray Management:** Each dish added to the order tray shall be assigned to a specific chair number (or marked as `Shared / Whole Table`). The customer order tray shall display assigned chair badges, provide a quick dropdown selector to reassign dishes between chairs, and support per-chair quantity adjustments.
* **SRS-WTR-08:** Submitting the order sets `order_status = 'Pending_Cashier'` and `kitchen_status = 'Pending_Bill'`, transmitting the ticket with room name and chair labels to the Cashier queue without exposing kitchen preparation until billed.

#### D. Bill Receipt Delivery & Food Service
* **SRS-WTR-09:** When the Cashier calculates the bill, the Waiter dashboard shall display a "Bill Ready" notification allowing the waiter to inspect and print the 80mm thermal receipt for the customer.
* **SRS-WTR-10:** When the Kitchen Chef marks food `Ready`, the Waiter dashboard shall display a high-priority "Food Ready" alert banner.
* **SRS-WTR-11:** The Waiter shall deliver dishes to the table and mark the order as `Served`, updating the table status to `Served`.
* **SRS-WTR-12:** **Active Orders Progression Tracker with Visual Dish Badges & Chair Labels:** The Waiter live orders tracker shall display visual dish badges with dish thumbnails, quantities, table numbers with Room/Floor context, and assigned chair labels for every active order, keeping the floor staff visually connected with the exact dishes and chairs to serve.

---

### 4.5 Stakeholder 5 — Kitchen Staff (Chef) Requirements

#### A. Kitchen Display System (KDS)
* **SRS-KIT-01:** The system shall provide a dedicated KDS screen displaying incoming customer orders in real time.
* **SRS-KIT-02:** **Kitchen Ticket Cards with Visual Dish Thumbnails & Chair Bases:** Kitchen cards shall show order number, table number, dining room name, assigned floor waiter name, 34x34 visual dish thumbnails directly beside each dish item name, chair allocation labels (`Chair 1`, `Chair 2`, `Shared`), quantities, order timestamp, and special cooking notes in a clean, high-speed ticket format so chefs instantly recognize culinary preparation and chair plating.
* **SRS-KIT-03:** **Financial Information Hiding:** The KDS interface shall strictly hide item prices, subtotals, discounts, taxes, customer phone numbers, and payment modes.

#### B. Finite Workflow State Transitions
* **SRS-KIT-04:** Kitchen Staff shall transition order status strictly through authorized states:  
  $$\text{New (Billed by Cashier)} \longrightarrow \text{Preparing} \longrightarrow \text{Ready for Service}$$
* **SRS-KIT-05:** Transitioning an order to `Ready` shall automatically notify the assigned Floor Waiter to collect and deliver dishes.
* **SRS-KIT-06:** **State Invariant Guard:** The system shall prevent unauthorized reverse status transitions.

---

## 5. Measurable Quality Requirements (TQM Reliability Metrics)

In compliance with TQM Quality Goal Q01, every quality commitment is mapped to an empirical target:

| Quality Dimension | Measurable Quality Metric | Target Benchmark | Verification & Audit Method |
| :--- | :--- | :--- | :--- |
| **Billing Accuracy** | Discrepancies between item rates, quantities, and bill grand total | **0 Discrepancies (100% Precision)** | Automated server-side unit tests and decimal arithmetic validation |
| **GST Tax Compliance** | Precision of 2.5% CGST and 2.5% SGST itemization on all saved bills | **100% Statutory Compliance** | Automated verification against Indian GST statutory rules |
| **Food Image Fidelity & Matching Invariant** | Dish photographs authentically matching the specific dish named | **100% Authentic Matching (0 Mismatches)** | Automated database verification and visual presentation audits across Owner, Cashier, Waiter, and Kitchen modules |
| **Image Lightbox Zoom & Media Accessibility** | Full-screen interactive viewer display on image click across all dashboards | **100% Coverage (Portal Unclipped)** | Automated React Portal DOM verification, keyboard Esc closing, and zero parent event propagation |
| **Commercial Separation Invariant** | Attempts by Admin to mutate menu items or tax/billing settings | **0 Allowed (100% Blocked)** | Route-level JWT RBAC returning `HTTP 403 Forbidden` with audit logging |
| **Owner Protection Invariant** | Unauthorized attempts by Admin to delete/demote Owner | **0 Allowed (100% Blocked)** | Route-level JWT RBAC middleware returning `HTTP 403 Forbidden` |
| **Waiter Handoff Integrity** | Synchronization across Waiter $\to$ Cashier $\to$ Kitchen $\to$ Customer | **100% Ticket Traceability** | Automated integration tests tracking order lifecycle states |
| **Audit Traceability** | Critical events (logins, voids, resets, backups, waiter orders, discounts) logged with timestamp | **100% Event Coverage** | Continuous relational insertion into MySQL `audit_logs` |
| **KDS Dispatch Latency** | Time delay between cashier billing and KDS screen queue appearance | **< 1.5 Seconds** | Optimized database indexing and lightweight REST fetch polling |
| **Poka-Yoke Table Control** | Prevention of seating customers on already occupied tables | **100% Blocked at Entry** | Backend table status checks returning `HTTP 400` on conflicts |

---

## 6. Database Schema & Entity Relationship Model

The system utilizes a relational database (`restaurant_billing_db`) running on MySQL / MariaDB comprising 11 normalized tables:

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      users      │       │   categories    │       │   menu_items    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ PK  id          │       │ PK  id          │       │ PK  id          │
│     username    │       │     name        │<──────│ FK  category_id │
│     password    │       │     description │       │     name        │
│     role        │       └─────────────────┘       │     price       │
│     status      │                                 │     discount_pct│
└────────┬────────┘                                 │     available   │
         │                                          └────────┬────────┘
         │ 1:N (created_by / waiter_id)                      │
         ▼                                                   │ 1:N
┌─────────────────┐       1:N                                ▼
│     orders      │────────────────────────────────>┌─────────────────┐
├─────────────────┤                                 │   order_items   │
│ PK  id          │                                 ├─────────────────┤
│     bill_number │                                 │ PK  id          │
│     table_num   │                                 │ FK  order_id    │
│     waiter_id   │                                 │ FK  menu_item_id│
│     waiter_name │                                 │     item_name   │
│     subtotal    │                                 │     price       │
│     tax_amount  │                                 │     quantity    │
│     discount    │                                 │     subtotal    │
│     total       │                                 │     chair_number│
│     payment_mthd│                                 │     chair_label │
│     room_id     │                                 └─────────────────┘
│     room_name   │
│     order_status│
│     kitchen_stat│
└────────┬────────┘
         │
         ├─── 1:N ───> [audit_logs]          (user_id, action, details, timestamp)
         ├─── 1:N ───> [backup_logs]         (file_name, file_size, status, created_at)
         └─── 1:N ───> [expenses]            (category, amount, expense_date, recorded_by)

  Multi-Room Dining Architecture & Table Seating Entity Model:
┌──────────────────────┐       1:N       ┌─────────────────────┐
│   restaurant_rooms   │────────────────>│  restaurant_tables  │
├──────────────────────┤                 ├─────────────────────┤
│ PK  id               │                 │ PK  id              │
│     name             │                 │     table_number    │
│     floor_number     │                 │ FK  room_id         │
│     description      │                 │     room_name       │
│     status           │                 │     capacity(chairs)│
└──────────────────────┘                 │     status          │
                                         │     customer_name   │
                                         │     customer_phone  │
                                         │     guests_count    │
                                         │ FK  current_order_id│
                                         │ FK  assigned_waiter │
                                         │     seated_at       │
                                         └─────────────────────┘

  Additional Independent Surveillance Tables:
  • [restaurant_settings] : (setting_key, setting_value) [GSTIN, Store Details, Tax Rates, Max Discount]
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

---

## 8. Verification & Traceability Matrix

| SRS Requirement Code | Implementation File / Component | Verification Method |
| :--- | :--- | :--- |
| **SRS-OWN-01 to 04** | `client/src/components/owner/OwnerOverview.jsx` | Integration test verifying aggregated SQL metrics |
| **SRS-OWN-05 to 08** | `client/src/components/owner/OwnerSalesReports.jsx` | Verified CSV export and letterhead print formatting |
| **SRS-OWN-09 to 12** | `client/src/components/owner/OwnerProfitLoss.jsx` | Mathematical verification of Sales minus Expenses |
| **SRS-OWN-13 to 14** | `client/src/components/owner/OwnerBillHistory.jsx` & `DishImage.jsx` | Read-only audit verification and itemized receipt modal with dish thumbnails |
| **SRS-OWN-15 to 18** | `api/routes/menu.js`, `OwnerMenu.jsx` & `DishImage.jsx` | Owner menu catalog table with dish thumbnails, CRUD, authentic photo presets & discount tests |
| **SRS-OWN-19 to 20** | `api/routes/owner.js` & `OwnerBillingSettings.jsx` | Owner tax/GST and discount limit configuration tests |
| **SRS-OWN-21 to 22** | `api/routes/owner.js` & `OwnerSeatingArrangement.jsx` | Dynamic dining rooms CRUD, custom table sizing by capacity, and interactive visual floor plan seating layout |
| **SRS-ADM-01 to 02** | `api/routes/users.js` & `AdminUsers.jsx` | Automated test asserting `HTTP 403` on Owner delete |
| **SRS-ADM-03** | `api/routes/admin.js` & `AdminDashboard.jsx` | Automated test asserting `HTTP 403` on Admin menu/tax mutation |
| **SRS-ADM-04 to 07** | `api/routes/backup.js`, `AuditLogs.jsx`, `ErrorLogs.jsx` | Disaster recovery & audit/error inspection tests |
| **SRS-CSH-01 to 03** | `client/src/components/POSBilling.jsx`, `ReceiptModal.jsx` & `DishImage.jsx` | POS menu card selection, order cart with dish thumbnails & printable receipt tests |
| **SRS-CSH-04 to 06** | `client/src/components/cashier/CashierWaiterQueue.jsx` & `DishImage.jsx` | Waiter queue billing calculation test with dish thumbnails and chair breakdown finalizing into billed tickets |
| **SRS-WTR-01 to 03** | `client/src/components/waiter/WaiterDashboard.jsx` & `api/routes/waiter.js` | Dining Room/Floor selector, 10 tables per room with 4-chair seating matrix, customer seating & clear actions |
| **SRS-WTR-04 to 06** | `api/routes/waiter.js`, `WaiterDashboard.jsx` & `DishImage.jsx` | Visual menu cards with 100% authentic dish photos, prices, discount badges & WhatsApp-style full-screen zoom lightbox |
| **SRS-WTR-07 to 08** | `api/routes/waiter.js` & `WaiterDashboard.jsx` | 4-step progressive stepper (`Room/Floor -> Table -> Chair -> Take Order`), chair-by-chair dish allocation tray, and `Pending_Cashier` dispatch |
| **SRS-WTR-09 to 12** | `WaiterDashboard.jsx` & `ReceiptModal.jsx` | Thermal bill print, food ready serving verification & active order visual dish badges with chair labels |
| **SRS-KIT-01 to 06** | `client/src/components/kitchen/KitchenOrderQueue.jsx` & `DishImage.jsx` | High-speed KDS ticket test with visual dish thumbnails, chair allocation labels & state transitions (`New` → `Prep` → `Ready`) |

---

## 9. Conclusion
This Software Requirements Specification establishes a rigorous, mistake-proof foundation for the **Restaurant Billing & Surveillance System**. By embedding TQM reliability principles directly into software architecture—through strict multi-role access control, immutable audit trails, server-side mathematical validation, real-time table sitting management, separation of commercial governance (Owner) from infrastructure administration (Admin), and complete stakeholder mapping across Owner, Admin, Cashier, Waiter, and Kitchen Staff—the system eliminates human error, prevents revenue leakage, coordinates floor service, and ensures total operational excellence.
