import { createContext, useReducer, useEffect, useContext } from 'react';
import api from '../api/axios';
import { ENDPOINTS } from '../api/config';

const AuthContext = createContext(null);

// Reducer
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
  loading: true,
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check auth on app load
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
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        dispatch({ type: 'LOGOUT' });
      }
    };

    initAuth();
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const response = await api.post(ENDPOINTS.LOGIN, { email, password });
    const { access, refresh } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    const profileResponse = await api.get(ENDPOINTS.PROFILE);

    dispatch({
      type: 'LOGIN',
      payload: { user: profileResponse.data },
    });

    return profileResponse.data;
  };

  // LOGOUT
  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');

    try {
      await api.post(ENDPOINTS.LOGOUT, { refresh: refreshToken });
    } catch (error) {
      // ignore errors
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


export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;