import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Avatar,
  Table, TableHead, TableRow, TableCell, TableBody, Chip,
  CircularProgress, LinearProgress, Stack, Divider,
} from '@mui/material';
import {
  People, WorkOutline, Description, AccessTime,
  CheckCircleOutline, CancelOutlined, TrendingUp,
} from '@mui/icons-material';
import { getPendingUsers, approveUser, rejectUser, getReports } from '../../api/admin';

const MOCK_PENDING = [
  { id: 1, first_name: 'Amina', last_name: 'Nakato', role: 'student', email: 'amina@iles.ug' },
  { id: 2, first_name: 'Robert', last_name: 'Kato', role: 'academic_supervisor', email: 'robert@iles.ug' },
  { id: 3, first_name: 'Sarah', last_name: 'Lubega', role: 'student', email: 'sarah@iles.ug' },
  { id: 4, first_name: 'James', last_name: 'Okello', role: 'workplace_supervisor', email: 'james@iles.ug' },
  { id: 5, first_name: 'Grace', last_name: 'Atim', role: 'student', email: 'grace@iles.ug' },
];

const MOCK_REPORT = { total_users: 42, pending_approval: 5, active_placements: 28, logs_this_week: 17, log_completion: 82, evaluation_rate: 67, active_placements_total: 34, pending_reviews: 12 };

const roleLabel = (r) => ({ student: 'Student', workplace_supervisor: 'Workplace Sup.', academic_supervisor: 'Academic Sup.', admin: 'Admin' }[r] ?? r);

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [pRes, rRes] = await Promise.all([getPendingUsers(), getReports()]);
        setPending(pRes.data?.results ?? pRes.data ?? []);
        setReport(rRes.data);
      } catch {
        setPending(MOCK_PENDING);
        setReport(MOCK_REPORT);
      } finally { setLoading(false); }
    })();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading((p) => ({ ...p, [id]: action }));
    try {
      if (action === 'approve') await approveUser(id);
      else await rejectUser(id);
      setPending((p) => p.filter((u) => u.id !== id));
    } catch { alert(`Failed to ${action} user.`); }
    finally { setActionLoading((p) => { const n = { ...p }; delete n[id]; return n; }); }
  };

  const r = report ?? MOCK_REPORT;

  const statCards = [
    { label: 'Total Users', value: r.total_users, icon: <People />, color: '#6366f1', light: '#eef2ff' },
    { label: 'Pending Approval', value: r.pending_approval, icon: <AccessTime />, color: '#f59e0b', light: '#fffbeb' },
    { label: 'Active Placements', value: r.active_placements, icon: <WorkOutline />, color: '#10b981', light: '#ecfdf5' },
    { label: 'Logs This Week', value: r.logs_this_week, icon: <Description />, color: '#3b82f6', light: '#eff6ff' },
  ];

  return (
    <Box sx={{ maxWidth: 1200 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#111827">Admin Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">System overview and pending user approvals</Typography>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map(({ label, value, icon, color, light }) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Card elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                <Avatar sx={{ bgcolor: light, color, width: 44, height: 44, borderRadius: 2 }}>
                  {icon}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#111827" lineHeight={1}>
                    {loading ? '—' : value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bottom two cols */}
      <Grid container spacing={2}>
        {/* Pending approvals */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography fontWeight={600} fontSize="0.95rem" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTime fontSize="small" color="warning" /> Pending User Approvals
                </Typography>
                <Button component={Link} to="/dashboard/admin/users" size="small" sx={{ textTransform: 'none', color: '#6366f1' }}>
                  View All →
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={28} /></Box>
              ) : pending.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircleOutline sx={{ color: '#10b981', fontSize: 36 }} />
                  <Typography variant="body2" color="text.secondary" mt={1}>No pending approvals</Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pending.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', fontWeight: 700, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                              {u.first_name?.[0]}{u.last_name?.[0]}
                            </Avatar>
                            <Box>
                              <Typography fontSize="0.85rem" fontWeight={600}>{u.first_name} {u.last_name}</Typography>
                              <Typography fontSize="0.72rem" color="text.secondary">{u.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={roleLabel(u.role)} size="small" sx={{ fontSize: '0.7rem', bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            <Button
                              size="small" variant="outlined" color="success"
                              disabled={!!actionLoading[u.id]}
                              onClick={() => handleAction(u.id, 'approve')}
                              sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                              startIcon={<CheckCircleOutline fontSize="inherit" />}
                            >
                              {actionLoading[u.id] === 'approve' ? '…' : 'Approve'}
                            </Button>
                            <Button
                              size="small" variant="outlined" color="error"
                              disabled={!!actionLoading[u.id]}
                              onClick={() => handleAction(u.id, 'reject')}
                              sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                              startIcon={<CancelOutlined fontSize="inherit" />}
                            >
                              {actionLoading[u.id] === 'reject' ? '…' : 'Reject'}
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System overview */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography fontWeight={600} fontSize="0.95rem" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUp fontSize="small" color="primary" /> System Overview
                </Typography>
                <Button component={Link} to="/dashboard/admin/reports" size="small" sx={{ textTransform: 'none', color: '#6366f1' }}>
                  Reports →
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={28} /></Box>
              ) : (
                <Stack spacing={2}>
                  <Grid container spacing={1.5}>
                    {[
                      { label: 'Pending Reviews', val: r.pending_reviews, color: '#f59e0b' },
                      { label: 'New This Week', val: r.logs_this_week, color: '#6366f1' },
                      { label: 'Completion', val: `${r.log_completion}%`, color: '#10b981' },
                      { label: 'Eval Rate', val: `${r.evaluation_rate}%`, color: '#3b82f6' },
                    ].map(({ label, val, color }) => (
                      <Grid item xs={6} key={label}>
                        <Box sx={{ bgcolor: '#f9fafb', borderRadius: 2, p: 1.25, textAlign: 'center' }}>
                          <Typography fontWeight={700} fontSize="1.35rem" color={color}>{val}</Typography>
                          <Typography fontSize="0.72rem" color="text.secondary">{label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider />

                  {[
                    { label: 'Log Completion', val: r.log_completion, color: '#10b981' },
                    { label: 'Evaluation Rate', val: r.evaluation_rate, color: '#f59e0b' },
                    { label: 'Active Placements', val: Math.round((r.active_placements / (r.active_placements_total || 34)) * 100), color: '#6366f1', sub: `${r.active_placements}/${r.active_placements_total ?? 34}` },
                  ].map(({ label, val, color, sub }) => (
                    <Box key={label}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography fontSize="0.82rem" fontWeight={500} color="#374151">{label}</Typography>
                        <Typography fontSize="0.82rem" fontWeight={600} color={color}>{sub ?? `${val}%`}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={val} sx={{ height: 6, borderRadius: 99, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 99 } }} />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}