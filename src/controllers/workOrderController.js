const { WorkOrder, Report, User } = require('../models');
const logger = require('../config/logger');

const createWorkOrder = async (req, res) => {
  try {
    const { reportId, scheduledDate, notes } = req.body;

    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const workOrder = await WorkOrder.create({
      ReportId: reportId,
      scheduledDate,
      notes,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Work order created successfully',
      workOrder
    });
  } catch (error) {
    logger.error('Error creating work order:', error);
    res.status(500).json({ message: 'Error creating work order' });
  }
};

const getWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByPk(req.params.id, {
      include: [
        { model: Report },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    res.json(workOrder);
  } catch (error) {
    logger.error('Error fetching work order:', error);
    res.status(500).json({ message: 'Error fetching work order' });
  }
};

const updateWorkOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const workOrder = await WorkOrder.findByPk(req.params.id);

    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    workOrder.status = status;
    await workOrder.save();

    res.json({
      message: 'Work order status updated successfully',
      workOrder
    });
  } catch (error) {
    logger.error('Error updating work order status:', error);
    res.status(500).json({ message: 'Error updating work order status' });
  }
};

const assignWorkOrder = async (req, res) => {
  try {
    const { userId } = req.body;
    const workOrder = await WorkOrder.findByPk(req.params.id);

    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    workOrder.assignedToId = userId;
    await workOrder.save();

    res.json({
      message: 'Work order assigned successfully',
      workOrder
    });
  } catch (error) {
    logger.error('Error assigning work order:', error);
    res.status(500).json({ message: 'Error assigning work order' });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { scheduledDate } = req.body;
    const workOrder = await WorkOrder.findByPk(req.params.id);

    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    workOrder.scheduledDate = scheduledDate;
    await workOrder.save();

    res.json({
      message: 'Work order schedule updated successfully',
      workOrder
    });
  } catch (error) {
    logger.error('Error updating work order schedule:', error);
    res.status(500).json({ message: 'Error updating work order schedule' });
  }
};

module.exports = {
  createWorkOrder,
  getWorkOrder,
  updateWorkOrderStatus,
  assignWorkOrder,
  updateSchedule
};