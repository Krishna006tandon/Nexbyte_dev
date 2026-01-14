import React, { useState } from 'react';
import './EmailAutomation.css';

const EmailAutomation = () => {
  const [emailSettings, setEmailSettings] = useState({
    enabled: false, // Disabled automatic emails
    autoReply: false,
    approvalEmail: false,
    rejectionEmail: false,
    completionEmail: false,
    customTemplates: {
      applicationReceived: {
        subject: 'Application Received - NexByte Internship',
        body: `Dear {name},

Thank you for applying to the NexByte Internship program! We have received your application for the {role} position.

Application Details:
- Name: {name}
- Email: {email}
- Role: {role}
- Date Applied: {date}

Our team will review your application and get back to you within 3-5 business days. In the meantime, feel free to check out our website and social media to learn more about what we do.

Best regards,
NexByte Team`
      },
      applicationApproved: {
        subject: 'Congratulations! Your Internship Application is Approved - NexByte',
        body: `Dear {name},

Congratulations! We are pleased to inform you that your application for the {role} position at NexByte has been approved.

Next Steps:
1. You will receive a separate email with internship details
2. Please confirm your availability within 48 hours
3. We will schedule an onboarding call to discuss the internship

Internship Details:
- Role: {role}
- Duration: {duration}
- Start Date: {startDate}
- Mentor: {mentor}

We are excited to have you join our team and look forward to working with you!

Best regards,
NexByte Team`
      },
      applicationRejected: {
        subject: 'Regarding Your Internship Application - NexByte',
        body: `Dear {name},

Thank you for your interest in the NexByte Internship program and for taking the time to apply for the {role} position.

After careful consideration of your application, we regret to inform you that we are unable to offer you an internship at this time. The competition was very strong, and the decision was difficult.

We encourage you to:
- Keep building your skills and portfolio
- Apply again in the future when new positions become available
- Follow us on social media for updates

We wish you the best in your future endeavors and thank you for your interest in NexByte.

Best regards,
NexByte Team`
      },
      internshipCompleted: {
        subject: 'Internship Completion Certificate - NexByte',
        body: `Dear {name},

Congratulations on successfully completing your internship at NexByte!

Internship Summary:
- Role: {role}
- Duration: {duration}
- Start Date: {startDate}
- End Date: {endDate}
- Mentor: {mentor}

Your certificate of completion is attached to this email. We hope you found valuable experience during your time with us.

We would appreciate it if you could:
- Provide feedback about your internship experience
- Update your LinkedIn profile with your NexByte experience
- Consider writing a testimonial for our website

Thank you for your contributions to NexByte. We wish you success in your future career!

Best regards,
NexByte Team`
      }
    }
  });

  const [emailLogs] = useState([
    {
      id: 1,
      type: 'application_received',
      recipient: 'rahul@example.com',
      subject: 'Application Received - NexByte Internship',
      sentAt: '2024-01-15T10:30:00Z',
      status: 'sent'
    },
    {
      id: 2,
      type: 'application_approved',
      recipient: 'amit@example.com',
      subject: 'Congratulations! Your Internship Application is Approved - NexByte',
      sentAt: '2024-01-14T15:45:00Z',
      status: 'sent'
    },
    {
      id: 3,
      type: 'application_rejected',
      recipient: 'sneha@example.com',
      subject: 'Regarding Your Internship Application - NexByte',
      sentAt: '2024-01-13T09:20:00Z',
      status: 'sent'
    }
  ]);

  const [editingTemplate, setEditingTemplate] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);

  const handleToggleSetting = (setting) => {
    setEmailSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleEditTemplate = (templateType) => {
    setEditingTemplate(templateType);
  };

  const handleSaveTemplate = (templateType, field, value) => {
    setEmailSettings(prev => ({
      ...prev,
      customTemplates: {
        ...prev.customTemplates,
        [templateType]: {
          ...prev.customTemplates[templateType],
          [field]: value
        }
      }
    }));
  };

  const handleSendTestEmail = () => {
    console.log('Sending test email to:', testEmail);
    // In real app, this would send actual test email
    alert(`Test email sent to ${testEmail}!`);
    setTestEmail('');
    setShowTestModal(false);
  };

  const getEmailTypeLabel = (type) => {
    const labels = {
      application_received: 'Application Received',
      application_approved: 'Application Approved',
      application_rejected: 'Application Rejected',
      internship_completed: 'Internship Completed'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      sent: '#1dd1a1',
      pending: '#feca57',
      failed: '#ee5a6f'
    };
    return colors[status] || '#747d8c';
  };

  return (
    <div className="email-automation">
      <div className="automation-header">
        <h1>Email Automation System</h1>
        <div className="header-actions">
          <button 
            onClick={() => setShowTestModal(true)}
            className="test-btn"
          >
            📧 Send Test Email
          </button>
        </div>
      </div>

      {/* Settings Section */}
      <div className="settings-section">
        <h2>Email Settings</h2>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <h3>Enable Email Automation</h3>
              <p>Turn on/off automatic email sending</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={emailSettings.enabled}
                onChange={() => handleToggleSetting('enabled')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Auto Reply to Applications</h3>
              <p>Send confirmation email when application is received</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={emailSettings.autoReply}
                onChange={() => handleToggleSetting('autoReply')}
                disabled={!emailSettings.enabled}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Approval Emails</h3>
              <p>Send email when application is approved</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={emailSettings.approvalEmail}
                onChange={() => handleToggleSetting('approvalEmail')}
                disabled={!emailSettings.enabled}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Rejection Emails</h3>
              <p>Send polite rejection email</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={emailSettings.rejectionEmail}
                onChange={() => handleToggleSetting('rejectionEmail')}
                disabled={!emailSettings.enabled}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Completion Emails</h3>
              <p>Send certificate and completion email</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={emailSettings.completionEmail}
                onChange={() => handleToggleSetting('completionEmail')}
                disabled={!emailSettings.enabled}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Email Templates Section */}
      <div className="templates-section">
        <h2>Email Templates</h2>
        <div className="templates-grid">
          {Object.entries(emailSettings.customTemplates).map(([key, template]) => (
            <div key={key} className="template-card">
              <div className="template-header">
                <h3>{getEmailTypeLabel(key)}</h3>
                <button
                  onClick={() => handleEditTemplate(editingTemplate === key ? null : key)}
                  className="edit-template-btn"
                >
                  {editingTemplate === key ? 'Cancel' : '✏️ Edit'}
                </button>
              </div>

              {editingTemplate === key ? (
                <div className="template-editor">
                  <div className="form-group">
                    <label>Subject:</label>
                    <input
                      type="text"
                      value={template.subject}
                      onChange={(e) => handleSaveTemplate(key, 'subject', e.target.value)}
                      className="template-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Body:</label>
                    <textarea
                      value={template.body}
                      onChange={(e) => handleSaveTemplate(key, 'body', e.target.value)}
                      className="template-textarea"
                      rows="10"
                    />
                  </div>
                  <div className="template-variables">
                    <p>Available variables: name, email, role, date, duration, startDate, endDate, mentor</p>
                  </div>
                </div>
              ) : (
                <div className="template-preview">
                  <div className="preview-subject">
                    <strong>Subject:</strong> {template.subject}
                  </div>
                  <div className="preview-body">
                    <strong>Body:</strong>
                    <pre>{template.body}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Email Logs Section */}
      <div className="logs-section">
        <h2>Email Logs</h2>
        <div className="logs-table">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Recipient</th>
                <th>Subject</th>
                <th>Sent At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {emailLogs.map(log => (
                <tr key={log.id}>
                  <td>
                    <span className="email-type-badge">
                      {getEmailTypeLabel(log.type)}
                    </span>
                  </td>
                  <td>{log.recipient}</td>
                  <td>{log.subject}</td>
                  <td>{new Date(log.sentAt).toLocaleString()}</td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(log.status) }}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Send Test Email</h3>
            <div className="form-group">
              <label>Email Address:</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address"
                className="modal-input"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSendTestEmail} className="send-btn">
                Send Test Email
              </button>
              <button onClick={() => setShowTestModal(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailAutomation;
