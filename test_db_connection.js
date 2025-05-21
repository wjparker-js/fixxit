const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'SealTeam6',
      database: process.env.DB_NAME || 'fixxit'
    });

    console.log('Successfully connected to MySQL database!');
    
    // Test query to check Users table
    const [rows] = await connection.query('SELECT * FROM Users LIMIT 1');
    console.log('Test query results:', rows.length > 0 ? rows[0] : 'No users found');
    
    await connection.end();
    console.log('Connection closed');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error(`Could not connect to MySQL server at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
    }
  }
}

testConnection();