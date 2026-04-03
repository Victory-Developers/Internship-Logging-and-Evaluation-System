import axiosInstance from './axiosInstance';

export const getMyScores = () => axiosInstance.get('/api/evaluations/my-scores/');