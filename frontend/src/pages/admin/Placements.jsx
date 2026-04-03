import { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, FormControl, InputLabel, Select,
  MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Chip, Stack,
  IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Snackbar, Alert, Tooltip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getAllPlacements, createPlacement, updatePlacement, deletePlacement } from '../../api/admin';

const MOCK = [
  { id: 1, student_name: 'John Ssozi', company: 'Kampala Software Ltd', job_title: 'Junior Developer', wp_supervisor_name: 'R. Kato', ac_supervisor_name: 'Dr. Nakato', start_date: '2026-01-06', end_date: '2026-04-30', status: 'active' },
  { id: 2, student_name: 'Sarah Lubega', company: 'TechHub Uganda', job_title: 'UX Design Intern', wp_supervisor_name: 'M. Apio', ac_supervisor_name: 'Dr. Okello', start_date: '2026-01-06', end_date: '2026-04-30', status: 'active' },
  { id: 3, student_name: 'James Okello', company: 'Andela Uganda', job_title: 'Software Engineer', wp_supervisor_name: 'R. Kato', ac_supervisor_name: 'Dr. Nakato', start_date: '2026-01-06', end_date: '2026-04-30', status: 'active' },
  { id: 4, student_name: 'Grace Atim', company: 'Airtel Uganda', job_title: 'Network Intern', wp_supervisor_name: 'P. Ssozi', ac_supervisor_name: 'Dr. Apio', start_date: '2026-02-02', end_date: '2026-05-30', status: 'active' },
  { id: 5, student_name: 'Mary Apio', company: 'MTN Uganda', job_title: 'Data Analyst Intern', wp_supervisor_name: 'B. Nkosi', ac_supervisor_name: 'Dr. Nakato', start_date: '2026-01-15', end_date: '2026-05-15', status: 'completed' },
];

