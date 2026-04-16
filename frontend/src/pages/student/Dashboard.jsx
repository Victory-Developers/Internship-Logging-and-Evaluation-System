import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

export default function StudentDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiClient.get('/student/dashboard')
      .then(r => setData(r.data))
      .catch(err => console.error(err));
  }, []);
}
