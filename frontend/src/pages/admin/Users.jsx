import React, { useState } from 'react';                                                                                                                                             
import { useSearchParams } from 'react-router-dom';   
import { toast } from 'react-toastify';                                                                                                                               
import api from '../../api/axios';                                                                                                                                                   
import { ENDPOINTS } from '../../api/config';                                                                                                                                        
import useListQuery from '../../hooks/useListQuery';                         
import ListPage from '../../components/list/ListPage';           
import Table from '../../components/list/Table';     
import Pagination from '../../components/list/Pagination';                                                                                                                           
import SearchBar from '../../components/list/SearchBar';         
import FilterBar from '../../components/list/FilterBar';                                                                                                                             
import { Btn, Modal, StatusBadge, Field } from '../../components/UI'; 
                                                                                                                                                                                    
const ROLE_OPTIONS = [                                                                                                                                                               
{ value: '',                      label: 'All' },  
{ value: 'student',               label: 'Students' },                                                                                                                             
{ value: 'academic_supervisor',   label: 'Academic Supervisors' },         
{ value: 'workplace_supervisor',  label: 'Workplace Supervisors' },                                                                                                                
{ value: 'admin',                 label: 'Admins' },                       
];                                                                                                                                                                                   
                                                                                                                                                                                    
const STATUS_OPTIONS = [                                                                                                                                                             
{ value: '',         label: 'All statuses' },                                                                                                                                      
{ value: 'pending',  label: 'Pending' },                                                                                                                                           
{ value: 'active',   label: 'Active' },                                                                                                                                            
{ value: 'rejected', label: 'Rejected' },          
];                                                                                                                                                                                   
                                                                            
const ROLE_LABEL = {                                                                                                                                                                 
student:               'Student',                                          
academic_supervisor:   'Academic Supervisor',                  
workplace_supervisor:  'Workplace Supervisor',                                                                                                                                     
admin:                 'Admin',
};                                                                                                                                                                                   
                                                                                                                                                                                    
export default function AdminUsers() {                           
const [searchParams] = useSearchParams();                                                                                                                                          
const initialStatus = searchParams.get('status') || '';                    
                                                    
const list = useListQuery({                                                                                                                                                        
    endpoint: ENDPOINTS.ADMIN_USERS,
    initialFilters: { role: '', status: initialStatus },                                                                                                                             
    initialOrdering: '-date_joined',                                         
});                                                                                                                                                                                
                                
const [viewing, setViewing] = useState(null);                                                                                                                                      
const [busyId, setBusyId] = useState(null);                                
                                                                                                                                                                                    
const handleApprove = async (user) => {          
    if (!confirm(`Approve ${user.full_name}? They will receive an email and can log in immediately.`)) return;                                                                       
    setBusyId(user.id);                                                      
    try {                                                                                                                                                                            
        await api.post(ENDPOINTS.ADMIN_USER_APPROVE(user.id));
        toast.success(`${user.full_name} has been approved successfully.`);                                                                                                                                           
        list.refetch();                                                        
    } catch (err) {
    } finally {                                    
        setBusyId(null);                                                                                                                                                               
    }                                                
};                                                                                                                                                                                 
                                                                            
const handleReject = async (user) => {                                                                                                                                             
    if (!confirm(`${user.full_name}'s request has been rejected.`)) return;
    setBusyId(user.id);                                                                                                                                                              
    try {                                                                                                                                                                            
        await api.post(ENDPOINTS.ADMIN_USER_REJECT(user.id));      
        toast.info(`${user.full_name}'s access request has been formally declined.`);                                                                                                                                           
        list.refetch();                                                        
    } catch (err) {                                  
        // Systemic routing and HTTP validation errors are intercepted by the global Axios protocol.                                                                                                        
    } finally {                                                  
        setBusyId(null);                                                                                                                                                               
    }                                                                        
};                                                             
                                                                                                                                                                                    
const columns = [                    
    { key: 'full_name', header: 'Name' },                                                                                                                                            
    { key: 'email',     header: 'Email' },                                                                                                                                           
    {                                              
    key: 'role',                                                                                                                                                                   
    header: 'Role',                                                        
    render: (u) => ROLE_LABEL[u.role] || u.role, 
    },                                                           
    {                                                                                                                                                                                
    key: 'status',                   
    header: 'Status',                                                                                                                                                              
    render: (u) => <StatusBadge status={u.status} />,                                                                                                                              
    },                                             
    {                                                                                                                                                                                
    key: 'date_joined',                                                    
    header: 'Joined',                
    render: (u) => u.date_joined
        ? new Date(u.date_joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })                                                                   
        : '—',                                     
    },                                                                                                                                                                               
    {                                                                        
    key: 'actions',                              
    header: 'Actions',                                         
    width: 240,                                                                                                                                                                    
    render: (u) => (          
        <div style={{ display: 'flex', gap: 6 }}>                                                                                                                                    
        {u.status === 'pending' ? (                                                                                                                                                
            <>                                                   
            <Btn                                                                                                                                                                   
                variant="primary"                                            
                size="sm"                          
                loading={busyId === u.id}                                                                                                                                            
                onClick={() => handleApprove(u)}
            >                                                                                                                                                                      
                Approve                                                      
            </Btn>                                                                                                                                                                 
            <Btn                                               
                variant="danger"                                                                                                                                                     
                size="sm"                                                    
                loading={busyId === u.id}
                onClick={() => handleReject(u)}                                                                                                                                      
            >                 
                Reject                                                                                                                                                               
            </Btn>                                                         
            </>                                                  
        ) : (             
            <Btn variant="secondary" size="sm" onClick={() => setViewing(u)}>
            View                     
            </Btn>                                                                                                                                                                   
        )}                                         
        </div>                                                                                                                                                                       
    ),                                                                     
    },                      
];           