const EMPTY = { student: '', company: '', job_title: '', wp_supervisor: '', ac_supervisor: '', start_date: '', end_date: '' };

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const statusChip = (s) => {
  const map = { active: { label: 'Active', color: 'success' }, completed: { label: 'Completed', color: 'primary' }, inactive: { label: 'Inactive', color: 'default' } };
  const cfg = map[s] ?? { label: s, color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size="small" variant="outlined" sx={{ fontSize: '0.72rem', fontWeight: 600 }} />;
};

export default function AdminPlacements() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null); // null | { mode, id? }
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [snack, setSnack] = useState(null);

  const fetchPlacements = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await getAllPlacements(params);
      setPlacements(res.data?.results ?? res.data ?? []);
    } catch { setPlacements(statusFilter ? MOCK.filter((p) => p.status === statusFilter) : MOCK); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchPlacements(); }, [fetchPlacements]);

  const openCreate = () => { setForm(EMPTY); setModal({ mode: 'create' }); };
  const openEdit = (p) => {
    setForm({ student: p.student ?? '', company: p.company ?? '', job_title: p.job_title ?? '', wp_supervisor: p.wp_supervisor ?? '', ac_supervisor: p.ac_supervisor ?? '', start_date: p.start_date ?? '', end_date: p.end_date ?? '' });
    setModal({ mode: 'edit', id: p.id });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        const res = await createPlacement(form);
        setPlacements((p) => [...p, res.data]);
      } else {
        const res = await updatePlacement(modal.id, form);
        setPlacements((p) => p.map((x) => x.id === modal.id ? res.data : x));
      }
      setSnack({ msg: `Placement ${modal.mode === 'create' ? 'created' : 'updated'}.`, severity: 'success' });
    } catch {
      // mock
      if (modal.mode === 'create') {
        setPlacements((p) => [...p, { ...form, id: Date.now(), student_name: form.student, wp_supervisor_name: form.wp_supervisor, ac_supervisor_name: form.ac_supervisor, status: 'active' }]);
      } else {
        setPlacements((p) => p.map((x) => x.id === modal.id ? { ...x, ...form, student_name: form.student || x.student_name, wp_supervisor_name: form.wp_supervisor || x.wp_supervisor_name, ac_supervisor_name: form.ac_supervisor || x.ac_supervisor_name } : x));
      }
      setSnack({ msg: `Placement ${modal.mode === 'create' ? 'created' : 'updated'}.`, severity: 'success' });
    } finally {
      setSaving(false);
      setModal(null);
    }
  };

  const handleDelete = async () => {
    try { await deletePlacement(deleteId); } catch { /* mock */ }
    setPlacements((p) => p.filter((x) => x.id !== deleteId));
    setSnack({ msg: 'Placement deleted.', severity: 'info' });
    setDeleteId(null);
  };

  const field = (key, label, placeholder, type = 'text') => (
    <TextField
      key={key} label={label} placeholder={placeholder} type={type}
      value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      size="small" fullWidth
      InputLabelProps={type === 'date' ? { shrink: true } : {}}
      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
    />
  );

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#111827">Placements</Typography>
          <Typography variant="body2" color="text.secondary">Manage all student placements and supervisor assignments</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>
          New Placement
        </Button>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)} sx={{ borderRadius: 2 }}>
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Card elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
          ) : placements.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}><Typography variant="body2" color="text.secondary">No placements found.</Typography></Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    {['Student', 'Company', 'Job Title', 'WP Sup.', 'AC Sup.', 'Start', 'End', 'Status', ''].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {placements.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell><Typography fontSize="0.875rem" fontWeight={600} whiteSpace="nowrap">{p.student_name ?? p.student}</Typography></TableCell>
                      <TableCell><Typography fontSize="0.82rem" color="text.secondary" whiteSpace="nowrap">{p.company}</Typography></TableCell>
                      <TableCell><Typography fontSize="0.82rem" color="text.secondary" whiteSpace="nowrap">{p.job_title}</Typography></TableCell>
                      <TableCell><Typography fontSize="0.82rem" color="text.secondary" whiteSpace="nowrap">{p.wp_supervisor_name ?? p.wp_supervisor}</Typography></TableCell>
                      <TableCell><Typography fontSize="0.82rem" color="text.secondary" whiteSpace="nowrap">{p.ac_supervisor_name ?? p.ac_supervisor}</Typography></TableCell>
                      <TableCell><Typography fontSize="0.82rem" color="text.secondary" whiteSpace="nowrap">{fmt(p.start_date)}</Typography></TableCell>
                      <TableCell><Typography fontSize="0.82rem" color="text.secondary" whiteSpace="nowrap">{fmt(p.end_date)}</Typography></TableCell>
                      <TableCell>{statusChip(p.status)}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p)} sx={{ color: '#6366f1' }}><Edit fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteId(p.id)} sx={{ color: '#ef4444' }}><Delete fontSize="small" /></IconButton></Tooltip>
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

      {/* Create / Edit dialog */}
      <Dialog open={!!modal} onClose={() => setModal(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{modal?.mode === 'create' ? 'New Placement' : 'Edit Placement'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>{field('student', 'Student', 'e.g. John Ssozi')}</Grid>
            <Grid item xs={12}>{field('company', 'Company', 'e.g. Kampala Software Ltd')}</Grid>
            <Grid item xs={12}>{field('job_title', 'Job Title', 'e.g. Junior Developer')}</Grid>
            <Grid item xs={12} sm={6}>{field('wp_supervisor', 'WP Supervisor', 'e.g. Mr. Kato Robert')}</Grid>
            <Grid item xs={12} sm={6}>{field('ac_supervisor', 'Academic Supervisor', 'e.g. Dr. Nakato Amina')}</Grid>
            <Grid item xs={12} sm={6}>{field('start_date', 'Start Date', '', 'date')}</Grid>
            <Grid item xs={12} sm={6}>{field('end_date', 'End Date', '', 'date')}</Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setModal(null)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>
            {saving ? 'Saving…' : 'Save Placement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Delete Placement?</DialogTitle>
        <DialogContent><Typography variant="body2" color="text.secondary">This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack?.severity} onClose={() => setSnack(null)} variant="filled" sx={{ borderRadius: 2 }}>{snack?.msg}</Alert>
      </Snackbar>
    </Box>
  );
}