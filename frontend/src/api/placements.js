import axiosInstance from './axiosInstance';

export const getMyPlacement = () => axiosInstance.get('/api/placements/my/');