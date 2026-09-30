# Pareto Analysis - Restaurant Billing System



## Quality Goal



**Q01: Improve Reliability**



## Purpose



Pareto analysis is used to identify which reliability-related problems contributed most to the development and testing issues of the Restaurant Billing System.



The analysis uses the defect information recorded during development and functional testing.



## Defect Data



| Rank | Defect / Issue | Frequency |

|---|---|---:|

| 1 | Audit log database schema mismatch | 1 |

| 2 | Error handler integration issue | 1 |

| 3 | Input validation issues found during testing | 0 |

| 4 | Backup creation failure | 0 |

| 5 | Unauthorized Cashier access | 0 |

| 6 | Unhandled test error after integration | 0 |



**Total recorded defect occurrences: 2**



## Pareto Calculation



| Defect / Issue | Frequency | Percentage | Cumulative Percentage |

|---|---:|---:|---:|

| Audit log database schema mismatch | 1 | 50% | 50% |

| Error handler integration issue | 1 | 50% | 100% |

| Input validation issues found during testing | 0 | 0% | 100% |

| Backup creation failure | 0 | 0% | 100% |

| Unauthorized Cashier access | 0 | 0% | 100% |

| Unhandled test error after integration | 0 | 0% | 100% |



## Pareto Interpretation



The recorded development issues were concentrated in two areas:



1\. **Audit log database schema mismatch**

2\. **Error handler integration issue**



Each occurred once and therefore represented 50% of the two recorded defect occurrences.



The other listed reliability categories had zero recorded failures during the documented functional testing.



## Improvement Actions



### Audit Log Database Schema Mismatch



The audit logging system initially encountered a database schema mismatch because the expected `username` field was not available in the existing table structure.



Corrective action:



\- Updated the audit log table structure.

\- Verified the required columns.

\- Re-tested the audit logger.

\- Confirmed that audit records were successfully saved.



### Error Handler Integration Issue



The error recovery testing initially encountered an unavailable `error\_handler` module.



Corrective action:



\- Added the error handler module.

\- Integrated it with the relevant application operation.

\- Tested the error handler with a `ValueError`.

\- Confirmed that the error was recorded in `error\_logs`.

\- Confirmed that an `ERROR` entry was recorded in `audit\_logs`.



## Pareto Conclusion



The Pareto analysis identifies the two recorded development issues as the primary reliability problems observed in the available defect data.



Both issues were corrected and subsequently verified.



The analysis demonstrates how defect data can be used to identify improvement priorities within the Q01 reliability objective.


