// Handles rendering responses and UI updates
export function renderResponse(elementId, { status, statusText, data, ok }) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const statusClass = ok ? 'text-success' : 'text-danger';
  el.innerHTML = `<div class='mb-2'><strong>Status:</strong> <span class='${statusClass}'>${status} ${statusText}</span></div>` +
    `<pre class='bg-light p-2 rounded'>${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}</pre>`;
}

export function showLoading(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = "<div class='d-flex justify-content-center'><div class='spinner-border text-primary' role='status'><span class='visually-hidden'>Loading...</span></div></div>";
  }
}