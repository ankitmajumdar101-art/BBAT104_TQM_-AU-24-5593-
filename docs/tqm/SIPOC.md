\# SIPOC Process Map - Restaurant Billing System



\## Quality Goal



\*\*Q01: Improve Reliability\*\*



\## Purpose



The SIPOC model identifies the Suppliers, Inputs, Process, Outputs and Customers involved in the Restaurant Billing System.



\## SIPOC Diagram



| Suppliers | Inputs | Process | Outputs | Customers |

|---|---|---|---|---|

| Restaurant Admin | Admin credentials | 1. User logs into the system | Authenticated Admin session | Restaurant Admin |

| Restaurant Cashier | Cashier credentials | 2. User authentication and role identification | Authenticated Cashier session | Cashier |

| Restaurant Staff | Menu item information | 3. Validate menu information | Valid menu data | Restaurant Staff |

| Restaurant Admin | Menu data | 4. Store menu information in SQLite database | Updated menu records | Admin / Cashier |

| System User | Application actions | 5. Record important system activities | Audit log records | Admin |

| System User | Database/application operation | 6. Detect and record errors | Error records and recovery message | Admin / System User |

| System Admin | Restaurant database | 7. Create database backup | Backup database file and backup history | Restaurant Admin |

| Admin | User account and role information | 8. Apply role-based access control | Authorized feature access | Admin / Cashier |



\## High-Level Process Flow



```text

User

\&#x20; |

\&#x20; v

Login

\&#x20; |

\&#x20; v

Authentication

\&#x20; |

\&#x20; +----------------------+

\&#x20; |                      |

\&#x20; v                      v

Admin                  Cashier

\&#x20; |                      |

\&#x20; v                      v

Admin Functions       Cashier Functions

\&#x20; |

\&#x20; +-------------------------------+

\&#x20; |               |               |

\&#x20; v               v               v

Audit Logs      Backup        User Roles

\&#x20; |

\&#x20; v

System Reliability



Menu Input

\&#x20; |

\&#x20; v

Input Validation

\&#x20; |

\&#x20; +------ Valid ------> Database

\&#x20; |

\&#x20; +------ Invalid ----> User Correction



Application Error

\&#x20; |

\&#x20; v

Error Handler

\&#x20; |

\&#x20; +------> Error Log

\&#x20; |

\&#x20; +------> Audit Log

\&#x20; |

\&#x20; +------> Recovery Guidance


