import React from 'react';                         
                                                                                                                                                                                    
/**                             
 * Filter controls. Supports two display types: 'select' (dropdown) and 'chip' (chip-bar).                                                                                           
 *                                                                           
 * Props:                                          
 *   filters: [{ key, label, type: 'select'|'chip', options: [{value, label}] }]
 *   values: { [key]: currentValue }                                                                                                                                                 
 *   onChange: (key, value) => void                  
 */                                                                                                                                                                                  
export default function FilterBar({ filters, values, onChange }) {           
return (                                           
    <div className="filter-bar">                                                                                                                                                     
    {filters.map((f) =>                
        f.type === 'chip' ? (                                                                                                                                                        
        <ChipFilter key={f.key} filter={f} value={values[f.key]} onChange={onChange} />                                                                                            
        ) : (                                                                                                                                                                        
        <SelectFilter key={f.key} filter={f} value={values[f.key]} onChange={onChange} />                                                                                          
        )                                                                    
    )}                                                                                                                                                                             
    </div>                                         
);                                                                                                                                                                                 
}                                                                            
                                                                                                                                                                                    
function SelectFilter({ filter, value, onChange }) {
return (                                                                                                                                                                           
    <div className="filter-bar__group">                                                                                                                                              
    <label className="filter-bar__label">{filter.label}:</label>
    <select                                                                                                                                                                        
        className="filter-bar__select"                                       
        value={value || ''}              
        onChange={(e) => onChange(filter.key, e.target.value)}
    >                                                                                                                                                                              
        {filter.options.map((opt) => (             
        <option key={opt.value} value={opt.value}>{opt.label}</option>                                                                                                             
        ))}                                                                  
    </select>                                                                                                                                                                      
    </div>                                           
);                                                                                                                                                                                 
}                                                                            
                                        
function ChipFilter({ filter, value, onChange }) {                                                                                                                                   
return (                                           
    <div className="filter-bar__group">                                                                                                                                              
    {filter.label && <span className="filter-bar__label">{filter.label}:</span>}
    <div className="filter-bar__chips">
        {filter.options.map((opt) => (                                                                                                                                               
        <button                        
            key={opt.value}                                                                                                                                                          
            className={`filter-bar__chip ${(value || '') === opt.value ? 'active' : ''}`}
            onClick={() => onChange(filter.key, opt.value)}
            type="button"                
        >                            
            {opt.label}                                                                                                                                                              
        </button>                                
        ))}                                                                                                                                                                          
    </div>                                                                 
    </div>                                                                                                                                                                           
);           
} 