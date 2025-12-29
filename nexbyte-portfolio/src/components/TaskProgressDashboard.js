import React, { useState, useEffect } from 'react';
import './TaskProgressDashboard.css';

const TaskProgressDashboard = ({ tasks, interns, projectName }) => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0
  });
  const [priorityStats, setPriorityStats] = useState({
    high: 0,
    medium: 0,
    low: 0
  });
  const [internStats, setInternStats] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    calculateStats();
    calculatePriorityStats();
    calculateInternStats();
  }, [tasks, interns]);

  const calculateStats = () => {
    const today = new Date();
    const newStats = {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'completed').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      pending: tasks.filter(task => task.status === 'pending').length,
      overdue: tasks.filter(task => {
        return task.dueDate && new Date(task.dueDate) < today && task.status !== 'completed';
      }).length
    };
    
    setStats(newStats);
    
    // Calculate progress percentage
    const percentage = newStats.total > 0 
      ? Math.round((newStats.completed / newStats.total) * 100) 
      : 0;
    setProgressPercentage(percentage);
  };

  const calculatePriorityStats = () => {
    const newPriorityStats = {
      high: tasks.filter(task => task.priority === 'high').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      low: tasks.filter(task => task.priority === 'low').length
    };
    setPriorityStats(newPriorityStats);
  };

  const calculateInternStats = () => {
    const internTaskMap = {};
    
    // Initialize intern stats
    interns.forEach(intern => {
      internTaskMap[intern._id] = {
        name: intern.name,
        email: intern.email,
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0
      };
    });

    // Count tasks per intern
    tasks.forEach(task => {
      if (task.assignedTo && task.assignedTo._id) {
        const internId = task.assignedTo._id;
        if (internTaskMap[internId]) {
          internTaskMap[internId].total++;
          if (task.status === 'completed') internTaskMap[internId].completed++;
          else if (task.status === 'in-progress') internTaskMap[internId].inProgress++;
          else if (task.status === 'pending') internTaskMap[internId].pending++;
        }
      }
    });

    setInternStats(Object.values(internTaskMap));
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#28a745'; // Green
    if (percentage >= 50) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#fd7e14';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in-progress': return '#007bff';
      case 'pending': return '#6c757d';
      default: return '#888';
    }
  };

  return (
    <div className="task-progress-dashboard">
      <div className="dashboard-header">
        <h2>{projectName} - Progress Dashboard</h2>
        <div className="last-updated">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="progress-overview">
        <div className="progress-main">
          <div className="progress-circle">
            <div 
              className="progress-fill"
              style={{ 
                background: `conic-gradient(${getProgressColor(progressPercentage)} ${progressPercentage * 3.6}deg, #e9ecef 0deg)` 
              }}
            >
              <div className="progress-inner">
                <span className="progress-percentage">{progressPercentage}%</span>
                <span className="progress-label">Complete</span>
              </div>
            </div>
          </div>
          <div className="progress-summary">
            <h3>Project Progress</h3>
            <p>{stats.completed} of {stats.total} tasks completed</p>
            <div className="progress-bar">
              <div 
                className="progress-fill-bar"
                style={{ 
                  width: `${progressPercentage}%`,
                  backgroundColor: getProgressColor(progressPercentage)
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
        
        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
        
        <div className="stat-card in-progress">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        
        <div className="stat-card overdue">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.overdue}</h3>
            <p>Overdue</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Priority Distribution */}
        <div className="chart-card">
          <h3>Task Distribution by Priority</h3>
          <div className="priority-chart">
            {Object.entries(priorityStats).map(([priority, count]) => (
              <div key={priority} className="priority-item">
                <div className="priority-bar">
                  <div 
                    className="priority-fill"
                    style={{ 
                      width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`,
                      backgroundColor: getPriorityColor(priority)
                    }}
                  ></div>
                </div>
                <div className="priority-label">
                  <span className="priority-name">{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                  <span className="priority-count">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intern Performance */}
        <div className="chart-card">
          <h3>Intern Task Overview</h3>
          <div className="intern-stats">
            {internStats.length === 0 ? (
              <p className="no-data">No tasks assigned to interns yet</p>
            ) : (
              internStats.map(intern => (
                <div key={intern.email} className="intern-item">
                  <div className="intern-header">
                    <span className="intern-name">{intern.name}</span>
                    <span className="intern-tasks">{intern.total} tasks</span>
                  </div>
                  <div className="intern-progress">
                    <div className="intern-stats-mini">
                      <span className="completed">{intern.completed}</span>
                      <span className="in-progress">{intern.inProgress}</span>
                      <span className="pending">{intern.pending}</span>
                    </div>
                    <div className="intern-bar">
                      <div 
                        className="intern-completed"
                        style={{ 
                          width: `${intern.total > 0 ? (intern.completed / intern.total) * 100 : 0}%` 
                        }}
                      ></div>
                      <div 
                        className="intern-in-progress"
                        style={{ 
                          width: `${intern.total > 0 ? (intern.inProgress / intern.total) * 100 : 0}%` 
                        }}
                      ></div>
                      <div 
                        className="intern-pending"
                        style={{ 
                          width: `${intern.total > 0 ? (intern.pending / intern.total) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="activity-timeline">
        <h3>Recent Task Activity</h3>
        <div className="timeline">
          {tasks.slice(-5).reverse().map(task => (
            <div key={task._id} className="timeline-item">
              <div 
                className="timeline-dot"
                style={{ backgroundColor: getStatusColor(task.status) }}
              ></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="task-title">{task.title}</span>
                  <span className="task-status">{task.status}</span>
                </div>
                <div className="timeline-meta">
                  <span>Priority: {task.priority}</span>
                  {task.assignedTo && <span>Assigned to: {task.assignedTo.name}</span>}
                  {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskProgressDashboard;
