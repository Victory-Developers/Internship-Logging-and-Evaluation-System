// src/pages/student/EditLog.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

export default function StudentEditLog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    apiClient.get(`/student/logs/${id}`).then(r => setForm(r.data));
  }, [id]);

  const handleSubmit = async (asDraft) => {
    await apiClient.put(`/student/logs/${id}`, {
      ...form,
      status: asDraft ? 'draft' : 'submitted'
    });
    navigate('/student/logs');
  };

  if (!form) return <p>Loading...</p>;

  return (
    <div>
      <h2>Edit Week {form.weekNumber} Log</h2>
      {/* same form fields as CreateLog, pre-filled with form state */}
      <button onClick={() => handleSubmit(true)}>Save as Draft</button>
      <button onClick={() => handleSubmit(false)}>Submit Log</button>
    </div>
  );
}
