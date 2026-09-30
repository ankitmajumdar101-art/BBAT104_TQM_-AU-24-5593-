\# FMEA - Restaurant Billing System



\## Quality Goal



\*\*Q01: Improve Reliability\*\*



\## Purpose



Failure Mode and Effects Analysis (FMEA) is used to identify possible failures in the Restaurant Billing System, understand their effects and causes, and define actions to reduce reliability risks.



\## RPN Calculation



\*\*RPN = Severity × Occurrence × Detection\*\*



\### Rating Scale



| Rating | Severity | Occurrence | Detection |

|---|---|---|---|

| 1 | Very low impact | Rare | Almost certain to detect |

| 2 | Low impact | Unlikely | Very high detection |

| 3 | Minor impact | Occasional | High detection |

| 4 | Moderate impact | Sometimes | Moderately high detection |

| 5 | Significant impact | Regular | Moderate detection |

| 6 | High impact | Frequent | Low detection |

| 7 | Very high impact | Very frequent | Very low detection |

| 8 | Serious impact | Highly frequent | Poor detection |

| 9 | Critical impact | Almost certain | Very poor detection |

| 10 | System-critical impact | Certain | Failure is unlikely to be detected |



\## FMEA Matrix



| ID | Process / Feature | Failure Mode | Effect | Possible Cause | Current Control | S | O | D | RPN | Recommended Action |

|---|---|---|---|---|---|---:|---:|---:|---:|---|

| FMEA-01 | Auto Backup | Database backup fails | Database recovery copy may not be available | Backup operation or file creation error | Backup Manager and backup history | 9 | 3 | 4 | 108 | Continue logging backup results and verify backup creation |

| FMEA-02 | Audit Log | User action is not recorded | Important activity cannot be traced | Logging operation fails | Audit Logger and audit log database table | 7 | 3 | 5 | 105 | Record important operations through the centralized audit logger |

| FMEA-03 | Input Validation | Invalid input is accepted | Incorrect data may enter the system | Missing or incomplete validation | Login and Menu validation | 8 | 3 | 3 | 72 | Validate required fields, numeric values and valid ranges before database insertion |

| FMEA-04 | Error Recovery | Unexpected error stops an operation | User may lose the current operation or application stability may be affected | Unhandled exception | Error Handler, error log and user-friendly message | 9 | 3 | 4 | 108 | Catch operation errors, record them and provide recovery guidance |

| FMEA-05 | User Roles | Unauthorized feature access | A user may access administrative functions | Incorrect role-based access control | Admin and Cashier role checks | 10 | 2 | 4 | 80 | Restrict Admin-only functions based on authenticated user role |



\## Risk Interpretation



The calculated RPN values identify areas where reliability controls are important.



The identified risks are addressed by the five Q01 features implemented in the system:



1\. \*\*Auto Backup\*\* - provides database backup capability.

2\. \*\*Audit Log\*\* - records important system activities.

3\. \*\*Input Validation\*\* - prevents invalid user input from being stored.

4\. \*\*Error Recovery\*\* - records errors and provides recovery guidance.

5\. \*\*User Roles\*\* - separates Admin and Cashier access.



\## Mitigation Summary



| Feature | Reliability Control |

|---|---|

| Auto Backup | Creates database backup files and records backup history |

| Audit Log | Records important user and system actions |

| Input Validation | Rejects invalid or incomplete input |

| Error Recovery | Logs errors and displays recovery guidance |

| User Roles | Limits administrative functions to Admin users |



\## Conclusion



The FMEA identifies potential reliability failures in the Restaurant Billing System and connects each failure mode with an implemented reliability control. The analysis supports the Q01 objective of improving system reliability through prevention, detection, logging, recovery and controlled access.

