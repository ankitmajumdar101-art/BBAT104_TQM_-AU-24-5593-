# PDCA Cycle - Restaurant Billing System



## Quality Goal



**Q01: Improve Reliability**



## Purpose



The PDCA (Plan-Do-Check-Act) cycle is used to document continuous improvement activities performed during development and testing of the Restaurant Billing System.



\---



# 1. PLAN



## Problem Identification



During development and testing, reliability-related issues were identified in the audit logging and error recovery areas.



The main documented issues were:



1\. Audit log database schema mismatch.

2\. Error handler integration issue.



## Quality Objective



Improve the reliability of the Restaurant Billing System by implementing:



\- Auto Backup

\- Audit Log

\- Input Validation

\- Error Recovery

\- User Roles



## Planned Improvements



| Area | Planned Improvement |

|---|---|

| Database protection | Implement automatic database backup |

| Activity traceability | Implement audit logging |

| Invalid data prevention | Implement input validation |

| Error management | Implement centralized error recovery |

| Access control | Implement Admin and Cashier roles |



\---



# 2. DO



The planned reliability features were implemented in the Restaurant Billing System.



### Auto Backup



A backup manager was implemented to create database backup files and record backup history.



### Audit Log



An audit logging system was implemented to record important activities such as login and menu operations.



### Input Validation



Validation was implemented to prevent invalid user input such as missing menu information and negative prices.



### Error Recovery



An error handler was implemented to catch unexpected errors, record them and provide recovery guidance.



### User Roles



Role-based access was implemented for Admin and Cashier users.



\---



# 3. CHECK



The implemented features were tested using functional test cases.



## Test Results



| Feature | Test | Result |

|---|---|---|

| Auto Backup | Create database backup | Pass |

| Auto Backup | Verify backup history | Pass |

| Audit Log | Record login activity | Pass |

| Audit Log | Record menu activity | Pass |

| Input Validation | Reject missing menu name | Pass |

| Input Validation | Reject negative price | Pass |

| Input Validation | Reject invalid login credentials | Pass |

| Error Recovery | Handle ValueError | Pass |

| Error Recovery | Record error in error\_logs | Pass |

| Error Recovery | Record ERROR audit activity | Pass |

| User Roles | Verify Admin access | Pass |

| User Roles | Verify Cashier restrictions | Pass |



## Development Defects Checked



| Defect | Corrective Action | Verification |

|---|---|---|

| Audit log schema mismatch | Updated database table structure | Audit records saved successfully |

| Error handler integration issue | Added and integrated error handler | Error handler test succeeded |



\---



# 4. ACT



Based on the testing results, the implemented reliability controls were retained.



## Actions Taken



\- Kept the corrected audit log database structure.

\- Kept centralized error handling.

\- Continued using input validation before database insertion.

\- Continued creating database backups.

\- Continued applying role-based access restrictions.

\- Recorded reliability-related activities and errors for future analysis.



## Future Improvement



Future development can extend the reliability system by:



\- Adding more automated test cases.

\- Adding backup restoration testing.

\- Adding additional audit events.

\- Adding more validation rules.

\- Adding automated regression testing.



\---



# PDCA Summary



```text

&#x20;             PLAN

&#x20;               |

&#x20;               v

&#x20;       Identify Reliability

&#x20;            Problems

&#x20;               |

&#x20;               v

&#x20;              DO

&#x20;               |

&#x20;               v

&#x20;      Implement Q01 Features

&#x20;               |

&#x20;               v

&#x20;             CHECK

&#x20;               |

&#x20;               v

&#x20;       Test \& Verify Results

&#x20;               |

&#x20;               v

&#x20;              ACT

&#x20;               |

&#x20;               v

&#x20;      Apply Corrective Actions

&#x20;               |

&#x20;               +------------------+

&#x20;                                  |

&#x20;                                  v

&#x20;                                PLAN


