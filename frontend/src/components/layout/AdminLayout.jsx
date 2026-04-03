import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Avatar, IconButton,
  Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People, WorkOutline, Description,
  BarChart, ErrorOutline, Person, Logout, Menu as MenuIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 248;

const NAV_MAIN = [
  { to: '/dashboard/admin', label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, end: true },
  { to: '/dashboard/admin/users', label: 'Users', icon: <People fontSize="small" /> },
  { to: '/dashboard/admin/placements', label: 'Placements', icon: <WorkOutline fontSize="small" /> },
  { to: '/dashboard/admin/logs', label: 'All Logs', icon: <Description fontSize="small" /> },
  { to: '/dashboard/admin/reports', label: 'Reports', icon: <BarChart fontSize="small" /> },
];

const NAV_SYSTEM = [
  { to: '/dashboard/admin/error-reference', label: 'Error Reference', icon: <ErrorOutline fontSize="small" /> },
  { to: '/dashboard/admin/profile', label: 'Profile', icon: <Person fontSize="small" /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'AU'
    : 'AU';
  const displayName = user
    ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'Admin User'
    : 'Admin User';

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0f172a' }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1rem', color: '#fff',
          }}>I</Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', letterSpacing: '0.04em', lineHeight: 1.2 }}>
              ILES
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Admin Panel
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 1.5 }}>
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: '#475569', letterSpacing: '0.12em', px: 1, mb: 0.5 }}>
          MAIN
        </Typography>
        <List dense disablePadding>
          {NAV_MAIN.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <ListItem disablePadding sx={{ mb: '2px' }}>
                  <ListItemButton
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: 2, py: 0.8,
                      position: 'relative',
                      bgcolor: isActive ? 'rgba(99,102,241,0.18)' : 'transparent',
                      color: isActive ? '#818cf8' : '#94a3b8',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: '#e2e8f0' },
                      '&::before': isActive ? {
                        content: '""', position: 'absolute', left: 0, top: '20%', bottom: '20%',
                        width: 3, bgcolor: '#6366f1', borderRadius: '0 3px 3px 0',
                      } : {},
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>{icon}</ListItemIcon>
                    <ListItemText primary={label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
                  </ListItemButton>
                </ListItem>
              )}
            </NavLink>
          ))}
        </List>

        <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: '#475569', letterSpacing: '0.12em', px: 1, mt: 2, mb: 0.5 }}>
          SYSTEM
        </Typography>
        <List dense disablePadding>
          {NAV_SYSTEM.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <ListItem disablePadding sx={{ mb: '2px' }}>
                  <ListItemButton
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: 2, py: 0.8,
                      bgcolor: isActive ? 'rgba(99,102,241,0.18)' : 'transparent',
                      color: isActive ? '#818cf8' : '#94a3b8',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: '#e2e8f0' },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>{icon}</ListItemIcon>
                    <ListItemText primary={label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
                  </ListItemButton>
                </ListItem>
              )}
            </NavLink>
          ))}
        </List>
      </Box>

      {/* User card */}
      <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: '0.7rem', fontWeight: 700, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          {initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayName}
          </Typography>
          <Typography sx={{ fontSize: '0.6rem', color: '#6366f1', fontWeight: 600, letterSpacing: '0.1em' }}>
            ADMIN
          </Typography>
        </Box>
        <Tooltip title="Sign out">
          <IconButton size="small" onClick={handleLogout} sx={{ color: '#475569', '&:hover': { color: '#f87171' } }}>
            <Logout fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f0f2f5' }}>
      {/* Permanent drawer on desktop */}
      {!isMobile && (
        <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' } }}>
          {drawerContent}
        </Drawer>
      )}

      {/* Temporary drawer on mobile */}
      {isMobile && (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}>
          {drawerContent}
        </Drawer>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
          <Toolbar sx={{ minHeight: '56px !important', px: { xs: 2, md: 3 } }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1, color: '#6b7280' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography sx={{ flex: 1, fontWeight: 600, fontSize: '0.95rem', color: '#111827' }}>
              Internship Logging & Evaluation
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', fontWeight: 700, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {initials}
              </Avatar>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                {displayName}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 2.5 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}