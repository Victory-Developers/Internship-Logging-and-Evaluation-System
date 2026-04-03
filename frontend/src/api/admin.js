import axiosInstance from './axiosInstance';

// Users
export const getPendingUsers = () => axiosInstance.get('/api/admin/users/pending/');
export const getAllUsers = (params = {}) => axiosInstance.get('/api/admin/users/', { params });
export const approveUser = (id) => axiosInstance.post(`/api/admin/users/${id}/approve/`);
export const rejectUser = (id) => axiosInstance.post(`/api/admin/users/${id}/reject/`);

// Placements
export const getAllPlacements = (params = {}) => axiosInstance.get('/api/placements/', { params });
export const createPlacement = (data) => axiosInstance.post('/api/placements/', data);
export const updatePlacement = (id, data) => axiosInstance.patch(`/api/placements/${id}/`, data);
export const deletePlacement = (id) => axiosInstance.delete(`/api/placements/${id}/`);

// Logs
export const getAllLogs = (params = {}) => axiosInstance.get('/api/logs/', { params });

// Reports
export const getReports = () => axiosInstance.get('/api/admin/reports/');
export const getAdminScores = () => axiosInstance.get('/api/evaluations/admin/scores/');