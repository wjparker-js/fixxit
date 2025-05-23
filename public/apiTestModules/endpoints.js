// Centralizes endpoint paths for easier updates and testing
export const endpoints = {
  register: '/api/auth/register',
  login: '/api/auth/login',
  createReport: '/api/reports',
  getReports: '/api/reports',
  getSingleReport: id => `/api/reports/${id}`,
  createWorkOrder: '/api/workorders',
  getWorkOrder: id => `/api/workorders/${id}`,
  updateWorkOrderStatus: id => `/api/workorders/${id}/status`,
  assignWorkOrder: id => `/api/workorders/${id}/assign`,
  updateSchedule: id => `/api/workorders/${id}/schedule`,
  adminGetReports: '/api/admin/reports',
  adminGetWorkOrders: '/api/admin/workorders',
  closeWorkOrder: id => `/api/admin/workorders/${id}/close`,
  reassignWorkOrder: id => `/api/admin/workorders/${id}/reassign`,
  generateReport: type => `/api/admin/reports/generate?type=${type}`
};