import React from 'react';                         
                                                                                                                                                                                    
/**                                                                          
 * Search input. Note: debouncing is handled by useListQuery, not here —
 * parent wires onChange directly to the hook's setSearch.
 *                                                 
 * Props:                                          
 *   value, onChange (string), placeholder                                                                                                                                           
 */                                                  
export default function SearchBar({ value, onChange, placeholder = 'Search…' }) {                                                                                                    
return (                                                                   
    <div className="search-bar">       
    <span className="search-bar__icon" aria-hidden>                                                                                                                                
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">                              
        <circle cx="11" cy="11" r="8" />                                                                                                                                           
        <path d="m21 21-4.3-4.3" />                                                                                                                                                
        </svg>                                                                                                                                                                       
    </span>                   
    <input                                                                                                                                                                         
        type="text"                                                                                                                                                                  
        className="search-bar__input"  
        value={value}                                                                                                                                                                
        onChange={(e) => onChange(e.target.value)}                                                                                                                                   
        placeholder={placeholder}
    />                                                                                                                                                                             
    </div>                                                                   
);           
} 