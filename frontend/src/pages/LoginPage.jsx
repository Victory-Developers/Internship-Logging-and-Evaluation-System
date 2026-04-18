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

    // Logging for your browser console to verify what is being sent
    console.log(`Attempting login for role: ${selectedRole}, email: ${email}`);

    try {
      // Pass the role to the login function
      await login(email, password, selectedRole);
      
      const path = getDashboardPath();
      console.log(`Login successful! Redirecting to: ${path}`);
      navigate(path);

    } catch (err) {
      // Technical log for debugging (View this in Browser Inspect -> Console)
      console.error("Full Login Error Object:", err);

      if (!err.response) {
        // The server didn't respond at all (Server is down or CORS issue)
        setError('Network error: Cannot reach the server. Please check your connection.');
      } else if (err.response.status === 401) {
        // Wrong credentials
        setError('Invalid email or password for the selected role.');
      } else if (err.response.status === 403) {
        // Role mismatch or restricted access
        setError('Access denied: You do not have permission to log in as ' + selectedRole);
      } else if (err.response.status === 422) {
        // Backend validation failed
        setError('Validation error: Please check if your email format is correct.');
      } else if (err.response.data?.detail) {
        // Custom message from the backend API
        setError(err.response.data.detail);
      } else {
        // Generic catch-all
        setError(`Error (${err.response.status}): Something went wrong. Please try again.`);
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
          <div className="auth-hero-container">
            <p className="auth-hero-tagline">Internship Logging & Evaluation System</p>
            <ul className="auth-hero-list">
              <li>Track placements</li>
              <li>Submit weekly logs</li>
              <li>Manage evaluations in one place</li>
            </ul>
          </div>
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
                onClick={() => {
                    setSelectedRole(role.value);
                    setError(''); // Clear error when switching roles
                }}
              >
                {role.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="auth-error" style={{ borderLeft: '4px solid #ff4d4d', padding: '10px', marginBottom: '15px' }}>
              <strong>Login Failed:</strong> {error}
            </div>
          )}

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
                <label className="auth-label" htmlFor="password">Password</label>
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
