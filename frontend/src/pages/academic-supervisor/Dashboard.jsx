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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* MAIN AREA */}
      <div style={{ padding: '30px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Academic Supervisor Dashboard</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Overview of student evaluations and placement progress</p>

        {loading ? (
          <p>Loading dashboard...</p>
        ) : (
          <>
            {/* 🔹 STATS SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '2em', marginRight: '10px' }}>👨‍🎓</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Assigned Students</h3>
                    <p style={{ margin: 0, fontSize: '1.8em', fontWeight: 'bold', color: 'white' }}>{stats.total_students}</p>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '2em', marginRight: '10px' }}>📋</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Pending Reviews</h3>
                    <p style={{ margin: 0, fontSize: '1.8em', fontWeight: 'bold', color: 'white' }}>{stats.pending_reviews}</p>
                  </div>
                </div>
                <button style={buttonStyle} onClick={() => navigate('/supervisor/reviews')}>Review Now</button>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '2em', marginRight: '10px' }}>✅</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Completed Evaluations</h3>
                    <p style={{ margin: 0, fontSize: '1.8em', fontWeight: 'bold', color: 'white' }}>{stats.completed_evaluations}</p>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '2em', marginRight: '10px' }}>🏢</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Active Placements</h3>
                    <p style={{ margin: 0, fontSize: '1.8em', fontWeight: 'bold', color: 'white' }}>{stats.active_placements}</p>
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
  padding: '20px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '15px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  textAlign: 'left',
  transition: 'transform 0.2s',
}

const buttonStyle = {
  background: 'rgba(255,255,255,0.2)',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.9em',
  marginTop: '10px',
  transition: 'background 0.2s',
}
