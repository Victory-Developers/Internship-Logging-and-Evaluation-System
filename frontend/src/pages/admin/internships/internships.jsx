import { useEffect, useState } from "react";
import api from "../../../api/axios";

export default function Internships() {
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const res = await api.get("/internships/");
      setInternships(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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