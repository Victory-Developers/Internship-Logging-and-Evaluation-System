import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/layout.css';

export default function WorkplaceSupervisorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar sidebar-supervisor">

        <div className="sidebar-brand">
          <div>
            <div className="sidebar-brand-text">ILES</div>
            <div className="sidebar-brand-subtitle">Workplace Supervisor</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/workplace/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Dashboard
          </NavLink>
          <NavLink to="/workplace/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> My Students
          </NavLink>
          <NavLink to="/workplace/logs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Log Reviews
          </NavLink>
          <NavLink to="/workplace/evaluations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Evaluations
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/workplace/profile" className="sidebar-profile-link">
            My Profile
          </NavLink>
          <button onClick={handleLogout} className="sidebar-logout-btn">
            Logout
          </button>
        </div>

      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1 className="topbar-title">Workplace Supervisor</h1>
          <div className="topbar-right">
            <div className="topbar-user">
              <div>
                <div className="topbar-user-name">{user?.full_name}</div>
                <div className="topbar-user-role">Workplace Supervisor</div>
              </div>
              <div className="topbar-avatar">
                {user?.full_name?.charAt(0) || 'W'}
              </div>
            </div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}