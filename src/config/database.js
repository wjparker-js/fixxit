const { Sequelize } = require('sequelize');
const logger = require('./logger');
const path = require('path');
const EventEmitter = require('events');

// Create a SQL logger event emitter to broadcast SQL queries
const sqlLogger = new EventEmitter();
// Store recent SQL queries for display
let recentSqlQueries = [];
const MAX_STORED_QUERIES = 50;

// Configure MySQL binary path for local client tools (if needed)
const mariaDBPath = 'C:\\Program Files\\MariaDB 10.4\\bin';
process.env.PATH = process.env.PATH + path.delimiter + mariaDBPath;

/**
 * To connect to a remote MySQL server:
 * 1. Set these environment variables before starting the application:
 *    - DB_HOST: Remote server hostname or IP (e.g., 'db.example.com' or '192.168.1.100')
 *    - DB_PORT: MySQL port (typically 3306)
 *    - DB_NAME: Database name on the remote server
 *    - DB_USER: MySQL username with access to the remote database
 *    - DB_PASS: Password for the MySQL user
 * 
 * 2. Example setting environment variables in Windows:
 *    set DB_HOST=remote-server-address
 *    set DB_PORT=3306
 *    set DB_NAME=fixxit
 *    set DB_USER=remote_user
 *    set DB_PASS=your_password
 */

// Define the database configuration based on environment
const dbConfig = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  logging: (msg) => logger.info(msg), // Use Winston logger for Sequelize logs
};

// Only initialize Sequelize and test connection if not in test environment
let sequelize = null;
let testConnection = async () => {}; // Default no-op function for test env

if (process.env.NODE_ENV !== 'test') {
  sequelize = new Sequelize(dbConfig);

  testConnection = async () => {
    logger.info('Database Config:', dbConfig); // Log database config
    logger.info('Environment Variables:', {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASS: process.env.DB_PASS ? 'SET' : 'NOT SET', // Mask password in logs
    });
    try {
      await sequelize.authenticate();
      logger.info(
        `Database connection established successfully to ${dbConfig.host}:${dbConfig.port}`
      );
    } catch (error) {
      logger.error('Unable to connect to the database:', error);
      process.exit(1); // Exit if database connection fails in non-test env
    }
  };
}

const gracefulShutdown = async () => {
  try {
    await sequelize.close();
    logger.info('Database connection closed gracefully.');
    process.exit(0);
  } catch (error) {
    logger.error('Error closing database connection:', error);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Function to get recent SQL queries
const getRecentSqlQueries = () => {
  return [...recentSqlQueries];
};

// Function to clear SQL query history
const clearSqlQueries = () => {
  recentSqlQueries = [];
  return true;
};

module.exports = { 
  sequelize, 
  testConnection, 
  sqlLogger, 
  getRecentSqlQueries, 
  clearSqlQueries 
};