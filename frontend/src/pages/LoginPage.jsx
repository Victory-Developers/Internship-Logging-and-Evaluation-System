import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/auth.css';

const ROLE_OPTIONS = [
{ value: 'student', label: 'Student' },
{ value: 'academic_supervisor', label: 'Supervisor' },
{ value: 'admin', label: 'Admin' },
];

export default function LoginPage() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [selectedRole, setSelectedRole] = useState('student');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const { login, getDashboardPath } = useAuth();
const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
    await login(email, password);
    navigate(getDashboardPath());
    } catch (err) {
    if (err.response?.status === 401) {
        setError('Invalid email or password.');
    } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
    } else {
        setError('Something went wrong. Please try again.');
    }
    } finally {
    setLoading(false);
    }
};

return (
    <div className="auth-page">

    <div className="auth-hero">
        <div className="auth-hero-bg" />
        <div className="auth-hero-overlay" />
        <div className="auth-hero-content">
        <div className="auth-hero-logo">ILES</div>
        <div className="auth-hero-divider" />
        <p className="auth-hero-tagline">
            Internship Logging & Evaluation System — track placements,
            submit weekly logs, and manage evaluations in one place.
        </p>
        </div>
    </div>

    <div className="auth-form-side">
        <div className="auth-form-container">

        <h2 className="auth-form-title">Welcome back</h2>
        <p className="auth-form-subtitle">Sign in to your account</p>

        <div className="role-selector">
            {ROLE_OPTIONS.map((role) => (
            <button
                key={role.value}
                type="button"
                className={`role-btn ${selectedRole === role.value ? 'active' : ''}`}
                onClick={() => setSelectedRole(role.value)}
            >
                {role.label}
            </button>
            ))}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
            <div className="auth-field">
            <div className="auth-field-header">
                <label className="auth-label" htmlFor="email">Email</label>
            </div>
            <input
                id="email"
                type="email"
                className="auth-input"
                placeholder={`Enter your ${selectedRole.replace('_', ' ')} email`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            </div>

            <div className="auth-field">
            <div className="auth-field-header">
                <label className="auth-label" 
htmlFor="password">Password</label>
                <Link to="/forgot-password" className="auth-field-link">
                Forgot password?
                </Link>
            </div>
            <input
                id="password"
                type="password"
                className="auth-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </div>

            <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            >
            {loading ? 'Signing in...' : 'Sign In'}
            </button>
        </form>

        <div className="auth-footer">
            Don't have an account? <Link to="/register">Sign Up</Link>
        </div>

        </div>
    </div>

    </div>
);
}