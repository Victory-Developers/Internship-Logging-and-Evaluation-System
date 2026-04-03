import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Divider,
  Avatar, TextField, Alert, CircularProgress, Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getLogById, addComment } from '../../api/logs';
import StatusChip from '../../components/common/StatusChip';
import { useAuth } from '../../context/AuthContext';

export default function LogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [log, setLog]         = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError]     = useState('');

  const fetchLog = () => {
    setLoading(true);
    getLogById(id)
      .then((res) => setLog(res.data))
      .catch(() => setError('Failed to load log.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLog(); }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await addComment(id, { content: comment });
      setComment('');
      fetchLog();
    } catch { setError('Failed to post comment.'); }
    finally { setPosting(false); }
  };

  if (loading) return <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard/student/logs')} sx={{ mb: 2 }}>
        Back to Logs
      </Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {log && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Week {log.week_number} Log — {log.week_of}
                </Typography>
                <StatusChip status={log.status} />
              </Box>
              <Divider sx={{ mb: 2 }} />
              {[
                { label: 'Activities This Week', value: log.activities },
                { label: 'What I Learned',       value: log.learning },
                { label: 'Challenges Faced',     value: log.challenges },
                { label: 'Plans for Next Week',  value: log.plans },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>{label}</Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.8 }}>{value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Comments ({log.comments?.length ?? 0})
              </Typography>
              {log.comments?.map((c) => (
                <Box key={c.id} sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
                  <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13 }}>
                    {c.author_name?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.author_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.created_at}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{c.content}</Typography>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box component="form" onSubmit={handleComment}>
                <TextField
                  label="Add Comment" multiline rows={2} fullWidth
                  value={comment} onChange={(e) => setComment(e.target.value)} sx={{ mb: 1.5 }}
                />
                <Button type="submit" variant="contained" disabled={posting}>
                  {posting ? <CircularProgress size={18} color="inherit" /> : 'Post Comment'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}