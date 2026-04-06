import { Navigate } from 'react-router-dom';                   
import useAuth from '../hooks/useAuth';
                                                                            
export default function ProtectedRoute({ children, allowedRoles }) {
const { isAuthenticated, loading, user } = useAuth();                       
                                                                            
// Still checking if there's a saved token — show nothing yet               
if (loading) {                                                              
    return <div className="page-loader">Loading...</div>;                     
}                                                                           

// Not logged in — go to login page                                         
if (!isAuthenticated) {                                      
    return <Navigate to="/login" replace />;
}

// Logged in but wrong role — go to their correct dashboard                 
if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;                                  
}                                                            
                                                                            
// All good — show the page
return children;                                                            
}                                                              