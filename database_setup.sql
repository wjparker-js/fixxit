-- Fixxit Application Database Setup Script
-- This script creates the necessary tables for the Fixxit application
-- Target MySQL Server: 209.182.216.21:3306

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS fixxit;

-- Use the fixxit database
USE fixxit;

-- Users table
CREATE TABLE IF NOT EXISTS Users (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS Reports (
  id VARCHAR(36) NOT NULL,
  description TEXT NOT NULL,
  location JSON,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  images JSON,
  UserId VARCHAR(36),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE SET NULL
);

-- Work Orders table
CREATE TABLE IF NOT EXISTS WorkOrders (
  id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'in_progress', 'completed') DEFAULT 'pending',
  scheduledDate DATETIME,
  notes TEXT,
  ReportId VARCHAR(36) UNIQUE,
  UserId VARCHAR(36),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (ReportId) REFERENCES Reports(id) ON DELETE CASCADE,
  FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE SET NULL
);

-- Create an admin user (password will be hashed by the application when used)
-- INSERT INTO Users (id, name, email, password, role, isActive, createdAt, updatedAt)
-- VALUES (UUID(), 'Admin User', 'admin@fixxit.com', 'temporaryPassword', 'admin', TRUE, NOW(), NOW());

-- Note: The actual password will be hashed by bcrypt in the application
-- This insert statement is commented out as it's better to create users through the application API

-- Add indexes for performance
CREATE INDEX idx_reports_status ON Reports(status);
CREATE INDEX idx_workorders_status ON WorkOrders(status);
CREATE INDEX idx_workorders_scheduled ON WorkOrders(scheduledDate);