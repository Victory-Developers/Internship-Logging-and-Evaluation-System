import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import NotificationBell from '../components/NotificationBell';
import '../styles/layout.css';
import logoImg from '../assets/Gemini_Generated_Image_sb9z89sb9z89sb9z.png';

export default function AdminLayout() {
const { user, logout } = useAuth();
const navigate = useNavigate();

const handleLogout = async () => {
    await logout();
    navigate('/login');
};

return (
    <div className="app-layout">
    <aside className="sidebar sidebar-admin">

        <div className="sidebar-brand">
        <img src={logoImg} alt="ILES Logo" className="sidebar-brand-icon" style={{ objectFit: 'contain' }} />
        <div>
            <div className="sidebar-brand-text">ILES Admin</div>
        </div>
        </div>

        <nav className="sidebar-nav">
        <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Dashboard
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Users
        </NavLink>
        <NavLink to="/admin/placements" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Placements
        </NavLink>
        <NavLink to="/admin/logs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Logs
        </NavLink>
        <NavLink to="/admin/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon"></span> Reports
        </NavLink>
        </nav>

        <div className="sidebar-footer">
        <NavLink to="/admin/placements/new" className="sidebar-cta-btn">
            + New Placement
        </NavLink>
        <NavLink to="/admin/profile" className="sidebar-profile-link">
            My Profile
        </NavLink>
        <button onClick={handleLogout} className="sidebar-logout-btn">
            Logout
        </button>
        </div>

    </aside>

    <main className="main-content">
        <header className="topbar">
        <h1 className="topbar-title">ILES Dashboard</h1>
        <div className="topbar-right">                                       
            <NotificationBell />                                                                                                                                                     
            <div className="topbar-user">                                                                                                                                            
                <div>                                  
                    <div className="topbar-user-name">{user?.full_name}</div>                                                                                                            
                    <div className="topbar-user-role">Administrator</div>  
                </div>      
                <div className="topbar-avatar">
                    {user?.full_name?.charAt(0) || 'A'}                                                                                                                                  
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
