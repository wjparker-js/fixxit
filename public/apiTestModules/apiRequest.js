// Handles making API requests
export async function apiRequest({ url, method = 'GET', headers = {}, body = null }) {
  const options = { method, headers };
  if (body) {
    if (body instanceof FormData) {
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
    }
  }
  try {
    const response = await fetch(url, options);
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    return { ok: response.ok, status: response.status, statusText: response.statusText, data };
  } catch (error) {
    return { ok: false, status: 0, statusText: 'Network Error', data: error.message };
  }
}