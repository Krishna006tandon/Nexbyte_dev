import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Member.css';

const Member = () => {
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [progressData, setProgressData] = useState({
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    totalTasks: 0,
    completionRate: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get('/api/profile', {
          headers: {
            'x-auth-token': token
          }
        });

        // Ensure we have valid user data
        if (!res.data || !res.data.role) {
          throw new Error('Invalid user data received');
        }

        // Define all valid roles that can access the member dashboard
        const allowedRoles = ['admin', 'member', 'intern'];
        
        // Check if user has an authorized role
        const userRole = res.data.role.toLowerCase();
        
        if (!allowedRoles.includes(userRole)) {
          console.warn(`Access denied for role: ${userRole}. Redirecting to home.`);
          navigate('/');
          return;
        }

        // Update user data with the role
        setUserData({
          ...res.data,
          role: userRole // Ensure consistent casing
        });
        setLoading(false);
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data. Please try logging in again.');
        setLoading(false);
        // Redirect to login on error
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('DEBUG: Member fetching tasks with token:', !!token);
        
        // First try: Member-specific endpoint
        let res = await axios.get('/api/tasks/my-tasks', {
          headers: {
            'x-auth-token': token
          }
        }).catch(async () => {
          console.log('DEBUG: my-tasks endpoint failed, trying general tasks endpoint...');
          // Fallback: General tasks endpoint
          return await axios.get('/api/tasks', {
            headers: {
              'x-auth-token': token
            }
          });
        });

        const tasksData = res.data;
        console.log('DEBUG: Member tasks fetched:', tasksData);
        
        // Filter tasks assigned to current user
        const assignedTasks = tasksData.filter(task => {
          // Check if task is assigned to current user
          const assignedToId = task.assignedTo?._id || task.assignedTo;
          const userId = userData?._id || userData.id;
          return !assignedToId || assignedToId === userId;
        });
        
        console.log('DEBUG: Filtered assigned tasks for user:', assignedTasks);
        setTasks(assignedTasks);
        
        // Calculate progress data based on assigned tasks only
        const completedTasks = assignedTasks.filter(t => t.status === 'Done' || t.status === 'completed' || t.status === 'approved').length;
        const inProgressTasks = assignedTasks.filter(t => t.status === 'In Progress' || t.status === 'in-progress' || t.status === 'review' || t.status === 'testing').length;
        const pendingTasks = assignedTasks.filter(t => t.status === 'Pending' || t.status === 'pending' || t.status === 'on-hold').length;
        const totalTasks = assignedTasks.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        setProgressData({
          completedTasks,
          inProgressTasks,
          pendingTasks,
          totalTasks,
          completionRate
        });
      } catch (err) {
        console.error('DEBUG: Failed to fetch member tasks:', err);
        // Set empty tasks on error
        setTasks([]);
        setProgressData({
          completedTasks: 0,
          inProgressTasks: 0,
          pendingTasks: 0,
          totalTasks: 0,
          completionRate: 0
        });
      }
    };

    if (userData) {
      fetchTasks();
    }
  }, [userData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      console.log('DEBUG: Member updating task:', taskId, 'to status:', newStatus);
      
      // Direct task update with task ID
      let response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setTasks(tasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        ));
        
        // Update progress data
        const updatedTasks = tasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        );
        const completedTasks = updatedTasks.filter(t => t.status === 'Done' || t.status === 'completed' || t.status === 'approved').length;
        const inProgressTasks = updatedTasks.filter(t => t.status === 'In Progress' || t.status === 'in-progress' || t.status === 'review' || t.status === 'testing').length;
        const pendingTasks = updatedTasks.filter(t => t.status === 'Pending' || t.status === 'pending' || t.status === 'on-hold').length;
        const totalTasks = updatedTasks.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        setProgressData({
          completedTasks,
          inProgressTasks,
          pendingTasks,
          totalTasks,
          completionRate
        });
        
        alert('Task status updated successfully!');
        // Don't call fetchMemberData - let local state update work like Intern panel
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('All update attempts failed:', response.status, errorData);
        
        // If all API endpoints fail, update locally and show appropriate message
        if (response.status === 403 || response.status === 404) {
          console.log('DEBUG: All endpoints failed, updating locally...');
          setTasks(tasks.map(task => 
            task._id === taskId ? { ...task, status: newStatus } : task
          ));
          
          // Update progress data locally
          const updatedTasks = tasks.map(task => 
            task._id === taskId ? { ...task, status: newStatus } : task
          );
          const completedTasks = updatedTasks.filter(t => t.status === 'Done' || t.status === 'completed' || t.status === 'approved').length;
          const inProgressTasks = updatedTasks.filter(t => t.status === 'In Progress' || t.status === 'in-progress' || t.status === 'review' || t.status === 'testing').length;
          const pendingTasks = updatedTasks.filter(t => t.status === 'Pending' || t.status === 'pending' || t.status === 'on-hold').length;
          const totalTasks = updatedTasks.length;
          const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          setProgressData({
            completedTasks,
            inProgressTasks,
            pendingTasks,
            totalTasks,
            completionRate
          });
          
          alert('Task status updated locally (changes may not be saved to server)');
          // Don't call fetchMemberData here - match Intern panel behavior
        } else {
          alert(`Failed to update task: ${errorData.msg || 'Permission denied or endpoint not found'}`);
        }
      }
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Error updating task status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': 
      case 'Done': 
      case 'approved': return '#27ae60';
      case 'in-progress': 
      case 'In Progress': return '#3498db';
      case 'review': 
      case 'Under Review': return '#f39c12';
      case 'testing': 
      case 'Testing': return '#6610f2';
      case 'pending': 
      case 'Pending': return '#f39c12';
      case 'on-hold': 
      case 'On Hold': return '#ffc107';
      case 'cancelled': 
      case 'Cancelled': return '#dc3545';
      default: return '#95a5a6';
    }
  };
  
  const ProgressBar = ({ percentage }) => (
    <div className="progress-bar-container">
      <div 
        className="progress-bar" 
        style={{ width: `${percentage}%` }}
      >
        {percentage}%
      </div>
    </div>
  );
  
  const renderProgressReport = () => (
    <div className="progress-report">
      <h3>Your Progress</h3>
      <div className="progress-stats">
        <div className="stat-item">
          <span className="stat-value">{progressData.completedTasks}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{progressData.inProgressTasks}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{progressData.pendingTasks}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>
      <div className="progress-summary">
        <div className="progress-header">
          <span>Task Completion</span>
          <span>{progressData.completionRate}%</span>
        </div>
        <ProgressBar percentage={progressData.completionRate} />
      </div>
    </div>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#e74c3c';
      case 'Medium': return '#f39c12';
      case 'Low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="member-container">
      <div className="member-sidebar">
        <div className="sidebar-header">
          <h3>NexByte Portal</h3>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={activeSection === 'dashboard' ? 'active' : ''}>
              <a href="#dashboard" onClick={() => setActiveSection('dashboard')}>Dashboard</a>
            </li>
            <li className={activeSection === 'profile' ? 'active' : ''}>
              <a href="#profile" onClick={() => setActiveSection('profile')}>My Profile</a>
            </li>
            <li className={activeSection === 'tasks' ? 'active' : ''}>
              <a href="#tasks" onClick={() => setActiveSection('tasks')}>My Tasks</a>
            </li>
            <li className={activeSection === 'progress' ? 'active' : ''}>
              <a href="#progress" onClick={() => setActiveSection('progress')}>Progress Report</a>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="member-main-content">
        <div className="member-header">
          <h1>Member Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {userData?.email}</span>
            <span className="role-badge">{userData?.role}</span>
          </div>
        </div>

        <div className="dashboard-content">
          {activeSection === 'dashboard' && (
            <>
              <div className="welcome-card">
                <h2>Welcome to NexByte!</h2>
                <p>This is your personal dashboard. Here you can manage your profile, view your tasks, and stay updated with your activities.</p>
              </div>

              <div className="info-grid">
                <div className="info-card">
                  <h3>Profile Information</h3>
                  <div className="profile-details">
                    <p><strong>Email:</strong> {userData?.email}</p>
                    <p><strong>Role:</strong> {userData?.role}</p>
                    <p><strong>Member Since:</strong> {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Task Overview</h3>
                  <div className="task-stats">
                    <p><strong>Total Tasks:</strong> {tasks.length}</p>
                    <p><strong>Pending:</strong> {tasks.filter(t => t.status === 'Pending' || t.status === 'pending' || t.status === 'on-hold').length}</p>
                    <p><strong>In Progress:</strong> {tasks.filter(t => t.status === 'In Progress' || t.status === 'in-progress' || t.status === 'review' || t.status === 'testing').length}</p>
                    <p><strong>Completed:</strong> {tasks.filter(t => t.status === 'Done' || t.status === 'completed' || t.status === 'approved').length}</p>
                  </div>
                </div>

                {userData?.role === 'intern' && (
                  <div className="info-card">
                    <h3>Internship Details</h3>
                    <div className="internship-details">
                      <p><strong>Start Date:</strong> {userData?.internshipStartDate ? new Date(userData.internshipStartDate).toLocaleDateString() : 'Not set'}</p>
                      <p><strong>End Date:</strong> {userData?.internshipEndDate ? new Date(userData.internshipEndDate).toLocaleDateString() : 'Not set'}</p>
                      <p><strong>Acceptance Date:</strong> {userData?.acceptanceDate ? new Date(userData.acceptanceDate).toLocaleDateString() : 'Not set'}</p>
                      {userData?.offerLetter && (
                        <button className="action-btn">View Offer Letter</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === 'tasks' && (
            <div className="tasks-section">
              <h2>My Assigned Tasks</h2>
              {tasks.length === 0 ? (
                <div className="no-tasks">
                  <p>No tasks assigned to you yet.</p>
                </div>
              ) : (
                <div className="tasks-grid">
                  {tasks.map(task => (
                    <div key={task._id} className="task-card">
                      <div className="task-header">
                        <h3>{task.title}</h3>
                        <div className="task-badges">
                          <span 
                            className="status-badge" 
                            style={{ backgroundColor: getStatusColor(task.status) }}
                          >
                            {task.status}
                          </span>
                          <span 
                            className="priority-badge" 
                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <div className="task-actions">
                          <select
                            value={task.status}
                            onChange={(e) => handleTaskStatusUpdate(task._id, e.target.value)}
                            className="status-select"
                            style={{ 
                              backgroundColor: getStatusColor(task.status),
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="review">Under Review</option>
                            <option value="testing">Testing</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                            <option value="on-hold">On Hold</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      <div className="task-description">
                        <p>{task.description}</p>
                      </div>
                      <div className="task-meta">
                        <p><strong>Due Date:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
                        <p><strong>Reward:</strong> {task.reward_amount_in_INR || 0} INR</p>
                      </div>
                      {task.comments && task.comments.length > 0 && (
                        <div className="task-comments">
                          <p><strong>Comments:</strong> {task.comments.length}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="profile-section">
              <h2>My Profile</h2>
              <div className="profile-card">
                <h3>Personal Information</h3>
                <div className="profile-details">
                  <p><strong>Email:</strong> {userData?.email}</p>
                  <p><strong>Role:</strong> {userData?.role}</p>
                  <p><strong>Member Since:</strong> {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="action-buttons">
                  <button className="action-btn">Edit Profile</button>
                  <button className="action-btn">Change Password</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'progress' && (
            <div className="progress-section">
              <h2>My Progress Report</h2>
              {renderProgressReport()}
              <div className="recent-tasks">
                <h3>Recent Tasks</h3>
                {tasks.slice(0, 3).map(task => (
                  <div key={task._id} className="task-item">
                    <div className="task-title">{task.title}</div>
                    <div className="task-status" style={{ color: getStatusColor(task.status) }}>
                      {task.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Member;
