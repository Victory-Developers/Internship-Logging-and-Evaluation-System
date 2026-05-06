import axios from 'axios';                                     
import { API_BASE_URL, ENDPOINTS } from './config';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {                                                                  
        'Content-Type': 'application/json',
    },                                                                          
});                                                            

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
                toast.warning('Session invalid. Authorisation required.');                            
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
                toast.error('Authorisation renewal rejected. Credentials expunged.');
                window.location.href = '/login';                                      
                return Promise.reject(refreshError);                   
            }
        }

        // Global Failure Broadcasting
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Systemic network anomaly.';

        // Prevent redundant broadcast if 401 was handled by refresh failure above
        if (statusCode >= 400 && statusCode < 500 && statusCode !== 401) {
            toast.warning(errorMessage, { autoClose: 5000 });
        } else if (statusCode >= 500) {
            toast.error('Infrastructure fault. Execution halted.', { autoClose: 5000 });
        } else if (!statusCode) {
            toast.error('Network unreachable. Verify packet transmission.', { autoClose: 5000 });
        }

        return Promise.reject(error);                                             
    }
);                                                                            
                                                                
export default api;