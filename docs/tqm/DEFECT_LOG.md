\# Defect Log - Restaurant Billing System



\## Quality Goal



\*\*Q01: Improve Reliability\*\*



\## Purpose



The defect log records problems discovered during development and testing of the Restaurant Billing System. It helps track the problem, its cause, corrective action and verification status.



\## Defect Log



| ID | Date | Module | Defect / Problem | Cause | Corrective Action | Status |

|---|---|---|---|---|---|---|

| D-001 | 2026-09-11 | Audit Log | Audit log could not save because the `username` column was missing | Database table structure did not match the audit logger | Updated the audit log table structure | Closed |

| D-002 | 2026-09-16 | Auto Backup | Backup functionality required database backup and history verification | Backup feature was being integrated into the system | Implemented backup manager and backup history logging | Closed |

| D-003 | 2026-09-19 | Error Recovery | Error handler module was initially unavailable during testing | Error handler integration was incomplete | Added and integrated `utils.error\\\_handler` | Closed |

| D-004 | 2026-09-19 | Error Recovery | Test errors needed to be recorded for verification | Error recovery logging required integration with error and audit logs | Integrated error logging and audit logging | Closed |

| D-005 | 2026-09-19 | Menu / Input Validation | Invalid menu values must not be stored | User input may contain missing or invalid values | Added validation for required fields and price values | Closed |

| D-006 | 2026-09-19 | User Roles | Administrative functions must not be available to Cashier users | Different user roles require different access levels | Implemented role-based dashboard access | Closed |



\## Defect Status



| Status | Meaning |

|---|---|

| Open | Defect still requires corrective action |

| In Progress | Corrective action is being implemented |

| Closed | Corrective action completed and verified |



\## Verification Evidence



\### D-001 - Audit Log



Audit logging was tested after correcting the database table structure. Login and menu activities were successfully recorded.



\### D-002 - Auto Backup



Backup testing successfully created database backup files and recorded them in the `backup\\\_logs` table.



\### D-003 / D-004 - Error Recovery



The error handler was tested using a `ValueError`. The error was recorded in `error\\\_logs` and the corresponding `ERROR` activity was recorded in `audit\\\_logs`.



\### D-005 - Input Validation



Testing confirmed that missing menu information and negative prices are rejected rather than added to the menu.



Invalid login credentials are also rejected.



\### D-006 - User Roles



Testing confirmed that Admin users can access administrative functions while Cashier users do not receive access to User Management, Audit Logs and Backup.



\## Conclusion



The defect log provides a record of reliability-related problems found during development and testing. Each listed defect has a corrective action and verification status, supporting continuous improvement of the Restaurant Billing System.

