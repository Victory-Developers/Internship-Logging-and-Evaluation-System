import React, { useState } from 'react';
import api from '../../api/axios';

const NotificationsPage = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');

  const sendNotification = async (e) => {
    e.preventDefault();

    try {
      await api.post('/admin/notifications/send/', {
        title,
        message,
      });

      setSuccess('Notification sent successfully!');
      setTitle('');
      setMessage('');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Send Notification</h1>

      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={sendNotification}>
        <input
          type="text"
          placeholder="Notification Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
          required
        />

        <textarea
          placeholder="Notification Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.textarea}
          required
        />

        <button type="submit" style={styles.button}>
          Send Notification
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    marginLeft: '270px',
  },

  input: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
  },

  textarea: {
    display: 'block',
    width: '100%',
    height: '150px',
    padding: '10px',
    marginBottom: '15px',
  },

  button: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
  },
};

export default NotificationsPage;
