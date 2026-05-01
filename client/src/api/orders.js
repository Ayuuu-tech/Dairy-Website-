import api from './axios';

export const placeOrder = (data) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders/my');
export const getOrder = (id) => api.get(`/orders/${id}`);

// Admin
export const getAllOrders = (params) => api.get('/admin/orders', { params });
export const updateOrderStatus = (id, status) => api.put(`/admin/orders/${id}/status`, { status });

// Admin stats
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = (params) => api.get('/admin/users', { params });
