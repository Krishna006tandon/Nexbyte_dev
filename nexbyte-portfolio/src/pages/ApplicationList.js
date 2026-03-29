import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ApplicationList.css';

const ApplicationList = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewTarget, setInterviewTarget] = useState(null);
  const [interviewDateTime, setInterviewDateTime] = useState('');
  const [interviewMeetLink, setInterviewMeetLink] = useState('');
  const [interviewSubmitting, setInterviewSubmitting] = useState(false);
  const [interviewError, setInterviewError] = useState('');

  const roles = ['Web Development Intern', 'Frontend Intern', 'Backend Intern', 'UI/UX Intern', 'Digital Marketing Intern'];
  const statuses = ['new', 'reviewing', 'interview', 'approved', 'rejected', 'hired'];

  // const getMockApplications = () => [
  //   {
  //     id: 1,
  //     name: 'Rahul Sharma',
  //     email: 'rahul@example.com',
  //     role: 'Web Development Intern',
  //     college: 'Delhi University',
  //     dateApplied: '2024-01-15',
  //     status: 'new',
  //     message: 'I want to learn modern web development with React and Node.js',
  //     resume: null
  //   },
  //   {
  //     id: 2,
  //     name: 'Priya Patel',
  //     email: 'priya@example.com',
  //     role: 'Frontend Intern',
  //     college: 'IIT Bombay',
  //     dateApplied: '2024-01-14',
  //     status: 'under_review',
  //     message: 'Passionate about creating beautiful user interfaces',
  //     resume: 'resume.pdf'
  //   },
  //   {
  //     id: 3,
  //     name: 'Amit Kumar',
  //     email: 'amit@example.com',
  //     role: 'Backend Intern',
  //     college: 'NIT Trichy',
  //     dateApplied: '2024-01-13',
  //     status: 'approved',
  //     message: 'Want to learn server-side development and databases',
  //     resume: 'amit_resume.pdf'
  //   },
  //   {
  //     id: 4,
  //     name: 'Sneha Reddy',
  //     email: 'sneha@example.com',
  //     role: 'UI/UX Intern',
  //     college: 'NID Ahmedabad',
  //     dateApplied: '2024-01-12',
  //     status: 'rejected',
  //     message: 'Interested in user experience design',
  //     resume: null
  //   },
  //   {
  //     id: 5,
  //     name: 'Vikram Singh',
  //     email: 'vikram@example.com',
  //     role: 'Digital Marketing Intern',
  //     college: 'MBA Delhi',
  //     dateApplied: '2024-01-11',
  //     status: 'shortlisted',
  //     message: 'Want to learn digital marketing strategies',
  //     resume: 'vikram_cv.pdf'
  //   },
  //   {
  //     id: 6,
  //     name: 'Anjali Gupta',
  //     email: 'anjali@example.com',
  //     role: 'Web Development Intern',
  //     college: 'Pune University',
  //     dateApplied: '2024-01-10',
  //     status: 'new',
  //     message: 'Interested in full-stack development',
  //     resume: null
  //   },
  //   {
  //     id: 7,
  //     name: 'Rohit Verma',
  //     email: 'rohit@example.com',
  //     role: 'Frontend Intern',
  //     college: 'JNU Delhi',
  //     dateApplied: '2024-01-09',
  //     status: 'under_review',
  //     message: 'Love working with React and modern CSS',
  //     resume: 'rohit_resume.pdf'
  //   }
  // ];

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/internship/applications');
        const applicationsData = response.data;
        setApplications(applicationsData);
        setFilteredApplications(applicationsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.education || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(app => app.role === roleFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(app => {
        const appDate = new Date(app.dateApplied);
        return appDate >= filterDate;
      });
    }

    setFilteredApplications(filtered);
  }, [searchTerm, roleFilter, statusFilter, dateFilter, applications]);

  const getStatusColor = (status) => {
    const colors = {
      new: '#ff6b6b',
      reviewing: '#feca57',
      interview: '#48dbfb',
      approved: '#1dd1a1',
      rejected: '#ee5a6f',
      hired: '#00d2d3'
    };
    return colors[status] || '#747d8c';
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: 'New',
      reviewing: 'Under Review',
      interview: 'Interview',
      approved: 'Approved',
      rejected: 'Rejected',
      hired: 'Hired'
    };
    return labels[status] || status;
  };

  const handleViewApplication = (appId) => {
    navigate(`/admin/application-detail/${appId}`);
  };

  const handleEditApplication = (appId) => {
    console.log('Edit application:', appId);
    // Open edit modal or navigate to edit page
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      if (newStatus === 'interview') {
        const target = applications.find(a => a._id === appId) || null;
        setInterviewTarget(target);
        setInterviewDateTime(target?.interviewDate ? new Date(target.interviewDate).toISOString().slice(0, 16) : '');
        setInterviewMeetLink(target?.interviewMeetLink || '');
        setInterviewError('');
        setShowInterviewModal(true);
        return;
      }

      const response = await axios.put(`/api/internship/applications/${appId}/status`, {
        status: newStatus
      });

      const updated = response.data;
      setApplications(prev => prev.map(app => (app._id === appId ? updated : app)));
      setFilteredApplications(prev => prev.map(app => (app._id === appId ? updated : app)));
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleInterviewCancel = () => {
    if (interviewSubmitting) return;
    setShowInterviewModal(false);
    setInterviewTarget(null);
    setInterviewDateTime('');
    setInterviewMeetLink('');
    setInterviewError('');
  };

  const handleInterviewSubmit = async () => {
    if (!interviewTarget?._id) return;
    setInterviewError('');

    if (!interviewDateTime) {
      setInterviewError('Please select interview date & time.');
      return;
    }
    if (!interviewMeetLink.trim()) {
      setInterviewError('Please paste Google Meet link.');
      return;
    }

    let isoDate = '';
    try {
      isoDate = new Date(interviewDateTime).toISOString();
    } catch {
      setInterviewError('Invalid date/time.');
      return;
    }

    try {
      setInterviewSubmitting(true);
      const response = await axios.put(`/api/internship/applications/${interviewTarget._id}/status`, {
        status: 'interview',
        interviewDate: isoDate,
        interviewMeetLink: interviewMeetLink.trim(),
      });
      const updated = response.data;
      setApplications(prev => prev.map(app => (app._id === interviewTarget._id ? updated : app)));
      setFilteredApplications(prev => prev.map(app => (app._id === interviewTarget._id ? updated : app)));
      setShowInterviewModal(false);
      setInterviewTarget(null);
      setInterviewDateTime('');
      setInterviewMeetLink('');
    } catch (error) {
      console.error('Error scheduling interview:', error);
      const msg = error?.response?.data?.message || 'Failed to schedule interview. Please try again.';
      setInterviewError(msg);
    } finally {
      setInterviewSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setDateFilter('');
  };

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="application-list">
      <div className="list-header">
        <h1>Internship Applications</h1>
        <div className="header-stats">
          <span className="total-count">Total: {filteredApplications.length}</span>
          <span className="filter-count">Filtered: {filteredApplications.length}</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, or college..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-dropdowns">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{getStatusLabel(status)}</option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-date"
            />
          </div>

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || roleFilter || statusFilter || dateFilter) && (
          <div className="active-filters">
            <span>Active Filters:</span>
            {searchTerm && <span className="filter-tag">Search: {searchTerm}</span>}
            {roleFilter && <span className="filter-tag">Role: {roleFilter}</span>}
            {statusFilter && <span className="filter-tag">Status: {getStatusLabel(statusFilter)}</span>}
            {dateFilter && <span className="filter-tag">Date: {new Date(dateFilter).toLocaleDateString()}</span>}
          </div>
        )}
      </div>

      {/* Applications Table */}
      <div className="applications-table-container">
        <table className="applications-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>College</th>
              <th>Date Applied</th>
              <th>Status</th>
              <th>Resume</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-results">
                  No applications found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredApplications.map(app => (
                <tr key={app._id} className="application-row">
                  <td className="name-cell">
                    <div className="applicant-name">{app.name}</div>
                  </td>
                  <td className="email-cell">
                    <a href={`mailto:${app.email}`} className="email-link">{app.email}</a>
                  </td>
                  <td className="role-cell">
                    <span className="role-badge">{app.role}</span>
                  </td>
                  <td className="education-cell">{app.education || 'N/A'}</td>
                  <td className="date-cell">
                    {new Date(app.dateApplied).toLocaleDateString()}
                  </td>
                  <td className="status-cell">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className="status-select"
                      style={{ backgroundColor: getStatusColor(app.status) }}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {getStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="resume-cell">
                    {app.resumeUrl || app.resume ? (
                      <span className="resume-available">✓ Available</span>
                    ) : (
                      <span className="resume-missing">—</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleViewApplication(app._id)}
                      className="action-btn view-btn"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditApplication(app._id)}
                      className="action-btn edit-btn"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showInterviewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={handleInterviewCancel}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              background: '#fff',
              borderRadius: 12,
              padding: 18,
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Schedule Interview</h2>
            <p style={{ marginTop: 6, color: '#555' }}>
              Status will move to <strong>Interview</strong> and applicant ko email auto-send ho jayega date/time + Google Meet link ke saath.
            </p>

            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Interview Date & Time</label>
              <input
                type="datetime-local"
                value={interviewDateTime}
                onChange={(e) => setInterviewDateTime(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Google Meet Link</label>
              <input
                type="url"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={interviewMeetLink}
                onChange={(e) => setInterviewMeetLink(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>

            {interviewError && (
              <div style={{ marginTop: 10, color: '#b91c1c', fontWeight: 600 }}>
                {interviewError}
              </div>
            )}

            <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="action-btn"
                onClick={handleInterviewCancel}
                disabled={interviewSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="action-btn view-btn"
                onClick={handleInterviewSubmit}
                disabled={interviewSubmitting}
              >
                {interviewSubmitting ? 'Sending...' : 'Save & Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination (if needed) */}
      <div className="pagination">
        <div className="pagination-info">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      </div>
    </div>
  );
};

export default ApplicationList;
