import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/layout.css';
import logoImg from '../assets/Gemini_Generated_Image_sb9z89sb9z89sb9z.png';

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
        <img src={logoImg} alt="ILES Logo" className="sidebar-brand-icon" style={{ objectFit: 'contain' }} />
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
        <NavLink to="/student/submit-report" className="sidebar-cta-btn" style={{ background: 'var(--color-primary-container, #E8F4FD)', color: 'var(--color-on-primary-container, #1A6FA8)', marginTop: 8, border: '1px solid #1A6FA840' }}>
            Submit Report
        </NavLink>
        <NavLink to="/student/profile" className="sidebar-profile-link">
            My Profile
        </NavLink>
        <button onClick={handleLogout} className="sidebar-logout-btn">
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