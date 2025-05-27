const { Report } = require('../models');
const logger = require('../config/logger');
const path = require('path');

const isValidImage = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  return file && allowedTypes.includes(file.mimetype);
};

const isValidLocation = (location) => {
  if (!location) return false;
  try {
    const loc = typeof location === 'string' ? JSON.parse(location) : location;
    return (
      typeof loc === 'object' &&
      typeof loc.latitude === 'number' &&
      typeof loc.longitude === 'number' &&
      Math.abs(loc.latitude) <= 90 &&
      Math.abs(loc.longitude) <= 180
    );
  } catch {
    return false;
  }
};

const createReport = async (req, res) => {
  try {
    const { description, location } = req.body;
    if (!description || description.length < 5) {
      return res.status(400).json({ message: 'Description is required and must be at least 5 characters.' });
    }
    if (location && !isValidLocation(location)) {
      return res.status(400).json({ message: 'Invalid location data.' });
    }
    if (req.files && req.files.length > 3) {
      return res.status(400).json({ message: 'A maximum of 3 images is allowed.' });
    }
    if (req.files && req.files.some(file => !isValidImage(file))) {
      return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG, and GIF are allowed.' });
    }
    const images = req.files ? req.files.map(file => file.path) : [];
    const userId = req.user ? req.user.id : null;
    const report = await Report.create({
      description,
      location: location ? (typeof location === 'string' ? JSON.parse(location) : location) : null,
      images,
      UserId: userId
    });
    // TODO: Image processing and thumbnail generation
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