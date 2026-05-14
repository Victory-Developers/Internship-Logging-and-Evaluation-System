import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const LogsPage = () => {
  // 🔹 Stores all logs from backend
  const [logs, setLogs] = useState([]);

  // 🔹 Controls loading state
  const [loading, setLoading] = useState(true);

  // 🔹 Filter state: all | pending | approved | rejected
  const [filter, setFilter] = useState('all');

  // 🔹 Search by student name/email
  const [search, setSearch] = useState('');

  // 🔹 Runs once when page loads
  useEffect(() => {
    fetchLogs();
  }, []);

  // 🔹 Fetch logs from backend
  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/logs/');
      setLogs(res.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Approve or Reject log
  const updateLogStatus = async (logId, status) => {
    try {
      await api.patch(`/admin/logs/${logId}/`, {
        status: status,
      });

      // Update UI instantly
      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.id === logId ? { ...log, status: status } : log
        )
      );
    } catch (error) {
      console.error(`Error updating log ${logId}:`, error);
    }
  };

  // 🔹 Filter + Search Logic
  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      filter === 'all' ? true : log.status === filter;

    const matchesSearch =
      log.student_name.toLowerCase().includes(search.toLowerCase()) ||
      log.student_email.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div style={styles.container}>
      {/* 🔹 PAGE TITLE */}
      <h1 style={styles.heading}>Logs Management</h1>

      {/* 🔹 CONTROLS */}
      <div style={styles.controls}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search by student name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Logs</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* 🔹 LOADING */}
      {loading ? (
        <p>Loading logs...</p>
      ) : filteredLogs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            {/* TABLE HEAD */}
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Week</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.student_name}</td>
                  <td>{log.student_email}</td>
                  <td>Week {log.week_number}</td>
                  <td>{log.submitted_at}</td>

                  {/* STATUS BADGE */}
                  <td>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          log.status === 'approved'
                            ? '#16a34a'
                            : log.status === 'rejected'
                            ? '#dc2626'
                            : '#f59e0b',
                      }}
                    >
                      {log.status}
                    </span>
                  </td>

                  {/* ACTION BUTTONS */}
                  <td>
                    <button
                      style={styles.viewBtn}
                      onClick={() =>
                        alert(`Open full log details for Log ID: ${log.id}`)
                      }
                    >
                      View
                    </button>

                    {log.status === 'pending' && (
                      <>
                        <button
                          style={styles.approveBtn}
                          onClick={() =>
                            updateLogStatus(log.id, 'approved')
                          }
                        >
                          Approve
                        </button>

                        <button
                          style={styles.rejectBtn}
                          onClick={() =>
                            updateLogStatus(log.id, 'rejected')
                          }
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* 🔹 STYLES */
const styles = {
  container: {
    marginLeft: '270px',
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },

  heading: {
    marginBottom: '20px',
    color: '#1e293b',
  },

  controls: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },

  searchInput: {
    flex: 1,
    minWidth: '250px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
  },

  filterSelect: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
  },

  tableWrapper: {
    overflowX: 'auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  statusBadge: {
    color: 'white',
    padding: '6px 10px',
    borderRadius: '999px',
    textTransform: 'capitalize',
    fontSize: '12px',
    fontWeight: 'bold',
  },

  viewBtn: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    marginRight: '5px',
    borderRadius: '6px',
    cursor: 'pointer',
  },

  approveBtn: {
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    marginRight: '5px',
    borderRadius: '6px',
    cursor: 'pointer',
  },

  rejectBtn: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default LogsPage;
