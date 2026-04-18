import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch data based on tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/${activeTab}/`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Export CSV
  const exportCSV = () => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(h => obj[h]));

    let csvContent =
      headers.join(',') +
      '\n' +
      rows.map(r => r.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_report.csv`;
    a.click();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Reports & Analytics</h1>

      {/* 🔹 Tabs */}
      <div style={tabContainer}>
        <button
          style={activeTab === 'students' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('students')}
        >
          Student Performance
        </button>

        <button
          style={activeTab === 'organisations' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('organisations')}
        >
          Organisation Performance
        </button>

        <button
          style={activeTab === 'submissions' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('submissions')}
        >
          Submission Analytics
        </button>
      </div>

      {/* 🔹 Export */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={exportCSV} style={exportBtn}>
          Export CSV
        </button>
      </div>

      {/* 🔹 Data Table */}
      <div style={{ marginTop: '20px' }}>
        {loading ? (
          <p>Loading...</p>
        ) : data.length === 0 ? (
          <p>No data available</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} style={thStyle}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((val, i) => (
                    <td key={i} style={tdStyle}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;

/* 🔹 STYLES */
const tabContainer = {
  display: 'flex',
  gap: '10px',
  marginTop: '20px',
};

const tabStyle = {
  padding: '10px 15px',
  border: '1px solid #ccc',
  background: '#f5f5f5',
  cursor: 'pointer',
};

const activeTabStyle = {
  ...tabStyle,
  background: '#007bff',
  color: '#fff',
};

const exportBtn = {
  padding: '10px 15px',
  background: 'green',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle = {
  border: '1px solid #ddd',
  padding: '10px',
  background: '#f0f0f0',
};

const tdStyle = {
  border: '1px solid #ddd',
  padding: '10px',
};
