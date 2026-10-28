# Test Plan - Restaurant Billing System



## 1. Project Information



**Project:** Restaurant Billing System  

**Quality Objective:** Q01 - Improve Reliability  

**Testing Type:** Functional Testing  

**Environment:** Python 3.13.5, SQLite, Tkinter, Windows



\---



## 2. Testing Objective



The purpose of testing is to verify that the Restaurant Billing System performs its main operations correctly and that the Q01 reliability features prevent, detect and recover from common failures.



\---



## 3. Features Under Test



The following reliability features are tested:



1\. User Login

2\. User Roles

3\. Input Validation

4\. Audit Logging

5\. Auto Backup

6\. Error Recovery

7\. Menu Management



\---



## 4. Test Cases



| Test ID | Feature | Test Condition | Expected Result | Actual Result | Status |

|---|---|---|---|---|---|

| TC-001 | Login | Valid Admin credentials | Admin dashboard opens | Admin login succeeded | Pass |

| TC-002 | Login | Incorrect password | Login rejected | "Invalid username or password" displayed | Pass |

| TC-003 | User Roles | Login as Admin | Admin functions available | Admin functions available | Pass |

| TC-004 | User Roles | Login as Cashier | Admin-only functions unavailable | Admin-only functions unavailable | Pass |

| TC-005 | Input Validation | Menu name missing | Item rejected | Item rejected | Pass |

| TC-006 | Input Validation | Negative price | Item rejected | Item rejected | Pass |

| TC-007 | Menu Management | Valid menu item | Item saved | Soup was added successfully | Pass |

| TC-008 | Audit Log | Successful login | LOGIN record created | LOGIN record verified | Pass |

| TC-009 | Audit Log | Menu operation | ADD\_MENU record created | ADD\_MENU record verified | Pass |

| TC-010 | Auto Backup | Create database backup | Backup file created | Backup file created | Pass |

| TC-011 | Auto Backup | Check backup log | Backup record stored | backup\_logs record verified | Pass |

| TC-012 | Error Recovery | Trigger ValueError | Error handled safely | Error handler processed error | Pass |

| TC-013 | Error Logging | Trigger test error | Error recorded | error\_logs record created | Pass |

| TC-014 | Error Audit | Trigger test error | ERROR audit record created | ERROR audit record verified | Pass |



\---



## 5. Database Verification



The database was checked during testing to verify the required tables.



The system contains:



\- users

\- menu\_items

\- bills

\- bill\_items

\- audit\_logs

\- backup\_logs

\- error\_logs



\---



## 6. Reliability Verification



### Audit Logging



Audit records were verified using the SQLite database.



The verified actions included:



\- LOGIN

\- ADD\_MENU

\- ERROR



### Backup



Database backup files were successfully created in the `backups` directory.



Backup history was also recorded in the `backup\_logs` table.



### Error Recovery



A `ValueError` test was performed.



The error handler processed the exception and the error was recorded in `error\_logs`.



The corresponding error activity was also recorded in `audit\_logs`.



### Input Validation



Invalid menu input was tested.



The system prevented:



\- Missing menu name

\- Negative menu price



Valid menu data was accepted successfully.



### User Roles



Admin and Cashier access were tested.



Admin users can access administrative functions while Cashier users are restricted from administrative functions.



\---



## 7. Test Summary



| Result | Count |

|---|---:|

| Passed | 14 |

| Failed | 0 |

| Total | 14 |



### Pass Percentage



**100% of the documented functional test cases passed.**



\---



## 8. Defects Found During Development



Two development issues were identified and corrected:



### Defect 1 - Audit Log Schema Mismatch



The audit logger initially attempted to use a database field that was not available in the existing table structure.



**Correction:** The database table was updated and the audit logger was tested again successfully.



### Defect 2 - Error Handler Integration



The error handler module was initially unavailable during the first integration test.



**Correction:** The required module was added and subsequently tested successfully.



\---



## 9. Final Testing Result



The documented functional tests passed after the identified development issues were corrected.



The test results provide evidence that the implemented Q01 reliability features operate as expected under the tested conditions.



## 10. Scope Limitation



These results represent the functional tests performed during development. They do not claim that every possible input, environment or failure condition has been tested.


