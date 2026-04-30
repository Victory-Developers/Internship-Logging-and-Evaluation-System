import { Navigate } from 'react-router-dom';

export default function ApprovalsPage() {
  return <Navigate to="/admin/users?status=pending" replace />;
}