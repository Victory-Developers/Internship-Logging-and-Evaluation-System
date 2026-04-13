// src/pages/student/ViewLog.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/client';

export default function StudentViewLog() {
  const { id } = useParams();
  const [log, setLog] = useState(null);

  useEffect(() => {
    apiClient.get(`/student/logs/${id}`).then(r => setLog(r.data));
  }, [id]);

  if (!log) return <p>Loading...</p>;

  return (
    <div>
      <Link to="/student/logs">← Back to Logs</Link>
      <h2>Week {log.weekNumber} Log</h2>
      <p>Status: {log.status}</p>
      {/* activities detail, supervisor comments/feedback */}
      {['draft','submitted'].includes(log.status) && (
        <Link to={`/student/logs/${id}/edit`}>Edit Log</Link>
      )}
    </div>
  );
}
