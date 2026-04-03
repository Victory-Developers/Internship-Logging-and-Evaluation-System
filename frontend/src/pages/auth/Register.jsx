import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
} from '@mui/material';
import { registerApi } from '../../api/auth';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', role: 'student', password: '', confirm_password: '',
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await registerApi(form);
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(' ') : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F6F8' }}>
        <Card sx={{ maxWidth: 420, mx: 2, p: 2 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Account Created!</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your account is pending admin approval. You'll receive an email once approved.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/login')}>Back to Sign In</Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F6F8' }}>
      <Card sx={{ width: '100%', maxWidth: 440, mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1 }}>ILES</Typography>
            <Typography variant="body2" color="text.secondary">Create your account — pending admin approval</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField label="First Name" name="first_name" fullWidth required value={form.first_name} onChange={handleChange} />
              <TextField label="Last Name"  name="last_name"  fullWidth required value={form.last_name}  onChange={handleChange} />
            </Box>
            <TextField label="Email Address" name="email" type="email" fullWidth required value={form.email} onChange={handleChange} sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select name="role" value={form.role} label="Role" onChange={handleChange}>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="workplace_supervisor">Workplace Sup.</MenuItem>
                <MenuItem value="academic_supervisor">Academic Sup.</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Password"         name="password"         type="password" fullWidth required value={form.password}         onChange={handleChange} sx={{ mb: 2 }} />
            <TextField label="Confirm Password" name="confirm_password" type="password" fullWidth required value={form.confirm_password} onChange={handleChange} sx={{ mb: 3 }} />

            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2.5, color: 'text.secondary' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1B4F72', fontWeight: 600 }}>Sign in</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}