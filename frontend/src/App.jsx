import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student pages
// import StudentDashboard from './pages/student/Dashboard';
// import StudentPlacement from './pages/student/Placement';
// import StudentWeeklyLogs from './pages/student/WeeklyLogs';
// import StudentCreateLog from './pages/student/CreateLog';
// import StudentEditLog from './pages/student/EditLog';
// import StudentViewLog from './pages/student/ViewLog';
// import StudentScores from './pages/student/Scores';

// Academic Supervisor pages
// import SupervisorDashboard from './pages/supervisor/Dashboard';
// import SupervisorStudents from './pages/supervisor/Students';
// import SupervisorPendingReviews from './pages/supervisor/PendingReviews';
// import SupervisorReviewLog from './pages/supervisor/ReviewLog';
// import SupervisorScoresOverview from './pages/supervisor/ScoresOverview';
// import SupervisorEvaluationForm from './pages/supervisor/EvaluationForm';

// Admin pages
// import AdminDashboard from './pages/admin/Dashboard';
// import AdminUsers from './pages/admin/Users';
// import AdminPlacements from './pages/admin/Placements';
// import AdminCreatePlacement from './pages/admin/CreatePlacement';
// import AdminReports from './pages/admin/Reports';

// Layouts
// import StudentLayout from './layouts/StudentLayout';
// import SupervisorLayout from './layouts/SupervisorLayout';
// import AdminLayout from './layouts/AdminLayout';

export default function App() {
  const { getDashboardPath, isAuthenticated } = useAuth();

  return (
    <Routes>

      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getDashboardPath()} replace 
/> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={getDashboardPath()} replace 
/> : <RegisterPage />}
      />

      {/* Student routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="placement" element={<StudentPlacement />} />
        <Route path="logs" element={<StudentWeeklyLogs />} />
        <Route path="logs/new" element={<StudentCreateLog />} />
        <Route path="logs/:id" element={<StudentViewLog />} />
        <Route path="logs/:id/edit" element={<StudentEditLog />} />
        <Route path="scores" element={<StudentScores />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Academic Supervisor routes */}
      <Route
        path="/supervisor"
        element={
          <ProtectedRoute allowedRoles={['academic_supervisor']}>
            <SupervisorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SupervisorDashboard />} />
        <Route path="students" element={<SupervisorStudents />} />
        <Route path="pending-reviews" element={<SupervisorPendingReviews />}
/>
        <Route path="review/:id" element={<SupervisorReviewLog />} />
        <Route path="scores" element={<SupervisorScoresOverview />} />
        <Route path="evaluate/:placementId" element={<SupervisorEvaluationForm
  />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="placements" element={<AdminPlacements />} />
        <Route path="placements/new" element={<AdminCreatePlacement />} />
        <Route path="reports" element={<AdminReports />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}
