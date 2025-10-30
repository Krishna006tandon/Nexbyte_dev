import React, { useState, useEffect } from 'react';
import './InternPanel.css';
import Sidebar from '../components/Sidebar';

const InternPanel = () => {
  const [internTasks, setInternTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInternTasks = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/tasks', {
          headers: { 'x-auth-token': token },
        });
        const data = await res.json();
        if (res.ok) {
          // Assuming the /api/tasks endpoint returns tasks assigned to the logged-in user if no clientId is provided
          // Or, we might need a specific endpoint like /api/tasks/me
          setInternTasks(data);
        } else {
          setError(data.message || 'Failed to fetch tasks');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInternTasks();
  }, []);

  if (loading) {
    return <div className="intern-panel-container">Loading tasks...</div>;
  }

  if (error) {
    return <div className="intern-panel-container">Error: {error}</div>;
  }

  return (
    <div className="intern-panel-container">
      <Sidebar />
      <div className="main-content">
        <h1>Intern Dashboard</h1>
        <h2>Your Assigned Tasks</h2>
        {internTasks.length === 0 ? (
          <p>No tasks assigned to you yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                <th>Reward (INR)</th>
              </tr>
            </thead>
            <tbody>
              {internTasks.map(task => (
                <tr key={task._id}>
                  <td>{task.task_title}</td>
                  <td>{task.task_description}</td>
                  <td>{task.status}</td>
                  <td>₹{task.reward_amount_in_INR}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InternPanel;
