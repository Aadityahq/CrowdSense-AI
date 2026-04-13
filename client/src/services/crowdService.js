import { api, apiGet } from './api';

export const getCrowdZones = () => apiGet('/api/crowd');
export const getQueueTimes = () => apiGet('/api/queues');
export const fetchCrowd = () => api.getCrowd();
