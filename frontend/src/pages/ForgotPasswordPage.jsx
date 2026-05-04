import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { ENDPOINTS } from '../api/config';
import '../styles/auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post(ENDPOINTS.FORGOT_PASSWORD, { email });
      setSuccess(true);
    } catch (err) {
      if (!err.response) {
        setError('Network error: Cannot reach the server. Please check your connection.');
      } else if (err.response.data?.email) {
        const emailErr = err.response.data.email;
        setError(Array.isArray(emailErr) ? emailErr[0] : emailErr);
      } else if (err.response.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
            <h2 className="auth-form-title">Check your email</h2>
            <p className="auth-form-subtitle">
              We've sent a password reset link to <strong>{email}</strong>.
              Check your inbox and follow the link to reset your password.
              The link expires in 30 minutes.
            </p>
            <div className="auth-footer">
              <Link to="/login">Back to Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="auth-form-title">Reset your password</h2>
          <p className="auth-form-subtitle">Enter your email and we'll send you a reset link</p>

          {error && (
            <div className="auth-error" style={{ borderLeft: '4px solid #ff4d4d', padding: '10px', marginBottom: '15px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                className="auth-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="auth-footer">
            Remember your password? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}