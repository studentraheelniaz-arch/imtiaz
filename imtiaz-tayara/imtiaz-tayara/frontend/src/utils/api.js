const BASE = '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),

  searchSchedules: (from, to, date) =>
    request(`/schedules?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}${date ? `&date=${date}` : ''}`),
  getSchedule: (id) => request(`/schedules/${id}`),

  createBooking: (payload, token) => request('/bookings', { method: 'POST', body: payload, token }),
  getBooking: (id, token) => request(`/bookings/${id}`, { token }),
  myBookings: (token) => request('/bookings', { token }),

  initiatePayment: (payload, token) => request('/payments/initiate', { method: 'POST', body: payload, token }),
  mockPay: (txn, fail) => request('/payments/mock-pay', { method: 'POST', body: { txn, fail } }),

  // Admin
  adminSchedules: (token) => request('/admin/schedules', { token }),
  adminCreateSchedule: (payload, token) => request('/admin/schedules', { method: 'POST', body: payload, token }),
  adminUpdateSchedule: (id, payload, token) => request(`/admin/schedules/${id}`, { method: 'PUT', body: payload, token }),
  adminUpdatePrice: (id, price, token) => request(`/admin/schedules/${id}/price`, { method: 'PATCH', body: { price }, token }),
  adminDeleteSchedule: (id, token) => request(`/admin/schedules/${id}`, { method: 'DELETE', token }),

  adminVans: (token) => request('/admin/vans', { token }),
  adminCreateVan: (payload, token) => request('/admin/vans', { method: 'POST', body: payload, token }),
  adminUpdateVan: (id, payload, token) => request(`/admin/vans/${id}`, { method: 'PUT', body: payload, token }),

  adminBookings: (token, params = '') => request(`/admin/bookings${params}`, { token }),
  adminCancelBooking: (id, token) => request(`/admin/bookings/${id}/cancel`, { method: 'POST', token }),

  adminRevenue: (token) => request('/admin/reports/revenue', { token }),
  adminLogs: (token) => request('/admin/logs', { token }),
};
