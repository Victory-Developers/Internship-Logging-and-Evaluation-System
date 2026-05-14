import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const ApprovalsPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending users from backend
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const res = await api.get('/admin/pending-users/');
      setPendingUsers(res.data);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, action) => {
    try {
      await api.post(`/admin/approve-user/${userId}/`, {
        action: action, // approve or reject
      });

      // Remove approved/rejected user from list
      setPendingUsers((prev) =>
        prev.filter((user) => user.id !== userId)
      );
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Approvals Management</h1>

      {loading ? (
        <p>Loading pending approvals...</p>
      ) : pendingUsers.length === 0 ? (
        <p>No pending approvals.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    style={styles.approveBtn}
                    onClick={() => handleApproval(user.id, 'approve')}
                  >
                    Approve
                  </button>

                  <button
                    style={styles.rejectBtn}
                    onClick={() => handleApproval(user.id, 'reject')}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    marginLeft: '270px',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },

  approveBtn: {
    backgroundColor: 'green',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    marginRight: '10px',
    cursor: 'pointer',
  },

  rejectBtn: {
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    cursor: 'pointer',
  },
};

export default ApprovalsPage;
