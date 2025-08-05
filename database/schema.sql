-- Expense Tracker Database Schema
-- MySQL 8.0+ Compatible

-- Create database
CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#007bff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT IGNORE INTO categories (name, color) VALUES
('Food & Dining', '#ff6b6b'),
('Transportation', '#4ecdc4'),
('Shopping', '#45b7d1'),
('Entertainment', '#96ceb4'),
('Bills & Utilities', '#ffeaa7'),
('Healthcare', '#dda0dd'),
('Education', '#98d8c8'),
('Travel', '#f7dc6f'),
('Other', '#aaa');

-- Create indexes for better performance
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_amount ON expenses(amount);

-- Display tables
SHOW TABLES;
SELECT 'Database setup completed successfully!' as Status;
