import React from 'react';                                                   
import { Spinner, EmptyState } from '../UI';         
                                                    
/**                                                
 * Generic data table.                   
 *                                                                                                                                                                                   
 * Props:                                            
 *   columns: [{ key, header, render?(row), width?, align? }]                                                                                                                        
 *   rows: array of objects                                                  
 *   rowKey: string (default 'id') — field used as React key                                                                                                                         
 *   loading: boolean                                                                                                                                                                
 *   empty: ReactNode (rendered when not loading and rows.length === 0)                                                                                                              
 *   onRowClick?: (row) => void                                                                                                                                                      
 */                                                                          
export default function Table({                      
columns,                                         
rows = [],                                                                                                                                                                         
rowKey = 'id',                                   
loading = false,                                                                                                                                                                   
empty = null,                                                              
onRowClick,                                                                                                                                                                        
}) {                                                                         
if (loading) {                                                                                                                                                                     
    return (                                                                 
    <div className="data-table-wrapper">                                                                                                                                           
        <div className="data-table__loading">                                
        <Spinner />                                
        </div>                                     
    </div>                                       
    );                                   
}                                                                                                                                                                                  
                                                    
if (!rows.length) {                                                                                                                                                                
    return (                                                                 
    <div className="data-table-wrapper">
        <div className="data-table__empty">                                                                                                                                          
        {empty || <EmptyState icon="📭" title="No data" description="Nothing to show here yet." />}
        </div>                                                                                                                                                                       
    </div>                                                                 
    );                                   
}                                                  
                                                    
return (                                         
    <div className="data-table-wrapper">
    <table className="data-table">                                                                                                                                                 
        <thead>                                                                                                                                                                      
        <tr>                                                                                                                                                                       
            {columns.map((col) => (                                                                                                                                                  
            <th                                                            
                key={col.key}                      
                style={{
                width: col.width,    
                textAlign: col.align || 'left',                                                                                                                                    
                }}                       
            >                                                                                                                                                                      
                {col.header}                                                 
            </th>                                
            ))}
        </tr>
        </thead>                                                                                                                                                                     
        <tbody>                        
        {rows.map((row) => (                                                                                                                                                       
            <tr                                                              
            key={row[rowKey]} 
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            style={onRowClick ? { cursor: 'pointer' } : undefined}
            >                                      
            {columns.map((col) => (    
                <td                                                                                                                                                                  
                key={col.key}                      
                style={{ textAlign: col.align || 'left' }}                                                                                                                         
                >                                                            
                {col.render ? col.render(row) : row[col.key]}
                </td>                                                                                                                                                                
            ))}                                  
            </tr>                                                                                                                                                                    
        ))}                                                                
        </tbody>                                                                                                                                                                     
    </table>                                     
    </div>                                                                                                                                                                           
);                                                                         
}    