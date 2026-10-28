# Fishbone Analysis - Restaurant Billing System



## Quality Goal



**Q01: Improve Reliability**



## Purpose



The Fishbone (Ishikawa) analysis identifies possible root causes of reliability-related problems found during development and testing.



The analysis focuses on the two documented development issues identified in the Pareto analysis:



\- Audit log database schema mismatch

\- Error handler integration issue



\---



# Problem 1: Audit Log Database Schema Mismatch



## Effect



**Audit log could not save records because the database table structure did not match the audit logger requirements.**



## Fishbone Categories



### People



\- Database changes and application code were developed separately.

\- The required audit-log fields were not initially verified against the existing database structure.



### Process



\- Database schema verification was not performed before testing the audit logger.

\- The audit logging feature was tested before all required columns were confirmed.



### Technology



\- SQLite database table was missing the expected `username` column.

\- Audit logger attempted to insert data into a field that was unavailable in the table.



### Code



\- Audit logger expected fields including username.

\- Existing database structure did not initially match the logger implementation.



### Data



\- Audit log records require user information, role, action and details.

\- Missing schema fields prevented complete audit records from being stored.



### Environment



\- The application and database were being developed and tested locally.

\- Existing database structure remained from an earlier implementation stage.



## Root Cause



The main root cause was a **mismatch between the audit logger code and the existing SQLite database schema**.



## Corrective Action



\- Inspected the existing database columns.

\- Updated the audit log table structure.

\- Re-ran the audit logger.

\- Verified that audit records were successfully stored.



\---



# Problem 2: Error Handler Integration Issue



## Effect



**The error recovery test initially failed because the `error\_handler` module was unavailable.**



## Fishbone Categories



### People



\- Error recovery functionality was introduced incrementally.

\- Integration testing was performed while the module was still being developed.



### Process



\- The error handler import was tested before the complete module integration was finished.

\- Module availability was not verified before the first GUI error-recovery test.



### Technology



\- Python module import initially failed.

\- The required `utils.error\_handler` module was not available at the first test attempt.



### Code



\- Application code expected:



&#x20; `utils.error\_handler`



\- The module was initially missing from the project.



### Testing



\- The first error-handler test produced a `ModuleNotFoundError`.

\- After the module was added, the import and error-handling tests succeeded.



### Environment



\- The application was being tested from the RestaurantBillingSystem project root.

\- Python module resolution depended on the correct project structure.



## Root Cause



The main root cause was an **incomplete integration of the error handler module into the project structure**.



## Corrective Action



\- Added the required error handler module.

\- Verified that it could be imported.

\- Integrated it into the Menu operation.

\- Tested the handler with a `ValueError`.

\- Verified the resulting records in `error\_logs`.

\- Verified the corresponding `ERROR` records in `audit\_logs`.



\---



# Combined Root Cause Summary



| Problem | Main Root Cause | Corrective Action |

|---|---|---|

| Audit Log Schema Mismatch | Code and database schema were not synchronized | Updated and verified database schema |

| Error Handler Integration | Error handler module was not initially available | Added, integrated and tested error handler |



# Reliability Improvement



The identified root causes were addressed through the Q01 reliability features:



| Root Cause Area | Reliability Improvement |

|---|---|

| Database structure mismatch | Database schema verification and audit logging |

| Missing error-handling module | Centralized error handling and error logging |

| Invalid user input | Input validation |

| Database data-loss risk | Auto backup |

| Unauthorized access | User role control |



# Conclusion



The Fishbone analysis shows that the reliability issues were primarily related to database-schema synchronization and incomplete module integration during development.



The corrective actions resolved the identified problems and were followed by functional verification.



These improvements support the Q01 objective:



**Improve Reliability**



