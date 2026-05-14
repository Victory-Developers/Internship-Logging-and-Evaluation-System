import { useState, useEffect, useCallback, useRef } from 'react';            
import api from '../api/axios';                                                                                                                                                      
                                                                                                                                                                                    
/**                                      
 * Hook for paginated/searchable/filterable list endpoints (DRF PageNumberPagination).                                                                                               
 *                                                                                                                                                                                   
 * Usage:                                          
 *   const list = useListQuery({                                                                                                                                                     
 *     endpoint: ENDPOINTS.ADMIN_USERS,                                      
 *     initialFilters: { role: '', status: '' },                                                                                                                                     
 *     initialOrdering: '-date_joined',            
 *   });                                                                                                                                                                             
 *                                                                           
 *   list.data       — array of results for current page                                                                                                                             
 *   list.count      — total count across all pages
 *   list.loading    — boolean                                                                                                                                                       
 *   list.error      — error message or null                                 
 *   list.page       — current page (1-indexed)                                                                                                                                      
 *   list.pageSize   — page size (default 20)        
 *   list.totalPages — derived from count / pageSize                                                                                                                                 
 *   list.setPage(n)                                                         
 *   list.search, list.setSearch(s)  — debounced 300ms                                                                                                                               
 *   list.filters, list.setFilter(key, value)                                                                                                                                        
 *   list.ordering, list.setOrdering(s)            
 *   list.refetch()                                                                                                                                                                  
 */                                                                                                                                                                                  
export default function useListQuery({               
endpoint,                                                                                                                                                                          
initialFilters = {},                                                                                                                                                               
initialOrdering = '',                  
pageSize = 20,                                                                                                                                                                     
debounceMs = 300,                                                                                                                                                                  
}) {                                                                                                                                                                                 
const [data, setData] = useState([]);                                                                                                                                              
const [count, setCount] = useState(0);                                     
const [loading, setLoading] = useState(false);                                                                                                                                     
const [error, setError] = useState(null);        
                                                                                                                                                                                    
const [page, setPage] = useState(1);                                       
const [search, setSearch] = useState('');                                                                                                                                          
const [filters, setFilters] = useState(initialFilters);
const [ordering, setOrdering] = useState(initialOrdering);                                                                                                                         
                                                                            
const [debouncedSearch, setDebouncedSearch] = useState('');
const abortRef = useRef(null);                                                                                                                                                     
                                                    
// Debounce search input                                                                                                                                                           
useEffect(() => {                                                          
    const t = setTimeout(() => setDebouncedSearch(search), debounceMs);
    return () => clearTimeout(t);                                                                                                                                                    
}, [search, debounceMs]);              
                                                                                                                                                                                    
// Reset to page 1 whenever search/filters/ordering change                 
useEffect(() => {                                                                                                                                                                  
    setPage(1);                                                              
}, [debouncedSearch, filters, ordering]);          
                                                                                                                                                                                    
const fetchData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();                                                                                                                                  
    const controller = new AbortController();                                                                                                                                        
    abortRef.current = controller;                 
                                                                                                                                                                                    
    setLoading(true);                                                        
    setError(null);                                                                                                                                                                  
                                                    
    const params = { page };                                                                                                                                                         
    if (debouncedSearch) params.search = debouncedSearch;                    
    if (ordering) params.ordering = ordering;                                                                                                                                        
    Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {                                                                                                                   
        params[key] = value;                                                 
    }                                            
    });                                              
                                                                                                                                                                                    
    try {                                            
    const res = await api.get(endpoint, { params, signal: controller.signal });                                                                                                    
    // DRF paginated response: { count, next, previous, results }                                                                                                                  
    // Defensive: if backend returns a plain array, use it as-is
    if (Array.isArray(res.data)) {                                                                                                                                                 
        setData(res.data);                                                   
        setCount(res.data.length);                                                                                                                                                   
    } else {                                                               
        setData(res.data.results || []);             
        setCount(res.data.count || 0);             
    }                         
    } catch (err) {                                                                                                                                                                  
    if (err.name === 'CanceledError' || err.name === 'AbortError') return;                                                                                                         
    setError(err.response?.data?.detail || err.message || 'Failed to load data');                                                                                                  
    setData([]);                                                                                                                                                                   
    setCount(0);                                                                                                                                                                   
    } finally {                          
    setLoading(false);                                                                                                                                                             
    }                                                                        
}, [endpoint, page, debouncedSearch, filters, ordering]);
                                        
useEffect(() => {                                                                                                                                                                  
    fetchData();                                                                                                                                                                     
    return () => {                                                                                                                                                                   
    if (abortRef.current) abortRef.current.abort();                                                                                                                                
    };                                                                       
}, [fetchData]);
                                        
const setFilter = useCallback((key, value) => {                                                                                                                                    
    setFilters((prev) => ({ ...prev, [key]: value }));
}, []);                                                                                                                                                                            
                                                                            
const totalPages = Math.max(1, Math.ceil(count / pageSize));
                                
return {                                           
    data,                                                                                                                                                                            
    count,     
    loading,                                                                                                                                                                         
    error,                                                                                                                                                                           
    page,                                          
    pageSize,                                                                                                                                                                        
    totalPages,                                                              
    setPage,                                         
    search,                                        
    setSearch, 
    filters,
    setFilter,                                                                                                                                                                       
    setFilters,
    ordering,                                                                                                                                                                        
    setOrdering,                                                             
    refetch: fetchData,                  
};                            
}  