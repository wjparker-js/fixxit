const express = require('express');
const {
  getAllReports,
  getAllWorkOrders,
  closeWorkOrder,
  reassignWorkOrder,
  generateReport
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Ensure all admin routes require admin role
router.use(authenticate, authorize(['admin']));

router.get('/reports', getAllReports);
router.get('/workorders', getAllWorkOrders);
router.put('/workorders/:id/close', closeWorkOrder);
router.put('/workorders/:id/reassign', reassignWorkOrder);
router.get('/reports/generate', generateReport);

module.exports = router;