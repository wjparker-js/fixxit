const mysql = require('mysql2/promise');
const express = require('express');
const app = express();
const port = 3001; // Using different port to avoid conflict

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'SealTeam6',
  database: 'fixxit'
};

app.get('/', async (req, res) => {
  try {
    // Create connection
    const connection = await mysql.createConnection(dbConfig);
    
    // Query users table
    const [rows] = await connection.execute('SELECT * FROM Users');
    
    // Close connection
    await connection.end();
    
    // Send response
    res.send(`
      <h1>Users Table Contents</h1>
      <p>Found ${rows.length} records</p>
      <pre>${JSON.stringify(rows, null, 2)}</pre>
    `);
  } catch (error) {
    res.send(`
      <h1>Error</h1>
      <p>${error.message}</p>
      <p>Stack trace: ${error.stack}</p>
      <p>Make sure:</p>
      <ul>
        <li>MySQL server is running on localhost:3306</li>
        <li>Username is 'root' and password is 'SealTeam6'</li>
        <li>Database 'fixxit' exists and has Users table</li>
        <li>Check if another service is using port 3001</li>
      </ul>
    `);
  }
});

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
});