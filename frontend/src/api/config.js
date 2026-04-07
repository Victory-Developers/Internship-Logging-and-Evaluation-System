export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
                                                                            
export const ROLES = {
STUDENT: 'student',                                                         
WORKPLACE_SUPERVISOR: 'workplace_supervisor',                
ACADEMIC_SUPERVISOR: 'academic_supervisor',
ADMIN: 'admin',
};                                                                            

export const LOG_STATUS = {                                                   
DRAFT: 'draft',                                              
SUBMITTED: 'submitted',
REVIEWED: 'reviewed',
APPROVED: 'approved',                                                       
REJECTED: 'rejected',
};                                                                            
                                                                
export const ENDPOINTS = {
// Auth
LOGIN: '/auth/login/',
REGISTER: '/auth/register/',                                                
LOGOUT: '/auth/logout/',
PROFILE: '/auth/profile/',                                                  
TOKEN_REFRESH: '/auth/token/refresh/',                       
FORGOT_PASSWORD: '/auth/forgot-password/',                                  
RESET_PASSWORD: '/auth/reset-password/',
CHANGE_PASSWORD: '/auth/change-password/',                                  
                                                                
// Placements                                                               
PLACEMENTS: '/placements/',
MY_PLACEMENT: '/placements/my/',                                            
MY_STUDENTS: '/placements/my-students/',                     
MY_ACADEMIC_STUDENTS: '/placements/my-academic-students/',                  

// Logs                                                                     
MY_LOGS: '/logs/my/',                                        
MY_LOG_PROGRESS: '/logs/my/progress/',                                      
SUPERVISOR_LOGS: '/logs/supervisor/',
ACADEMIC_LOGS: '/logs/academic/',                                           
ADMIN_LOGS: '/logs/admin/',                                                 

// Evaluations                                                              
WORKPLACE_EVALUATIONS: '/evaluations/workplace/',            
ACADEMIC_EVALUATIONS: '/evaluations/academic/',
ACADEMIC_SCORES: '/evaluations/academic/scores/',                           
MY_SCORES: '/evaluations/my-scores/',
ADMIN_SCORES: '/evaluations/admin/scores/',                                 
                                                                
// Admin                                                                    
ADMIN_USERS: '/admin/users/',                                
ADMIN_PENDING_USERS: '/admin/users/pending/',
ADMIN_REPORTS: '/admin/reports/',                                           
};