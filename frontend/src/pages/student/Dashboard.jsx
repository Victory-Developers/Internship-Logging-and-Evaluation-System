import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button,
  Table, TableBody, TableCell, TableHead, TableRow,
  LinearProgress, Skeleton, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth }       from '../../context/AuthContext';
import { getMyLogs }     from '../../api/logs';
import { getMyPlacement } from '../../api/placements';
import StatusChip        from '../../components/common/StatusChip';

function StatCard({ label, value, color }) {
  return (
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [logs, setLogs]           = useState([]);
  const [placement, setPlacement] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    Promise.all([getMyLogs(), getMyPlacement()])
      .then(([logsRes, placRes]) => {
        setLogs(logsRes.data?.results ?? logsRes.data ?? []);
        setPlacement(placRes.data);
      })
      .catch((err) => {
  if (err.response?.status !== 404) setError('Failed to load dashboard data.');
})
      .finally(() => setLoading(false));
  }, []);

  const total    = logs.length;
  const approved = logs.filter((l) => l.status === 'approved').length;
  const pending  = logs.filter((l) => l.status === 'pending' || l.status === 'submitted').length;
  const rejected = logs.filter((l) => l.status === 'rejected').length;
  const recent   = [...logs].sort((a, b) => b.week_number - a.week_number).slice(0, 5);

  const currentWeek  = placement?.current_week ?? 0;
  const totalWeeks   = placement?.duration_weeks ?? 16;
  const progress     = totalWeeks ? Math.round((currentWeek / totalWeeks) * 100) : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Welcome back, {user?.first_name} {user?.last_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {placement?.company ?? 'No active placement'}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/dashboard/student/logs/new')}>
          Submit Log
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {loading ? [1,2,3,4].map((i) => (
          <Grid item xs={6} md={3} key={i}><Skeleton variant="rectangular" height={96} sx={{ borderRadius: 3 }} /></Grid>
        )) : (<>
          <Grid item xs={6} md={3}><StatCard label="Total Logs"  value={total}    color="primary.main" /></Grid>
          <Grid item xs={6} md={3}><StatCard label="Approved"    value={approved} color="success.main" /></Grid>
          <Grid item xs={6} md={3}><StatCard label="Pending"     value={pending}  color="warning.main" /></Grid>
          <Grid item xs={6} md={3}><StatCard label="Rejected"    value={rejected} color="error.main"   /></Grid>
        </>)}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent logs */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Recent Weekly Logs</Typography>
                <Button size="small" onClick={() => navigate('/dashboard/student/logs')}>View All →</Button>
              </Box>
              {loading ? <Skeleton variant="rectangular" height={180} /> : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Week</b></TableCell>
                      <TableCell><b>Activities</b></TableCell>
                      <TableCell><b>Status</b></TableCell>
                      <TableCell><b>Action</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recent.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>Week {log.week_number}</TableCell>
                        <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.activities}
                        </TableCell>
                        <TableCell><StatusChip status={log.status} /></TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => navigate(`/dashboard/student/logs/${log.id}`)}>
                            {log.status === 'rejected' ? 'Edit' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {recent.length === 0 && (
                      <TableRow><TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 3 }}>No logs yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Placement card */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>My Placement</Typography>
              {loading ? <Skeleton variant="rectangular" height={160} /> : placement ? (<>
                {[
                  { label: 'Company',        value: placement.company },
                  { label: 'Job Title',      value: placement.job_title },
                  { label: 'Start Date',     value: placement.start_date },
                  { label: 'End Date',       value: placement.end_date },
                  { label: 'WP Supervisor',  value: placement.workplace_supervisor_name },
                  { label: 'AC Supervisor',  value: placement.academic_supervisor_name },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{value ?? '—'}</Typography>
                  </Box>
                ))}
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Progress — Week {currentWeek} of {totalWeeks}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{progress}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </>) : (
                <Typography variant="body2" color="text.secondary">No placement assigned yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}