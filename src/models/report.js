const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

module.exports = Report;