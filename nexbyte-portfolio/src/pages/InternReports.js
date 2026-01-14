import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InternReports.css';

const InternReports = () => {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [internReport, setInternReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      
      const response = await axios.get('/api/users', { headers });
      const internUsers = response.data.filter(user => user.role === 'intern');
      setInterns(internUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching interns:', error);
      setLoading(false);
    }
  };

  const handleViewReport = async (intern) => {
    setSelectedIntern(intern);
    setReportLoading(true);
    setShowReportModal(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      
      const response = await axios.get(`/api/reports/user/${intern._id}`, { headers });
      setInternReport(response.data);
    } catch (error) {
      console.error('Error fetching intern report:', error);
      setInternReport(null);
    } finally {
      setReportLoading(false);
    }
  };

  const closeModal = () => {
    setShowReportModal(false);
    setSelectedIntern(null);
    setInternReport(null);
  };

  const getInternStatus = (intern) => {
    const now = new Date();
    const startDate = new Date(intern.internshipStartDate);
    const endDate = new Date(intern.internshipEndDate);
    
    if (now < startDate) return 'Upcoming';
    if (now > endDate) return 'Completed';
    return 'Active';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': '#1dd1a1',
      'Upcoming': '#48dbfb',
      'Completed': '#ee5a6f'
    };
    return colors[status] || '#747d8c';
  };

  if (loading) {
    return <div className="loading">Loading interns...</div>;
  }

  return (
    <div className="intern-reports">
      <div className="reports-header">
        <h1>Intern Reports</h1>
        <p>View performance reports and statistics for all interns</p>
      </div>

      <div className="interns-grid">
        {interns.length === 0 ? (
          <div className="no-interns">
            <p>No interns found in the system.</p>
          </div>
        ) : (
          interns.map((intern) => (
            <div key={intern._id} className="intern-card">
              <div className="intern-header">
                <div className="intern-info">
                  <h3>{intern.email}</h3>
                  <p className="intern-type">
                    {intern.internType === 'free' ? 'Free Intern' : 'Stipend Intern'}
                  </p>
                </div>
                <div 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(getInternStatus(intern)) }}
                >
                  {getInternStatus(intern)}
                </div>
              </div>

              <div className="intern-details">
                <div className="detail-item">
                  <label>Internship Period:</label>
                  <span>
                    {new Date(intern.internshipStartDate).toLocaleDateString()} - {new Date(intern.internshipEndDate).toLocaleDateString()}
                  </span>
                </div>
                {intern.acceptanceDate && (
                  <div className="detail-item">
                    <label>Acceptance Date:</label>
                    <span>{new Date(intern.acceptanceDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="intern-actions">
                <button 
                  onClick={() => handleViewReport(intern)}
                  className="btn btn-primary view-report-btn"
                >
                  📊 View Report
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Intern Performance Report</h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            
            <div className="modal-body">
              {reportLoading ? (
                <div className="loading">Loading report...</div>
              ) : internReport ? (
                <div className="report-content">
                  <div className="report-header">
                    <h3>{selectedIntern.email}</h3>
                    <p>
                      Internship Period: {new Date(selectedIntern.internshipStartDate).toLocaleDateString()} - {new Date(selectedIntern.internshipEndDate).toLocaleDateString()}
                    </p>
                    <p>Intern Type: {selectedIntern.internType === 'free' ? 'Free' : 'Stipend'}</p>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <h4>Total Tasks</h4>
                      <div className="stat-number">{internReport.statistics.totalTasks}</div>
                    </div>
                    <div className="stat-card">
                      <h4>Completed</h4>
                      <div className="stat-number">{internReport.statistics.completedTasks}</div>
                    </div>
                    <div className="stat-card">
                      <h4>In Progress</h4>
                      <div className="stat-number">{internReport.statistics.inProgressTasks}</div>
                    </div>
                    <div className="stat-card">
                      <h4>Completion Rate</h4>
                      <div className="stat-number">{internReport.statistics.completionRate}%</div>
                    </div>
                  </div>

                  <div className="report-section">
                    <h4>Task Priority Breakdown</h4>
                    <div className="priority-breakdown">
                      <div className="priority-item">
                        <span className="priority-label">High Priority:</span>
                        <span>{internReport.priorityBreakdown.high.completed} of {internReport.priorityBreakdown.high.total} completed ({internReport.priorityBreakdown.high.completionRate}%)</span>
                      </div>
                      <div className="priority-item">
                        <span className="priority-label">Medium Priority:</span>
                        <span>{internReport.priorityBreakdown.medium.completed} of {internReport.priorityBreakdown.medium.total} completed ({internReport.priorityBreakdown.medium.completionRate}%)</span>
                      </div>
                      <div className="priority-item">
                        <span className="priority-label">Low Priority:</span>
                        <span>{internReport.priorityBreakdown.low.completed} of {internReport.priorityBreakdown.low.total} completed ({internReport.priorityBreakdown.low.completionRate}%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="report-section">
                    <h4>Recent Activity</h4>
                    <div className="recent-activity">
                      {internReport.recentActivity.map((task, index) => (
                        <div key={index} className="activity-item">
                          <div className="activity-header">
                            <span className="task-title">{task.title}</span>
                            <span className={`status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>
                              {task.status}
                            </span>
                          </div>
                          <div className="activity-details">
                            <span>Priority: {task.priority}</span>
                            <span>Reward: ₹{task.reward}</span>
                            {task.completedAt && (
                              <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="report-footer">
                    <p>Report generated on: {new Date().toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="no-report">
                  <p>No report data available for this intern.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternReports;
