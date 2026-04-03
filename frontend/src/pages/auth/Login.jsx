import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { loginApi } from '../../api/auth';

const ROLES = ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'];
const ROLE_LABELS = {
  student: 'Student',
  workplace_supervisor: 'Workplace Sup.',
  academic_supervisor: 'Academic Sup.',
  admin: 'Admin',
};

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '', role: 'student' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await loginApi({ email: form.email, password: form.password, role: form.role });
      login(data.access, data.refresh, data.user);
      const routes = {
        student: '/dashboard/student',
        workplace_supervisor: '/dashboard/workplace',
        academic_supervisor: '/dashboard/academic',
        admin: '/dashboard/admin',
      };
      navigate(routes[data.user.role] ?? '/dashboard/student');
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F6F8' }}>
      <Card sx={{ width: '100%', maxWidth: 420, mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1 }}>ILES</Typography>
            <Typography variant="body2" color="text.secondary">Sign in to your account</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email Address" name="email" type="email" fullWidth required
              value={form.email} onChange={handleChange} sx={{ mb: 2 }}
            />
            <TextField
              label="Password" name="password" type="password" fullWidth required
              value={form.password} onChange={handleChange} sx={{ mb: 1 }}
            />
            <Box sx={{ textAlign: 'right', mb: 2 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: '#1B4F72' }}>Forgot password?</Link>
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Role</InputLabel>
              <Select name="role" value={form.role} label="Select Role" onChange={handleChange}>
                {ROLES.map((r) => <MenuItem key={r} value={r}>{ROLE_LABELS[r]}</MenuItem>)}
              </Select>
            </FormControl>

            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2.5, color: 'text.secondary' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1B4F72', fontWeight: 600 }}>Register here</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}