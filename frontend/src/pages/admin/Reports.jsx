import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/config';
import { Card, Spinner, EmptyState, Btn } from '../../components/UI';

const formatDate = (s) => s
  ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('student-reports');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [placements, setPlacements] = useState([]);
  const [placementsLoading, setPlacementsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load system statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get(ENDPOINTS.ADMIN_REPORTS);
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load system reports');
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  // Load student placements
  useEffect(() => {
    const loadPlacements = async () => {
      try {
        const res = await api.get(ENDPOINTS.PLACEMENTS);
        const data = res.data;
        setPlacements(Array.isArray(data) ? data : data?.results || []);
      } catch (err) {
        console.error('Failed to load placements:', err);
      } finally {
        setPlacementsLoading(false);
      }
    };
    loadPlacements();
  }, []);

  // Derive statistical counts from nested backend object
  const totalUsers = stats?.users
    ? Object.values(stats.users).reduce((acc, curr) => acc + (curr.total || 0), 0)
    : 0;

  const activeStudents = stats?.users?.student?.active || 0;

  const pendingUsers = stats?.users
    ? Object.values(stats.users).reduce((acc, curr) => acc + (curr.pending || 0), 0)
    : 0;

  const totalPlacements = stats?.placements?.total || 0;
  const activePlacements = stats?.placements?.active || 0;
  const pendingPlacements = stats?.placements?.pending || 0;

  const totalLogs = stats?.weekly_logs?.total || 0;
  const submittedLogs = stats?.weekly_logs?.submitted || 0;
  const approvedLogs = stats?.weekly_logs?.approved || 0;

  const totalEvaluations = stats?.evaluations
    ? (stats.evaluations.workplace_eval_submitted || 0) + (stats.evaluations.academic_eval_submitted || 0)
    : 0;

  // Filter student reports (only show placements where end date has passed)
  const submittedPlacements = placements.filter(p => {
    if (!p.end_date) return false;
    return new Date() > new Date(p.end_date);
  });

  // Export CSV for statistics
  const exportCSV = () => {
    if (!stats) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Users', totalUsers],
      ['Active Students', activeStudents],
      ['Pending Users', pendingUsers],
      ['Total Placements', totalPlacements],
      ['Active Placements', activePlacements],
      ['Pending Placements', pendingPlacements],
      ['Total Logs', totalLogs],
      ['Submitted Logs', submittedLogs],
      ['Approved Logs', approvedLogs],
      ['Total Evaluations', totalEvaluations],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'iles_system_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return <EmptyState title="Error" description={error} />;
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700, margin: 0 }}>
          Reports
        </h1>
        {activeTab === 'system-stats' && stats && (
          <Btn variant="secondary" onClick={exportCSV}>Export CSV</Btn>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--outline-variant, #e5e6fe)', marginBottom: '1.5rem', gap: '1rem' }}>
        <button
          onClick={() => setActiveTab('student-reports')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'student-reports' ? '3px solid var(--primary, #002452)' : '3px solid transparent',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            color: activeTab === 'student-reports' ? 'var(--primary, #002452)' : 'var(--on-surface-variant, #5c5752)',
            marginBottom: '-2px',
            transition: 'color 0.2s, border-color 0.2s'
          }}
        >
          Student Reports
        </button>
        <button
          onClick={() => setActiveTab('system-stats')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'system-stats' ? '3px solid var(--primary, #002452)' : '3px solid transparent',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            color: activeTab === 'system-stats' ? 'var(--primary, #002452)' : 'var(--on-surface-variant, #5c5752)',
            marginBottom: '-2px',
            transition: 'color 0.2s, border-color 0.2s'
          }}
        >
          System Statistics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'student-reports' ? (
        placementsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div>
        ) : submittedPlacements.length === 0 ? (
          <EmptyState
            title="No Student Reports Submitted"
            description="No end-of-internship reports have been uploaded yet. Students will be able to submit their final PDF reports once their placement periods end."
          />
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-container-low, #f9f9f9)', borderBottom: '1px solid var(--outline-variant, #e5e6fe)' }}>
                    <th style={thStyle}>Student</th>
                    <th style={thStyle}>Company</th>
                    <th style={thStyle}>End Date</th>
                    <th style={thStyle}>Report Status</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedPlacements.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--outline-variant, #e5e6fe)' }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: 'var(--on-surface, #1A1714)' }}>{p.student?.full_name || 'Unassigned'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--on-surface-variant, #5c5752)' }}>{p.student?.email || ''}</div>
                      </td>
                      <td style={tdStyle}>{p.company_name}</td>
                      <td style={tdStyle}>{formatDate(p.end_date)}</td>
                      <td style={tdStyle}>
                        <span style={submittedBadgeStyle}>Submitted</span>
                      </td>
                      <td style={tdStyle}>
                        <Btn
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            toast.info(`Downloading final internship report for ${p.student?.full_name || 'student'}...`);
                          }}
                        >
                          Download PDF
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        statsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div>
        ) : !stats ? (
          <EmptyState title="No Stats" description="No report data available yet." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <StatCard label="Total Users" value={totalUsers} />
            <StatCard label="Active Students" value={activeStudents} />
            <StatCard label="Pending Users" value={pendingUsers} color="#B5882A" />
            <StatCard label="Total Placements" value={totalPlacements} />
            <StatCard label="Active Placements" value={activePlacements} color="#2D6A4F" />
            <StatCard label="Pending Placements" value={pendingPlacements} color="#B5882A" />
            <StatCard label="Total Logs" value={totalLogs} />
            <StatCard label="Submitted Logs" value={submittedLogs} />
            <StatCard label="Approved Logs" value={approvedLogs} color="#2D6A4F" />
            <StatCard label="Total Evaluations" value={totalEvaluations} />
          </div>
        )
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <Card>
      <div style={{ fontSize: 13, color: 'var(--on-surface-variant, #5c5752)', marginBottom: 4 }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        fontWeight: 700,
        color: color || 'var(--on-surface, #1A1714)',
      }}>
        {value ?? '—'}
      </div>
    </Card>
  );
}

const thStyle = {
  padding: '12px 16px',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--on-surface-variant, #5c5752)',
  borderBottom: '1px solid var(--outline-variant, #e5e6fe)'
};

const tdStyle = {
  padding: '14px 16px',
  fontSize: '14px',
  color: 'var(--on-surface, #1A1714)'
};

const submittedBadgeStyle = {
  background: '#DEF7EC',
  color: '#03543F',
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600
};