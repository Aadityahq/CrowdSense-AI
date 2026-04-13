import { api, apiGet, apiPost } from './api';

export const getAlerts = () => apiGet('/api/alerts');
export const createAlert = (payload) => apiPost('/api/alerts', payload);
export const fetchAlerts = () => api.getAlerts();
