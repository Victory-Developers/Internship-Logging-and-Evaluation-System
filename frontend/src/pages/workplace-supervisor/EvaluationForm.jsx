import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/config';
import { Card, Field, Input, Btn, Spinner } from '../../components/UI';

const CRITERIA = [
  { key: 'professionalism',  label: 'Professionalism' },
  { key: 'technical_skills', label: 'Technical Skills' },
  { key: 'communication',    label: 'Communication' },
  { key: 'punctuality',      label: 'Punctuality' },
];

export default function WorkplaceEvaluationForm() {
  const { placementId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    professionalism: '',
    technical_skills: '',
    communication: '',
    punctuality: '',
  });
  const [existingId, setExistingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get(ENDPOINTS.WP_EVALUATIONS, { params: { placement: placementId } })
      .then(res => {
        const evals = Array.isArray(res.data) ? res.data : res.data?.results || [];
        if (evals.length > 0) {
          const existing = evals[0];
          setExistingId(existing.id);
          setForm({
            professionalism: existing.professionalism ?? '',
            technical_skills: existing.technical_skills ?? '',
            communication: existing.communication ?? '',
            punctuality: existing.punctuality ?? '',
          });
        }
      })
      .catch(() => {
          // Network anomalies are intercepted and broadcast by the global HTTP interceptor.
      })
      .finally(() => setLoading(false));
  }, [placementId]);

  const setField = (key) => (e) => {
    const val = e.target.value;
    if (val !== '' && (Number(val) < 0 || Number(val) > 10)) return;
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const total = CRITERIA.reduce((sum, c) => sum + (Number(form[c.key]) || 0), 0);
  const filledCount = CRITERIA.filter(c => form[c.key] !== '').length;
  const average = filledCount > 0 ? (total / filledCount).toFixed(1) : '—';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const payload = { placement: placementId };
    CRITERIA.forEach(c => {
      if (form[c.key] !== '') payload[c.key] = Number(form[c.key]);
    });

    try {
      if (existingId) {
        await api.patch(ENDPOINTS.WP_EVALUATION_DETAIL(existingId), payload);
        toast.success('Evaluation updated successfully!');
      } else {
        await api.post(ENDPOINTS.WP_EVALUATIONS, payload);
        toast.success('Evaluation submitted successfully!');
      }
      navigate('/workplace/evaluations');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        setErrors(data);
        toast.warning('Please correct the highlighted errors in the form.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const errMsg = (key) => {
    const e = errors[key];
    return e ? (Array.isArray(e) ? e.join(' ') : String(e)) : null;
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700, marginBottom: '1.5rem' }}>
        {existingId ? 'Edit' : 'Submit'} Workplace Evaluation
      </h1>

      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {CRITERIA.map(c => (
            <Field key={c.key} label={c.label} required error={errMsg(c.key)} hint="Score 0-10">
              <Input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={form[c.key]}
                onChange={setField(c.key)}
                error={!!errMsg(c.key)}
                required
              />
            </Field>
          ))}

          <div style={{
            padding: '12px 16px', background: '#D8EDDF', borderRadius: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#1B4332' }}>
              Total: {total} / {filledCount * 10}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1B4332' }}>
              Average: {average} / 10
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Btn variant="secondary" type="button" onClick={() => navigate('/workplace/evaluations')}>Cancel</Btn>
            <Btn variant="primary" type="submit" loading={submitting}>
              {existingId ? 'Update Evaluation' : 'Submit Evaluation'}
            </Btn>
          </div>
        </form>
      </Card>
    </div>
  );
}