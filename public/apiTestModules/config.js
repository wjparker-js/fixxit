// Handles configuration such as server URL and token storage
export function getServerUrl() {
  return localStorage.getItem('fixxitServerUrl') || 'http://localhost:3000';
}

export function setServerUrl(url) {
  localStorage.setItem('fixxitServerUrl', url);
}

export function getAuthToken() {
  return localStorage.getItem('fixxitAuthToken') || '';
}

export function setAuthToken(token) {
  localStorage.setItem('fixxitAuthToken', token);
}

export function clearAuthToken() {
  localStorage.removeItem('fixxitAuthToken');
}