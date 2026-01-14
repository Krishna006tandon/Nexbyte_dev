import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ApplicationDetail.css';

const ApplicationDetail = () => {
  // Extract ID from URL since useParams doesn't work with Admin wildcard routing
  const getIdFromUrl = () => {
    const pathname = window.location.pathname;
    const parts = pathname.split('/');
    return parts[parts.length - 1]; // Get the last part of the URL
  };
  
  const id = getIdFromUrl();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // const getMockApplication = () => ({
  //   id: 1,
  //   name: 'Rahul Sharma',
  //   email: 'rahul@example.com',
  //   phone: '+91 9876543210',
  //   role: 'Web Development Intern',
  //   college: 'Delhi University',
  //   degree: 'B.Tech Computer Science',
  //   year: '3rd Year',
  //   dateApplied: '2024-01-15',
  //   status: 'new',
  //   message: 'I want to learn modern web development with React and Node.js. I have basic knowledge of HTML, CSS, and JavaScript, and I\'m eager to build real-world projects with a growing startup like NexByte.',
  //   resume: 'rahul_sharma_resume.pdf',
  //   portfolio: 'https://rahulportfolio.example.com',
  //   github: 'https://github.com/rahulsharma',
  //   linkedin: 'https://linkedin.com/in/rahulsharma',
  //   skills: ['HTML', 'CSS', 'JavaScript', 'React Basics', 'Node.js Basics'],
  //   experience: 'Worked on 2 college projects using HTML, CSS, and JavaScript. Created a simple e-commerce website and a personal portfolio.',
  //   availability: 'Available for 3 months internship',
  //   whyNexByte: 'I want to learn from industry experts and work on real projects that will help me build my skills and portfolio.',
  //   adminNotes: '',
  //   lastUpdated: '2024-01-15T10:30:00Z'
  // });

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id || id === 'undefined') {
        console.error('Invalid application ID:', id);
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching application with ID:', id);
        setLoading(true);
        const response = await axios.get(`/api/internship/applications/${id}`);
        const applicationData = response.data;
        console.log('Application data received:', applicationData);
        setApplication(applicationData);
        setNotes(applicationData.notes || '');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching application:', error);
        console.error('Error response:', error.response);
        setLoading(false);
      }
    };

    if (id && id !== 'undefined') {
      fetchApplication();
    } else {
      console.error('No valid ID provided');
      setLoading(false);
    }
  }, [id]);

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

  const handleStatusChange = async (newStatus) => {
    if (!id || id === 'undefined') {
      console.error('No valid application ID available');
      return;
    }
    
    try {
      const response = await axios.put(`/api/internship/applications/${id}/status`, {
        status: newStatus
      });
      setApplication(response.data);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!id || id === 'undefined') {
      console.error('No valid application ID available');
      return;
    }
    
    try {
      const response = await axios.put(`/api/internship/applications/${id}/status`, {
        notes: notes
      });
      setApplication(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleDownloadResume = async () => {
    if (!id || id === 'undefined') {
      console.error('No valid application ID available');
      return;
    }
    
    try {
      const response = await axios.put(`/api/internship/applications/${id}/status`, {
        resume: application.resume
      });
      setApplication(response.data);
    } catch (error) {
      console.error('Error updating resume download status:', error);
    }
  };

  const handleSendEmail = () => {
    if (!application) {
      console.error('No application data available');
      return;
    }
    
    // In real app, this would open email client or send email
    window.location.href = `mailto:${application.email}`;
  };

  if (loading) {
    return <div className="loading">Loading application details...</div>;
  }

  if (!application) {
    return <div className="not-found">Application not found</div>;
  }

  return (
    <div className="application-detail">
      <div className="detail-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin/application-list')} className="back-btn">
            ← Back to Applications
          </button>
          <h1>Application Details</h1>
        </div>
        <div className="header-right">
          <div className="status-badge" style={{ backgroundColor: getStatusColor(application.status) }}>
            {getStatusLabel(application.status)}
          </div>
          <div className="application-id">ID: #{id}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="action-group">
          <label>Change Status:</label>
          <select
            value={application.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="status-select"
          >
            <option value="new">New</option>
            <option value="reviewing">Under Review</option>
            <option value="interview">Interview</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>

        <div className="action-buttons">
          <button onClick={handleSendEmail} className="action-btn email-btn">
            📧 Send Email
          </button>
          <button onClick={handleDownloadResume} className="action-btn download-btn">
            📄 Download Resume
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Applicant Details
          </button>
          <button
            className={`tab ${activeTab === 'message' ? 'active' : ''}`}
            onClick={() => setActiveTab('message')}
          >
            Message
          </button>
          <button
            className={`tab ${activeTab === 'resume' ? 'active' : ''}`}
            onClick={() => setActiveTab('resume')}
          >
            Resume & Portfolio
          </button>
          <button
            className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Admin Notes
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'details' && (
            <div className="details-section">
              <div className="details-grid">
                <div className="detail-group">
                  <h3>Personal Information</h3>
                  <div className="detail-item">
                    <label>Full Name:</label>
                    <span>{application.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <a href={`mailto:${application.email}`}>{application.email}</a>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{application.phone}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h3>Academic Information</h3>
                  <div className="detail-item">
                    <label>Education:</label>
                    <span>{application.education || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h3>Internship Details</h3>
                  <div className="detail-item">
                    <label>Applied Role:</label>
                    <span>{application.role}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date Applied:</label>
                    <span>{new Date(application.dateApplied).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{application.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h3>Skills</h3>
                  <div className="skills-list">
                    {application.skills ? application.skills.split(',').map((skill, index) => (
                      <span key={index} className="skill-tag">{skill.trim()}</span>
                    )) : <span>No skills listed</span>}
                  </div>
                </div>

                <div className="detail-group full-width">
                  <h3>Experience</h3>
                  <p>{application.experience}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'message' && (
            <div className="message-section">
              <h3>Cover Letter</h3>
              <div className="message-content">
                <p>{application.coverLetter || 'No cover letter provided'}</p>
              </div>
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="resume-section">
              <div className="resume-info">
                <h3>Resume</h3>
                <div className="file-info">
                  <span className="file-name">📄 {application.resume}</span>
                  <button onClick={handleDownloadResume} className="download-resume-btn">
                    Download Resume
                  </button>
                </div>
              </div>

              <div className="portfolio-links">
                <h3>Portfolio & Links</h3>
                <div className="links-grid">
                  {application.portfolio && (
                    <a href={application.portfolio} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                      🌐 Portfolio
                    </a>
                  )}
                  {application.github && (
                    <a href={application.github} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                      💻 GitHub
                    </a>
                  )}
                  {application.linkedin && (
                    <a href={application.linkedin} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                      💼 LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="notes-section">
              <h3>Admin Notes</h3>
              {isEditing ? (
                <div className="notes-editor">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes about this applicant..."
                    className="notes-textarea"
                  />
                  <div className="notes-actions">
                    <button onClick={handleSaveNotes} className="save-btn">
                      Save Notes
                    </button>
                    <button onClick={() => setIsEditing(false)} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="notes-display">
                  <p>{notes || 'No notes added yet.'}</p>
                  <button onClick={() => setIsEditing(true)} className="edit-notes-btn">
                    ✏️ Edit Notes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="footer-info">
        <p>Last Updated: {new Date(application.lastUpdated).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ApplicationDetail;
