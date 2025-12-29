import React, { useState, useEffect } from 'react';
import './TaskMonitoringDashboard.css';

const TaskMonitoringDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all tasks and users
      const [tasksResponse, usersResponse] = await Promise.all([
        fetch('/api/tasks', {
          headers: { 'x-auth-token': token }
        }),
        fetch('/api/interns', {
          headers: { 'x-auth-token': token }
        })
      ]);

      const tasksData = await tasksResponse.json();
      const usersData = await usersResponse.json();
      
      setTasks(tasksData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending' || t.status === 'Pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress' || t.status === 'In Progress').length;
    const completed = tasks.filter(t => t.status === 'completed' || t.status === 'Done' || t.status === 'completed').length;
    const review = tasks.filter(t => t.status === 'review' || t.status === 'Under Review').length;
    const testing = tasks.filter(t => t.status === 'testing' || t.status === 'Testing').length;
    const onHold = tasks.filter(t => t.status === 'on-hold' || t.status === 'On Hold').length;

    return { total, pending, inProgress, completed, review, testing, onHold };
  };

  const getUserStats = () => {
    return users.map(user => {
      const userTasks = tasks.filter(task => {
        const assignedToId = task.assignedTo?._id || task.assignedTo;
        return assignedToId === user._id;
      });

      const completed = userTasks.filter(t => t.status === 'completed' || t.status === 'Done' || t.status === 'completed').length;
      const inProgress = userTasks.filter(t => t.status === 'in-progress' || t.status === 'In Progress').length;
      const pending = userTasks.filter(t => t.status === 'pending' || t.status === 'Pending').length;
      const total = userTasks.length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...user,
        taskStats: { total, completed, inProgress, pending, completionRate }
      };
    });
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(task => {
        const status = task.status.toLowerCase();
        return status.includes(filter.toLowerCase());
      });
    }

    // Filter by user
    if (selectedUser !== 'all') {
      filtered = filtered.filter(task => {
        const assignedToId = task.assignedTo?._id || task.assignedTo;
        return assignedToId === selectedUser;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done': return '#27ae60';
      case 'in-progress':
      case 'in progress': return '#3498db';
      case 'review':
      case 'under review': return '#f39c12';
      case 'testing': return '#6610f2';
      case 'pending': return '#f39c12';
      case 'on-hold':
      case 'on hold': return '#ffc107';
      default: return '#95a5a6';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="monitoring-loading">
        <div className="spinner"></div>
        <p>Loading task monitoring data...</p>
      </div>
    );
  }

  const stats = getTaskStats();
  const userStats = getUserStats();
  const filteredTasks = getFilteredTasks();

  return (
    <div className="task-monitoring-dashboard">
      {/* Stats Overview */}
      <div className="stats-overview">
        <h3>Task Overview</h3>
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card in-progress">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card review">
            <div className="stat-number">{stats.review}</div>
            <div className="stat-label">Under Review</div>
          </div>
          <div className="stat-card testing">
            <div className="stat-number">{stats.testing}</div>
            <div className="stat-label">Testing</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {/* User Performance */}
      <div className="user-performance">
        <h3>User Performance</h3>
        <div className="user-stats-grid">
          {userStats.map(user => (
            <div key={user._id} className="user-stat-card">
              <div className="user-header">
                <h4>{user.email}</h4>
                <span className={`role-badge ${user.role}`}>
                  {user.role}
                </span>
              </div>
              <div className="user-task-stats">
                <div className="mini-stat">
                  <span className="mini-number">{user.taskStats.total}</span>
                  <span className="mini-label">Total</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-number">{user.taskStats.completed}</span>
                  <span className="mini-label">Done</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-number">{user.taskStats.inProgress}</span>
                  <span className="mini-label">In Progress</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-number">{user.taskStats.completionRate}%</span>
                  <span className="mini-label">Rate</span>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${user.taskStats.completionRate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3>Task Filters</h3>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Status:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Under Review</option>
              <option value="testing">Testing</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>User:</label>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.email} ({user.role})
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="task-list-section">
        <h3>Tasks ({filteredTasks.length})</h3>
        <div className="task-table">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Reward</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task._id}>
                  <td>
                    <div className="task-info">
                      <strong>{task.title}</strong>
                      <small>{task.description?.substring(0, 50)}...</small>
                    </div>
                  </td>
                  <td>
                    {task.assignedTo ? (
                      <span className="assigned-user">
                        {task.assignedTo.email || task.assignedTo}
                      </span>
                    ) : (
                      <span className="unassigned">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority || 'Medium'}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </td>
                  <td>₹{task.reward_amount_in_INR || 0}</td>
                  <td>
                    <button 
                      className="action-btn"
                      onClick={() => window.open(`/task/${task._id}`, '_blank')}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTasks.length === 0 && (
            <div className="no-tasks">
              <p>No tasks found matching the current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskMonitoringDashboard;
