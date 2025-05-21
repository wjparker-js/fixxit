const express = require('express');
const { createReport, getReport, getUserReports } = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const upload = require('../utils/fileUpload');
const cors = require('cors');

const router = express.Router();

// Enable CORS for all routes
router.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Tester'],
  credentials: true
}));

router.post('/', authenticate, upload.array('images', 3), createReport);
router.get('/:id', authenticate, getReport);
router.get('/', authenticate, getUserReports);

module.exports = router;