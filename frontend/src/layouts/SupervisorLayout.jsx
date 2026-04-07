import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/layout.css';

export default function SupervisorLayout() {
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
            <div className="sidebar-brand-text">Makerere</div>
            <div className="sidebar-brand-text">University</div>
            <div className="sidebar-brand-subtitle">Academic Supervisor</div>
        </div>
        </div>

        <nav className="sidebar-nav">
        <NavLink to="/supervisor/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Dashboard
        </NavLink>
        <NavLink to="/supervisor/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> My Students
        </NavLink>
        <NavLink to="/supervisor/pending-reviews" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Pending Evaluations
        </NavLink>
        <NavLink to="/supervisor/scores" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Evaluation History
        </NavLink>
        </nav>

        <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-footer-link">
            Logout
        </button>
        </div>

    </aside>

    <main className="main-content">
        <header className="topbar">
        <h1 className="topbar-title">Dashboard</h1>
        <div className="topbar-right">
            <div className="topbar-user">
            <div>
                <div className="topbar-user-name">{user?.full_name}</div>
                <div className="topbar-user-role">Academic Supervisor</div>
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
