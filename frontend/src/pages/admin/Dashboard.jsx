import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_students: 0,
    total_supervisors: 0,
    total_placements: 0,
    pending_users: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/admin/dashboard/');
        setStats(res.data.stats);
        setRecentActivity(res.data.recent_activity);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700, marginBottom: '1.5rem' }}>
        Admin Dashboard
      </h1>

      {loading ? (
        <>
          {/* SKELETON CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="skeleton-box" style={{ width: 32, height: 32, borderRadius: '50%', marginRight: '16px' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton-box" style={{ height: '14px', width: '65%', marginBottom: '8px' }} />
                    <div className="skeleton-box" style={{ height: '24px', width: '35%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SKELETON RECENT ACTIVITY */}
          <div style={{ background: 'var(--surface-container-low, #f9f9f9)', padding: '20px', borderRadius: '12px', border: '1px solid var(--outline-variant, #e5e6fe)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div className="skeleton-box" style={{ height: '20px', width: '150px', marginBottom: '20px' }} />
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[1, 2, 3, 4, 5].map((idx) => (
                <li key={idx} style={{ padding: '12px 0', borderBottom: idx < 5 ? '1px solid var(--outline-variant, #e5e6fe)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="skeleton-box" style={{ height: '16px', width: '50%' }} />
                  <div className="skeleton-box" style={{ height: '12px', width: '80px' }} />
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            
            {/* Total Students */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #002452)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '16px' }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--on-surface-variant, #5c5752)' }}>Total Students</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700, color: 'var(--on-surface, #1A1714)' }}>{stats.total_students}</p>
                </div>
              </div>
            </div>

            {/* Supervisors */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #002452)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '16px' }}>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 10v6M19 13h6" />
                </svg>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--on-surface-variant, #5c5752)' }}>Supervisors</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700, color: 'var(--on-surface, #1A1714)' }}>{stats.total_supervisors}</p>
                </div>
              </div>
            </div>

            {/* Placements */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #002452)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '16px' }}>
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--on-surface-variant, #5c5752)' }}>Placements</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700, color: 'var(--on-surface, #1A1714)' }}>{stats.total_placements}</p>
                  </div>
                </div>
                <button
                  style={{
                    ...buttonStyle,
                    opacity: hoveredBtn === 'placements' ? 0.9 : 1,
                    transform: hoveredBtn === 'placements' ? 'translateY(-1px)' : 'none'
                  }}
                  onMouseEnter={() => setHoveredBtn('placements')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  onClick={() => navigate('/admin/placements')}
                >
                  View Placements
                </button>
              </div>
            </div>

            {/* Pending Approvals */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #002452)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '16px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--on-surface-variant, #5c5752)' }}>Pending Approvals</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700, color: 'var(--on-surface, #1A1714)' }}>{stats.pending_users}</p>
                  </div>
                </div>
                <button
                  style={{
                    ...buttonStyle,
                    opacity: hoveredBtn === 'pending' ? 0.9 : 1,
                    transform: hoveredBtn === 'pending' ? 'translateY(-1px)' : 'none'
                  }}
                  onMouseEnter={() => setHoveredBtn('pending')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  onClick={() => navigate('/admin/users?status=pending')}
                >
                  Manage Users
                </button>
              </div>
            </div>

          </div>

          <div style={{ background: 'var(--surface-container-low, #f9f9f9)', padding: '20px', borderRadius: '12px', border: '1px solid var(--outline-variant, #e5e6fe)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginTop: 0, fontSize: '18px', fontWeight: 700, color: 'var(--on-surface, #1A1714)' }}>Recent Activity</h2>

            {recentActivity.length === 0 ? (
              <p style={{ color: 'var(--on-surface-variant, #5c5752)' }}>No recent activity</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {recentActivity.map((item, index) => (
                  <li key={index} style={{ padding: '12px 0', borderBottom: index < recentActivity.length - 1 ? '1px solid var(--outline-variant, #e5e6fe)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: 'var(--on-surface, #1A1714)' }}>{item.description}</span>
                    <small style={{ color: 'var(--on-surface-variant, #5c5752)' }}>{item.time}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const cardStyle = {
  padding: '24px',
  background: 'var(--surface-container-high, #e5e6fe)',
  borderRadius: '16px',
  border: '1px solid var(--outline-variant, #dfe1f9)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '110px',
  boxSizing: 'border-box'
};

const buttonStyle = {
  background: 'var(--primary, #002452)',
  color: 'var(--on-primary, #ffffff)',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.875em',
  fontWeight: 600,
  marginTop: '4px',
  width: 'fit-content',
  transition: 'opacity 0.2s, transform 0.2s'
};

export default Dashboard;