import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/config';
import { Card, Field, Input, Textarea, Btn, Spinner, toast } from '../../components/UI';

export default function StudentEditLog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(ENDPOINTS.MY_LOG_DETAIL(id))
      .then(res => setForm(res.data))
      .catch(() => toast('Failed to load log', 'error'));
  }, [id]);

  if (!form) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div>;
  }

  if (form.status !== 'draft') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <p>This log has already been submitted and cannot be edited.</p>
        <Btn variant="secondary" onClick={() => navigate(`/student/logs/${id}`)}>View Log</Btn>
      </div>
    );
  }

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
      await api.patch(ENDPOINTS.MY_LOG_DETAIL(id), {
        week_number: form.week_number,
        start_date: form.start_date,
        end_date: form.end_date,
        activities: form.activities,
        learning: form.learning,
        challenges: form.challenges,
        next_week: form.next_week,
      });
      if (andSubmit) {
        await api.post(ENDPOINTS.MY_LOG_SUBMIT(id));
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
        Edit Week {form.week_number} Log
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

          <Field label="Activities" required error={errMsg('activities')}>
            <Textarea rows={4} value={form.activities || ''} onChange={setField('activities')} required />
          </Field>
          <Field label="Learning Outcomes" error={errMsg('learning')}>
            <Textarea rows={3} value={form.learning || ''} onChange={setField('learning')} />
          </Field>
          <Field label="Challenges" error={errMsg('challenges')}>
            <Textarea rows={3} value={form.challenges || ''} onChange={setField('challenges')} />
          </Field>
          <Field label="Plans for Next Week" error={errMsg('next_week')}>
            <Textarea rows={3} value={form.next_week || ''} onChange={setField('next_week')} />
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
