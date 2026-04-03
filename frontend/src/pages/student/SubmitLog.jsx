import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, CircularProgress, Divider, Paper,
} from '@mui/material';
import SaveIcon   from '@mui/icons-material/Save';
import SendIcon   from '@mui/icons-material/Send';
import { createLog, updateLog, submitLog, getLogById } from '../../api/logs';

const EMPTY = { week_of: '', activities: '', learning: '', challenges: '', plans: '' };

const STATUS_GUIDE = [
  { status: 'Draft',     desc: 'Saved, not yet submitted' },
  { status: 'Submitted', desc: 'Awaiting supervisor review' },
  { status: 'Approved',  desc: 'Cleared by supervisor' },
  { status: 'Rejected',  desc: 'Needs revision & resubmit' },
];

export default function SubmitLog() {
  const { id }   = useParams();   // present when editing
  const navigate = useNavigate();
  const [form, setForm]         = useState(EMPTY);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    if (!id) return;
    getLogById(id)
      .then((res) => {
        const d = res.data;
        setForm({ week_of: d.week_of, activities: d.activities, learning: d.learning, challenges: d.challenges, plans: d.plans });
      })
      .catch(() => setError('Failed to load log.'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (andSubmit = false) => {
    setError(''); setSuccess('');
    setLoading(true);
    try {
      let logId = id;
      if (!logId) {
        const res = await createLog(form);
        logId = res.data.id;
      } else {
        await updateLog(logId, form);
      }
      if (andSubmit) {
        await submitLog(logId);
        setSuccess('Log submitted for review!');
        setTimeout(() => navigate('/dashboard/student/logs'), 1500);
      } else {
        setSuccess('Draft saved.');
        setTimeout(() => navigate('/dashboard/student/logs'), 1200);
      }
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Save failed.');
    } finally {
      setLoading(false);
    }
  };

  const title = id ? 'Edit Weekly Log' : `Submit Weekly Log`;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fill in each section, save as draft, or submit for review
      </Typography>

      {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Form */}
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            {fetching ? <CircularProgress /> : (
              <>
                <TextField
                  label="Week Of" name="week_of" type="date" fullWidth required
                  InputLabelProps={{ shrink: true }} value={form.week_of}
                  onChange={handleChange} sx={{ mb: 2.5 }}
                />
                {[
                  { name: 'activities',  label: 'Activities This Week' },
                  { name: 'learning',    label: 'What I Learned' },
                  { name: 'challenges',  label: 'Challenges Faced' },
                  { name: 'plans',       label: 'Plans for Next Week' },
                ].map((field) => (
                  <TextField
                    key={field.name} name={field.name} label={field.label}
                    multiline rows={3} fullWidth required
                    value={form[field.name]} onChange={handleChange} sx={{ mb: 2.5 }}
                  />
                ))}

                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" startIcon={<SaveIcon />} onClick={() => save(false)} disabled={loading}>
                    Save Draft
                  </Button>
                  <Button variant="contained" startIcon={<SendIcon />} onClick={() => save(true)} disabled={loading}>
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Submit Log'}
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status guide */}
        <Paper variant="outlined" sx={{ width: { xs: '100%', md: 220 }, p: 2.5, height: 'fit-content', borderRadius: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Log Status Guide</Typography>
          {STATUS_GUIDE.map(({ status, desc }) => (
            <Box key={status} sx={{ mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{status}</Typography>
              <Typography variant="caption" color="text.secondary">{desc}</Typography>
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  );
}