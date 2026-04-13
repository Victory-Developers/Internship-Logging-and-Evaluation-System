// src/pages/student/Placement.jsx
import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

export default function StudentPlacement() {
  const [placement, setPlacement] = useState(undefined); // undefined = loading

  useEffect(() => {
    apiClient.get('/student/placement')
      .then(r => setPlacement(r.data))
      .catch(() => setPlacement(null)); // null = no placement
  }, []);

  if (placement === undefined) return <p>Loading...</p>;

  // Renders student_noplacement.png
  if (!placement) return (
    <div>
      <h2>My Internship Placement</h2>
      <p>No placement assigned yet.</p>
      <p>Awaiting assignment by administrator</p>
    </div>
  );

  // Renders student_viewplacement.png
  return (
    <div>
      <h2>My Internship Placement</h2>
      {/* organization card, duration + progress bar, 
          supervisor card, week timeline, quick actions */}
    </div>
  );
}
