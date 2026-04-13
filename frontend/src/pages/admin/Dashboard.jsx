import React, { useState } from 'react';
import Sidebar from './pages/sidebar'; 

const Dashboard = () => {
  const [selectedFeature, setSelectedFeature] = useState('stats');

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar setSelectedFeature={setSelectedFeature} />

    //main area
      <div style={{ marginLeft: '250px', padding: '20px' }}>
        <h1>Dashboard Content</h1>
        <p>Current view: {selectedFeature}</p>
      </div>
    </div>
  );
};

export default Dashboard;
