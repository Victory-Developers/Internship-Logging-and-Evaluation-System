// src/pages/student/CreateLog.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

export default function StudentCreateLog() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    weekNumber: '', startDate: '', endDate: '',
    activitiesSummary: '', activitiesDetail: '', status: 'draft'
  });

  const handleSubmit = async (asDraft) => {
    await apiClient.post('/student/logs', {
      ...form,
      status: asDraft ? 'draft' : 'submitted'
    });
    navigate('/student/logs');
  };

  return (
    <div>
      <h2>Submit New Weekly Log</h2>
      {/* form fields */}
      <button onClick={() => handleSubmit(true)}>Save as Draft</button>
      <button onClick={() => handleSubmit(false)}>Submit Log</button>
    </div>
  );
}
