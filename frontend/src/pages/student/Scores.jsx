// src/pages/student/Scores.jsx
import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

export default function StudentScores() {
  const [scores, setScores] = useState(null);

  useEffect(() => {
    apiClient.get('/student/scores').then(r => setScores(r.data));
  }, []);

  if (!scores) return <p>Loading...</p>;

  return (
    <div>
      <h2>My Evaluation Scores</h2>
      {/* score cards or table per evaluation criterion */}
    </div>
  );
}
