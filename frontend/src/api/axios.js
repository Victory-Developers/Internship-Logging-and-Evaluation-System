import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from './config';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper function to parse Django / DRF errors dynamically
const parseBackendError = (error) => {
    const data = error.response?.data;
    if (!data) return 'Could not connect to the server. Please check your internet connection.';

    // 1. If backend returned a simple error string
    if (typeof data === 'string') return data;
    if (data.detail && typeof data.detail === 'string') return data.detail;
    if (data.message && typeof data.message === 'string') return data.message;

    // 2. If it's a validation error object (e.g. { "job_title": ["This field is required."] })
    if (typeof data === 'object') {
        const errorMessages = [];
        for (const [key, value] of Object.entries(data)) {
            // Skip general details/message if they weren't strings (already handled above)
            if (key === 'detail' || key === 'message') continue;

            // General validation/credential errors (non_field_errors) should not have field prefix
            if (key === 'non_field_errors') {
                if (Array.isArray(value)) {
                    errorMessages.push(value.join(', '));
                } else if (typeof value === 'string') {
                    errorMessages.push(value);
                }
                continue;
            }

            // Format field keys like 'job_title' to 'Job Title'
            const fieldName = key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (char) => char.toUpperCase());

            if (Array.isArray(value)) {
                errorMessages.push(`${fieldName}: ${value.join(', ')}`);
            } else if (typeof value === 'string') {
                errorMessages.push(`${fieldName}: ${value}`);
            }
        }
        if (errorMessages.length > 0) {
            return errorMessages.join('\n');
        }
    }

    return 'An unexpected error occurred.';
};

// REQUEST INTERCEPTOR
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // Token Refresh Protocol
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                toast.warning('Your session has expired. Please log in again.');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(
                    `${API_BASE_URL}${ENDPOINTS.TOKEN_REFRESH}`,
                    { refresh: refreshToken }
                );

                const newAccessToken = response.data.access;
                localStorage.setItem('access_token', newAccessToken);

                if (response.data.refresh) {
                    localStorage.setItem('refresh_token', response.data.refresh);
                }

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                toast.error('Session expired. Please log in again.');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Global Failure Broadcasting
        const statusCode = error.response?.status;
        const errorMessage = parseBackendError(error);

        // Prevent redundant broadcast if 401 was handled by refresh failure above
        if (statusCode >= 400 && statusCode < 500 && statusCode !== 401) {
            toast.warning(errorMessage, { autoClose: 5000 });
        } else if (statusCode >= 500) {
            toast.error('Something went wrong on our server. Please try again later.', { autoClose: 5000 });
        } else if (!statusCode) {
            toast.error('Network unreachable. Please check your internet connection.', { autoClose: 5000 });
        }

        return Promise.reject(error);
    }
);

export default api;