import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentPlacement from './pages/student/Placement';
import StudentWeeklyLogs from './pages/student/WeeklyLogs';
import StudentCreateLog from './pages/student/CreateLog';
import StudentEditLog from './pages/student/EditLog';
import StudentViewLog from './pages/student/ViewLog';
import StudentScores from './pages/student/Scores';
import StudentSubmitReport from './pages/student/SubmitReport';

// Academic Supervisor pages
import SupervisorDashboard from './pages/academic-supervisor/Dashboard';
import SupervisorStudents from './pages/academic-supervisor/Students';
import SupervisorPendingReviews from './pages/academic-supervisor/PendingReviews';
import SupervisorReviewLog from './pages/academic-supervisor/ReviewLog';
import SupervisorScoresOverview from './pages/academic-supervisor/ScoresOverview';
import SupervisorEvaluationForm from './pages/academic-supervisor/EvaluationForm';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminPlacements from './pages/admin/Placements';
import AdminCreatePlacement from './pages/admin/CreatePlacement';
import AdminReports from './pages/admin/Reports';
import AdminLogs from './pages/admin/logs';

// Workplace Supervisor pages
import WorkplaceDashboard from './pages/workplace-supervisor/Dashboard';
import WorkplaceStudents from './pages/workplace-supervisor/Students';
import WorkplaceLogs from './pages/workplace-supervisor/Logs';
import WorkplaceReviewLog from './pages/workplace-supervisor/ReviewLog';
import WorkplaceEvaluations from './pages/workplace-supervisor/Evaluations';
import WorkplaceEvaluationForm from './pages/workplace-supervisor/EvaluationForm';
import ProfilePage from './pages/ProfilePage';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import SupervisorLayout from './layouts/SupervisorLayout';
import AdminLayout from './layouts/AdminLayout';
import WorkplaceSupervisorLayout from './layouts/WorkplaceSupervisorLayout';

export default function App() {
  const { getDashboardPath, isAuthenticated } = useAuth();

  return (
    <Routes>

      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <RegisterPage />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />} 
      />

      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
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
        <Route path="submit-report" element={<StudentSubmitReport />} />
        <Route path="profile" element={<ProfilePage />} />
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
        <Route path="pending-reviews" element={<SupervisorPendingReviews />} />
        <Route path="review/:id" element={<SupervisorReviewLog />} />
        <Route path="scores" element={<SupervisorScoresOverview />} />
        <Route path="evaluate/:placementId" element={<SupervisorEvaluationForm />} />
        <Route path="profile" element={<ProfilePage />} />
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
        <Route path="logs" element={<AdminLogs />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Workplace Supervisor routes */}
      <Route
        path="/workplace"
        element={
          <ProtectedRoute allowedRoles={['workplace_supervisor']}>
            <WorkplaceSupervisorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<WorkplaceDashboard />} />
        <Route path="students" element={<WorkplaceStudents />} />
        <Route path="logs" element={<WorkplaceLogs />} />
        <Route path="review/:id" element={<WorkplaceReviewLog />} />
        <Route path="evaluations" element={<WorkplaceEvaluations />} />
        <Route path="evaluate/:placementId" element={<WorkplaceEvaluationForm />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}