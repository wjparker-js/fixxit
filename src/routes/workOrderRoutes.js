const express = require('express');
const { 
  createWorkOrder, 
  getWorkOrder, 
  updateWorkOrderStatus, 
  assignWorkOrder,
  updateSchedule 
} = require('../controllers/workOrderController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, authorize(['admin']), createWorkOrder);
router.get('/:id', authenticate, getWorkOrder);
router.put('/:id/status', authenticate, updateWorkOrderStatus);
router.put('/:id/assign', authenticate, authorize(['admin']), assignWorkOrder);
router.put('/:id/schedule', authenticate, updateSchedule);

module.exports = router;