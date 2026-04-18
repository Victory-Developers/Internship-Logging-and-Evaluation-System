import React from 'react'

const Sidebar = ({ setSelectedFeature }) => {
    const menuItems =[
        { id: 'stats', label: 'Genarl Stats' },
        { id: 'students' , label: 'students' },
    
    ];

    return (
        <div style={sidebarStyle}>
          <h2 style={{ color: 'white', padding: '20px' }}>Admin Panel</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {menuItems.map((item) => (
              <li 
                key={item.id} 
                onClick={() => setSelectedFeature(item.id)}
                style={menuItemStyle}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      );
    };

    // Quick styles for clarity
const sidebarStyle = {
    width: '250px',
    height: '100vh',
    backgroundColor: '#2c3e50',
    position: 'fixed'
  };
  
  const menuItemStyle = {
    padding: '15px 20px',
    color: 'white',
    cursor: 'pointer',
    borderBottom: '1px solid #34495e'
  };
    export default Sidebar;
