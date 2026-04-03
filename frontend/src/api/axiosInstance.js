import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://ssozihenry.pythonanywhere.com',
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor: auto-refresh on 401
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        try {
          const { data } = await axios.post(
            'https://ssozihenry.pythonanywhere.com/api/auth/token/refresh/',
            { refresh }
          );
          localStorage.setItem('access', data.access);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
          original.headers['Authorization'] = `Bearer ${data.access}`;
          return axiosInstance(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;