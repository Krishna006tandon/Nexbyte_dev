import React, { useState, useEffect } from 'react';
import './InternPanel.css';
import InternSidebar from '../components/InternSidebar';

const InternPanel = () => {
  const [internTasks, setInternTasks] = useState([]);
  const [offerLetter, setOfferLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      try {
        // Fetch tasks
        const tasksRes = await fetch('/api/tasks', { headers });
        const tasksData = await tasksRes.json();
        if (tasksRes.ok) {
          setInternTasks(tasksData);
        } else {
          setError(tasksData.message || 'Failed to fetch tasks');
        }

        // Fetch user profile for offer letter
        const profileRes = await fetch('/api/profile', { headers });
        const profileData = await profileRes.json();
        if (profileRes.ok) {
          setOfferLetter(profileData.offerLetter);
        } else {
          setError(profileData.message || 'Failed to fetch profile');
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="intern-panel-container">Loading...</div>;
  }

  if (error) {
    return <div className="intern-panel-container">Error: {error}</div>;
  }

  return (
    <div className="intern-panel-container">
      <InternSidebar />
      <div className="main-content">
        <h1>Intern Dashboard</h1>

        {offerLetter && (
          <div className="offer-letter-section">
            <h2>Your Offer Letter</h2>
            <div className="offer-letter-content" dangerouslySetInnerHTML={{ __html: offerLetter }} />
          </div>
        )}

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
