import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
import api from '../../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState('dashboard');

  // 🔹 State for dashboard data
  const [stats, setStats] = useState({
    total_students: 0,
    total_supervisors: 0,
    total_placements: 0,
    pending_users: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  const [loading, setLoading] = useState(true);

  // 🔹 Fetch data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/admin/dashboard/'); // 🔥 create this endpoint in Django

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
    <div style={{ display: 'flex' }}>
      <Sidebar setSelectedFeature={setSelectedFeature} />

      {/* MAIN AREA */}
      <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
        <h1>Admin Dashboard</h1>

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
                    <h3 style={{ margin: 0 }}>Total Students</h3>
                    <p style={{ margin: 0, fontSize: '1.5em', fontWeight: 'bold' }}>{stats.total_students}</p>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '2em', marginRight: '10px' }}>👨‍🏫</span>
                  <div>
                    <h3 style={{ margin: 0 }}>Supervisors</h3>
                    <p style={{ margin: 0, fontSize: '1.5em', fontWeight: 'bold' }}>{stats.total_supervisors}</p>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '2em', marginRight: '10px' }}>🏢</span>
                  <div>
                    <h3 style={{ margin: 0 }}>Placements</h3>
                    <p style={{ margin: 0, fontSize: '1.5em', fontWeight: 'bold' }}>{stats.total_placements}</p>
                  </div>
                </div>
                <button style={buttonStyle} onClick={() => navigate('/admin/placements')}>View Placements</button>
              </div>

              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '2em', marginRight: '10px' }}>⏳</span>
                  <div>
                    <h3 style={{ margin: 0 }}>Pending Approvals</h3>
                    <p style={{ margin: 0, fontSize: '1.5em', fontWeight: 'bold' }}>{stats.pending_users}</p>
                  </div>
                </div>
                <button style={buttonStyle} onClick={() => navigate('/admin/users')}>Manage Users</button>
              </div>

            </div>

            {/* 🔹 RECENT ACTIVITY */}
            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0 }}>Recent Activity</h2>

              {recentActivity.length === 0 ? (
                <p>No recent activity</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {recentActivity.map((item, index) => (
                    <li key={index} style={{ padding: '10px 0', borderBottom: index < recentActivity.length - 1 ? '1px solid #ddd' : 'none', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.description}</span>
                      <small style={{ color: '#666' }}>{item.time}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 🔹 Simple card styling
const cardStyle = {
  padding: '20px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '15px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  textAlign: 'left',
  transition: 'transform 0.2s',
  ':hover': {
    transform: 'translateY(-5px)',
  },
};

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
};

export default Dashboard;
