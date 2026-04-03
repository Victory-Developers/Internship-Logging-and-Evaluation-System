import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, Avatar,
  Table, TableHead, TableRow, TableCell, TableBody, Chip,
  CircularProgress, LinearProgress, Stack,
} from '@mui/material';
import { Download, People, WorkOutline, Description, Star } from '@mui/icons-material';
import { getReports, getAdminScores } from '../../api/admin';

const MOCK_SCORES = [
  { id: 1, student_name: 'John Ssozi', placement: 'Kampala Software Ltd', total_logs: 8, approved_logs: 5, wp_score: 8.0, ac_score: 7.5, combined: 7.75, completion: 50 },
  { id: 2, student_name: 'James Okello', placement: 'Andela Uganda', total_logs: 9, approved_logs: 9, wp_score: 8.75, ac_score: 8.0, combined: 8.38, completion: 56 },
  { id: 3, student_name: 'Sarah Lubega', placement: 'TechHub Uganda', total_logs: 6, approved_logs: 4, wp_score: 7.25, ac_score: null, combined: null, completion: 38 },
  { id: 4, student_name: 'Mary Apio', placement: 'Airtel Uganda', total_logs: 5, approved_logs: 3, wp_score: 7.5, ac_score: null, combined: null, completion: 31 },
  { id: 5, student_name: 'Grace Atim', placement: 'Airtel Uganda', total_logs: 4, approved_logs: 2, wp_score: null, ac_score: null, combined: null, completion: 25 },
];
const MOCK_REPORT = { total_students: 34, wp_supervisors: 5, ac_supervisors: 3, active_placements: 28, total_logs: 142, evaluation_rate: 67 };

const scoreColor = (v) => v == null ? 'text.secondary' : v >= 8 ? '#059669' : v >= 6 ? '#d97706' : '#dc2626';
const scoreBg   = (v) => v == null ? 'transparent' : v >= 8 ? '#ecfdf5' : v >= 6 ? '#fffbeb' : '#fef2f2';

function ScoreChip({ value }) {
  if (value == null) return <Typography fontSize="0.82rem" color="text.secondary">—</Typography>;
  return (
    <Box sx={{ display: 'inline-block', bgcolor: scoreBg(value), color: scoreColor(value), px: 1, py: 0.25, borderRadius: 999, fontSize: '0.78rem', fontWeight: 700 }}>
      {value.toFixed(1)}
    </Box>
  );
}

export default function AdminReports() {
  const [report, setReport] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [r, s] = await Promise.all([getReports(), getAdminScores()]);
        setReport(r.data);
        setScores(s.data?.results ?? s.data ?? []);
      } catch { setReport(MOCK_REPORT); setScores(MOCK_SCORES); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleExport = () => {
    if (!scores.length) return;
    const headers = ['Student', 'Placement', 'Total Logs', 'Approved', 'WP Score', 'AC Score', 'Combined', 'Completion'];
    const rows = scores.map((s) => [s.student_name, s.placement, s.total_logs, s.approved_logs, s.wp_score ?? '—', s.ac_score ?? '—', s.combined ?? '—', `${s.completion}%`]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'iles_report.csv' });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const r = report ?? MOCK_REPORT;

  const statCards = [
    { label: 'Total Students', value: r.total_students, icon: <People />, color: '#6366f1', light: '#eef2ff' },
    { label: 'WP Supervisors', value: r.wp_supervisors, icon: <People />, color: '#3b82f6', light: '#eff6ff' },
    { label: 'AC Supervisors', value: r.ac_supervisors, icon: <People />, color: '#8b5cf6', light: '#f5f3ff' },
    { label: 'Active Placements', value: r.active_placements, icon: <WorkOutline />, color: '#10b981', light: '#ecfdf5' },
    { label: 'Total Logs', value: r.total_logs, icon: <Description />, color: '#f59e0b', light: '#fffbeb' },
    { label: 'Evaluation Rate', value: `${r.evaluation_rate}%`, icon: <Star />, color: '#ec4899', light: '#fdf2f8' },
  ];

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#111827">System Reports</Typography>
          <Typography variant="body2" color="text.secondary">Full snapshot — users, placements, logs, evaluations</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Download />} onClick={handleExport} sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#6366f1', color: '#6366f1', '&:hover': { borderColor: '#4f46e5', bgcolor: '#eef2ff' } }}>
          Export CSV
        </Button>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map(({ label, value, icon, color, light }) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={label}>
            <Card elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, px: 2 }}>
                <Avatar sx={{ bgcolor: light, color, width: 38, height: 38, borderRadius: 2 }}>{icon}</Avatar>
                <Box>
                  <Typography fontWeight={700} fontSize="1.3rem" color={color} lineHeight={1}>{loading ? '—' : value}</Typography>
                  <Typography fontSize="0.7rem" color="text.secondary">{label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Scores table */}
      <Card elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography fontWeight={600} fontSize="0.95rem">All Student Scores</Typography>
            <Chip label={`${scores.length} students`} size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }} />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    {['Student', 'Placement', 'Logs', 'Approved', 'WP Score', 'AC Score', 'Combined', 'Completion'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scores.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell><Typography fontSize="0.875rem" fontWeight={600} whiteSpace="nowrap">{s.student_name}</Typography></TableCell>
                      <TableCell><Typography fontSize="0.82rem" color="text.secondary" whiteSpace="nowrap">{s.placement}</Typography></TableCell>
                      <TableCell align="center"><Typography fontSize="0.85rem" fontWeight={500}>{s.total_logs}</Typography></TableCell>
                      <TableCell align="center"><Typography fontSize="0.85rem" fontWeight={500}>{s.approved_logs}</Typography></TableCell>
                      <TableCell><ScoreChip value={s.wp_score} /></TableCell>
                      <TableCell><ScoreChip value={s.ac_score} /></TableCell>
                      <TableCell>
                        {s.combined != null
                          ? <Typography fontSize="0.875rem" fontWeight={700} color={scoreColor(s.combined)}>{s.combined.toFixed(2)}</Typography>
                          : <Typography fontSize="0.82rem" color="text.secondary">—</Typography>}
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LinearProgress variant="determinate" value={s.completion} sx={{ flex: 1, height: 5, borderRadius: 99, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: s.completion >= 50 ? '#6366f1' : '#f59e0b', borderRadius: 99 } }} />
                          <Typography fontSize="0.75rem" fontWeight={600} color="#374151" whiteSpace="nowrap">{s.completion}%</Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}