# Restaurant Billing System
## TQM Course Project
**Project:** Restaurant Billing System  
**Quality Goal:** Q01 - Improve Reliability
## Project Objective
The objective of this project is to develop a desktop-based Restaurant Billing System that provides reliable and accurate restaurant billing operations.
The system focuses on improving software reliability through five quality features:
1. Auto Backup
2. Audit Log
3. Input Validation
4. Error Recovery
5. User Roles
## Technology Stack
- Python 3.13
- Tkinter
- SQLite3
- Visual Studio Code
- Git
- GitHub
## Main Modules
- User Login
- Dashboard
- Menu Management
- Billing
- Bill History
- User Management
- Audit Logs
- Backup and Restore
- Reports
## Quality Goal
### Q01 - Improve Reliability
The system improves reliability by:
- Preventing invalid data through input validation
- Recording important system activities through audit logs
- Protecting database data through backups
- Handling errors safely through error recovery
- Controlling access through user roles
## TQM Documentation
The project includes the following TQM documents:
- SRS
- SIPOC
- CTQ
- FMEA
- Defect Log
- SQC Checksheet
- Pareto Analysis
- Fishbone Analysis
- PDCA Cycle
- Reliability Verification
## Testing Documentation
Functional testing documentation is available in:
`docs/testing/TEST_PLAN.md`
The testing documentation covers the major reliability features and records their verification results.
## User Documentation
The project includes:
- `docs/USER_MANUAL.md`
- `docs/INSTALLATION_GUIDE.md`
These documents explain how to use and install the application.
## Project Structure
```text
RestaurantBillingSystem/
│
├── database/
│   ├── database.py
│   └── restaurant.db
│
├── gui/
│   ├── login.py
│   ├── dashboard.py
│   ├── menu.py
│   ├── backup.py
│   └── audit_logs.py
│
├── utils/
│   ├── audit_logger.py
│   ├── backup_manager.py
│   ├── error_logger.py
│   └── error_handler.py
│
├── backups/
│
├── docs/
│   ├── SRS.md
│   ├── USER_MANUAL.md
│   ├── INSTALLATION_GUIDE.md
│   ├── testing/
│   │   └── TEST_PLAN.md
│   └── tqm/
│       ├── SIPOC.md
│       ├── CTQ.md
│       ├── FMEA.md
│       ├── DEFECT_LOG.md
│       ├── CHECKSHEET.md
│       ├── PARETO_ANALYSIS.md
│       ├── FISHBONE_ANALYSIS.md
│       ├── PDCA.md
│       └── RELIABILITY_VERIFICATION.md
│
└── main.py

