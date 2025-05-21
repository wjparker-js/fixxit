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

// Log database configuration (sensitive info redacted)
console.log('Database Config:', {
  database: process.env.DB_NAME || 'fixxit',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS ? '********' : 'SealTeam6',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '3306'
});

// Debug environment variables
console.log('Environment Variables:', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS ? 'SET' : 'NOT SET'
});

// Parse host and port from DB_HOST environment variable
// Use the DB_HOST directly without splitting if DB_PORT is provided
let host, port;
if (process.env.DB_HOST && process.env.DB_HOST.includes(':')) {
  [host, port] = process.env.DB_HOST.split(':');
} else {
  host = process.env.DB_HOST || 'localhost';
  port = null;
}
const dbPort = process.env.DB_PORT || process.env.db_port || port || 3306;

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'fixxit',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'SealTeam6',
  host: host,
  port: parseInt(dbPort, 10),
  dialect: 'mysql',
  logging: (sql, timing) => {
    // Log to console and file
    logger.debug(sql);
    console.log('\n----- GENERATED SQL -----');
    console.log(sql);
    console.log('------------------------\n');
    
    // Store the query for retrieval by the API
    const timestamp = new Date().toISOString();
    const queryInfo = { sql, timestamp, timing };
    
    // Add to recent queries and maintain max size
    recentSqlQueries.unshift(queryInfo);
    if (recentSqlQueries.length > MAX_STORED_QUERIES) {
      recentSqlQueries.pop();
    }
    
    // Emit event for real-time updates
    sqlLogger.emit('new-query', queryInfo);
    
    return sql;
  },
  dialectOptions: {
    // Options for remote connections
    connectTimeout: 60000, // Increase connection timeout for remote servers
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false // Set to true in production for proper SSL verification
    } : false
  },
  pool: {
    max: parseInt(process.env.DB_POOL_MAX, 10) || 5,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000
  },
  retry: {
    max: 3,
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ]
  }
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`Database connection established successfully to ${host}:${dbPort}`);
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    
    // Provide more helpful error messages for common connection issues
    if (error.name === 'SequelizeHostNotFoundError') {
      logger.error(`Could not resolve host: ${host}. Please check if the remote server address is correct.`);
    } else if (error.name === 'SequelizeConnectionRefusedError') {
      logger.error(`Connection refused at ${host}:${dbPort}. Please check if:
      - The remote MySQL server is running
      - The port ${dbPort} is open on the remote server
      - Any firewall is blocking the connection`);
    } else if (error.name === 'SequelizeAccessDeniedError') {
      logger.error('Access denied. Please check your username and password.');
    }
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return false;
  }
};

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