import { apiGet } from './api';

export const getRouteRecommendations = () => apiGet('/api/routes');
