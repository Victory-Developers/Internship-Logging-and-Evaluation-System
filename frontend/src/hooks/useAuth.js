import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { ROLES } from '../api/config';

export default function useAuth() {                                           
const context = useContext(AuthContext);
                                                                            
if (!context) {                                              
    throw new Error('useAuth must be used within an AuthProvider');
}

const isStudent = () => context.user?.role === ROLES.STUDENT;               
const isAdmin = () => context.user?.role === ROLES.ADMIN;
const isWorkplaceSupervisor = () => context.user?.role === ROLES.WORKPLACE_SUPERVISOR;                                                   
const isAcademicSupervisor = () => context.user?.role === ROLES.ACADEMIC_SUPERVISOR;                                                    
                                                                
const getDashboardPath = () => {                                            
    if (!context.user) return '/login';
    switch (context.user.role) {                                              
    case ROLES.STUDENT: return '/student/dashboard';         
    case ROLES.ADMIN: return '/admin/dashboard';                            
    case ROLES.ACADEMIC_SUPERVISOR: return '/supervisor/dashboard';
    case ROLES.WORKPLACE_SUPERVISOR: return '/supervisor/dashboard';        
    default: return '/login';                                               
    }
};                                                                          
                                                                
return {
    ...context,
    isStudent,
    isAdmin,
    isWorkplaceSupervisor,
    isAcademicSupervisor,
    getDashboardPath,                                                         
};
}    