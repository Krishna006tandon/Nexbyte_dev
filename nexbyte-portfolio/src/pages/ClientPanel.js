import React, { useState, useEffect } from 'react';
import './ClientPanel.css';

const ClientPanel = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found, please log in.');
          return;
        }

        const res = await fetch('/api/client/data', {
          headers: {
            'x-auth-token': token,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }

        const clientData = await res.json();
        setData(clientData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div className="client-panel-error">{error}</div>;
  }

  if (!data) {
    return <div className="client-panel-loading">Loading...</div>;
  }

  return (
    <div className="client-panel-container">
      <h1>{data.message}</h1>
      <div className="client-data">
        <h2>Project Details</h2>
        <p><strong>Project:</strong> {data.clientData.project}</p>
        <p><strong>Status:</strong> {data.clientData.status}</p>
        <p><strong>Due Date:</strong> {data.clientData.dueDate}</p>
      </div>
    </div>
  );
};

export default ClientPanel;
