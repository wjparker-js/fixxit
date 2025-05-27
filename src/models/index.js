const User = require('./user');
const Report = require('./report');
const WorkOrder = require('./workOrder');
const Tenant = require('./tenant');
const UserTenant = require('./userTenant');

// Define relationships
User.hasMany(Report);
Report.belongsTo(User);

Report.hasOne(WorkOrder);
WorkOrder.belongsTo(Report);

User.hasMany(WorkOrder);
WorkOrder.belongsTo(User, { as: 'assignedTo' });

User.hasMany(UserTenant, { foreignKey: 'userId' });
UserTenant.belongsTo(User, { foreignKey: 'userId' });
Tenant.hasMany(UserTenant, { foreignKey: 'tenantId' });
UserTenant.belongsTo(Tenant, { foreignKey: 'tenantId' });

module.exports = {
  User,
  Report,
  WorkOrder,
  Tenant,
  UserTenant
};