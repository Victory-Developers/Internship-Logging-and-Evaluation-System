import { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Select, MenuItem,
  FormControl, InputLabel, InputAdornment, Table, TableHead, TableRow,
  TableCell, TableBody, Avatar, Chip, Button, Stack, CircularProgress,
  Snackbar, Alert, IconButton, Tooltip,
} from '@mui/material';
import { Search, Refresh, CheckCircle, Cancel, Visibility } from '@mui/icons-material';
import { getAllUsers, approveUser, rejectUser } from '../../api/admin';

const MOCK_USERS = [
  { id: 1, first_name: 'John', last_name: 'Ssozi', email: 'student@iles.ug', role: 'student', status: 'active', date_joined: '2026-01-06' },
  { id: 2, first_name: 'Amina', last_name: 'Nakato', email: 'amina@iles.ug', role: 'student', status: 'pending', date_joined: '2026-03-25' },
  { id: 3, first_name: 'Robert', last_name: 'Kato', email: 'supervisor@iles.ug', role: 'workplace_supervisor', status: 'active', date_joined: '2026-01-05' },
  { id: 4, first_name: 'Dr. Nakato', last_name: 'Amina', email: 'academic@iles.ug', role: 'academic_supervisor', status: 'active', date_joined: '2026-01-04' },
  { id: 5, first_name: 'Grace', last_name: 'Atim', email: 'grace@iles.ug', role: 'student', status: 'rejected', date_joined: '2026-03-20' },
  { id: 6, first_name: 'James', last_name: 'Okello', email: 'james@iles.ug', role: 'workplace_supervisor', status: 'pending', date_joined: '2026-03-22' },
  { id: 7, first_name: 'Sarah', last_name: 'Lubega', email: 'sarah@iles.ug', role: 'student', status: 'active', date_joined: '2026-01-08' },
  { id: 8, first_name: 'Mary', last_name: 'Apio', email: 'mary@iles.ug', role: 'student', status: 'active', date_joined: '2026-01-10' },
];

const roleLabel = (r) => ({ student: 'Student', workplace_supervisor: 'Workplace Sup.', academic_supervisor: 'Academic Sup.', admin: 'Admin' }[r] ?? r);

const statusChip = (status) => {
  const map = {
    active:   { label: 'Active',   color: 'success' },
    pending:  { label: 'Pending',  color: 'warning' },
    rejected: { label: 'Rejected', color: 'error' },
  };
  const cfg = map[status] ?? { label: status, color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size="small" variant="outlined" sx={{ fontSize: '0.72rem', fontWeight: 600 }} />;
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [snack, setSnack] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await getAllUsers(params);
      setUsers(res.data?.results ?? res.data ?? []);
    } catch { setUsers(MOCK_USERS); }
    finally { setLoading(false); }
  }, [roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (id, action) => {
    setActionLoading((p) => ({ ...p, [id]: action }));
    try {
      if (action === 'approve') await approveUser(id);
      else await rejectUser(id);
      setUsers((p) => p.map((u) => u.id === id ? { ...u, status: action === 'approve' ? 'active' : 'rejected' } : u));
      setSnack({ msg: `User ${action}d successfully.`, severity: 'success' });
    } catch { setSnack({ msg: 'Action failed.', severity: 'error' }); }
    finally { setActionLoading((p) => { const n = { ...p }; delete n[id]; return n; }); }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <Box sx={{ maxWidth: 1200 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#111827">All Users</Typography>
          <Typography variant="body2" color="text.secondary">Manage accounts across all roles</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchUsers} sx={{ textTransform: 'none', borderRadius: 2 }}>
          Refresh
        </Button>
      </Box>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: '#9ca3af' }} /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)} sx={{ borderRadius: 2 }}>
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="workplace_supervisor">Workplace Sup.</MenuItem>
            <MenuItem value="academic_supervisor">Academic Sup.</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)} sx={{ borderRadius: 2 }}>
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Table */}
      <Card elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="body2" color="text.secondary">No users found matching your filters.</Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 30, height: 30, fontSize: '0.68rem', fontWeight: 700, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                            {u.first_name?.[0]}{u.last_name?.[0]}
                          </Avatar>
                          <Typography fontSize="0.875rem" fontWeight={600} color="#111827" whiteSpace="nowrap">
                            {u.first_name} {u.last_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Typography fontSize="0.82rem" color="text.secondary">{u.email}</Typography></TableCell>
                      <TableCell><Chip label={roleLabel(u.role)} size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontSize: '0.7rem', fontWeight: 600 }} /></TableCell>
                      <TableCell>{statusChip(u.status)}</TableCell>
                      <TableCell><Typography fontSize="0.82rem" color="text.secondary" whiteSpace="nowrap">{fmt(u.date_joined)}</Typography></TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {u.status === 'pending' && (
                            <>
                              <Button size="small" variant="outlined" color="success" disabled={!!actionLoading[u.id]} onClick={() => handleAction(u.id, 'approve')} sx={{ textTransform: 'none', fontSize: '0.75rem', px: 1 }} startIcon={<CheckCircle fontSize="inherit" />}>
                                {actionLoading[u.id] === 'approve' ? '…' : 'Approve'}
                              </Button>
                              <Button size="small" variant="outlined" color="error" disabled={!!actionLoading[u.id]} onClick={() => handleAction(u.id, 'reject')} sx={{ textTransform: 'none', fontSize: '0.75rem', px: 1 }} startIcon={<Cancel fontSize="inherit" />}>
                                {actionLoading[u.id] === 'reject' ? '…' : 'Reject'}
                              </Button>
                            </>
                          )}
                          {u.status === 'rejected' && (
                            <Button size="small" variant="outlined" color="primary" disabled={!!actionLoading[u.id]} onClick={() => handleAction(u.id, 'approve')} sx={{ textTransform: 'none', fontSize: '0.75rem', px: 1 }}>
                              {actionLoading[u.id] ? '…' : 'Re-Approve'}
                            </Button>
                          )}
                          {u.status === 'active' && (
                            <Tooltip title="View user">
                              <IconButton size="small" sx={{ color: '#6b7280' }}><Visibility fontSize="small" /></IconButton>
                            </Tooltip>
                          )}
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

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack?.severity} onClose={() => setSnack(null)} variant="filled" sx={{ borderRadius: 2 }}>{snack?.msg}</Alert>
      </Snackbar>
    </Box>
  );
}