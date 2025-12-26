import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InternPanel.css';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InternPanel = () => {
  const { user, isIntern, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [resources, setResources] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  
  // Form states
  const [offerLetter, setOfferLetter] = useState(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diaryEntry, setDiaryEntry] = useState('');
  const [profileForm, setProfileForm] = useState({});
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    theme: 'dark',
    language: 'en'
  });

  useEffect(() => {
    console.log('InternPanel - User:', user);
    console.log('InternPanel - isIntern:', isIntern);
    console.log('InternPanel - authLoading:', authLoading);
    
    if (authLoading) return;
    
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'intern') {
      console.log(`User role is ${user.role}, not intern. Access denied.`);
      navigate('/dashboard');
      return;
    }
    
    fetchInternData();
  }, [user, isIntern, authLoading, navigate]);

  const fetchInternData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'x-auth-token': token };

    try {
      // Fetch all data in parallel
      const [
        profileRes,
        tasksRes,
        diaryRes,
        reportsRes,
        notificationsRes,
        resourcesRes,
        teamRes
      ] = await Promise.all([
        fetch('/api/profile', { headers }),
        fetch('/api/tasks', { headers }),
        fetch('/api/diary', { headers }),
        fetch('/api/reports', { headers }),
        fetch('/api/notifications', { headers }),
        fetch('/api/resources', { headers }),
        fetch('/api/team', { headers })
      ]);

      const data = await Promise.all([
        profileRes.json(),
        tasksRes.json(),
        diaryRes.json(),
        reportsRes.json(),
        notificationsRes.json(),
        resourcesRes.json(),
        teamRes.json()
      ]);

      if (profileRes.ok) {
        setProfile(data[0]);
        setOfferLetter(data[0].offerLetter);
        setProfileForm({
          firstName: data[0].firstName || '',
          lastName: data[0].lastName || '',
          phone: data[0].phone || '',
          bio: data[0].bio || '',
          skills: data[0].skills || []
        });
      }
      if (tasksRes.ok) setTasks(data[1]);
      if (diaryRes.ok) setDiaryEntries(data[2]);
      if (reportsRes.ok) setReports(data[3]);
      if (notificationsRes.ok) setNotifications(data[4]);
      if (resourcesRes.ok) setResources(data[5]);
      if (teamRes.ok) setTeamMembers(data[6]);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOfferLetter = () => {
    if (!profile?.internshipStartDate || !profile?.internshipEndDate) {
      toast.error('Internship dates not available');
      return;
    }

    const startDate = new Date(profile.internshipStartDate).toLocaleDateString();
    const endDate = new Date(profile.internshipEndDate).toLocaleDateString();
    
    const offerContent = `
      <div style="font-family: Arial, sans-serif; padding: 40px; background: #f9f9f9;">
        <h1 style="color: #333;">Internship Offer</h1>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <p>To: ${user.email}</p>
        <p>Dear ${profileForm.firstName || 'Intern'},</p>
        <p>We are pleased to offer you an internship position at NexByte Dev.</p>
        <p>Duration: ${startDate} to ${endDate}</p>
        <p>We look forward to having you join our team!</p>
        <p>Best regards,<br>NexByte Dev Team</p>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = offerContent;
    
    window.html2pdf().from(element).save(`offer_letter_${user.email}.pdf`);
  };

  const handleAcceptOffer = async () => {
    if (!window.confirm('Are you sure you want to accept this internship offer?')) return;
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/intern/accept-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ status: 'accepted' })
      });

      if (response.ok) {
        toast.success('Offer accepted successfully!');
        fetchInternData();
      } else {
        throw new Error('Failed to accept offer');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectOffer = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/intern/reject-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ 
          status: 'rejected',
          reason: rejectionReason
        })
      });

      if (response.ok) {
        toast.success('Offer rejected successfully');
        setShowRejectForm(false);
        setRejectionReason('');
        fetchInternData();
      } else {
        throw new Error('Failed to reject offer');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiarySubmit = async () => {
    if (!diaryEntry.trim()) {
      toast.error('Please write something in your diary');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ content: diaryEntry })
      });

      if (response.ok) {
        toast.success('Diary entry saved!');
        setDiaryEntry('');
        fetchInternData();
      } else {
        throw new Error('Failed to save diary entry');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        fetchInternData();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Settings updated successfully!');
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    
    return { total, completed, pending, inProgress };
  };

  const getGrowthData = () => {
    return reports.map(report => ({
      date: new Date(report.date).toLocaleDateString(),
      skills: report.skillsLearned || [],
      performance: report.performanceScore || 0,
      feedback: report.feedback || ''
    }));
  };

  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (error) {
    return <div className="intern-panel-error">Error: {error}</div>;
  }

  const stats = getTaskStats();
  const growthData = getGrowthData();

  return (
    <div className="intern-panel-container">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Sidebar Navigation */}
      <aside className="intern-sidebar">
        <div className="sidebar-header">
          <div className="intern-logo">
            <h3>NexByte</h3>
            <span>Intern Portal</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button 
                className={`nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveSection('dashboard')}
              >
                <i className="fas fa-home"></i>
                Dashboard
              </button>
            </li>
            <li>
              <button 
                className={`nav-btn ${activeSection === 'offer' ? 'active' : ''}`}
                onClick={() => setActiveSection('offer')}
              >
                <i className="fas fa-file-contract"></i>
                Offer Letter
              </button>
            </li>
            <li>
              <button 
                className={`nav-btn ${activeSection === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveSection('tasks')}
              >
                <i className="fas fa-tasks"></i>
                Tasks
              </button>
            </li>
            <li>
              <button 
                className={`nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveSection('profile')}
              >
                <i className="fas fa-user"></i>
                Profile
              </button>
            </li>
            <li>
              <button 
                className={`nav-btn ${activeSection === 'diary' ? 'active' : ''}`}
                onClick={() => setActiveSection('diary')}
              >
                <i className="fas fa-book"></i>
                Daily Diary
              </button>
            </li>
            <li>
              <button 
                className={`nav-btn ${activeSection === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveSection('reports')}
              >
                <i className="fas fa-chart-line"></i>
                Growth Report
              </button>
            </li>
            <li>
              <button 
                className={`nav-btn ${activeSection === 'resources' ? 'active' : ''}`}
                onClick={() => setActiveSection('resources')}
              >
                <i className="fas fa-book-open"></i>
                Resources
              </button>
            </li>
            <li>
              <button 
                className={`nav-btn ${activeSection === 'team' ? 'active' : ''}`}
                onClick={() => setActiveSection('team')}
              >
                <i className="fas fa-users"></i>
                Team
              </button>
            </li>
            <li>
              <button 
                className={`nav-btn ${activeSection === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveSection('settings')}
              >
                <i className="fas fa-cog"></i>
                Settings
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="user-details">
              <p className="user-name">{profileForm.firstName || user.email.split('@')[0]}</p>
              <p className="user-role">Intern</p>
            </div>
          </div>
          <button 
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="intern-main-content">
        <header className="content-header">
          <div className="header-left">
            <h1>Welcome back, {profileForm.firstName || 'Intern'}!</h1>
            <p>Here's what's happening with your internship today.</p>
          </div>
          <div className="header-right">
            <div className="notification-bell">
              <i className="fas fa-bell"></i>
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </div>
          </div>
        </header>

        <div className="content-body">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="dashboard-section">
              <div className="stats-grid">
                <div className="stat-card total-tasks">
                  <div className="stat-icon">
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.total}</h3>
                    <p>Total Tasks</p>
                  </div>
                </div>
                
                <div className="stat-card completed-tasks">
                  <div className="stat-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.completed}</h3>
                    <p>Completed</p>
                  </div>
                </div>
                
                <div className="stat-card pending-tasks">
                  <div className="stat-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.pending}</h3>
                    <p>Pending</p>
                  </div>
                </div>
                
                <div className="stat-card growth-score">
                  <div className="stat-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{growthData.length > 0 ? growthData[growthData.length - 1].performance : 0}%</h3>
                    <p>Growth Score</p>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="dashboard-card recent-tasks">
                  <h3>Recent Tasks</h3>
                  <div className="task-list-mini">
                    {tasks.slice(0, 3).map(task => (
                      <div key={task._id} className="task-item-mini">
                        <div className="task-info">
                          <h4>{task.title}</h4>
                          <span className={`status-badge ${task.status}`}>{task.status}</span>
                        </div>
                        {task.dueDate && (
                          <small>Due: {new Date(task.dueDate).toLocaleDateString()}</small>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-card recent-diary">
                  <h3>Latest Diary Entry</h3>
                  {diaryEntries.length > 0 ? (
                    <div className="diary-preview">
                      <p className="diary-date">
                        {new Date(diaryEntries[0].date).toLocaleDateString()}
                      </p>
                      <p className="diary-content">
                        {diaryEntries[0].content.substring(0, 150)}...
                      </p>
                    </div>
                  ) : (
                    <p className="no-entries">No diary entries yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Offer Letter Section */}
          {activeSection === 'offer' && (
            <div className="offer-section">
              <div className="section-header">
                <h2>Internship Offer Letter</h2>
                <p>Review and respond to your internship offer</p>
              </div>
              
              {offerLetter ? (
                <div className="offer-card">
                  <div className="offer-content" dangerouslySetInnerHTML={{ __html: offerLetter }} />
                  
                  <div className="offer-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={handleDownloadOfferLetter}
                    >
                      <i className="fas fa-download"></i>
                      Download Offer Letter
                    </button>
                    
                    {(!profile?.offerStatus || profile?.offerStatus === 'pending') && (
                      <>
                        <button 
                          className="btn btn-success"
                          onClick={handleAcceptOffer}
                          disabled={isSubmitting}
                        >
                          <i className="fas fa-check"></i>
                          {isSubmitting ? 'Processing...' : 'Accept Offer'}
                        </button>
                        
                        <button 
                          className="btn btn-danger"
                          onClick={() => setShowRejectForm(!showRejectForm)}
                          disabled={isSubmitting}
                        >
                          <i className="fas fa-times"></i>
                          {showRejectForm ? 'Cancel' : 'Reject Offer'}
                        </button>
                        
                        {showRejectForm && (
                          <div className="reject-form">
                            <h4>Reason for Rejection</h4>
                            <textarea
                              placeholder="Please provide a reason for rejecting the offer"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows="4"
                              required
                            />
                            <button 
                              className="btn btn-danger"
                              onClick={handleRejectOffer}
                              disabled={!rejectionReason.trim() || isSubmitting}
                            >
                              {isSubmitting ? 'Submitting...' : 'Submit Rejection'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    
                    {profile?.offerStatus === 'accepted' && (
                      <div className="offer-status accepted">
                        <i className="fas fa-check-circle"></i>
                        <span>Offer Accepted</span>
                      </div>
                    )}
                    
                    {profile?.offerStatus === 'rejected' && (
                      <div className="offer-status rejected">
                        <i className="fas fa-times-circle"></i>
                        <span>Offer Rejected</span>
                        {profile.rejectionReason && (
                          <div className="rejection-reason">
                            <strong>Reason:</strong> {profile.rejectionReason}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-offer">
                  <i className="fas fa-file-contract"></i>
                  <h3>No Offer Letter Available</h3>
                  <p>Your offer letter hasn't been generated yet. Please check back later.</p>
                </div>
              )}
            </div>
          )}

          {/* Tasks Section */}
          {activeSection === 'tasks' && (
            <div className="tasks-section">
              <div className="section-header">
                <h2>Your Tasks</h2>
                <div className="task-filters">
                  <button className="filter-btn active">All</button>
                  <button className="filter-btn">Pending</button>
                  <button className="filter-btn">In Progress</button>
                  <button className="filter-btn">Completed</button>
                </div>
              </div>
              
              {tasks.length > 0 ? (
                <div className="task-list">
                  {tasks.map(task => (
                    <div key={task._id} className={`task-card ${task.status}`}>
                      <div className="task-header">
                        <div className="task-title">
                          <h3>{task.title}</h3>
                          <span className={`priority-badge ${task.priority || 'medium'}`}>
                            {task.priority || 'Medium'}
                          </span>
                        </div>
                        <span className={`status-badge ${task.status}`}>
                          {task.status}
                        </span>
                      </div>
                      
                      <p className="task-description">{task.description}</p>
                      
                      <div className="task-meta">
                        {task.dueDate && (
                          <div className="due-date">
                            <i className="fas fa-calendar"></i>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        {task.assignedBy && (
                          <div className="assigned-by">
                            <i className="fas fa-user"></i>
                            Assigned by: {task.assignedBy}
                          </div>
                        )}
                      </div>
                      
                      <div className="task-actions">
                        <button className="btn btn-sm btn-primary">
                          <i className="fas fa-eye"></i> View
                        </button>
                        <button className="btn btn-sm btn-secondary">
                          <i className="fas fa-edit"></i> Update
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-tasks"></i>
                  <h3>No tasks assigned yet</h3>
                  <p>Check back later for new assignments.</p>
                </div>
              )}
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Profile Information</h2>
                <p>Update your personal information and skills</p>
              </div>
              
              <div className="profile-card">
                <div className="profile-avatar">
                  <div className="avatar-placeholder">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <button className="btn btn-secondary">Change Avatar</button>
                </div>
                
                <div className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={user.email} disabled />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                      rows="4"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Skills</label>
                    <input
                      type="text"
                      value={profileForm.skills?.join(', ') || ''}
                      onChange={(e) => setProfileForm({...profileForm, skills: e.target.value.split(', ').filter(s => s.trim())})}
                      placeholder="JavaScript, React, Node.js..."
                    />
                  </div>
                  
                  <button className="btn btn-primary" onClick={handleProfileUpdate}>
                    <i className="fas fa-save"></i>
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Daily Diary Section */}
          {activeSection === 'diary' && (
            <div className="diary-section">
              <div className="section-header">
                <h2>Daily Diary</h2>
                <p>Document your daily learning and experiences</p>
              </div>
              
              <div className="diary-card">
                <div className="diary-form">
                  <h3>Today's Entry</h3>
                  <textarea
                    value={diaryEntry}
                    onChange={(e) => setDiaryEntry(e.target.value)}
                    placeholder="What did you learn today? What challenges did you face? What accomplishments are you proud of?"
                    rows="6"
                  />
                  <button className="btn btn-primary" onClick={handleDiarySubmit}>
                    <i className="fas fa-save"></i>
                    Save Entry
                  </button>
                </div>
                
                <div className="diary-history">
                  <h3>Previous Entries</h3>
                  {diaryEntries.length > 0 ? (
                    <div className="diary-list">
                      {diaryEntries.map((entry, index) => (
                        <div key={entry._id || index} className="diary-item">
                          <div className="diary-header">
                            <span className="diary-date">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="diary-content">{entry.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-entries">No previous entries found</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Growth Report Section */}
          {activeSection === 'reports' && (
            <div className="reports-section">
              <div className="section-header">
                <h2>Growth & Performance Report</h2>
                <p>Track your progress and skill development</p>
              </div>
              
              <div className="reports-grid">
                <div className="report-card performance-chart">
                  <h3>Performance Trend</h3>
                  <div className="chart-placeholder">
                    <i className="fas fa-chart-line"></i>
                    <p>Performance chart will be displayed here</p>
                  </div>
                </div>
                
                <div className="report-card skills-progress">
                  <h3>Skills Development</h3>
                  <div className="skills-list">
                    {profileForm.skills?.map((skill, index) => (
                      <div key={index} className="skill-item">
                        <span className="skill-name">{skill}</span>
                        <div className="skill-progress">
                          <div className="progress-bar" style={{width: `${Math.random() * 100}%`}}></div>
                        </div>
                      </div>
                    )) || (
                      <p>No skills added yet</p>
                    )}
                  </div>
                </div>
                
                <div className="report-card recent-reports">
                  <h3>Recent Reports</h3>
                  {reports.length > 0 ? (
                    <div className="report-list">
                      {reports.map((report, index) => (
                        <div key={report._id || index} className="report-item">
                          <div className="report-header">
                            <span className="report-date">
                              {new Date(report.date).toLocaleDateString()}
                            </span>
                            <span className="report-score">
                              Score: {report.performanceScore || 'N/A'}%
                            </span>
                          </div>
                          <p className="report-feedback">{report.feedback || 'No feedback available'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No reports available yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Resources Section */}
          {activeSection === 'resources' && (
            <div className="resources-section">
              <div className="section-header">
                <h2>Learning Resources</h2>
                <p>Access company documentation and learning materials</p>
              </div>
              
              <div className="resources-grid">
                {resources.length > 0 ? (
                  resources.map((resource, index) => (
                    <div key={resource._id || index} className="resource-card">
                      <div className="resource-icon">
                        <i className={`fas ${resource.type === 'document' ? 'fa-file-alt' : 'fa-video'}`}></i>
                      </div>
                      <h4>{resource.title}</h4>
                      <p>{resource.description}</p>
                      <button className="btn btn-primary btn-sm">
                        <i className="fas fa-external-link-alt"></i>
                        Access Resource
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-book-open"></i>
                    <h3>No resources available</h3>
                    <p>Learning materials will be added soon.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Team Section */}
          {activeSection === 'team' && (
            <div className="team-section">
              <div className="section-header">
                <h2>Team Directory</h2>
                <p>Meet your team members and mentors</p>
              </div>
              
              <div className="team-grid">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member, index) => (
                    <div key={member._id || index} className="team-card">
                      <div className="member-avatar">
                        <i className="fas fa-user-circle"></i>
                      </div>
                      <h4>{member.name}</h4>
                      <p className="member-role">{member.role}</p>
                      <p className="member-email">{member.email}</p>
                      <div className="member-actions">
                        <button className="btn btn-primary btn-sm">
                          <i className="fas fa-envelope"></i>
                          Contact
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-users"></i>
                    <h3>No team members found</h3>
                    <p>Team directory will be updated soon.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Settings</h2>
                <p>Manage your account preferences</p>
              </div>
              
              <div className="settings-card">
                <div className="setting-group">
                  <h3>Notifications</h3>
                  <div className="setting-item">
                    <label className="setting-toggle">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                      />
                      <span>Email Notifications</span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <label className="setting-toggle">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                      />
                      <span>Push Notifications</span>
                    </label>
                  </div>
                </div>
                
                <div className="setting-group">
                  <h3>Appearance</h3>
                  <div className="setting-item">
                    <label>Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => setSettings({...settings, theme: e.target.value})}
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
                
                <div className="setting-group">
                  <h3>Language</h3>
                  <div className="setting-item">
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({...settings, language: e.target.value})}
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                </div>
                
                <button className="btn btn-primary" onClick={handleSettingsUpdate}>
                  <i className="fas fa-save"></i>
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InternPanel;