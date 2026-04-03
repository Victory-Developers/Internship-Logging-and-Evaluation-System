import { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, InputAdornment,
  Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Button, CircularProgress, Stack,
} from '@mui/material';
import { Search, Visibility } from '@mui/icons-material';
import { getAllLogs } from '../../api/admin';

const MOCK_LOGS = [
  { id: 1, student_name: 'John Ssozi', week_of: '2026-03-24', activities: 'JWT auth endpoints, token refresh', status: 'draft', comments_count: 0 },
  { id: 2, student_name: 'John Ssozi', week_of: '2026-03-17', activities: 'Django REST API setup', status: 'approved', comments_count: 2 },
  { id: 3, student_name: 'Sarah Lubega', week_of: '2026-03-17', activities: 'Figma wireframes for mobile app', status: 'pending', comments_count: 0 },
  { id: 4, student_name: 'James Okello', week_of: '2026-03-17', activities: 'Node.js microservices setup', status: 'approved', comments_count: 1 },
  { id: 5, student_name: 'Mary Apio', week_of: '2026-03-10', activities: 'Sprint planning and Jira setup', status: 'rejected', comments_count: 1 },
  { id: 6, student_name: 'Grace Atim', week_of: '2026-03-10', activities: 'Network topology documentation', status: 'approved', comments_count: 0 },
  { id: 7, student_name: 'Sarah Lubega', week_of: '2026-03-10', activities: 'User research interviews', status: 'pending', comments_count: 0 },
  { id: 8, student_name: 'John Ssozi', week_of: '2026-03-10', activities: 'Database schema design', status: 'approved', comments_count: 1 },
];

const STATUS_TABS = ['all', 'approved', 'pending', 'rejected', 'draft'];

const statusChip = (s) => {
  const map = {
    approved: { label: 'Approved', color: 'success' },
    pending:  { label: 'Pending',  color: 'warning' },
    rejected: { label: 'Rejected', color: 'error' },
    draft:    { label: 'Draft',    color: 'default' },
    submitted:{ label: 'Submitted',color: 'info' },
  };
  const cfg = map[s] ?? { label: s, color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size="small" variant="outlined" sx={{ fontSize: '0.7rem', fontWeight: 600 }} />;
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function AdminAllLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const activeStatus = STATUS_TABS[tabIndex];

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeStatus !== 'all' ? { status: activeStatus } : {};
      const res = await getAllLogs(params);
      setLogs(res.data?.results ?? res.data ?? []);
    } catch {
      setLogs(activeStatus === 'all' ? MOCK_LOGS : MOCK_LOGS.filter((l) => l.status === activeStatus));
    } finally { setLoading(false); }
  }, [activeStatus]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return !q || l.student_name?.toLowerCase().includes(q) || l.activities?.toLowerCase().includes(q);
  });

  const summaryItems = [
    { label: 'Total', value: MOCK_LOGS.length, color: '#6366f1' },
    { label: 'Approved', value: MOCK_LOGS.filter((l) => l.status === 'approved').length, color: '#10b981' },
    { label: 'Pending', value: MOCK_LOGS.filter((l) => l.status === 'pending').length, color: '#f59e0b' },
    { label: 'Rejected', value: MOCK_LOGS.filter((l) => l.status === 'rejected').length, color: '#ef4444' },
  ];

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#111827">All Logs</Typography>
        <Typography variant="body2" color="text.secondary">View and monitor all student weekly log submissions</Typography>
      </Box>

      {/* Summary pills */}
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
        {summaryItems.map(({ label, value, color }) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: '#fff', border: '1px solid #f3f4f6', borderRadius: 999, px: 2, py: 0.5, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
            <Typography fontSize="0.82rem" color="text.secondary">{label}</Typography>
            <Typography fontSize="0.82rem" fontWeight={700} color={color}>{value}</Typography>
          </Box>
        ))}
      </Stack>

      {/* Tabs + search */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          sx={{
            bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2, minHeight: 36,
            '& .MuiTab-root': { textTransform: 'capitalize', minHeight: 36, fontSize: '0.85rem', fontWeight: 500, px: 2, py: 0.75 },
            '& .Mui-selected': { bgcolor: '#6366f1', color: '#fff !important', borderRadius: 1.5 },
            '& .MuiTabs-indicator': { display: 'none' },
          }}
        >
          {STATUS_TABS.map((t) => (
            <Tab key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} />
          ))}
        </Tabs>
        <TextField
          placeholder="Search student or activities…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: '#9ca3af' }} /></InputAdornment> }}
        />
      </Box>

      <Card elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}><Typography variant="body2" color="text.secondary">No logs found.</Typography></Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    {['Student', 'Week Of', 'Activities Summary', 'Status', 'Comments', 'Action'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={l.id} hover>
                      <TableCell><Typography fontSize="0.875rem" fontWeight={600} whiteSpace="nowrap">{l.student_name}</Typography></TableCell>
                      <TableCell><Typography fontSize="0.82rem" color="text.secondary" whiteSpace="nowrap">{fmt(l.week_of)}</Typography></TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography fontSize="0.82rem" color="#374151" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {l.activities}
                        </Typography>
                      </TableCell>
                      <TableCell>{statusChip(l.status)}</TableCell>
                      <TableCell align="center"><Typography fontSize="0.82rem" color="text.secondary">{l.comments_count ?? 0}</Typography></TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" startIcon={<Visibility fontSize="inherit" />} sx={{ textTransform: 'none', fontSize: '0.75rem', borderRadius: 1.5 }}>
                          View
                        </Button>
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