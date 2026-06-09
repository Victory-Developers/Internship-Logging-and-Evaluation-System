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
              <input
                id="new-password"
                type="password"
                className="auth-input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
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
              <input
                id="confirm-password"
                type="password"
                className="auth-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
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