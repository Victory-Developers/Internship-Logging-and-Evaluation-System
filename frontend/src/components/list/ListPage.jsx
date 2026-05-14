import React from 'react';                         
                                                    
/**                                                
 * Layout wrapper for list pages: header (title + actions) and a controls row above the body.
 *                                                 
 * Props:                                                                                                                                                                            
 *   title: string                       
 *   actions?: ReactNode (e.g., "+ Add Placement" button)                                                                                                                            
 *   controls?: ReactNode (search bar, filter bar)                           
 *   children: the table + pagination                                                                                                                                                
 */                                                                          
export default function ListPage({ title, actions, controls, children }) {
return (                                                                                                                                                                           
    <div className="list-page">                      
    <div className="list-page__header">                                                                                                                                            
        <h1 className="list-page__title">{title}</h1>                                                                                                                                
        {actions && <div className="list-page__actions">{actions}</div>}                                                                                                             
    </div>                                                                                                                                                                         
    {controls && <div className="list-page__controls">{controls}</div>}                                                                                                            
    {children}                                                                                                                                                                     
    </div>                                                                   
);                            
} 