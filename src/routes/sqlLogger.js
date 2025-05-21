/**
 * SQL Logger Routes
 * Provides endpoints to access SQL query logs
 */

const express = require('express');
const router = express.Router();
const { getRecentSqlQueries, clearSqlQueries } = require('../config/database');

// Get recent SQL queries
router.get('/', (req, res) => {
  try {
    const queries = getRecentSqlQueries();
    // Ensure only serializable fields are sent
    const safeQueries = queries.map(q => ({
      sql: q.sql,
      timestamp: q.timestamp,
      timing: q.timing
    }));
    res.json({
      success: true,
      count: safeQueries.length,
      queries: safeQueries
    });
  } catch (error) {
    console.error('Error fetching SQL queries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SQL queries',
      error: error.message
    });
  }
});

// Clear SQL query history
router.delete('/', (req, res) => {
  try {
    clearSqlQueries();
    res.json({
      success: true,
      message: 'SQL query history cleared'
    });
  } catch (error) {
    console.error('Error clearing SQL queries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear SQL queries',
      error: error.message
    });
  }
});

module.exports = router;