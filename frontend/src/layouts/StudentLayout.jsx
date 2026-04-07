import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/layout.css';

export default function StudentLayout() {
const { user, logout } = useAuth();
const navigate = useNavigate();

const handleLogout = async () => {
    await logout();
    navigate('/login');
};

return (
    <div className="app-layout">
    <aside className="sidebar sidebar-student">

        <div className="sidebar-brand">
        <div className="sidebar-brand-icon">IL</div>
        <span className="sidebar-brand-text">ILES</span>
        </div>

        <nav className="sidebar-nav">
        <NavLink to="/student/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Dashboard
        </NavLink>
        <NavLink to="/student/placement" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Placements
        </NavLink>
        <NavLink to="/student/logs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Weekly Logs
        </NavLink>
        <NavLink to="/student/scores" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Evaluations
        </NavLink>
        </nav>

        <div className="sidebar-footer">
        <NavLink to="/student/logs/new" className="sidebar-cta-btn">
            + Submit Log
        </NavLink>
        <button onClick={handleLogout} className="sidebar-footer-link">
            Logout
        </button>
        </div>

    </aside>

    <main className="main-content">
        <header className="topbar">
        <h1 className="topbar-title">Student Dashboard</h1>
        <div className="topbar-right">
            <div className="topbar-user">
            <div>
                <div className="topbar-user-name">{user?.full_name}</div>
                <div className="topbar-user-role">Student</div>
            </div>
            <div className="topbar-avatar">
                {user?.full_name?.charAt(0) || 'S'}
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