import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ENDPOINTS } from '../api/config';
import '../styles/auth.css';

const ROLE_OPTIONS = [
{ value: 'student', label: 'Student' },
{ value: 'academic_supervisor', label: 'Supervisor' },
{ value: 'admin', label: 'Admin' },
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
    // Clear the error for this field as user types
    if (fieldErrors[name]) {
    setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
    });
    }
};

const handleRoleChange = (role) => {
    setForm((prev) => ({ ...prev, role }));
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Client-side validation
    if (form.password !== form.confirm_password) {
    setFieldErrors({ confirm_password: 'Passwords do not match.' });
    return;
    }

    if (form.password.length < 8) {
    setFieldErrors({ password: 'Password must be at least 8 characters.' });
    return;
    }

    setLoading(true);

    // Build the payload — only include fields relevant to the role
    const payload = {
    full_name: form.full_name,
    email: form.email,
    password: form.password,
    confirm_password: form.confirm_password,
    role: form.role,
    };

    if (form.role === 'student' && form.student_number) {
    payload.student_number = form.student_number;
    }

    if (form.role === 'workplace_supervisor' && form.organisation) {
    payload.organisation = form.organisation;
    }

    try {
    await api.post(ENDPOINTS.REGISTER, payload);
    setSuccess(true);
    // Redirect to login after 2 seconds
    setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
    if (err.response?.data) {
        const data = err.response.data;
        // DRF returns field errors as { field_name: ["error message"] }
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
        <div className="auth-form-container" style={{ textAlign: 'center'}}>
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
            Internship Logging & Evaluation System — track placements,
            submit weekly logs, and manage evaluations in one place.
        </p>
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
                className={`role-btn ${form.role === role.value ? 'active' : ''}`}
                onClick={() => handleRoleChange(role.value)}
            >
                {role.label}
            </button>
            ))}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>

            <div className="auth-field">
            <label className="auth-label" htmlFor="full_name">Full Name</label>
            <input
                id="full_name"
                name="full_name"
                type="text"
                className="auth-input"
                placeholder="Enter your full name"
                value={form.full_name}
                onChange={handleChange}
                required
            />
            {fieldErrors.full_name && (
                <div className="auth-field-error">{fieldErrors.full_name}</div>
            )}
            </div>

            <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input
                id="email"
                name="email"
                type="email"
                className="auth-input"
                placeholder="Enter your email"
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
                placeholder="e.g. 21/U/12345/PS"
                value={form.student_number}
                onChange={handleChange}
                />
                {fieldErrors.student_number && (
                <div className="auth-field-error">{fieldErrors.student_number}</div>
                )}
            </div>
            )}

            <div className="auth-field">
            <label className="auth-label" 
                htmlFor="password">Password
            </label>
            <input
                id="password"
                name="password"
                type="password"
                className="auth-input"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                required
            />
            {fieldErrors.password && (
                <div className="auth-field-error">{fieldErrors.password}</div>
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
                placeholder="Re-enter your password"
                value={form.confirm_password}
                onChange={handleChange}
                required
            />
            {fieldErrors.confirm_password && (
                <div className="auth-field-error">{fieldErrors.confirm_password}</div>)}
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
