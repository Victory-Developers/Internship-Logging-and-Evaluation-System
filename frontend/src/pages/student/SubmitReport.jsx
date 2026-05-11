import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/config';
import { Card, Field, Btn, Spinner } from '../../components/UI';

const formatDate = (s) => s
  ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

export default function StudentSubmitReport() {
  const navigate = useNavigate();
  const [placement, setPlacement] = useState(undefined);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get(ENDPOINTS.MY_PLACEMENT)
      .then(res => setPlacement(res.data))
      .catch(err => {
        if (err.response?.status === 404) {
          setPlacement(null);
        } else {
          setPlacement(null);
        }
      });
  }, []);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setFile(null);
      toast.success('End of internship report submitted successfully!');
    }, 2000);
  };

  if (placement === undefined) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div>;
  }

  if (placement === null) {
    return (
      <div style={{ width: '100%' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700, marginBottom: '1.5rem' }}>
          Submit Internship Report
        </h1>
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <span style={{ fontSize: 48 }}>📋</span>
            <h3 style={{ fontSize: 18, margin: '1rem 0 0.5rem 0' }}>No Active Placement</h3>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: '1.5rem' }}>
              You must have an approved internship placement to submit your final report.
            </p>
            <Btn variant="primary" onClick={() => navigate('/student/placement')}>
              Go to Placements
            </Btn>
          </div>
        </Card>
      </div>
    );
  }

  const isInternshipActive = placement.status === 'active' && new Date() < new Date(placement.end_date);

  return (
    <div style={{ width: '100%' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700, marginBottom: '1.5rem' }}>
        Submit Internship Report
      </h1>

      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1714', margin: 0 }}>Internship Period</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Start Date">
              <div style={detailStyle}>{formatDate(placement.start_date)}</div>
            </Field>
            <Field label="End Date">
              <div style={detailStyle}>{formatDate(placement.end_date)}</div>
            </Field>
          </div>
        </div>
      </Card>

      {isInternshipActive ? (
        <div style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 12,
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontSize: 40 }}>🔒</span>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E40AF', margin: '0.75rem 0 0.5rem 0' }}>
            Submission Disabled
          </h3>
          <p style={{ color: '#1E3A8A', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            The end of internship report submission will become active after the official end date of your internship: <strong>{formatDate(placement.end_date)}</strong>.
          </p>
        </div>
      ) : (
        <Card>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1714', margin: 0 }}>Upload Report</h2>
            <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>
              Please upload your final end-of-internship report (PDF, max 10MB).
            </p>
            
            <div style={dropzoneStyle}>
              <input 
                type="file" 
                accept=".pdf" 
                id="report-file" 
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }} 
              />
              <label htmlFor="report-file" style={{ cursor: 'pointer', display: 'block', width: '100%' }}>
                <span style={{ fontSize: 32 }}>📁</span>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#374151', marginTop: 8 }}>
                  {file ? file.name : 'Click to select report file'}
                </div>
                <div style={{ fontSize: 12, color: '#9A938D', marginTop: 4 }}>
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Only PDF files are supported'}
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {file && (
                <Btn variant="ghost" onClick={() => setFile(null)}>Clear File</Btn>
              )}
              <Btn variant="primary" type="submit" loading={uploading} disabled={!file}>
                Submit Report
              </Btn>
            </div>
          </form>
        </Card>
      )}
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

const dropzoneStyle = {
  border: '2px dashed #E2DDD6',
  borderRadius: 8,
  padding: '2.5rem 1.5rem',
  textAlign: 'center',
  background: '#FAF9F6',
  transition: 'border-color 0.2s',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};