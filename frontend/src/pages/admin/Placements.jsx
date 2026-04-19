import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function PlacementsPage() {

  //  STATE = where React stores data
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    student: '',
    organisation: '',
    start_date: '',
    end_date: ''
  });

  //  RUNS ON PAGE LOAD
  useEffect(() => {
    fetchPlacements();
  }, []);

  //  FETCH DATA FROM BACKEND
  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/placements/');
      setPlacements(res.data);
    } catch (err) {
      console.error('Error fetching placements', err);
    } finally {
      setLoading(false);
    }
  };

  //  HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  //  SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/placements/', form);

      // Refresh list after adding
      fetchPlacements();

      // Clear form
      setForm({
        student: '',
        organisation: '',
        start_date: '',
        end_date: ''
      });

    } catch (err) {
      console.error('Error creating placement', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Placements</h2>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <input
          name="student"
          placeholder="Student ID"
          value={form.student}
          onChange={handleChange}
        />

        <input
          name="organisation"
          placeholder="Organisation"
          value={form.organisation}
          onChange={handleChange}
        />

        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
        />

        <input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
        />

        <button type="submit">Add Placement</button>
      </form>

      <hr />

      {/*  TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Student</th>
              <th>Organisation</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>

          <tbody>
            {placements.map((p) => (
              <tr key={p.id}>
                <td>{p.student}</td>
                <td>{p.organisation}</td>
                <td>{p.start_date}</td>
                <td>{p.end_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
