import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/config';
import { Card, Field, Input, Textarea, Btn, StatusBadge, Spinner } from '../../components/UI';

const formatDate = (s) => s
  ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

export default function StudentPlacement() {
  const [placement, setPlacement] = useState(undefined);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    api.get(ENDPOINTS.MY_PLACEMENT)
      .then(res => { setPlacement(res.data); setShowForm(false); })
      .catch(err => {
        if (err.response?.status === 404) {
          setPlacement(null);
          setShowForm(true);
        } else {
          setPlacement(null);
        }
      });
  };

  useEffect(() => { load(); }, []);

  if (placement === undefined) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div>;
  }

  if (placement === null || showForm) {
    return <PlacementSubmitForm onSuccess={load} />;
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700 }}>
          My Placement
        </h1>
        <StatusBadge status={placement.status} />
      </div>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Company">
            <div style={detailStyle}>{placement.company_name}</div>
          </Field>
          {placement.company_address && (
            <Field label="Address">
              <div style={detailStyle}>{placement.company_address}</div>
            </Field>
          )}
          <Field label="Job Title">
            <div style={detailStyle}>{placement.job_title || '—'}</div>
          </Field>
          {placement.description && (
            <Field label="Description">
              <div style={{ ...detailStyle, whiteSpace: 'pre-wrap' }}>{placement.description}</div>
            </Field>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Start Date">
              <div style={detailStyle}>{formatDate(placement.start_date)}</div>
            </Field>
            <Field label="End Date">
              <div style={detailStyle}>{formatDate(placement.end_date)}</div>
            </Field>
          </div>
          {placement.duration_days && (
            <Field label="Duration">
              <div style={detailStyle}>{placement.duration_days} days</div>
            </Field>
          )}
          <Field label="Workplace Supervisor">
            <div style={detailStyle}>
              {placement.workplace_supervisor
                ? `${placement.workplace_supervisor.full_name} (${placement.workplace_supervisor.email})`
                : placement.invited_supervisor_email
                  ? `Invited: ${placement.invited_supervisor_email}`
                  : '—'}
            </div>
          </Field>
          <Field label="Academic Supervisor">
            <div style={detailStyle}>
              {placement.academic_supervisor
                ? `${placement.academic_supervisor.full_name} (${placement.academic_supervisor.email})`
                : '—'}
            </div>
          </Field>

          {placement.status === 'pending' && (
            <div style={{ padding: '12px 16px', background: '#FDF3DC', borderRadius: 8, fontSize: 14, color: '#B5882A' }}>
              Your placement request is pending admin review. You will be notified once it is activated.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function PlacementSubmitForm({ onSuccess }) {
  const [form, setForm] = useState({
    job_title: '', description: '', start_date: '', end_date: '',
    invited_supervisor_email: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [companyQuery, setCompanyQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newCompanyAddress, setNewCompanyAddress] = useState('');
  const [newCompanyEmail, setNewCompanyEmail] = useState('');
  const [newCompanyPhone, setNewCompanyPhone] = useState('');
  const [inviteStatus, setInviteStatus] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [linkedSupervisor, setLinkedSupervisor] = useState(null);

  useEffect(() => {
    if (companyQuery.length < 2) { setCompanySuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await api.get(ENDPOINTS.COMPANY_SEARCH, { params: { q: companyQuery } });
        setCompanySuggestions(Array.isArray(res.data) ? res.data : []);
        setShowSuggestions(true);
      } catch { setCompanySuggestions([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [companyQuery]);

  const handleInvite = async () => {
    if (!form.invited_supervisor_email) return;
    setInviting(true);
    try {
      const res = await api.post(ENDPOINTS.INVITE_SUPERVISOR, { email: form.invited_supervisor_email });
      setInviteStatus(res.data);
      if (res.data.status === 'existing') setLinkedSupervisor(res.data.user);
      toast.info(res.data.message);
    } catch (err) {
    } finally { setInviting(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    const payload = {
      job_title: form.job_title, description: form.description,
      start_date: form.start_date, end_date: form.end_date,
      invited_supervisor_email: form.invited_supervisor_email,
    };
    if (selectedCompany) {
      payload.company = selectedCompany.id;
    } else {
      payload.new_company_name = companyQuery;
      payload.new_company_address = newCompanyAddress;
      payload.new_company_email = newCompanyEmail;
      payload.new_company_phone = newCompanyPhone;
    }
    if (linkedSupervisor) payload.workplace_supervisor = linkedSupervisor.id;

    try {
      await api.post(ENDPOINTS.STUDENT_PLACEMENT_SUBMIT, payload);
      toast.success('Your placement request has been submitted successfully for review!');
      onSuccess();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') { 
        setErrors(data); 
        toast.warning('Please correct the highlighted errors in the form.'); 
      }
      // Systemic routing errors handled by global interceptor.
    } finally { setSubmitting(false); }
  };

  const errMsg = (key) => { const e = errors[key]; return e ? (Array.isArray(e) ? e.join(' ') : String(e)) : null; };
  const setField = (key) => (e) => { setForm(prev => ({ ...prev, [key]: e.target.value })); setErrors(prev => ({ ...prev, [key]: undefined })); };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700, marginBottom: '1.5rem' }}>
        Submit Placement Request
      </h1>
      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Company Name" required error={errMsg('new_company_name')} hint="Type to search or enter a new company">
            <div style={{ position: 'relative' }}>
              <Input value={companyQuery} onChange={(e) => { setCompanyQuery(e.target.value); setSelectedCompany(null); }} required autoComplete="off" />
              {showSuggestions && companySuggestions.length > 0 && (
                <div style={suggestionsStyle}>
                  {companySuggestions.map(c => (
                    <div key={c.id} style={suggestionItemStyle}
                      onClick={() => { setSelectedCompany(c); setCompanyQuery(c.name); setShowSuggestions(false); }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F0EDE8'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <div style={{ fontWeight: 500 }}>{c.name}</div>
                      {c.address && <div style={{ fontSize: 12, color: '#9A938D' }}>{c.address}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Field>
          {selectedCompany && (
            <div style={{ padding: '8px 12px', background: '#D8EDDF', borderRadius: 8, fontSize: 13, color: '#1B4332' }}>
              Selected: {selectedCompany.name} {selectedCompany.address ? `— ${selectedCompany.address}` : ''}
            </div>
          )}
          {!selectedCompany && companyQuery.length > 0 && (
            <>
              <Field label="Company Address"><Textarea rows={2} value={newCompanyAddress} onChange={e => setNewCompanyAddress(e.target.value)} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Company Email"><Input type="email" value={newCompanyEmail} onChange={e => setNewCompanyEmail(e.target.value)} /></Field>
                <Field label="Company Phone"><Input value={newCompanyPhone} onChange={e => setNewCompanyPhone(e.target.value)} /></Field>
              </div>
            </>
          )}
          <Field label="Job Title" required error={errMsg('job_title')}>
            <Input value={form.job_title} onChange={setField('job_title')} error={!!errMsg('job_title')} required />
          </Field>
          <Field label="Description" error={errMsg('description')}>
            <Textarea rows={3} value={form.description} onChange={setField('description')} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Start Date" required error={errMsg('start_date')}>
              <Input type="date" value={form.start_date} onChange={setField('start_date')} required />
            </Field>
            <Field label="End Date" required error={errMsg('end_date')}>
              <Input type="date" value={form.end_date} onChange={setField('end_date')} required />
            </Field>
          </div>
          <Field label="Workplace Supervisor Email" hint="Enter their email to invite or link them">
            <div style={{ display: 'flex', gap: 8 }}>
              <Input type="email" value={form.invited_supervisor_email} onChange={setField('invited_supervisor_email')} style={{ flex: 1 }} />
              <Btn variant="secondary" type="button" onClick={handleInvite} loading={inviting} disabled={!form.invited_supervisor_email}>Check / Invite</Btn>
            </div>
          </Field>
          {inviteStatus && (
            <div style={{ padding: '8px 12px', background: inviteStatus.status === 'existing' ? '#D8EDDF' : '#FDF3DC', borderRadius: 8, fontSize: 13, color: inviteStatus.status === 'existing' ? '#1B4332' : '#B5882A' }}>
              {inviteStatus.message}
            </div>
          )}
          {errors.detail && (
            <div style={{ padding: '8px 12px', background: '#FDECEA', borderRadius: 8, fontSize: 13, color: '#C0392B' }}>{errors.detail}</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Btn variant="primary" type="submit" loading={submitting}>Submit Placement Request</Btn>
          </div>
        </form>
      </Card>
    </div>
  );
}

const detailStyle = { padding: '8px 12px', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--on-surface)' };
const suggestionsStyle = { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #E2DDD6', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: 200, overflowY: 'auto' };
const suggestionItemStyle = { padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #F0EDE8' };