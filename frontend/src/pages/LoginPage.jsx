import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Logging for your browser console to verify what is being sent
    console.log(`Attempting login for role: email: ${email}`);

    try {
      const userData = await login(email, password);
      const path = getDashboardPath(userData);
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
        setError('Invalid email or password.');
      } else if (err.response.status === 403) {
        // Role mismatch or restricted access
        setError('Access denied: You do not have permission to log in.');
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
                placeholder={`Enter your email`}
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
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(prev => !prev)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
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

