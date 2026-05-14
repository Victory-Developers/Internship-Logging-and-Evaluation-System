import React, { useState, useEffect } from 'react';                                                                                                                                  
import { useNavigate } from 'react-router-dom';                              
import api from '../../api/axios';                                                                                                                                                   
import { ENDPOINTS } from '../../api/config';                                
import { Btn, Field, Input, Select, Textarea, toast, Card } from '../../components/UI';
                                                                                                                                                                                    
const DAY_OPTIONS = [                                            
{ value: 1, label: 'Monday' },                                                                                                                                                     
{ value: 2, label: 'Tuesday' },                                            
{ value: 3, label: 'Wednesday' },                                                                                                                                                  
{ value: 4, label: 'Thursday' },                                           
{ value: 5, label: 'Friday' },                                                                                                                                                     
{ value: 6, label: 'Saturday' },                   
{ value: 7, label: 'Sunday' },                                                                                                                                                     
];                                                                           
                                                                                                                                                                                    
const initialForm = {                                                                                                                                                                
company_name:         '',                          
company_address:      '',                                                                                                                                                          
job_title:            '',                                                                                                                                                          
description:          '', 
start_date:           '',                                                                                                                                                          
end_date:             '',                                                  
weekly_log_deadline:  5, // Friday                 
status:               'active',                                                                                                                                                    
student:              '',                                      
workplace_supervisor: '',                                                                                                                                                          
academic_supervisor:  '',                                                  
};                                                 
                                                                
