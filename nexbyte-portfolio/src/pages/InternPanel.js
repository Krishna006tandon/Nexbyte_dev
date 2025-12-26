import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InternPanel.css';
import InternSidebar from '../components/InternSidebar';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InternPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [internTasks, setInternTasks] = useState([]);
  const [offerLetter, setOfferLetter] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      try {
        // Fetch tasks
        const tasksRes = await fetch('/api/tasks', { headers });
        const tasksData = await tasksRes.json();
        if (tasksRes.ok) {
          setInternTasks(tasksData);
        } else {
          setError(tasksData.message || 'Failed to fetch tasks');
        }

        // Fetch user profile for offer letter
        const profileRes = await fetch('/api/profile', { headers });
        const profileData = await profileRes.json();
        if (profileRes.ok) {
          setProfile(profileData);
          setOfferLetter(profileData.offerLetter);
        } else {
          setError(profileData.message || 'Failed to fetch profile');
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadOfferLetter = (member) => {
    if (!member.internshipStartDate || !member.internshipEndDate) {
      alert('Internship start or end date is not set for this member.');
      return;
    }
    const startDateParts = member.internshipStartDate.split('T')[0].split('-');
    const startDate = new Date(startDateParts[0], startDateParts[1] - 1, startDateParts[2]);

    const endDateParts = member.internshipEndDate.split('T')[0].split('-');
    const endDate = new Date(endDateParts[0], endDateParts[1] - 1, endDateParts[2]);

    const formattedStartDate = startDate.toLocaleDateString();
    const formattedEndDate = endDate.toLocaleDateString();

    const acceptanceDate = new Date();
    acceptanceDate.setDate(acceptanceDate.getDate() + 7);
    const formattedAcceptanceDate = acceptanceDate.toLocaleDateString();

    const offerLetterContent = `
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #0d1117;
            color: #c9d1d9;
            margin: 0;
            padding: 20px;
        }
        .offer-letter-box {
            max-width: 800px;
            margin: auto;
            padding: 50px;
            background-color: #161b22;
            border: 1px solid #30363d;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .header {
            text-align: center;
            margin-bottom: 50px;
            border-bottom: 1px solid #30363d;
            padding-bottom: 20px;
        }
        .header img {
            max-width: 150px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #58a6ff;
            font-size: 2.2em;
            font-weight: 600;
        }
        .body-content {
            line-height: 1.8;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #30363d;
            color: #8b949e;
        }
    </style>
    <div class="offer-letter-box">
        <header class="header">
            <img src="/logobill.jpg" alt="NexByte_Dev Logo">
            <h1>Offer of Internship</h1>
        </header>
        <div class="body-content">
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>To,</p>
            <p>${member.email}</p>
            <p><strong>Subject: Internship Offer at NexByte_Dev</strong></p>
            <p>Dear ${member.email.split('@')[0]},</p>
            <p>We are pleased to offer you an internship position at NexByte_Dev. This internship is starting from <strong>${formattedStartDate}</strong> to <strong>${formattedEndDate}</strong>.</p>
            <p>We believe that your skills and passion will be a great asset to our team. We are excited to see your contributions to our projects.</p>
            <p>Your internship will commence on <strong>${formattedStartDate}</strong>. Further details about your role, responsibilities, and onboarding process will be shared with you shortly.</p>
            <p>Please confirm your acceptance of this offer by <strong>${formattedAcceptanceDate}</strong>.</p>
            <p>We look forward to welcoming you to the team.</p>
            <p>Sincerely,</p>
            <p><strong>The NexByte_Dev Team</strong></p>
        </div>
        <footer class="footer">
            <p>&copy; ${new Date().getFullYear()} NexByte_Dev. All rights reserved.</p>
        </footer>
    </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = offerLetterContent;

    const opt = {
      margin:       0,
      filename:     `offer_letter_${member.email}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, backgroundColor: '#0d1117' },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    window.html2pdf().from(element).set(opt).save();
  };

  const handleAcceptOffer = async () => {
    if (!window.confirm('Are you sure you want to accept this internship offer?')) {
      return;
    }
    
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

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Offer accepted successfully!');
        // Update UI or redirect as needed
        window.location.reload();
      } else {
        throw new Error(data.message || 'Failed to accept offer');
      }
    } catch (err) {
      console.error('Error accepting offer:', err);
      toast.error(err.message || 'Failed to accept offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectOffer = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejecting the offer');
      return;
    }
    
    if (!window.confirm('Are you sure you want to reject this internship offer?')) {
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

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Offer rejected. Thank you for your response.');
        // Update UI or redirect as needed
        window.location.reload();
      } else {
        throw new Error(data.message || 'Failed to reject offer');
      }
    } catch (err) {
      console.error('Error rejecting offer:', err);
      toast.error(err.message || 'Failed to reject offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="intern-panel-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div className="intern-panel-container">Error: {error}</div>;
  }

  if (!user || user.role !== 'intern') {
    navigate('/login');
    return null;
  }

  return (
    <div className="intern-panel-container">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <InternSidebar />
      <div className="intern-main-content">
        <div className="intern-panel">
          <h2>Welcome, {user.email}</h2>
          <div className="intern-content">
            {offerLetter && (
              <div className="card offer-letter-section">
                <h3>Your Offer Letter</h3>
                <div className="offer-letter-content" dangerouslySetInnerHTML={{ __html: offerLetter }} />
                <div className="offer-letter-actions">
                  <button 
                    className="btn-download"
                    onClick={() => handleDownloadOfferLetter(profile)}
                  >
                    <i className="fas fa-download"></i> Download Offer Letter
                  </button>
                  
                  {(!profile?.offerStatus || profile?.offerStatus === 'pending') && (
                    <>
                      <button 
                        className="btn-accept"
                        onClick={handleAcceptOffer}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Accept Offer'}
                      </button>
                      
                      <button 
                        className="btn-reject"
                        onClick={() => setShowRejectForm(!showRejectForm)}
                        disabled={isSubmitting}
                      >
                        {showRejectForm ? 'Cancel' : 'Reject Offer'}
                      </button>
                      
                      {showRejectForm && (
                        <div className="reject-form">
                          <textarea
                            className="reject-reason"
                            placeholder="Please provide a reason for rejecting the offer (required)"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows="4"
                            required
                          />
                          <button 
                            className="btn-submit-reject"
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
                      <i className="fas fa-check-circle"></i> Offer Accepted
                    </div>
                  )}
                  
                  {profile?.offerStatus === 'rejected' && (
                    <div className="offer-status rejected">
                      <i className="fas fa-times-circle"></i> Offer Rejected
                      {profile.rejectionReason && (
                        <div className="rejection-reason">
                          <strong>Reason:</strong> {profile.rejectionReason}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="card tasks-section">
              <h3>Your Tasks</h3>
              {internTasks.length > 0 ? (
                <ul className="task-list">
                  {internTasks.map((task) => (
                    <li key={task._id} className="task-item">
                      <div className="task-header">
                        <h4>{task.task_title || 'Untitled Task'}</h4>
                        <span className={`status-badge ${task.status || 'pending'}`}>
                          {task.status || 'Pending'}
                        </span>
                      </div>
                      {task.task_description && (
                        <p className="task-description">{task.task_description}</p>
                      )}
                      {task.dueDate && (
                        <div className="task-meta">
                          <span className="due-date">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-tasks">
                  <p>No tasks assigned yet. Check back later or contact your supervisor.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternPanel;
