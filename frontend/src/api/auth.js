import axiosInstance from './axiosInstance';

export const loginApi        = (data) => axiosInstance.post('/api/auth/login/', data);
export const registerApi     = (data) => axiosInstance.post('/api/auth/register/', data);
export const forgotPasswordApi = (data) => axiosInstance.post('/api/auth/forgot-password/', data);
export const resetPasswordApi  = (data) => axiosInstance.post('/api/auth/reset-password/', data);