import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ENDPOINTS } from '../api/config';
import '../styles/auth.css';

const PASSWORD_RULES = [
  { key: 'length',    label: 'At least 8 characters',        test: (pw) => pw.length >= 8 },
  { key: 'uppercase', label: 'At least one uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lowercase', label: 'At least one lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { key: 'number',    label: 'At least one number',           test: (pw) => /[0-9]/.test(pw) },
  { key: 'special',   label: 'At least one special character', test: (pw) => /[^a-zA-Z0-9]/.test(pw) },
];

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const allRulesMet = PASSWORD_RULES.every((rule) => rule.test(newPassword));
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = allRulesMet && passwordsMatch && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post(ENDPOINTS.RESET_PASSWORD, {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (!err.response) {
        setError('Network error: Cannot reach the server.');
      } else if (err.response.data?.error) {
        setError(err.response.data.error);
      } else if (err.response.data?.new_password) {
        const pwErr = err.response.data.new_password;
        setError(Array.isArray(pwErr) ? pwErr.join(' ') : pwErr);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // No token in URL
  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-hero">
          <div className="auth-hero-bg" />
          <div className="auth-hero-overlay" />
          <div className="auth-hero-content">
            <div className="auth-hero-logo">ILES</div>
            <div className="auth-hero-divider" />
            <p className="auth-hero-tagline">Internship Logging &amp; Evaluation System</p>
          </div>
        </div>
        <div className="auth-form-side">
          <div className="auth-form-container" style={{ textAlign: 'center' }}>
            <h2 className="auth-form-title">Invalid Link</h2>
            <p className="auth-form-subtitle">
              This password reset link is invalid or missing a token.
            </p>
            <div className="auth-footer">
              <Link to="/forgot-password">Request a new reset link</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-hero">
          <div className="auth-hero-bg" />
          <div className="auth-hero-overlay" />
          <div className="auth-hero-content">
            <div className="auth-hero-logo">ILES</div>
            <div className="auth-hero-divider" />
            <p className="auth-hero-tagline">Internship Logging &amp; Evaluation System</p>
          </div>
        </div>
        <div className="auth-form-side">
          <div className="auth-form-container" style={{ textAlign: 'center' }}>
            <h2 className="auth-form-title">Password Reset Successful</h2>
            <p className="auth-form-subtitle">
              Your password has been reset. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-bg" />
        <div className="auth-hero-overlay" />
        <div className="auth-hero-content">
          <div className="auth-hero-logo">ILES</div>
          <div className="auth-hero-divider" />
          <div className="auth-hero-container">
            <p className="auth-hero-tagline">Internship Logging &amp; Evaluation System</p>
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
          <h2 className="auth-form-title">Create new password</h2>
          <p className="auth-form-subtitle">Enter your new password below</p>

          {error && (
            <div className="auth-error" style={{ borderLeft: '4px solid #ff4d4d', padding: '10px', marginBottom: '15px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="new-password">New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              {newPassword.length > 0 && (
                <ul className="password-requirements">
                  {PASSWORD_RULES.map((rule) => (
                    <li key={rule.key} className={`password-req-item ${rule.test(newPassword) ? 'met' : 'unmet'}`}>
                      {rule.test(newPassword) ? '✓' : '✗'} {rule.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="confirm-password">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
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
              {confirmPassword.length > 0 && (
                <p className={`password-match-status ${passwordsMatch ? 'matched' : ''}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords must match'}
                </p>
              )}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={!canSubmit}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login">Back to Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}