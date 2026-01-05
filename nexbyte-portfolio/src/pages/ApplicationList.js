import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const roles = ['Web Development Intern', 'Frontend Intern', 'Backend Intern', 'UI/UX Intern', 'Digital Marketing Intern'];
  const statuses = ['new', 'under_review', 'shortlisted', 'approved', 'rejected', 'completed'];

  const getMockApplications = () => [
    {
      id: 1,
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      role: 'Web Development Intern',
      college: 'Delhi University',
      dateApplied: '2024-01-15',
      status: 'new',
      message: 'I want to learn modern web development with React and Node.js',
      resume: null
    },
    {
      id: 2,
      name: 'Priya Patel',
      email: 'priya@example.com',
      role: 'Frontend Intern',
      college: 'IIT Bombay',
      dateApplied: '2024-01-14',
      status: 'under_review',
      message: 'Passionate about creating beautiful user interfaces',
      resume: 'resume.pdf'
    },
    {
      id: 3,
      name: 'Amit Kumar',
      email: 'amit@example.com',
      role: 'Backend Intern',
      college: 'NIT Trichy',
      dateApplied: '2024-01-13',
      status: 'approved',
      message: 'Want to learn server-side development and databases',
      resume: 'amit_resume.pdf'
    },
    {
      id: 4,
      name: 'Sneha Reddy',
      email: 'sneha@example.com',
      role: 'UI/UX Intern',
      college: 'NID Ahmedabad',
      dateApplied: '2024-01-12',
      status: 'rejected',
      message: 'Interested in user experience design',
      resume: null
    },
    {
      id: 5,
      name: 'Vikram Singh',
      email: 'vikram@example.com',
      role: 'Digital Marketing Intern',
      college: 'MBA Delhi',
      dateApplied: '2024-01-11',
      status: 'shortlisted',
      message: 'Want to learn digital marketing strategies',
      resume: 'vikram_cv.pdf'
    },
    {
      id: 6,
      name: 'Anjali Gupta',
      email: 'anjali@example.com',
      role: 'Web Development Intern',
      college: 'Pune University',
      dateApplied: '2024-01-10',
      status: 'new',
      message: 'Interested in full-stack development',
      resume: null
    },
    {
      id: 7,
      name: 'Rohit Verma',
      email: 'rohit@example.com',
      role: 'Frontend Intern',
      college: 'JNU Delhi',
      dateApplied: '2024-01-09',
      status: 'under_review',
      message: 'Love working with React and modern CSS',
      resume: 'rohit_resume.pdf'
    }
  ];

  useEffect(() => {
    const mockApplications = getMockApplications();
    setApplications(mockApplications);
    setFilteredApplications(mockApplications);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.college.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleViewApplication = (appId) => {
    navigate(`/admin/application-detail/${appId}`);
  };

  const handleEditApplication = (appId) => {
    console.log('Edit application:', appId);
    // Open edit modal or navigate to edit page
  };

  const handleStatusChange = (appId, newStatus) => {
    setApplications(applications.map(app => 
      app.id === appId ? { ...app, status: newStatus } : app
    ));
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
                <tr key={app.id} className="application-row">
                  <td className="name-cell">
                    <div className="applicant-name">{app.name}</div>
                  </td>
                  <td className="email-cell">
                    <a href={`mailto:${app.email}`} className="email-link">{app.email}</a>
                  </td>
                  <td className="role-cell">
                    <span className="role-badge">{app.role}</span>
                  </td>
                  <td className="college-cell">{app.college}</td>
                  <td className="date-cell">
                    {new Date(app.dateApplied).toLocaleDateString()}
                  </td>
                  <td className="status-cell">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
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
                    {app.resume ? (
                      <span className="resume-available">✓ Available</span>
                    ) : (
                      <span className="resume-missing">—</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleViewApplication(app.id)}
                      className="action-btn view-btn"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditApplication(app.id)}
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
