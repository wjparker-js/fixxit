# Fixxit Database Setup Instructions

This document provides instructions for setting up the Fixxit database tables on the remote MySQL server at 209.182.216.21:3306.

## Connection Issues

When attempting to connect to the remote MySQL server, we encountered a connection timeout error. This could be due to one of the following reasons:

1. The server is behind a firewall that blocks incoming connections on port 3306
2. The server is not currently running or accessible from your network
3. The credentials in the .env file may need to be updated

## Manual Database Setup

To set up the database tables manually, follow these steps:

1. Connect to the remote MySQL server using a MySQL client:
   ```
   mysql -h 209.182.216.21 -P 3306 -u root -p
   ```
   When prompted, enter the password: `SealTeam6`

2. Once connected, execute the following SQL commands to create the necessary tables:

```sql
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

-- Add indexes for performance
CREATE INDEX idx_reports_status ON Reports(status);
CREATE INDEX idx_workorders_status ON WorkOrders(status);
CREATE INDEX idx_workorders_scheduled ON WorkOrders(scheduledDate);
```

## Database Schema Explanation

The database schema consists of three main tables:

1. **Users** - Stores user information including authentication details and role
2. **Reports** - Stores incident reports submitted by users
3. **WorkOrders** - Stores work orders created from reports for remediation

### Relationships

- A User can create many Reports (one-to-many)
- A Report can have one WorkOrder (one-to-one)
- A User can be assigned to many WorkOrders (one-to-many)

## Verifying Database Setup

After creating the tables, you can verify they were created correctly by running:

```sql
SHOW TABLES;
DESC Users;
DESC Reports;
DESC WorkOrders;
```

## Application Configuration

The application is already configured to connect to this database using the settings in the `.env` file:

```
DB_HOST=209.182.216.21
db_port=3306
DB_USER=root
DB_PASS=SealTeam6
DB_NAME=fixxit
```

Once the database tables are created, the application should be able to connect and function properly.