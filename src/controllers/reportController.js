const { Report } = require('../models');
const logger = require('../config/logger');

const createReport = async (req, res) => {
  try {
    const { description, location } = req.body;
    const images = req.files ? req.files.map(file => file.path) : [];

    const report = await Report.create({
      description,
      location: location ? JSON.parse(location) : null,
      images,
      UserId: req.user.id
    });

    res.status(201).json({
      message: 'Report created successfully',
      report
    });
  } catch (error) {
    logger.error('Error creating report:', error);
    res.status(500).json({ message: 'Error creating report' });
  }
};

const getReport = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    logger.error('Error fetching report:', error);
    res.status(500).json({ message: 'Error fetching report' });
  }
};

const getUserReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json(reports);
  } catch (error) {
    logger.error('Error fetching user reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

module.exports = {
  createReport,
  getReport,
  getUserReports
};