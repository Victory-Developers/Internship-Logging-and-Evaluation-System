// src/api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Attach JWT token to every request automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or wherever you store it
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
