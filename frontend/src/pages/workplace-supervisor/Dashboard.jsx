import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/config';
import { Card, Spinner, StatusBadge, Btn } from '../../components/UI';

const formatDate = (s) => s
  ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

export default function WorkplaceDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, pendingLogs: 0, evaluations: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [placementsRes, logsRes, evalsRes] = await Promise.all([
          api.get(ENDPOINTS.WP_STUDENTS),
          api.get(ENDPOINTS.WP_LOGS),
          api.get(ENDPOINTS.WP_EVALUATIONS),
        ]);
        const placements = Array.isArray(placementsRes.data) ? placementsRes.data : placementsRes.data?.results || [];
        const logs = Array.isArray(logsRes.data) ? logsRes.data : logsRes.data?.results || [];
        const evals = Array.isArray(evalsRes.data) ? evalsRes.data : evalsRes.data?.results || [];

        setStats({
          students: placements.length,
          pendingLogs: logs.filter(l => l.status === 'submitted').length,
          evaluations: evals.length,
        });
        setRecentLogs(logs.filter(l => l.status === 'submitted').slice(0, 5));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div>;
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700, marginBottom: '1.5rem' }}>
        Dashboard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Assigned Students" value={stats.students} onClick={() => navigate('/workplace/students')} />
        <StatCard label="Pending Log Reviews" value={stats.pendingLogs} color="#B5882A" onClick={() => navigate('/workplace/logs')} />
        <StatCard label="Evaluations Submitted" value={stats.evaluations} color="#2D6A4F" onClick={() => navigate('/workplace/evaluations')} />
      </div>

      {recentLogs.length > 0 && (
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem', color: '#1A1714' }}>
            Recent Submitted Logs
          </h2>
          {recentLogs.map(l => (
            <div key={l.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #F0EDE8',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{l.student?.full_name || '—'}</div>
                <div style={{ fontSize: 12, color: '#9A938D' }}>Week {l.week_number} — {formatDate(l.submitted_at)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <StatusBadge status={l.status} />
                <Btn variant="secondary" size="sm" onClick={() => navigate(`/workplace/review/${l.id}`)}>Review</Btn>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value, color, onClick }) {
  return (
    <Card style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div onClick={onClick}>
        <div style={{ fontSize: 13, color: '#9A938D', marginBottom: 4 }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: color || '#1A1714' }}>
          {value}
        </div>
      </div>
    </Card>
  );
}