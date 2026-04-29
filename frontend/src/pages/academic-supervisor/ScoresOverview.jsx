import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/config';
import { Card, Spinner, EmptyState } from '../../components/UI';

export default function SupervisorScoresOverview() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(ENDPOINTS.ACADEMIC_SCORES)
      .then(res => setScores(Array.isArray(res.data) ? res.data : res.data?.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div>;
  }

  if (scores.length === 0) {
    return (
      <EmptyState
        title="No evaluations yet"
        description="You have not submitted any evaluations yet."
      />
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700, marginBottom: '1.5rem' }}>
        Evaluation Overview
      </h1>

      <Card padding="0">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Student', 'WP Avg', 'AC Avg', 'Combined'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{s.student?.full_name || s.student_name || '—'}</td>
                  <td style={tdStyle}>{s.workplace_average != null ? Number(s.workplace_average).toFixed(1) : '—'}</td>
                  <td style={tdStyle}>{s.academic_average != null ? Number(s.academic_average).toFixed(1) : '—'}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {s.combined_average != null ? Number(s.combined_average).toFixed(1) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 500,
  color: '#9A938D',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #E2DDD6',
};

const tdStyle = {
  padding: '10px 14px',
  fontSize: 14,
  color: '#1A1714',
  borderBottom: '1px solid #F0EDE8',
};