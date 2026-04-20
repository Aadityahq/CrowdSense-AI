const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
import { auth } from '../firebase';

async function buildHeaders(extraHeaders = {}) {
  const headers = {
    ...extraHeaders,
  };

  const user = auth?.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      // Let request proceed without auth header if token retrieval fails.
    }
  }

  return headers;
}

export async function apiGet(path) {
  const headers = await buildHeaders();
  const response = await fetch(`${API_BASE}${path}`, { headers });

  if (!response.ok) {
    let detail = '';
    try {
      const payload = await response.json();
      detail = payload?.message ? `: ${payload.message}` : '';
    } catch (error) {
      detail = '';
    }

    throw new Error(`Request failed for ${path} (${response.status})${detail}`);
  }

  return response.json();
}

export async function apiPost(path, body) {
  const headers = await buildHeaders({
    'Content-Type': 'application/json',
  });

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let detail = '';
    try {
      const payload = await response.json();
      detail = payload?.message ? `: ${payload.message}` : '';
    } catch (error) {
      detail = '';
    }

    throw new Error(`Request failed for ${path} (${response.status})${detail}`);
  }

  return response.json();
}

export const api = {
  getCrowd: () => apiGet('/api/crowd'),
  getAlerts: () => apiGet('/api/alerts'),
  getAuthSession: () => apiGet('/api/auth/me'),
  createAlert: (data) => apiPost('/api/alerts', data),
};
