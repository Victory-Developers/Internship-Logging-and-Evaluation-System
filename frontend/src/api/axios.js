import axios from 'axios';                                     
import { API_BASE_URL, ENDPOINTS } from './config';

const api = axios.create({
baseURL: API_BASE_URL,
headers: {                                                                  
    'Content-Type': 'application/json',
},                                                                          
});                                                            

// REQUEST INTERCEPTOR — runs before every request leaves the browser         
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
                                                                
// RESPONSE INTERCEPTOR — runs when any response comes back
api.interceptors.response.use(
(response) => response, // 2xx responses pass through untouched
                                                                            
async (error) => {                                                          
    const originalRequest = error.config;                                     
                                                                            
    // If we got a 401 and haven't already retried this request               
    if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;                                          
                                                                
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        // No refresh token — user must log in again                          
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');                             
        window.location.href = '/login';                       
        return Promise.reject(error);                                         
    }
                                                                            
    try {                                                    
        // Ask the backend for a new access token
        const response = await axios.post(                                    
        `${API_BASE_URL}${ENDPOINTS.TOKEN_REFRESH}`,
        { refresh: refreshToken }                                           
        );                                                     

        const newAccessToken = response.data.access;                          
        localStorage.setItem('access_token', newAccessToken);
                                                                            
        // If the backend also rotated the refresh token, save the new one    
        if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh);       
        }                                                      

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);                                          

    } catch (refreshError) {                                                
        // Refresh token is also expired — force logout        
        localStorage.removeItem('access_token');                              
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';                                      
        return Promise.reject(refreshError);                   
    }
    }

    return Promise.reject(error);                                             
}
);                                                                            
                                                                
export default api;