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

  // Export CSV for statistics
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
        ) : placements.length === 0 ? (
          <EmptyState title="No Placements Found" description="There are no student placements registered in the system yet." />
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
                  {placements.map((p) => {
                    const isSubmitted = new Date() > new Date(p.end_date);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--outline-variant, #e5e6fe)' }}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600, color: 'var(--on-surface, #1A1714)' }}>{p.student?.full_name || 'Unassigned'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--on-surface-variant, #5c5752)' }}>{p.student?.email || ''}</div>
                        </td>
                        <td style={tdStyle}>{p.company_name}</td>
                        <td style={tdStyle}>{formatDate(p.end_date)}</td>
                        <td style={tdStyle}>
                          {isSubmitted ? (
                            <span style={submittedBadgeStyle}>Submitted</span>
                          ) : (
                            <span style={ongoingBadgeStyle}>Internship Ongoing</span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          {isSubmitted ? (
                            <Btn
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                toast.info(`Downloading final internship report for ${p.student?.full_name || 'student'}...`);
                              }}
                            >
                              Download PDF
                            </Btn>
                          ) : (
                            <span style={{ fontSize: '13px', color: 'var(--on-surface-variant, #5c5752)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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

const ongoingBadgeStyle = {
  background: '#FEF08A',
  color: '#713F12',
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600
};