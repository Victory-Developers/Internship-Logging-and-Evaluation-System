import React, { useState } from 'react';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import { ENDPOINTS } from '../api/config';
import { Card, Field, Input, Btn, Spinner, StatusBadge } from '../components/UI';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    organisation: user?.organisation || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  if (!user) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div>;
  }

  const roleLabels = {
    student: 'Student Intern',
    academic_supervisor: 'Academic Supervisor',
    workplace_supervisor: 'Workplace Supervisor',
    admin: 'Administrator',
  };

  const handleTextChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name,
      };
      if (user.role === 'workplace_supervisor') {
        payload.organisation = form.organisation;
      }
      
      await api.patch(ENDPOINTS.PROFILE, payload);
      await refreshUser();
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        setErrors(data);
      } else {
        toast.error('Failed to update profile details.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      full_name: user.full_name || '',
      organisation: user.organisation || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div style={{ width: '100%' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700, marginBottom: '1.5rem' }}>
        My Profile
      </h1>

      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid #E2DDD6', paddingBottom: '1.5rem' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--primary)',
            color: 'var(--on-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
          }}>
            {(user.full_name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1A1714' }}>
              {user.full_name}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#5A5450', fontSize: '0.875rem' }}>
              {user.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="User Role">
              <div style={{ padding: '10px 12px', background: 'var(--surface-container-low)', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>
                {roleLabels[user.role] || user.role}
              </div>
            </Field>

            <Field label="Account Status">
              <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                <StatusBadge status={user.status} />
              </div>
            </Field>
          </div>

          <Field label="Full Name" required error={errors.full_name}>
            {isEditing ? (
              <Input
                type="text"
                value={form.full_name}
                onChange={handleTextChange('full_name')}
                required
              />
            ) : (
              <div style={{ padding: '10px 12px', background: 'var(--surface-container-low)', borderRadius: 8, fontSize: 14 }}>
                {user.full_name || '—'}
              </div>
            )}
          </Field>

          {user.role === 'student' && (
            <Field label="Student Number">
              <div style={{ padding: '10px 12px', background: 'var(--surface-container-low)', borderRadius: 8, fontSize: 14 }}>
                {user.student_number || '—'}
              </div>
            </Field>
          )}

          {user.role === 'workplace_supervisor' && (
            <Field label="Organisation" required={isEditing} error={errors.organisation}>
              {isEditing ? (
                <Input
                  type="text"
                  value={form.organisation}
                  onChange={handleTextChange('organisation')}
                  required
                />
              ) : (
                <div style={{ padding: '10px 12px', background: 'var(--surface-container-low)', borderRadius: 8, fontSize: 14 }}>
                  {user.organisation || '—'}
                </div>
              )}
            </Field>
          )}

          <Field label="Date Joined">
            <div style={{ padding: '10px 12px', background: 'var(--surface-container-low)', borderRadius: 8, fontSize: 14 }}>
              {user.date_joined ? new Date(user.date_joined).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : '—'}
            </div>
          </Field>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid #E2DDD6', paddingTop: '1.25rem' }}>
            {isEditing ? (
              <>
                <Btn variant="secondary" onClick={handleCancel}>
                  Cancel
                </Btn>
                <Btn variant="primary" type="submit" loading={saving}>
                  Save Changes
                </Btn>
              </>
            ) : (
              <Btn variant="primary" onClick={() => setIsEditing(true)}>
                Edit Details
              </Btn>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}