export default function AdminCreatePlacement() {                                                                                                                                     
const navigate = useNavigate();                    
const [form, setForm] = useState(initialForm);                                                                                                                                     
const [errors, setErrors] = useState({});                                  
const [submitting, setSubmitting] = useState(false);                                                                                                                               
                                                    
const [students, setStudents] = useState([]);                                                                                                                                      
const [workplaceSupervisors, setWorkplaceSupervisors] = useState([]);      
const [academicSupervisors, setAcademicSupervisors] = useState([]);                                                                                                                
                                                    
useEffect(() => {                                                                                                                                                                  
    const loadUsers = async () => {                                          
    try {                                                                                                                                                                          
        const [studentRes, wpRes, acRes] = await Promise.all([
        api.get(ENDPOINTS.ADMIN_USERS, { params: { role: 'student',              status: 'active', ordering: 'full_name' } }),                                                     
        api.get(ENDPOINTS.ADMIN_USERS, { params: { role: 'workplace_supervisor', status: 'active', ordering: 'full_name' } }),
        api.get(ENDPOINTS.ADMIN_USERS, { params: { role: 'academic_supervisor',  status: 'active', ordering: 'full_name' } }),                                                     
        ]);                                                                                                                                                                          
        setStudents(extractList(studentRes.data));                                                                                                                                   
        setWorkplaceSupervisors(extractList(wpRes.data));                                                                                                                            
        setAcademicSupervisors(extractList(acRes.data));                     
    } catch {                                    
        toast('Failed to load supervisors/students', 'error');                                                                                                                       
    }                                                                                                                                                                              
    };                                                                                                                                                                               
    loadUsers();                                                                                                                                                                     
}, []);                                                                                                                                                                            
                                                                                                                                                                                    
const setField = (key) => (e) => {                                         
    setForm((prev) => ({ ...prev, [key]: e.target.value }));                                                                                                                         
    setErrors((prev) => ({ ...prev, [key]: undefined }));                    
};                                                                                                                                                                                 
                                                                            
const handleSubmit = async (e) => {                            
    e.preventDefault();                              
    setErrors({});                                 
                                                                                                                                                                                    
    // Build payload — strip empty optional FK fields so backend receives null, not ""
    const payload = { ...form };                                                                                                                                                     
    ['student', 'workplace_supervisor', 'academic_supervisor'].forEach((k) => {
    if (!payload[k]) delete payload[k];                                                                                                                                            
    });                                                                                                                                                                              
                                                    
    setSubmitting(true);                                                                                                                                                             
    try {                                                                    
    await api.post(ENDPOINTS.PLACEMENTS, payload);                                                                                                                                 
    toast('Placement created');                  
    navigate('/admin/placements');                                                                                                                                                 
    } catch (err) {                                                          
    const data = err.response?.data;                                                                                                                                               
    if (data && typeof data === 'object') {                    
        setErrors(data);                                                                                                                                                             
        toast('Please fix the errors and try again', 'error');               
    } else {                                     
        toast('Failed to create placement', 'error');            
    }                                                                                                                                                                              
    } finally {                                                  
    setSubmitting(false);                                                                                                                                                          
    }                                                                        
};                                                                                                                                                                                 

const errMsg = (key) => {                                                                                                                                                          
    const e = errors[key];                                                   
    if (!e) return null;                                                                                                                                                             
    return Array.isArray(e) ? e.join(' ') : String(e);                       
};                                   
                                                    
return (                                         
    <div style={{ maxWidth: 720, margin: '0 auto' }}>            
    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700, marginBottom: '1.5rem' }}>                                               
        New Placement                                
    </h1>                                                                                                                                                                          
                                                                            
    <Card>                                                                                                                                                                         
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Company Name" required error={errMsg('company_name')}>                                                                                                       
            <Input                                                           
            value={form.company_name}                                                                                                                                              
            onChange={setField('company_name')}                                                                                                                                    
            error={!!errMsg('company_name')}                                                                                                                                       
            required                                                                                                                                                               
            />                                                                                                                                                                       
        </Field>                                                           
                                                                                                                                                                                    
        <Field label="Job Title" required error={errMsg('job_title')}>
            <Input                                                                                                                                                                   
            value={form.job_title}                                                                                                                                                 
            onChange={setField('job_title')}
            error={!!errMsg('job_title')}                                                                                                                                          
            required                                                       
            />                                       
        </Field>                                                                                                                                                                   
                                                                
        <Field label="Company Address" required error={errMsg('company_address')}>                                                                                                 
            <Textarea                                                        
            rows={2}
            value={form.company_address}
            onChange={setField('company_address')}                                                                                                                                 
            error={!!errMsg('company_address')}  
            required                                                                                                                                                               
            />                                                               
        </Field>                                 
                
        <Field label="Description" hint="Optional — what the student will do" error={errMsg('description')}>
            <Textarea                                                                                                                                                                
            rows={3}                             
            value={form.description}                                                                                                                                               
            onChange={setField('description')}                             
            />                                                   
        </Field>          
                                                    
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>                                                                                             
            <Field label="Start Date" required error={errMsg('start_date')}>
            <Input                                                                                                                                                                 
                type="date"                                                  
                value={form.start_date}                                                                                                                                              
                onChange={setField('start_date')}                            
                error={!!errMsg('start_date')}       
                required                           
            />                                                                                                                                                                     
            </Field>        
            <Field label="End Date" required error={errMsg('end_date')}>                                                                                                             
            <Input                                                         
                type="date"                          
                value={form.end_date}                                                                                                                                                
                onChange={setField('end_date')}                  
                error={!!errMsg('end_date')}                                                                                                                                         
                required                                                     
            />                       
            </Field>                                 
        </div>                                                                                                                                                                     
                                                                
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>                                                                                             
            <Field label="Weekly Log Deadline" required hint="Day of week the student submits their log" error={errMsg('weekly_log_deadline')}>
            <Select                              
                value={form.weekly_log_deadline}                 
                onChange={setField('weekly_log_deadline')}                                                                                                                           
                error={!!errMsg('weekly_log_deadline')}          
            >                                                                                                                                                                      
                {DAY_OPTIONS.map((d) => (                                    
                <option key={d.value} value={d.value}>{d.label}</option>                                                                                                           
                ))}                                              
            </Select>                                                                                                                                                              
            </Field>                                                         
            <Field label="Status" error={errMsg('status')}>                                                                                                                          
            <Select value={form.status} onChange={setField('status')}>     
                <option value="active">Active</option>                                                                                                                               
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>                                                                                                                         
            </Select>                                                      
            </Field>                                             
        </div>                                                                                                                                                                     
                                                    
        <Field label="Workplace Supervisor" hint="Optional — the on-site supervisor at the company" error={errMsg('workplace_supervisor')}>                                        
            <Select                                                          
            value={form.workplace_supervisor}                                                                                                                                      
            onChange={setField('workplace_supervisor')}        
            error={!!errMsg('workplace_supervisor')}                                                                                                                               
            >                                                                
            <option value="">— None —</option>     
            {workplaceSupervisors.map((u) => (   
                <option key={u.id} value={u.id}>                                                                                                                                     
                {u.full_name} ({u.organisation || u.email})
                </option>                                                                                                                                                            
            ))}                                                            
            </Select>                                            
        </Field>                                                                                                                                                                   
                                                                
        <Field label="Academic Supervisor" hint="Optional — the university faculty supervising the student" error={errMsg('academic_supervisor')}>                                 
            <Select                                                          
            value={form.academic_supervisor}                                                                                                                                       
            onChange={setField('academic_supervisor')}         
            error={!!errMsg('academic_supervisor')}                                                                                                                                
            >                                                                
            <option value="">— None —</option>                                                                                                                                     
            {academicSupervisors.map((u) => (                              
                <option key={u.id} value={u.id}>                                                                                                                                     
                {u.full_name} ({u.email})
                </option>                                                                                                                                                            
            ))}                                                            
            </Select>
        </Field>                                                                                                                                                                   

        <Field label="Student" hint="Optional — can be assigned later" error={errMsg('student')}>                                                                                  
            <Select                                                          
            value={form.student}                 
            onChange={setField('student')}                     
            error={!!errMsg('student')}
            >                                      
            <option value="">— Unassigned —</option>
            {students.map((u) => (               
                <option key={u.id} value={u.id}>                                                                                                                                     
                {u.full_name} ({u.student_number || u.email})
                </option>                                                                                                                                                            
            ))}                                                            
            </Select>                              
        </Field>                                                                                                                                                                   
                                        
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '0.5rem' }}>                                                                                 
            <Btn variant="secondary" type="button" onClick={() => navigate('/admin/placements')}>
            Cancel                                             
            </Btn>                                                                                                                                                                   
            <Btn variant="primary" type="submit" loading={submitting}>
            Create Placement                                                                                                                                                       
            </Btn>                                                           
        </div>                                                                                                                                                                     
        </form>                                                                                                                                                                      
    </Card>                                                                                                                                                                        
    </div>                                                                                                                                                                           
);                                                                         
}
                                                                                                                                                                                    
// DRF paginated response → list of users; if backend returned a plain array, use that
function extractList(data) {                                                                                                                                                         
if (Array.isArray(data)) return data;                                      
return data?.results || [];                                    
}                                               