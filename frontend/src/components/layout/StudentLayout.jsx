import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton,
  ListItemIcon, ListItemText, Avatar, Divider, IconButton,
  useTheme, useMediaQuery,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EditNoteIcon from "@mui/icons-material/EditNote";
import BusinessIcon from "@mui/icons-material/Business";
import StarIcon from "@mui/icons-material/Star";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../../context/AuthContext";

const DRAWER_WIDTH = 240;

const navItems = [
  { label: "Dashboard", Icon: DashboardIcon, to: "/dashboard/student" },
  { label: "My Logs", Icon: ListAltIcon, to: "/dashboard/student/logs" },
  { label: "Submit Log", Icon: EditNoteIcon, to: "/dashboard/student/logs/new" },
  { label: "My Placement", Icon: BusinessIcon, to: "/dashboard/student/placement" },
  { label: "My Scores", Icon: StarIcon, to: "/dashboard/student/scores" },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#1B4F72" }}>
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography variant="h6" sx={{ color: "#fff", fontWeight: 800 }}>ILES</Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
          Internship Logging and Evaluation
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />
      <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "#2ECC71", width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)" }}>Student</Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />
      <List sx={{ flex: 1, px: 1.5, py: 1 }}>
        {navItems.map(({ label, Icon, to }) => (
          <ListItemButton
            key={to}
            component={NavLink}
            to={to}
            end={to === "/dashboard/student"}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2, mb: 0.5, color: "rgba(255,255,255,0.7)",
              "&.active": { bgcolor: "rgba(255,255,255,0.15)", color: "#fff", "& .MuiListItemIcon-root": { color: "#2ECC71" } },
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "#fff" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}><Icon /></ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" } }}>
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {isMobile ? (
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}>
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer variant="permanent"
          sx={{ width: DRAWER_WIDTH, flexShrink: 0, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", border: "none" } }}>
          {drawerContent}
        </Drawer>
      )}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {isMobile && (
          <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
            <Toolbar>
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>ILES</Typography>
            </Toolbar>
          </AppBar>
        )}
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}