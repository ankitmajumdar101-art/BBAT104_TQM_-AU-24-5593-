-- ============================================================
-- Restaurant Billing System - MySQL Database Schema
-- Quality Goal: Q01 - Improve Reliability & Multi-Stakeholder Architecture
-- Stakeholders: Owner, Admin, Cashier, Customer, Developer/Maintainer
-- ============================================================

CREATE DATABASE IF NOT EXISTS restaurant_billing_db
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE restaurant_billing_db;

-- ------------------------------------------------------------
-- 1. USERS TABLE (Role-Based Access Control)
-- Roles: Owner (P&L, reports, staff), Admin (Menu, backups, logs), Cashier (Billing)
-- Passwords stored as BCrypt hashes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Owner', 'Admin', 'Cashier') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. MENU ITEMS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    available BOOLEAN NOT NULL DEFAULT 1,
    image_url VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. ORDERS TABLE (Billing & Invoice Records)
-- Stores detailed tax breakdowns (CGST + SGST), discounts, payment method & customer details
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    table_number INT NOT NULL DEFAULT 1,
    customer_name VARCHAR(100) NOT NULL DEFAULT 'Walk-in Customer',
    customer_phone VARCHAR(20) DEFAULT '',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 5.00, -- 5% GST (2.5% CGST + 2.5% SGST)
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'fixed',
    discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    payment_method ENUM('Cash', 'UPI', 'Card') NOT NULL DEFAULT 'Cash',
    payment_status ENUM('Paid', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Paid',
    order_status ENUM('Completed', 'Preparing', 'Cancelled') NOT NULL DEFAULT 'Completed',
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. ORDER ITEMS TABLE (Line Items for Each Bill)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT,
    item_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. AUDIT LOGS TABLE (Q01 Reliability - Complete Traceability)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    username VARCHAR(50),
    role VARCHAR(20),
    action VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. ERROR LOGS TABLE (Q01 Reliability - Failure Recovery)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS error_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    error_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    module VARCHAR(100) DEFAULT 'General',
    stack_trace TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. BACKUP LOGS TABLE (Q01 Reliability - Database Protection)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS backup_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    backup_file VARCHAR(255) NOT NULL,
    file_size_kb DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('Success', 'Failed') NOT NULL DEFAULT 'Success',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default Users (Passwords encrypted with BCrypt, cost factor 10)
-- owner / owner123
-- admin / admin123
-- cashier / cash123
INSERT INTO users (username, password, role, full_name, email, phone)
VALUES 
    ('owner', '$2a$10$ZdngespcLulbbrbgKyvy8eXa6hhR2MOni.pNJWohDiVjMqy1VfG7y', 'Owner', 'Restaurant Owner', 'owner@restaurant.com', '+91 9876543210'),
    ('admin', '$2a$10$.NrIalhXGD0Lwa2BJhXohu02C2JXEJcPj0R/al.2OIhnkOULgz/se', 'Admin', 'System Administrator', 'admin@restaurant.com', '+91 9876543211'),
    ('cashier', '$2a$10$y04eV/RUbsEtRDQzKNQuF.YNrUS4wa9I71F/ivcSvF.WdOQG9gEfO', 'Cashier', 'Front Desk Cashier', 'cashier@restaurant.com', '+91 9876543212')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Default Menu Categories
INSERT INTO categories (name, description)
VALUES 
    ('Starters', 'Appetizers and quick bites'),
    ('Main Course', 'Hearty and full-course meals'),
    ('Fast Food', 'Pizzas, burgers, and snacks'),
    ('Beverages', 'Hot and cold refreshments'),
    ('Desserts', 'Sweet treats and ice creams')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Default Menu Items
INSERT INTO menu_items (category_id, name, description, price, available)
VALUES 
    (1, 'Paneer Tikka', 'Cottage cheese marinated in spices and grilled', 250.00, 1),
    (1, 'Veg Spring Rolls', 'Crispy rolls filled with shredded vegetables', 180.00, 1),
    (1, 'Hot Tomato Soup', 'Warm and creamy fresh tomato soup', 90.00, 1),
    (2, 'Chicken Biryani', 'Aromatic basmati rice cooked with spiced chicken', 320.00, 1),
    (2, 'Paneer Butter Masala', 'Rich and creamy tomato gravy with cottage cheese', 260.00, 1),
    (2, 'Dal Makhani', 'Slow-cooked black lentils with butter and cream', 220.00, 1),
    (2, 'Butter Naan', 'Soft Indian flatbread baked in tandoor with butter', 45.00, 1),
    (3, 'Margherita Pizza', 'Classic cheese and tomato pizza with basil', 280.00, 1),
    (3, 'Masala Dosa', 'Crispy fermented crepe filled with spiced potatoes', 150.00, 1),
    (3, 'Veg Cheese Burger', 'Grilled veggie patty topped with melted cheese', 130.00, 1),
    (4, 'Cold Coffee', 'Chilled blended milk, espresso, and ice cream', 110.00, 1),
    (4, 'Masala Chai', 'Traditional Indian spiced milk tea', 40.00, 1),
    (4, 'Fresh Lime Soda', 'Refreshing sweet and salty sparkling limeade', 60.00, 1),
    (5, 'Gulab Jamun', 'Warm fried milk-solid balls in saffron syrup', 80.00, 1),
    (5, 'Chocolate Brownie with Ice Cream', 'Warm fudge brownie served with vanilla ice cream', 160.00, 1)
ON DUPLICATE KEY UPDATE price=VALUES(price);

-- Initial Audit Log
INSERT INTO audit_logs (username, role, action, details)
VALUES 
    ('admin', 'Admin', 'INITIALIZE_DATABASE', 'MySQL database initialized with tables and default seeds');
