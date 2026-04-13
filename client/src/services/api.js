const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed for ${path}`);
  }

  return response.json();
}

export async function apiPost(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}`);
  }

  return response.json();
}

export const api = {
  getCrowd: () => apiGet('/api/crowd'),
  getAlerts: () => apiGet('/api/alerts'),
  login: (data) => apiPost('/api/auth/login', data),
  signup: (data) => apiPost('/api/auth/signup', data),
  requestOtp: (data) => apiPost('/api/auth/request-otp', data),
  verifyOtp: (data) => apiPost('/api/auth/verify-otp', data),
  createAlert: (data) => apiPost('/api/alerts', data),
};
