import axiosInstance from './axiosInstance';

export const getMyLogs      = (params) => axiosInstance.get('/api/logs/my/', { params });
export const getMyProgress  = ()       => axiosInstance.get('/api/logs/my/progress/');
export const getLogById     = (id)     => axiosInstance.get(`/api/logs/${id}/`);
export const createLog      = (data)   => axiosInstance.post('/api/logs/my/', data);
export const submitLog      = (id)     => axiosInstance.post(`/api/logs/my/${id}/submit/`);
export const updateLog      = (id, data) => axiosInstance.patch(`/api/logs/my/${id}/`, data);
export const addComment     = (id, data) => axiosInstance.post(`/api/logs/${id}/comments/`, data);