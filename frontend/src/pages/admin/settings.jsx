import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/config';
import { Card, Field, Spinner } from '../../components/UI';

export default function AdminSettings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(ENDPOINTS.PROFILE)
      .then(res => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700, marginBottom: '1.5rem' }}>
        Settings
      </h1>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Name">
            <div style={detailStyle}>{profile?.full_name || '—'}</div>
          </Field>
          <Field label="Email">
            <div style={detailStyle}>{profile?.email || '—'}</div>
          </Field>
          <Field label="Role">
            <div style={detailStyle}>{profile?.role || '—'}</div>
          </Field>
        </div>
      </Card>
    </div>
  );
}

const detailStyle = {
  padding: '8px 12px',
  background: 'var(--surface-container-low)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 14,
  color: 'var(--on-surface)',
};