// Load environment variables first, before any other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS handling
app.use(morgan('dev')); // Logging
app.use(express.json()); // Body parsing
app.use(express.urlencoded({ extended: true }));

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const { sequelize, testConnection } = require('./config/database');
const logger = require('./config/logger');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const workOrderRoutes = require('./routes/workOrderRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Test database connection and sync models
const initializeDatabase = async () => {
  await testConnection();
  await sequelize.sync({ alter: false });
  logger.info('Database models synchronized');
};

initializeDatabase().catch(err => {
  logger.error('Database initialization failed:', err);
  process.exit(1);
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Serve static files from public directory
app.use(express.static('public'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Received request for /api/health from', req.ip);
  try {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
  } catch (error) {
    console.error('Error in /api/health:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Database health check endpoint
app.get('/api/health/database', async (req, res) => {
  try {
    await testConnection();
    res.status(200).json({ status: 'connected', message: 'Database connection successful' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Import SQL logger routes
const sqlLoggerRoutes = require('./routes/sqlLogger');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/workorders', workOrderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sql-logs', sqlLoggerRoutes);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    // Port is already in use, try using a different port
    const newPort = parseInt(PORT) + 1;
    console.log(`Port ${PORT} is already in use, attempting to use port ${newPort}`);
    process.env.PORT = newPort;
    server.close();
    app.listen(newPort, () => {
      console.log(`Server is running on port ${newPort}`);
    });
  } else {
    console.error('Server error:', err);
  }
});

module.exports = app;