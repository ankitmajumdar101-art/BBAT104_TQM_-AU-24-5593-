# CTQ Tree - Restaurant Billing & POS Web Application

## Quality Goal
**Q01: Improve Reliability & Multi-Stakeholder Operational Quality**

## CTQ Objective
The Restaurant Billing & POS Web Application must operate reliably across modern web clients, protect database integrity, maintain an unalterable audit trail of financial actions, recover from unexpected errors safely, and control role-based access for Owner, Admin, and Cashier stakeholders.

## CTQ Tree

```text
                                 Q01: Improve Reliability
                                            |
         +----------------------------------+----------------------------------+
         |                                  |                                  |
         v                                  v                                  v
  Prevent Invalid                    Protect Data                       Record Activities
       Data                                 |                                  |
         |                                  v                                  v
         v                             Auto Backup                         Audit Log
  Input Validation                          |                                  |
         |                            +-----+-----+                      +-----+-----+
    +----+----+                       |           |                      |           |
    |         |                       v           v                      v           v
    v         v                   SQL Dump   Verification              Billing     Security
Required   Positive Price &      Generation     Logs                   Actions      Events
 Fields       Quantities
         
         +----------------------------------+----------------------------------+
         |                                                                     |
         v                                                                     v
   Recover From Errors                                                   Control Access
         |                                                                     |
         v                                                                     v
   Error Recovery                                                         User Roles
         |                                                               (RBAC & JWT)
    +----+----+                                                                |
    |         |                                                       +--------+--------+
    v         v                                                       |        |        |
Error Log  Safe Client                                                v        v        v
 Records    Recovery                                                Owner    Admin   Cashier
```

## Critical-to-Quality Requirements by Stakeholder

| Stakeholder | Voice of Customer (VoC) | Critical to Quality (CTQ) Driver | Measurable Quality Metric |
| :--- | :--- | :--- | :--- |
| **Owner** | "I need to know my daily restaurant revenue and top-selling dishes without manual counting." | Real-time Analytics & Transparency | 100% accurate live revenue calculation from database transactions. |
| **Admin** | "I need to update menu prices and staff accounts without database errors or downtime." | Menu CRUD & Access Management | Changes reflected instantly across all terminals with zero restart. |
| **Cashier** | "I need to bill customers in under 5 seconds with correct taxes, discounts, and UPI QR." | High-Speed Billing & UPI Integration | Order creation under 200ms; dynamic UPI QR code rendered on receipt. |
| **Customer** | "I want an itemized bill showing exact items, quantities, and legal GST taxes." | Clear Tax Billing & Thermal Printing | Accurate 5% GST (2.5% CGST + 2.5% SGST); 80mm thermal receipt format. |
| **Developer** | "The application must not crash if an unexpected error occurs during peak hours." | Centralized Error Recovery & Logging | Zero unhandled process crashes; 100% of exceptions captured in `error_logs`. |
