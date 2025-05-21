/**
 * Database Setup Script for Fixxit Application
 * This script connects to the remote MySQL server and executes the SQL commands
 * from the database_setup.sql file to create the necessary tables.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Database connection configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.db_port || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'SealTeam6',
  multipleStatements: true // Allow multiple SQL statements in one query
};

async function setupDatabase() {
  console.log('Starting database setup...');
  console.log(`Connecting to MySQL server at ${dbConfig.host}:${dbConfig.port}`);
  
  let connection;
  
  try {
    // First connect without database to create it if needed
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true
    });
    
    console.log('Connected to MySQL server successfully');
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'fixxit'};`);
    console.log(`Ensured database '${process.env.DB_NAME || 'fixxit'}' exists`);
    
    // Close initial connection
    await connection.end();
    
    // Connect with database selected
    connection = await mysql.createConnection({
      ...dbConfig,
      database: process.env.DB_NAME || 'fixxit'
    });
    
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'database_setup.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute SQL script
    console.log('Executing SQL script to create tables...');
    const [results] = await connection.query(sqlScript);
    
    console.log('Database setup completed successfully!');
    console.log('The following tables have been created:');
    console.log('- Users');
    console.log('- Reports');
    console.log('- WorkOrders');
    
  } catch (error) {
    console.error('Error setting up database:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error(`Could not connect to MySQL server at ${dbConfig.host}:${dbConfig.port}`);
      console.error('Please check that:');
      console.error('1. The server is running and accessible');
      console.error('2. The host and port are correct');
      console.error('3. Any firewall rules allow the connection');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the setup
setupDatabase();