import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Tab, Tabs,
  Table, TableBody, TableCell, TableHead, TableRow, Skeleton, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getMyLogs } from '../../api/logs';
import StatusChip    from '../../components/common/StatusChip';

const TABS = ['all', 'approved', 'pending', 'rejected', 'draft'];

export default function MyLogs() {
  const navigate = useNavigate();
  const [tab, setTab]       = useState(0);
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    const params = TABS[tab] !== 'all' ? { status: TABS[tab] } : {};
    getMyLogs(params)
      .then((res) => setLogs(res.data?.results ?? res.data ?? []))
      .catch(() => setError('Failed to load logs.'))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>My Weekly Logs</Typography>
          <Typography variant="body2" color="text.secondary">All submitted log entries and their current status</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/dashboard/student/logs/new')}>
          New Log
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto">
            {TABS.map((t, i) => (
              <Tab key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} value={i} />
            ))}
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? <Skeleton variant="rectangular" height={240} /> : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Week</b></TableCell>
                  <TableCell><b>Week Of</b></TableCell>
                  <TableCell><b>Activities Summary</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell><b>Comments</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>Week {log.week_number}</TableCell>
                    <TableCell>{log.week_of}</TableCell>
                    <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.activities}
                    </TableCell>
                    <TableCell><StatusChip status={log.status} /></TableCell>
                    <TableCell>{log.comments_count ?? 0}</TableCell>
                    <TableCell>
                      {log.status === 'rejected' || log.status === 'draft' ? (
                        <Button size="small" variant="outlined" onClick={() => navigate(`/dashboard/student/logs/${log.id}/edit`)}>
                          {log.status === 'rejected' ? 'Edit & Resubmit' : 'Edit / Submit'}
                        </Button>
                      ) : (
                        <Button size="small" onClick={() => navigate(`/dashboard/student/logs/${log.id}`)}>
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}