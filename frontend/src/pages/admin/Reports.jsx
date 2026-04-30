import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/config';
import { Card, Spinner, EmptyState, Btn } from '../../components/UI';

export default function AdminReports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Fetch data based on tab
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(ENDPOINTS.ADMIN_REPORTS);
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 🔹 Export CSV
  const exportCSV = () => {
    if (!stats) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Users', stats.total_users ?? '—'],
      ['Active Students', stats.active_students ?? '—'],
      ['Pending Users', stats.pending_users ?? '—'],
      ['Total Placements', stats.total_placements ?? '—'],
      ['Active Placements', stats.active_placements ?? '—'],
      ['Pending Placements', stats.pending_placements ?? '—'],
      ['Total Logs', stats.total_logs ?? '—'],
      ['Submitted Logs', stats.submitted_logs ?? '—'],
      ['Approved Logs', stats.approved_logs ?? '—'],
      ['Total Evaluations', stats.total_evaluations ?? '—'],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'iles_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <EmptyState title="Error" description={error} />;
  }

  if (!stats) {
    return <EmptyState title="No data" description="No report data available yet." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700 }}>
          Reports
        </h1>
        <Btn variant="secondary" onClick={exportCSV}>Export CSV</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        <StatCard label="Total Users" value={stats.total_users} />
        <StatCard label="Active Students" value={stats.active_students} />
        <StatCard label="Pending Users" value={stats.pending_users} color="#B5882A" />
        <StatCard label="Total Placements" value={stats.total_placements} />
        <StatCard label="Active Placements" value={stats.active_placements} color="#2D6A4F" />
        <StatCard label="Pending Placements" value={stats.pending_placements} color="#B5882A" />
        <StatCard label="Total Logs" value={stats.total_logs} />
        <StatCard label="Submitted Logs" value={stats.submitted_logs} />
        <StatCard label="Approved Logs" value={stats.approved_logs} color="#2D6A4F" />
        <StatCard label="Total Evaluations" value={stats.total_evaluations} />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <Card>
      <div style={{ fontSize: 13, color: '#9A938D', marginBottom: 4 }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        fontWeight: 700,
        color: color || '#1A1714',
      }}>
        {value ?? '—'}
      </div>
    </Card>
  );
}