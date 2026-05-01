import api from './axios';

export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const logoutUser = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const sendOtpApi = (data) => api.post('/auth/send-otp', data);
export const verifyOtpApi = (data) => api.post('/auth/verify-otp', data);
export const googleLoginApi = (data) => api.post('/auth/google', data);
