import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';                                                                                                                                      
import api from '../api/axios';                                              
import { ENDPOINTS } from '../api/config';                                                                                                                                           
                                                                            
const POLL_INTERVAL_MS = 30000;                                                                                                                                                      
                                                                            
/**                                                                                                                                                                                  
 * Bell icon in the admin topbar.                                            
 * Polls /admin/users/pending/count/ every 30s.                                                                                                                                      
 * Pauses when the browser tab is hidden, resumes on focus.                  
 * Shows red badge when count > 0.                                                                                                                                                   
 * Click → /admin/users?status=pending               
 */                                                                                                                                                                                  
export default function NotificationBell() {                                 
const [count, setCount] = useState(0);                         
const navigate = useNavigate();                  
const intervalRef = useRef(null);                                                                                                                                                  
                                                                                                                                                                                    
const fetchCount = useCallback(async () => {                                                                                                                                       
    try {                                                                                                                                                                            
    const res = await api.get(ENDPOINTS.ADMIN_PENDING_USERS_COUNT);        
    setCount(res.data?.count || 0);                                                                                                                                                
    } catch {                                                                                                                                                                        
    // silent fail — keep last known value rather than zero out the badge
    }                                                                                                                                                                                
}, []);                                                                    
                                                    
const startPolling = useCallback(() => {         
    if (intervalRef.current) return;                                                                                                                                                 
    intervalRef.current = setInterval(fetchCount, POLL_INTERVAL_MS);
}, [fetchCount]);                                                                                                                                                                  
                                                                                                                                                                                    
const stopPolling = useCallback(() => {
    if (intervalRef.current) {                                                                                                                                                       
    clearInterval(intervalRef.current);                                                                                                                                            
    intervalRef.current = null;                                
    }                                                                                                                                                                                
}, []);                                                                    
                                                                                                                                                                                    
useEffect(() => {                                  
    fetchCount();                                                                                                                                                                    
    if (!document.hidden) startPolling();                                    
                
    const handleVisibilityChange = () => {
    if (document.hidden) {                                                                                                                                                         
        stopPolling();          
    } else {                                                                                                                                                                       
        fetchCount();                                                        
        startPolling();                                          
    }        
    };
                                                                                                                                                                                    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {                                                                                                                                                                   
    stopPolling();                                                         
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    };                                             
}, [fetchCount, startPolling, stopPolling]);                   
                                        
const handleClick = () => {            
    navigate('/admin/users?status=pending');                                                                                                                                         
};                                                 
                                                                                                                                                                                    
const tooltip = count > 0                                                  
    ? `${count} pending approval${count === 1 ? '' : 's'}`
    : 'No pending approvals';   
                                                                                                                                                                                    
return (                                         
    <button                                                                                                                                                                          
    onClick={handleClick}                                                  
    title={tooltip}                  
    aria-label={tooltip}                                                                                                                                                           
    style={{                  
        position: 'relative',                                                                                                                                                        
        display: 'flex',                                                     
        alignItems: 'center',                                    
        justifyContent: 'center',      
        width: 40,                       
        height: 40,                                                                                                                                                                  
        background: 'transparent',                   
        border: 'none',                                                                                                                                                              
        borderRadius: '50%',                                                 
        cursor: 'pointer',
        color: 'var(--on-surface-variant)',
        transition: 'background var(--transition-fast)',                                                                                                                             
    }}                        
    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container-high)')}                                                                                     
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >                                                            
    <svg                      
        width="20"                                   
        height="20"                                                                                                                                                                  
        viewBox="0 0 24 24"                                      
        fill="none"                                                                                                                                                                  
        stroke="currentColor"                                                
        strokeWidth="2"                                                                                                                                                              
        strokeLinecap="round"
        strokeLinejoin="round"                                                                                                                                                       
    >                                                                                                                                                                              
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />                                                                                                                                  
    </svg>                                                                 
    {count > 0 && (                                            
        <span                                        
        style={{                                 
            position: 'absolute',                                                                                                                                                    
            top: 4,                    
            right: 4,                                                                                                                                                                
            minWidth: 18,                                                                                                                                                            
            height: 18,                              
            padding: '0 5px',                                                                                                                                                        
            background: '#C0392B',                                           
            color: '#fff',
            fontSize: 10,              
            fontWeight: 700,                                                                                                                                                         
            borderRadius: 9,    
            display: 'flex',                                                                                                                                                         
            alignItems: 'center',                                            
            justifyContent: 'center',                            
            lineHeight: 1,             
            boxShadow: '0 0 0 2px var(--surface)',
        }}                                                                                                                                                                         
        >                                            
        {count > 99 ? '99+' : count}                                                                                                                                               
        </span>                                                              
    )}                                           
    </button>                                                    
);                                                                                                                                                                                 
}