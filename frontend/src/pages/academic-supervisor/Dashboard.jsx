import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from "../../api/axios";
import {
  Navbar, PageLayout, PageBody, Card, Btn, StatusBadge,
  Modal, Spinner, EmptyState, Field, Textarea, Select, toast
} from '../../components/UI'

export default function SupervisorDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total_students: 0,
    pending_reviews: 0,
    completed_evaluations: 0,
    active_placements: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/evaluations/academic/dashboard/')
        setStats(res.data.stats)
        setRecentActivity(res.data.recent_activity)
      } catch (err) {
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div style={{ width: '100%' }}>
      <div style={{ padding: '10px 0', width: '100%' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--on-surface, #1A1714)' }}>Academic Supervisor Dashboard</h1>
        <p style={{ color: 'var(--on-surface-variant, #5c5752)', marginBottom: '30px' }}>Overview of student evaluations and placement progress</p>

        {loading ? (
          <p>Loading dashboard...</p>
        ) : (
          <>
            {/* 🔹 STATS SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #002452)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '16px' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--on-surface-variant, #5c5752)', fontWeight: 500 }}>Assigned Students</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 700, color: 'var(--on-surface, #1A1714)' }}>{stats.total_students}</p>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #002452)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '16px' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--on-surface-variant, #5c5752)', fontWeight: 500 }}>Pending Reviews</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 700, color: 'var(--on-surface, #1A1714)' }}>{stats.pending_reviews}</p>
                    </div>
                  </div>
                  <button style={buttonStyle} onClick={() => navigate('/supervisor/pending-reviews')}>Review Now</button>
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #002452)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '16px' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--on-surface-variant, #5c5752)', fontWeight: 500 }}>Completed Evaluations</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 700, color: 'var(--on-surface, #1A1714)' }}>{stats.completed_evaluations}</p>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #002452)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '16px' }}>
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--on-surface-variant, #5c5752)', fontWeight: 500 }}>Active Placements</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 700, color: 'var(--on-surface, #1A1714)' }}>{stats.active_placements}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* 🔹 RECENT ACTIVITY */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>Recent Activity</h2>

              {recentActivity.length === 0 ? (
                <p style={{ color: '#999' }}>No recent activity</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {recentActivity.map((item, index) => (
                    <li key={index} style={{ padding: '15px 0', borderBottom: index < recentActivity.length - 1 ? '1px solid #eee' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#333', fontSize: '14px' }}>{item.description}</span>
                      <small style={{ color: '#999', fontSize: '12px' }}>{item.time}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// 🔹 Card styling
const cardStyle = {
  padding: '24px',
  background: 'var(--surface-container-high, #e5e6fe)',
  border: '1px solid var(--outline-variant, #dfe1f9)',
  borderRadius: '12px',
  textAlign: 'left',
}

const buttonStyle = {
  background: 'var(--primary, #002452)',
  color: 'var(--on-primary, #ffffff)',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  marginTop: '16px',
  alignSelf: 'flex-start',
  transition: 'opacity 0.2s',
}
