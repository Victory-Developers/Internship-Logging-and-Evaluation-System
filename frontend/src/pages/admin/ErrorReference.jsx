import {
  Box, Card, CardContent, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, Grid, Chip, Link, Stack,
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';

const HTTP_CODES = [
  { code: '200 / 201', meaning: 'Success',          action: 'Update UI state, show success toast notification',              type: 'success' },
  { code: '400',       meaning: 'Validation Error',  action: 'Show field-level error messages from response body',           type: 'warning' },
  { code: '401',       meaning: 'Unauthorized',      action: 'Attempt token refresh; if fails, redirect to login',           type: 'warning' },
  { code: '403',       meaning: 'Forbidden',         action: 'Show "You do not have permission for this action"',            type: 'error' },
  { code: '404',       meaning: 'Not Found',         action: 'Show "Record not found" message, navigate back',              type: 'error' },
  { code: '500',       meaning: 'Server Error',      action: 'Show generic error message, log to monitoring',               type: 'error' },
];

const ROLE_ROUTES = [
  { role: 'Student',          route: '/dashboard/student',   screens: ['Placement', 'Submit Log', 'Progress', 'Scores'],                         color: '#6366f1', light: '#eef2ff' },
  { role: 'Workplace Sup.',   route: '/dashboard/workplace', screens: ['Review Logs', 'Submit Performance Eval'],                                 color: '#10b981', light: '#ecfdf5' },
  { role: 'Academic Sup.',    route: '/dashboard/academic',  screens: ['Monitor Logs', 'Submit Academic Eval', 'Scores Overview'],                color: '#3b82f6', light: '#eff6ff' },
  { role: 'Admin',            route: '/dashboard/admin',     screens: ['Approve Users', 'Manage Placements', 'Reports'],                         color: '#8b5cf6', light: '#f5f3ff' },
];

const typeCfg = {
  success: { dotColor: '#10b981', rowBg: '#f0fdf4' },
  warning: { dotColor: '#f59e0b', rowBg: '#fffbeb' },
  error:   { dotColor: '#ef4444', rowBg: '#fef2f2' },
};

export default function ErrorReference() {
  return (
    <Box sx={{ maxWidth: 960 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#111827">Error Handling Reference</Typography>
        <Typography variant="body2" color="text.secondary">HTTP status codes and recommended UI actions</Typography>
      </Box>

      {/* HTTP Codes */}
      <Card elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography fontWeight={600} fontSize="0.95rem" mb={2}>HTTP Status Codes</Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#fafafa' }}>
                  {['Code', 'Meaning', 'Recommended UI Action'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {HTTP_CODES.map((row) => {
                  const cfg = typeCfg[row.type];
                  return (
                    <TableRow key={row.code} sx={{ bgcolor: cfg.rowBg, '&:hover': { filter: 'brightness(0.98)' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cfg.dotColor, flexShrink: 0 }} />
                          <Typography fontFamily="monospace" fontWeight={700} fontSize="0.875rem" whiteSpace="nowrap">{row.code}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600} fontSize="0.875rem" color="#374151" whiteSpace="nowrap">{row.meaning}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontSize="0.85rem" color="#6b7280" lineHeight={1.5}>{row.action}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      {/* Role-based routing */}
      <Card elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography fontWeight={600} fontSize="0.95rem" mb={2}>Role-Based Routing After Login</Typography>
          <Grid container spacing={2}>
            {ROLE_ROUTES.map(({ role, route, screens, color, light }) => (
              <Grid item xs={12} sm={6} key={role}>
                <Box sx={{ bgcolor: '#f9fafb', borderRadius: 2, p: 2, borderTop: `3px solid ${color}` }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1.5} flexWrap="wrap" gap={0.5}>
                    <Chip label={role} size="small" sx={{ bgcolor: light, color, fontWeight: 700, fontSize: '0.75rem' }} />
                    <Typography component="code" fontSize="0.75rem" color="#64748b" sx={{ bgcolor: '#f1f5f9', px: 1, py: 0.25, borderRadius: 1, fontFamily: 'monospace' }}>
                      {route}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5}>
                    {screens.map((s) => (
                      <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                        <Typography fontSize="0.82rem" color="#374151">{s}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* API Explorer */}
      <Card elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, bgcolor: '#fafbff' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Typography fontSize="2rem" lineHeight={1}>⚡</Typography>
            <Box>
              <Typography fontWeight={600} fontSize="0.95rem" mb={0.5}>Interactive API Explorer (Swagger UI)</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>Test every endpoint live:</Typography>
              <Link
                href="https://ssozihenry.pythonanywhere.com/api/docs/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem', color: '#6366f1', fontWeight: 500 }}
              >
                https://ssozihenry.pythonanywhere.com/api/docs/
                <OpenInNew fontSize="inherit" />
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}