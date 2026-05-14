import React from 'react';      
                                                    
/**                                                
 * Pagination control.                   
 *                              
 * Props:                                                                                                                                                                            
 *   page: current page (1-indexed)                
 *   totalPages: total page count                                                                                                                                                    
 *   pageSize: items per page (for the "Showing X-Y of Z" text)              
 *   total: total item count                                                                                                                                                         
 *   onChange: (newPage) => void         
 */                                                                                                                                                                                  
export default function Pagination({ page, totalPages, pageSize, total, onChange }) {
if (totalPages <= 1 && total <= pageSize) {      
    return (                                         
    <div className="list-pagination">            
        <span className="list-pagination__summary">                                                                                                                                  
        Showing {total} of {total}                 
        </span>                                                                                                                                                                      
    </div>                                                                 
    );                                                                                                                                                                               
}                                                                                                                                                                                  
                                        
const pages = buildPageList(page, totalPages);                                                                                                                                     
const from = (page - 1) * pageSize + 1;                                    
const to = Math.min(page * pageSize, total);                                                                                                                                       
                                                                            
return (                                         
    <div className="list-pagination">    
    <span className="list-pagination__summary">
        Showing {from}–{to} of {total}                                                                                                                                               
    </span>                                      
    <div className="list-pagination__pages">                                                                                                                                       
        <button                                                              
        className="list-pagination__btn"                                                                                                                                           
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}                                                                                                                                                       
        aria-label="Previous page"                                         
        >                                          
        ‹ Prev                                   
        </button>                        
        {pages.map((p, i) =>                                                                                                                                                         
        p === '…' ? (                              
            <span key={`ellipsis-${i}`} className="list-pagination__ellipsis">…</span>                                                                                               
        ) : (                                                              
            <button                      
            key={p}                                                                                                                                                                
            className={`list-pagination__btn ${p === page ? 'active' : ''}`}
            onClick={() => onChange(p)}                                                                                                                                            
            disabled={p === page}                                          
            >                            
            {p}                                                                                                                                                                    
            </button>                                
        )                                                                                                                                                                          
        )}                                                                   
        <button                                      
        className="list-pagination__btn"                                                                                                                                           
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}                                                                                                                                              
        aria-label="Next page"                                                                                                                                                     
        >                                          
        Next ›                                                                                                                                                                     
        </button>                                                            
    </div>                                         
    </div>                                         
);           
}
                                                                                                                                                                                    
// Build a sliding window: 1 ... [current-1] [current] [current+1] ... last
function buildPageList(current, total) {                                                                                                                                             
if (total <= 7) {                                                          
    return Array.from({ length: total }, (_, i) => i + 1);
}                                                  
                                                    
const pages = [];                                  
const window = [current - 1, current, current + 1].filter((p) => p > 1 && p < total);
                                                                                                                                                                                    
pages.push(1);                                   
if (window[0] > 2) pages.push('…');                                                                                                                                                
pages.push(...window);                                                     
if (window[window.length - 1] < total - 1) pages.push('…');                                                                                                                        
pages.push(total);                                                         
                                        
return pages;                                      
}  