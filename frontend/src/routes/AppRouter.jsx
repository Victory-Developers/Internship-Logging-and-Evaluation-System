import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Auth
import Login          from '../pages/auth/Login';
import Register       from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Student
import StudentLayout   from '../components/layout/StudentLayout';
import StudentDashboard from '../pages/student/Dashboard';
import MyLogs          from '../pages/student/MyLogs';
import SubmitLog       from '../pages/student/SubmitLog';
import MyPlacement     from '../pages/student/MyPlacement';
import MyScores        from '../pages/student/MyScores';
import LogDetail       from '../pages/student/LogDetail';

// Admin
import AdminLayout     from '../components/layout/AdminLayout';
import AdminDashboard  from '../pages/admin/Dashboard';
import AdminUsers      from '../pages/admin/Users';
import AdminPlacements from '../pages/admin/Placements';
import AdminAllLogs    from '../pages/admin/AllLogs';
import AdminReports    from '../pages/admin/Reports';
import ErrorReference  from '../pages/admin/ErrorReference';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ─── Public ─────────────────────────────────────── */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ─── Student ─────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/dashboard/student" element={<StudentLayout />}>
            <Route index                element={<StudentDashboard />} />
            <Route path="logs"          element={<MyLogs />} />
            <Route path="logs/new"      element={<SubmitLog />} />
            <Route path="logs/:id"      element={<LogDetail />} />
            <Route path="logs/:id/edit" element={<SubmitLog />} />
            <Route path="placement"     element={<MyPlacement />} />
            <Route path="scores"        element={<MyScores />} />
          </Route>
        </Route>

        {/* ─── Admin ───────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/dashboard/admin" element={<AdminLayout />}>
            <Route index                  element={<AdminDashboard />} />
            <Route path="users"           element={<AdminUsers />} />
            <Route path="placements"      element={<AdminPlacements />} />
            <Route path="logs"            element={<AdminAllLogs />} />
            <Route path="reports"         element={<AdminReports />} />
            <Route path="error-reference" element={<ErrorReference />} />
          </Route>
        </Route>

        {/* ─── Fallback ────────────────────────────────────── */}
        <Route path="/"  element={<Navigate to="/login" replace />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}