const filters = [                                                                                                                                                                  
    {                           
    key: 'role',                                                                                                                                                                   
    label: '',                                                             
    type: 'chip',                                              
    options: ROLE_OPTIONS,
    },                                 
    {                           
    key: 'status',                                                                                                                                                                 
    label: 'Status',                             
    type: 'select',                                                                                                                                                                
    options: STATUS_OPTIONS,                                               
    },         
];
                                                                                                                                                                                    
return (                      
    <>                                                                                                                                                                               
    <ListPage                                                              
        title="Users"                                            
        controls={          
        <>   
            <SearchBar
            value={list.search}                                                                                                                                                    
            onChange={list.setSearch}
            placeholder="Search by name, email, or student number…"                                                                                                                
            />                                                               
            <FilterBar                             
            filters={filters}                                  
            values={list.filters}
            onChange={list.setFilter}              
            />                                     
        </>                                                                                                                                                                        
        }                   
    >                                                                                                                                                                              
        <Table                                                               
        columns={columns}                                                                                                                                                          
        rows={list.data}                           
        loading={list.loading}                                                                                                                                                     
        rowKey="id"                                                        
        />                  
        <Pagination
        page={list.page}             
        totalPages={list.totalPages}                                                                                                                                               
        pageSize={list.pageSize}                   
        total={list.count}                                                                                                                                                         
        onChange={list.setPage}                                            
        />                             
    </ListPage>               
                                                    
    <Modal                                                                                                                                                                         
        open={!!viewing}                                         
        onClose={() => setViewing(null)}                                                                                                                                             
        title={viewing ? viewing.full_name : ''}                             
        width={520}                    
    >                                                                                                                                                                              
        {viewing && (                                
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>                                                                                                    
            <Field label="Email">                                            
            <div style={detailStyle}>{viewing.email}</div>
            </Field>                               
            <Field label="Role">                                 
            <div style={detailStyle}>{ROLE_LABEL[viewing.role] || viewing.role}</div>                                                                                              
            </Field>                                             
            <Field label="Status">                                                                                                                                                   
            <div><StatusBadge status={viewing.status} /></div>                                                                                                                     
            </Field>                               
            {viewing.student_number && (                                                                                                                                             
            <Field label="Student Number">                                 
                <div style={detailStyle}>{viewing.student_number}</div>                                                                                                              
            </Field>                                                       
            )}                                                                                                                                                                       
            {viewing.organisation && (               
            <Field label="Organisation">                                                                                                                                           
                <div style={detailStyle}>{viewing.organisation}</div>                                                                                                                
            </Field>                 
            )}                                                                                                                                                                       
            <Field label="Joined">                                           
            <div style={detailStyle}>                                                                                                                                              
                {viewing.date_joined                             
                ? new Date(viewing.date_joined).toLocaleString('en-GB')                                                                                                            
                : '—'}                                                     
            </div>                                 
            </Field>                                                                                                                                                                 
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setViewing(null)}>Close</Btn>                                                                                                  
            </div>                                                           
        </div>                                     
        )}                                                                                                                                                                           
    </Modal>                                                   
    </>                                                                                                                                                                              
);                                                                         
}              
                                                                                                                                                                                    
const detailStyle = {                                                                                                                                                                
padding: '8px 12px',                                                                                                                                                               
background: 'var(--surface-container-low)',                                                                                                                                        
borderRadius: 'var(--radius-sm)',                                          
fontSize: 14,                        
color: 'var(--on-surface)',                        
};