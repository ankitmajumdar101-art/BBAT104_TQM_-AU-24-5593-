# SQC Checksheet - Restaurant Billing System



## Quality Goal



**Q01: Improve Reliability**



## Purpose



The checksheet records reliability-related observations obtained during functional testing of the Restaurant Billing System.



## Testing Period



September 2026



## Reliability Test Checksheet



| ID | Test Area | Test Condition | Expected Result | Observed Result | Status |

|---|---|---|---|---|---|

| T-001 | Login | Correct Admin credentials | Admin login succeeds | Admin login succeeded | Pass |

| T-002 | Login | Incorrect password | Login rejected | "Invalid username or password" displayed | Pass |

| T-003 | Input Validation | Menu name missing | Item should not be added | Validation message displayed | Pass |

| T-004 | Input Validation | Negative menu price | Item should not be added | Validation message displayed | Pass |

| T-005 | Menu | Valid menu item | Item should be saved | Soup was added successfully | Pass |

| T-006 | Audit Log | Successful login | Login activity recorded | LOGIN record created | Pass |

| T-007 | Audit Log | Menu activity | Menu activity recorded | ADD\_MENU record created | Pass |

| T-008 | Auto Backup | Create database backup | Backup file should be created | Backup file created successfully | Pass |

| T-009 | Auto Backup | Check backup history | Backup should be recorded | backup\_logs record created | Pass |

| T-010 | Error Recovery | Test ValueError | Error should be handled | Error handler processed the error | Pass |

| T-011 | Error Recovery | Check error log | Error should be recorded | ValueError record created | Pass |

| T-012 | Error Recovery | Check audit log | ERROR activity should be recorded | ERROR audit record created | Pass |

| T-013 | User Roles | Login as Admin | Admin functions available | Admin functions displayed | Pass |

| T-014 | User Roles | Login as Cashier | Admin-only functions unavailable | User Management, Audit Logs and Backup unavailable | Pass |



## Summary



| Result | Count |

|---|---:|

| Passed | 14 |

| Failed | 0 |

| Total Tests | 14 |



## Defect Frequency



The following reliability-related issues were identified during development and testing:



| Defect / Issue | Frequency |

|---|---:|

| Audit log database schema mismatch | 1 |

| Error handler integration issue | 1 |

| Input validation issues found during testing | 0 |

| Backup creation failure | 0 |

| Unauthorized Cashier access | 0 |

| Unhandled test error after integration | 0 |



## Interpretation



The checksheet shows that the tested Q01 reliability functions produced the expected results during functional verification.



The development issues identified during implementation were corrected and subsequently verified.



## Conclusion



The checksheet provides structured evidence that the five Q01 reliability features were tested individually. The recorded results will be used as input for the Pareto analysis and subsequent SQC improvement activities.


