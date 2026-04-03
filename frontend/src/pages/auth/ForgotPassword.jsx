import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress,
} from '@mui/material';
import { forgotPasswordApi } from '../../api/auth';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPasswordApi({ email });
      setSent(true);
    } catch {
      setError('Could not send reset link. Please check the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F6F8' }}>
      <Card sx={{ width: '100%', maxWidth: 400, mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1 }}>ILES</Typography>
            <Typography variant="body2" color="text.secondary">Reset your password</Typography>
          </Box>

          {sent ? (
            <Alert severity="success">
              Reset link sent! Check your email — it expires in 30 minutes.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your email. We'll send a reset link — expires in 30 min.
              </Typography>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  label="Email Address" type="email" fullWidth required
                  value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 3 }}
                />
                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Send Reset Link'}
                </Button>
              </Box>
            </>
          )}

          <Box sx={{ mt: 2.5, textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: 13, color: '#1B4F72' }}>← Back to Sign In</Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}