import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ENDPOINTS } from '../api/config';
import '../styles/auth.css';

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'academic_supervisor', label: 'Academic Supervisor' },
  { value: 'workplace_supervisor', label: 'Workplace Supervisor' },
];

const PASSWORD_RULES = [
  { key: 'length',    label: 'At least 8 characters',        test: (pw) => pw.length >= 8 },
  { key: 'uppercase', label: 'At least one uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lowercase', label: 'At least one lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { key: 'number',    label: 'At least one number',           test: (pw) => /[0-9]/.test(pw) },
  { key: 'special',   label: 'At least one special character', test: (pw) => /[^a-zA-Z0-9]/.test(pw) },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'student',
    student_number: '',
    organisation: '',
  });

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleRoleChange = (role) => {
    setForm((prev) => ({
      ...prev,
      role,
      student_number: '',
      organisation: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const allRulesMet = PASSWORD_RULES.every((rule) => rule.test(form.password));
    if (!allRulesMet) {
      setFieldErrors({ password: 'Password does not meet all requirements.' });
      return;
    }

    if (form.password !== form.confirm_password) {
      setFieldErrors({ confirm_password: 'Passwords do not match.' });
      return;
    }

    if (form.password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters.' });
      return;
    }

    if (form.role === 'student' && !form.student_number) {
      setFieldErrors({
        student_number: 'Student number is required for student accounts.',
      });
      return;
    }

    if (form.role === 'workplace_supervisor' && !form.organisation) {
      setFieldErrors({
        organisation: 'Organisation is required for workplace supervisors.',
      });
      return;
    }

    setLoading(true);

    const payload = {
      full_name: form.full_name,
      email: form.email,
      password: form.password,
      confirm_password: form.confirm_password,
      role: form.role,
    };

    if (form.role === 'student') {
      payload.student_number = form.student_number;
    }

    if (form.role === 'workplace_supervisor') {
      payload.organisation = form.organisation;
    }

    try {
      await api.post(ENDPOINTS.REGISTER, payload);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;

        if (typeof data === 'object' && !data.detail) {
          const parsed = {};
          for (const [key, value] of Object.entries(data)) {
            parsed[key] = Array.isArray(value) ? value[0] : value;
          }
          setFieldErrors(parsed);
        } else {
          setError(data.detail || 'Registration failed.');
        }
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
            <p className="auth-hero-tagline">
              Internship Logging & Evaluation System
            </p>
          </div>
        </div>

        <div className="auth-form-side">
          <div
            className="auth-form-container"
            style={{ textAlign: 'center' }}
          >
            <h2 className="auth-form-title">Account Created</h2>
            <p className="auth-form-subtitle">
              Your account is pending approval by an administrator.
              Redirecting to login...
            </p>
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
          <p className="auth-hero-tagline">
            Internship Logging & Evaluation System
          </p>

          <ul>
            <li>Track placements</li>
            <li>Submit weekly logs</li>
            <li>Manage evaluations in one place</li>
          </ul>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Create an account</h2>
          <p className="auth-form-subtitle">Join ILES to get started</p>

          <div className="role-selector">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role.value}
                type="button"
                className={`role-btn ${
                  form.role === role.value ? 'active' : ''
                }`}
                onClick={() => handleRoleChange(role.value)}
              >
                {role.label}
              </button>
            ))}
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="full_name">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                className="auth-input"
                value={form.full_name}
                onChange={handleChange}
                required
              />
              {fieldErrors.full_name && (
                <div className="auth-field-error">
                  {fieldErrors.full_name}
                </div>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="auth-input"
                value={form.email}
                onChange={handleChange}
                required
              />
              {fieldErrors.email && (
                <div className="auth-field-error">{fieldErrors.email}</div>
              )}
            </div>

            {form.role === 'student' && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="student_number">
                  Student Number
                </label>
                <input
                  id="student_number"
                  name="student_number"
                  type="text"
                  className="auth-input"
                  value={form.student_number}
                  onChange={handleChange}
                />
                {fieldErrors.student_number && (
                  <div className="auth-field-error">
                    {fieldErrors.student_number}
                  </div>
                )}
              </div>
            )}

            {form.role === 'workplace_supervisor' && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="organisation">
                  Organisation
                </label>
                <input
                  id="organisation"
                  name="organisation"
                  type="text"
                  className="auth-input"
                  value={form.organisation}
                  onChange={handleChange}
                />
                {fieldErrors.organisation && (
                  <div className="auth-field-error">
                    {fieldErrors.organisation}
                  </div>
                )}
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="auth-input"
                value={form.password}
                onChange={handleChange}
                required
              />
              {form.password.length > 0 && (
                <ul className="password-requirements">
                  {PASSWORD_RULES.map((rule) => (
                    <li key={rule.key} className={`password-req-item ${rule.test(form.password) ? 'met' : 'unmet'}`}>
                      {rule.test(form.password) ? '✓' : '✗'} {rule.label}
                    </li>
                  ))}
                </ul>
              )}
              {fieldErrors.password && (
                <div className="auth-field-error">
                  {fieldErrors.password}
                </div>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="confirm_password">
                Confirm Password
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                className="auth-input"
                value={form.confirm_password}
                onChange={handleChange}
                required
              />
              {form.confirm_password.length > 0 && (
                <p className={`password-match-status ${form.password === form.confirm_password ? 'matched' : ''}`}>
                  {form.password === form.confirm_password ? '✓ Passwords match' : '✗ Passwords must match'}
                </p>
              )}
              {fieldErrors.confirm_password && (
                <div className="auth-field-error">
                  {fieldErrors.confirm_password}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}