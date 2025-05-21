const User = require('./user');
const Report = require('./report');
const WorkOrder = require('./workOrder');

// Define relationships
User.hasMany(Report);
Report.belongsTo(User);

Report.hasOne(WorkOrder);
WorkOrder.belongsTo(Report);

User.hasMany(WorkOrder);
WorkOrder.belongsTo(User, { as: 'assignedTo' });

module.exports = {
  User,
  Report,
  WorkOrder
};