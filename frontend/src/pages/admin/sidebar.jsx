import React from 'react'

const Sidebar = ({ setSelectedFeature }) => {
    const menuItems =[
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'users', label: 'Users' },
        { id: 'placements', label: 'Placements' },
        { id: 'internships', label: 'Internships'},
        { id: 'reports', label: 'Reports' },
    ];

    return (
        <div style={sidebarStyle}>
          <h2 style={{ color: 'white', padding: '20px' }}>Admin Panel</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {menuItems.map((item) => (
              <li 
                key={item.id} 
                onClick={() => setSelectedFeature(item.id)}
                style={menuItemStyle}
              >
                {item.label}
              </li>
            ))}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  // 🔹 Used to open/close dropdown menus
  const [openMenu, setOpenMenu] = useState({
    users: false,
    logs: false,
  });

  // 🔹 React Router navigation
  const navigate = useNavigate();

  // 🔹 Toggle dropdown sections
  const toggleMenu = (menu) => {
    setOpenMenu((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // 🔹 Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={styles.sidebar}>
      {/* 🔹 Logo / System Name */}
      <h2 style={styles.logo}>ILES Admin</h2>

      {/* 🔹 Main Menu */}
      <ul style={styles.menu}>

        {/* DASHBOARD */}
        <li style={styles.menuItem} onClick={() => navigate('/admin/dashboard')}>
          📊 Dashboard
        </li>

        {/* USERS */}
        <li style={styles.menuItem} onClick={() => toggleMenu('users')}>
          👥 Users {openMenu.users ? '▲' : '▼'}
        </li>

        {openMenu.users && (
          <ul style={styles.subMenu}>
            <li style={styles.subMenuItem} onClick={() => navigate('/admin/users/all')}>
              All Users
            </li>
            <li style={styles.subMenuItem} onClick={() => navigate('/admin/users/students')}>
              Students
            </li>
            <li style={styles.subMenuItem} onClick={() => navigate('/admin/users/supervisors')}>
              Supervisors
            </li>
            <li style={styles.subMenuItem} onClick={() => navigate('/admin/users/admins')}>
              Admins
            </li>
          </ul>
        )}

        {/* PLACEMENTS */}
        <li style={styles.menuItem} onClick={() => navigate('/admin/placements')}>
          🏢 Placements
        </li>

        {/* LOGS */}
        <li style={styles.menuItem} onClick={() => toggleMenu('logs')}>
          📘 Logs {openMenu.logs ? '▲' : '▼'}
        </li>

        {openMenu.logs && (
          <ul style={styles.subMenu}>
            <li style={styles.subMenuItem} onClick={() => navigate('/admin/logs/all')}>
              All Logs
            </li>
            <li style={styles.subMenuItem} onClick={() => navigate('/admin/logs/pending')}>
              Pending
            </li>
            <li style={styles.subMenuItem} onClick={() => navigate('/admin/logs/approved')}>
              Approved
            </li>
          </ul>
        )}

        {/* EVALUATIONS */}
        <li style={styles.menuItem} onClick={() => navigate('/admin/evaluations')}>
          📝 Evaluations
        </li>

        {/* ORGANISATIONS */}
        <li style={styles.menuItem} onClick={() => navigate('/admin/organisations')}>
          🏭 Organisations
        </li>

        {/* REPORTS */}
        <li style={styles.menuItem} onClick={() => navigate('/admin/reports')}>
          📈 Reports
        </li>

        {/* APPROVALS */}
        <li style={styles.menuItem} onClick={() => navigate('/admin/approvals')}>
          ✅ Approvals
        </li>

        {/* NOTIFICATIONS */}
        <li style={styles.menuItem} onClick={() => navigate('/admin/notifications')}>
          🔔 Notifications
        </li>

        {/* SETTINGS */}
        <li style={styles.menuItem} onClick={() => navigate('/admin/settings')}>
          ⚙️ Settings
        </li>

        {/* PROFILE */}
        <li style={styles.menuItem} onClick={() => navigate('/admin/profile')}>
          👤 Profile
        </li>

        {/* LOGOUT */}
        <li style={styles.logout} onClick={handleLogout}>
          🚪 Logout
        </li>
      </ul>
    </div>
  );
};

// 🔹 Styling Section
const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '20px',
    position: 'fixed',
    left: 0,
    top: 0,
    overflowY: 'auto',
  },

  logo: {
    textAlign: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #334155',
    paddingBottom: '15px',
  },

  menu: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },

  menuItem: {
    padding: '12px 15px',
    cursor: 'pointer',
    borderRadius: '8px',
    marginBottom: '5px',
    transition: '0.3s',
  },

  subMenu: {
    listStyle: 'none',
    paddingLeft: '20px',
    marginBottom: '10px',
  },

  subMenuItem: {
    padding: '8px 10px',
    cursor: 'pointer',
    color: '#cbd5e1',
    fontSize: '14px',
  },

  logout: {
    padding: '12px 15px',
    cursor: 'pointer',
    marginTop: '20px',
    color: '#f87171',
    borderTop: '1px solid #334155',
  },
};

export default Sidebar;
