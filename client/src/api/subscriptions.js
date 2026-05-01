import api from './axios';

export const createSubscription = (data) => api.post('/subscriptions', data);
export const getMySubscription = () => api.get('/subscriptions/my');
export const updateSubscription = (id, data) => api.put(`/subscriptions/${id}`, data);
