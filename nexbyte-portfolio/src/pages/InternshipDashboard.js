import React, { useState, useEffect } from 'react';
import './InternshipDashboard.css';

const InternshipDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [roleStats, setRoleStats] = useState({});
  const [monthlyStats, setMonthlyStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('visual'); // 'visual' or 'list'

  // Mock data for demonstration
  useEffect(() => {
    const mockApplications = [
      {
        id: 1,
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        role: 'Web Development Intern',
        college: 'Delhi University',
        dateApplied: '2024-01-15',
        status: 'new',
        message: 'I want to learn modern web development with React and Node.js'
      },
      {
        id: 2,
        name: 'Priya Patel',
        email: 'priya@example.com',
        role: 'Frontend Intern',
        college: 'IIT Bombay',
        dateApplied: '2024-01-14',
        status: 'under_review',
        message: 'Passionate about creating beautiful user interfaces'
      },
      {
        id: 3,
        name: 'Amit Kumar',
        email: 'amit@example.com',
        role: 'Backend Intern',
        college: 'NIT Trichy',
        dateApplied: '2024-01-13',
        status: 'approved',
        message: 'Want to learn server-side development and databases'
      },
      {
        id: 4,
        name: 'Sneha Reddy',
        email: 'sneha@example.com',
        role: 'UI/UX Intern',
        college: 'NID Ahmedabad',
        dateApplied: '2024-01-12',
        status: 'rejected',
        message: 'Interested in user experience design'
      },
      {
        id: 5,
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        role: 'Digital Marketing Intern',
        college: 'MBA Delhi',
        dateApplied: '2024-01-11',
        status: 'shortlisted',
        message: 'Want to learn digital marketing strategies'
      }
    ];

    setApplications(mockApplications);
    
    // Calculate stats
    const newCount = mockApplications.filter(app => app.status === 'new').length;
    const pendingCount = mockApplications.filter(app => app.status === 'under_review' || app.status === 'shortlisted').length;
    const approvedCount = mockApplications.filter(app => app.status === 'approved').length;
    const rejectedCount = mockApplications.filter(app => app.status === 'rejected').length;

    setStats({
      total: mockApplications.length,
      new: newCount,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount
    });

    // Calculate role-wise stats
    const roleWise = {};
    mockApplications.forEach(app => {
      roleWise[app.role] = (roleWise[app.role] || 0) + 1;
    });
    setRoleStats(roleWise);

    // Calculate monthly stats
    const monthly = {};
    mockApplications.forEach(app => {
      const month = new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthly[month] = (monthly[month] || 0) + 1;
    });
    setMonthlyStats(monthly);

    setLoading(false);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      new: '#ff6b6b',
      under_review: '#feca57',
      shortlisted: '#48dbfb',
      approved: '#1dd1a1',
      rejected: '#ee5a6f',
      completed: '#00d2d3'
    };
    return colors[status] || '#747d8c';
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: 'New',
      under_review: 'Under Review',
      shortlisted: 'Shortlisted',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed'
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="loading">Loading internship dashboard...</div>;
  }

  return (
    <div className="internship-dashboard">
      <div className="dashboard-header">
        <h1>Internship Applications Dashboard</h1>
        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'visual' ? 'active' : ''}`}
            onClick={() => setViewMode('visual')}
          >
            📊 Visual View
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List View
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-overview">
        <div className="stat-card total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card new">
          <div className="stat-number">{stats.new}</div>
          <div className="stat-label">New</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-number">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="visual-view">
          {/* Role-wise Applications */}
          <div className="chart-section">
            <h2>Role-wise Applications</h2>
            <div className="role-chart">
              {Object.entries(roleStats).map(([role, count]) => (
                <div key={role} className="role-bar">
                  <div className="role-info">
                    <span className="role-name">{role}</span>
                    <span className="role-count">{count}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(count / Math.max(...Object.values(roleStats))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="chart-section">
            <h2>Monthly Applications</h2>
            <div className="monthly-chart">
              {Object.entries(monthlyStats).reverse().map(([month, count]) => (
                <div key={month} className="month-bar">
                  <div className="month-info">
                    <span className="month-name">{month}</span>
                    <span className="month-count">{count}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill monthly" 
                      style={{ 
                        width: `${(count / Math.max(...Object.values(monthlyStats))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="recent-applications">
            <h2>Recent Applications</h2>
            <div className="recent-list">
              {applications.slice(0, 5).map(app => (
                <div key={app.id} className="recent-item">
                  <div className="applicant-info">
                    <div className="applicant-name">{app.name}</div>
                    <div className="applicant-role">{app.role}</div>
                  </div>
                  <div className="applicant-meta">
                    <span className="date">{new Date(app.dateApplied).toLocaleDateString()}</span>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(app.status) }}
                    >
                      {getStatusLabel(app.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="list-view">
          <div className="applications-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>College</th>
                  <th>Date Applied</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td>{app.name}</td>
                    <td>{app.email}</td>
                    <td>{app.role}</td>
                    <td>{app.college}</td>
                    <td>{new Date(app.dateApplied).toLocaleDateString()}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(app.status) }}
                      >
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn view">View</button>
                      <button className="action-btn edit">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipDashboard;
