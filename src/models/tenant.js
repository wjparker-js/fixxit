const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  organizationName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  contactInfo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  brandingConfig: {
    type: DataTypes.JSON,
    allowNull: true
  },
  subscriptionTier: {
    type: DataTypes.STRING,
    allowNull: true
  },
  apiLimits: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = Tenant; 