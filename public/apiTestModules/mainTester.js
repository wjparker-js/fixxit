// Main logic for orchestrating API tests using modular components
import { apiRequest } from './apiRequest.js';
import { renderResponse, showLoading } from './uiRenderer.js';
import { getServerUrl, getAuthToken } from './config.js';
import { endpoints } from './endpoints.js';

export async function testApiEndpoint(type, params = {}) {
  let url = '', method = 'GET', body = null;
  switch(type) {
    case 'register':
      url = getServerUrl() + endpoints.register;
      method = 'POST';
      body = params;
      break;
    case 'login':
      url = getServerUrl() + endpoints.login;
      method = 'POST';
      body = params;
      break;
    case 'createReport':
      url = getServerUrl() + endpoints.createReport;
      method = 'POST';
      body = params.formData;
      break;
    case 'getReports':
      url = getServerUrl() + endpoints.getReports;
      break;
    case 'getSingleReport':
      url = getServerUrl() + endpoints.getSingleReport(params.id);
      break;
    case 'createWorkOrder':
      url = getServerUrl() + endpoints.createWorkOrder;
      method = 'POST';
      body = params;
      break;
    case 'getWorkOrder':
      url = getServerUrl() + endpoints.getWorkOrder(params.id);
      break;
    case 'updateWorkOrderStatus':
      url = getServerUrl() + endpoints.updateWorkOrderStatus(params.id);
      method = 'PUT';
      body = { status: params.status };
      break;
    case 'assignWorkOrder':
      url = getServerUrl() + endpoints.assignWorkOrder(params.id);
      method = 'PUT';
      body = { userId: params.userId };
      break;
    case 'updateSchedule':
      url = getServerUrl() + endpoints.updateSchedule(params.id);
      method = 'PUT';
      body = { scheduledDate: params.scheduledDate };
      break;
    case 'adminGetReports':
      url = getServerUrl() + endpoints.adminGetReports;
      break;
    case 'adminGetWorkOrders':
      url = getServerUrl() + endpoints.adminGetWorkOrders;
      break;
    case 'closeWorkOrder':
      url = getServerUrl() + endpoints.closeWorkOrder(params.id);
      method = 'PUT';
      break;
    case 'reassignWorkOrder':
      url = getServerUrl() + endpoints.reassignWorkOrder(params.id);
      method = 'PUT';
      body = { userId: params.userId };
      break;
    case 'generateReport':
      url = getServerUrl() + endpoints.generateReport(params.type);
      break;
    default:
      throw new Error('Unknown endpoint type');
  }
  const headers = {};
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  showLoading(params.responseElementId);
  const result = await apiRequest({ url, method, headers, body });
  renderResponse(params.responseElementId, result);
  return result;
}