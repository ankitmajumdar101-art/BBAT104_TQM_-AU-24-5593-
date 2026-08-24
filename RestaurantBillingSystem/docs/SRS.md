# Software Requirements Specification (SRS)

## 1. Project Title

Restaurant Billing System - Q01: Improve Reliability

## 2. Quality Goal

Improve Reliability

## 3. Project Objective

The objective of the system is to provide a reliable desktop application for restaurant order processing and billing.

## 4. Scope

The system will support restaurant staff in managing menu items, creating bills, maintaining billing records, managing users, and generating basic reports.

The project will specifically focus on improving reliability using five quality features:

- Auto Backup
- Audit Log
- Input Validation
- Error Recovery
- User Roles

## 5. Target Users

### Admin

The administrator manages users, menu data, backups, audit logs, and system operations.

### Cashier

The cashier creates bills, manages customer orders, and views billing information.

## 6. Functional Requirements

The system shall:

1. Allow authorized users to log in.
2. Allow administrators to manage menu items.
3. Allow cashiers to create restaurant bills.
4. Store billing information in a database.
5. Validate user input before storing data.
6. Maintain an audit log of important activities.
7. Automatically create database backups.
8. Handle application errors without unnecessary crashes.
9. Restrict system operations according to user roles.
10. Allow users to view previous bills.

## 7. Non-Functional Requirements

### Reliability

The application should continue operating safely when expected errors occur.

### Data Accuracy

The system should prevent invalid billing and menu information.

### Security

Users should only access functions permitted by their roles.

### Maintainability

The application should use a modular structure so that individual components can be modified and tested.

## 8. Technology

- Python 3.x
- Tkinter
- SQLite3
- Pandas
- Matplotlib
- Seaborn

## 9. Quality Features

### Auto Backup

The system will create database backups to reduce the risk of permanent data loss.

### Audit Log

Important user and system activities will be recorded.

### Input Validation

Invalid or incomplete input will be rejected before database operations.

### Error Recovery

Expected application errors will be handled safely and recorded where appropriate.

### User Roles

Different permissions will be provided to Admin and Cashier users.

## 10. Project Status

Under Development

## 11. System Architecture

The Restaurant Billing System follows a layered desktop application architecture.

```text
User
 ↓
Tkinter GUI
 ↓
Application / Business Logic
 ↓
SQLite Database
 ↓
Audit Logs / Error Logs / Backup