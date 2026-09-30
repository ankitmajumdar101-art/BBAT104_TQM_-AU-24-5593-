\# CTQ Tree - Restaurant Billing System



\## Quality Goal



\*\*Q01: Improve Reliability\*\*



\## CTQ Objective



The Restaurant Billing System should operate reliably by preventing invalid data, protecting database information, recording important activities, recovering from errors, and controlling user access.



\## CTQ Tree



```text

\&#x20;                        Q01: Improve Reliability

\&#x20;                                 |

\&#x20;         +-----------------------+-----------------------+

\&#x20;         |                       |                       |

\&#x20;         v                       v                       v

\&#x20;  Prevent Invalid          Protect Data            Record Activities

\&#x20;      Data                     |                       |

\&#x20;         |                     |                       |

\&#x20;         v                     v                       v

\&#x20;  Input Validation        Auto Backup              Audit Log

\&#x20;         |                     |                       |

\&#x20;    +----+----+           +----+----+            +-----+-----+

\&#x20;    |         |           |         |            |           |

\&#x20;    v         v           v         v            v           v

\&#x20;Required   Valid Price   Backup    Backup     Login       Menu

\&#x20;Fields                  Creation  History    Activity    Activity





\&#x20;         +-----------------------+-----------------------+

\&#x20;         |                                               |

\&#x20;         v                                               v

\&#x20;   Recover From Errors                         Control Access

\&#x20;         |                                               |

\&#x20;         v                                               v

\&#x20;   Error Recovery                                User Roles

\&#x20;         |                                               |

\&#x20;    +----+----+                                      +---+---+

\&#x20;    |         |                                      |       |

\&#x20;    v         v                                      v       v

\&#x20;Error Log  Recovery Message                       Admin   Cashier


