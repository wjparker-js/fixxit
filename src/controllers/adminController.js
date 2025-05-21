const { Report, WorkOrder, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

const getAllReports = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const reports = await Report.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json(reports);
  } catch (error) {
    logger.error('Error fetching all reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

const getAllWorkOrders = async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (assignedTo) {
      where.assignedToId = assignedTo;
    }

    const workOrders = await WorkOrder.findAll({
      where,
      include: [
        { model: Report },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(workOrders);
  } catch (error) {
    logger.error('Error fetching all work orders:', error);
    res.status(500).json({ message: 'Error fetching work orders' });
  }
};

const closeWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByPk(req.params.id);
    
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    workOrder.status = 'completed';
    await workOrder.save();

    res.json({
      message: 'Work order closed successfully',
      workOrder
    });
  } catch (error) {
    logger.error('Error closing work order:', error);
    res.status(500).json({ message: 'Error closing work order' });
  }
};

const reassignWorkOrder = async (req, res) => {
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
      message: 'Work order reassigned successfully',
      workOrder
    });
  } catch (error) {
    logger.error('Error reassigning work order:', error);
    res.status(500).json({ message: 'Error reassigning work order' });
  }
};

const generateReport = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let report = {};

    switch (type) {
      case 'status':
        report = await WorkOrder.findAll({
          attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['status']
        });
        break;
      
      case 'timeline':
        report = await WorkOrder.findAll({
          where: {
            createdAt: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          },
          attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: [sequelize.fn('DATE', sequelize.col('createdAt'))]
        });
        break;

      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    res.json(report);
  } catch (error) {
    logger.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

module.exports = {
  getAllReports,
  getAllWorkOrders,
  closeWorkOrder,
  reassignWorkOrder,
  generateReport
};