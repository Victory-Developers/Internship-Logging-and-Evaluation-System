import { useEffect, useState, useCallback } from "react";
import api from "../../../api/axios";

export default function Internships() {
  const [internships, setInternships] = useState([]);

  const fetchInternships = useCallback(async () => {
    try {
      const res = await api.get("/internships/");
      setInternships(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInternships();
  }, [fetchInternships]);

  return (
    <div>
      <h2>Internships</h2>

      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Student</th>
            <th>Organisation</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {internships.map((i) => (
            <tr key={i.id}>
              <td>{i.student}</td>
              <td>{i.organisation}</td>
              <td>{i.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}