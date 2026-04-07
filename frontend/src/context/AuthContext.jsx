import { createContext, useReducer, useEffect } from 'react';               
import api from '../api/axios';                                               
import { ENDPOINTS } from '../api/config';
                                                                            
const AuthContext = createContext(null);                                    

// All possible state changes in one place                                    
const authReducer = (state, action) => {
switch (action.type) {                                                      
    case 'LOGIN':                                                           
    return {                                                                
        ...state,
        user: action.payload.user,                                            
        isAuthenticated: true,                                              
        loading: false,
    };
    case 'LOGOUT':
    return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,                                                       
    };
    case 'SET_LOADING':                                                       
    return {                                                              
        ...state,
        loading: action.payload,
    };
    default:
    return state;
}
};

const initialState = {                                                        
user: null,
isAuthenticated: false,                                                     
loading: true, // true on first load — we don't know yet if there's a saved token                                                                         
};
                                                                            
export function AuthProvider({ children }) {                                  
const [state, dispatch] = useReducer(authReducer, initialState);
                                                                            
// On app load, check if we have a saved token and fetch the user profile   
useEffect(() => {
    const initAuth = async () => {                                            
    const token = localStorage.getItem('access_token');                   
    if (!token) {                                                           
        dispatch({ type: 'SET_LOADING', payload: false });
        return;                                                               
    }                                                                     

    try {
        const response = await api.get(ENDPOINTS.PROFILE);
        dispatch({ type: 'LOGIN', payload: { user: response.data } });        
    } catch (error) {
        // Token is invalid or expired (and refresh failed in the interceptor)
        localStorage.removeItem('access_token');                              
        localStorage.removeItem('refresh_token');
        dispatch({ type: 'LOGOUT' });                                         
    }                                                                       
    };
                                                                            
    initAuth();                                                             
}, []);

const login = async (email, password) => {
    const response = await api.post(ENDPOINTS.LOGIN, { email, password });
    const { access, refresh } = response.data;
                                                                            
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);                           
                                                                            
    // Fetch the user's profile to get their role, name, etc.                 
    const profileResponse = await api.get(ENDPOINTS.PROFILE);
    dispatch({ type: 'LOGIN', payload: { user: profileResponse.data } });     
                                                                            
    return profileResponse.data;
};                                                                          
                                                                            
const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
    // Tell the backend to blacklist this refresh token                     
    await api.post(ENDPOINTS.LOGOUT, { refresh: refreshToken });
    } catch (error) {                                                         
    // Even if the API call fails, still clear local state                  
    }
                                                                            
    localStorage.removeItem('access_token');                                  
    localStorage.removeItem('refresh_token');
    dispatch({ type: 'LOGOUT' });                                             
};                                                                        

const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    login,                                                                    
    logout,
};                                                                          
                                                                            
return (
    <AuthContext.Provider value={value}>
    {children}
    </AuthContext.Provider>
);
}

export default AuthContext;