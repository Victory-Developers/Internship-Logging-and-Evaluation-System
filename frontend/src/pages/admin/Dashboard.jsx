import React, { useEffect, useState } from 'react';
import Sidebar from './pages/sidebar';
import api from '../api/axios';

const Dashboard = () => {
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
        const res = await api.get('/dashboard/'); // 🔥 create this endpoint in Django

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
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              
              <div style={cardStyle}>
                <h3>Total Students</h3>
                <p>{stats.total_students}</p>
              </div>

              <div style={cardStyle}>
                <h3>Supervisors</h3>
                <p>{stats.total_supervisors}</p>
              </div>

              <div style={cardStyle}>
                <h3>Placements</h3>
                <p>{stats.total_placements}</p>
              </div>

              <div style={cardStyle}>
                <h3>Pending Approvals</h3>
                <p>{stats.pending_users}</p>
              </div>

            </div>

            {/* 🔹 RECENT ACTIVITY */}
            <div>
              <h2>Recent Activity</h2>

              {recentActivity.length === 0 ? (
                <p>No recent activity</p>
              ) : (
                <ul>
                  {recentActivity.map((item, index) => (
                    <li key={index}>
                      {item.description} — <small>{item.time}</small>
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
  flex: 1,
  padding: '20px',
  background: '#fff',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  textAlign: 'center',
};

export default Dashboard;
