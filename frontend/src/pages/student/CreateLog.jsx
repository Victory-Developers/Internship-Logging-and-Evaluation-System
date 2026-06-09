import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/config';
import { Card, Field, Input, Textarea, Btn, toast } from '../../components/UI';

export default function StudentCreateLog() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    week_number: '',
    start_date: '',
    end_date: '',
    activities: '',
    learning: '',
    challenges: '',
    next_week: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const errMsg = (key) => {
    const e = errors[key];
    return e ? (Array.isArray(e) ? e.join(' ') : String(e)) : null;
  };

  const handleSave = async (andSubmit = false) => {
    setErrors({});
    setSubmitting(true);
    try {
      const res = await api.post(ENDPOINTS.MY_LOGS, form);
      if (andSubmit) {
        await api.post(ENDPOINTS.MY_LOG_SUBMIT(res.data.id));
        toast('Log submitted');
      } else {
        toast('Draft saved');
      }
      navigate('/student/logs');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        setErrors(data);
        toast('Please fix the errors', 'error');
      } else {
        toast('Failed to save log', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700, marginBottom: '1.5rem' }}>
        New Weekly Log
      </h1>

      <Card>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Field label="Week Number" required error={errMsg('week_number')}>
              <Input type="number" min="1" value={form.week_number} onChange={setField('week_number')} required />
            </Field>
            <Field label="Start Date" required error={errMsg('start_date')}>
              <Input type="date" value={form.start_date} onChange={setField('start_date')} required />
            </Field>
            <Field label="End Date" required error={errMsg('end_date')}>
              <Input type="date" value={form.end_date} onChange={setField('end_date')} required />
            </Field>
          </div>

          <Field label="Activities" required error={errMsg('activities')} hint="What did you do this week?">
            <Textarea rows={4} value={form.activities} onChange={setField('activities')} required />
          </Field>

          <Field label="Learning Outcomes" error={errMsg('learning')} hint="What did you learn?">
            <Textarea rows={3} value={form.learning} onChange={setField('learning')} />
          </Field>

          <Field label="Challenges" error={errMsg('challenges')} hint="Any difficulties faced?">
            <Textarea rows={3} value={form.challenges} onChange={setField('challenges')} />
          </Field>

          <Field label="Plans for Next Week" error={errMsg('next_week')}>
            <Textarea rows={3} value={form.next_week} onChange={setField('next_week')} />
          </Field>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Btn variant="secondary" type="button" onClick={() => navigate('/student/logs')}>Cancel</Btn>
            <Btn variant="ghost" type="submit" loading={submitting}>Save Draft</Btn>
            <Btn variant="primary" type="button" loading={submitting} onClick={() => handleSave(true)}>Submit</Btn>
          </div>
        </form>
      </Card>
    </div>
  );
}