import React, { useState, useEffect } from 'react';
import './InternPanel.css';
import InternSidebar from '../components/InternSidebar';

const InternPanel = () => {
  const [internTasks, setInternTasks] = useState([]);
  const [offerLetter, setOfferLetter] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return <div className="intern-panel-container">Loading...</div>;
  }

  if (error) {
    return <div className="intern-panel-container">Error: {error}</div>;
  }

  return (
    <div className="intern-panel-container">
      <InternSidebar />
      <div className="main-content">
        <h1>Intern Dashboard</h1>

        {offerLetter && (
          <div className="offer-letter-section">
            <h2>Your Offer Letter</h2>
            <div className="offer-letter-content" dangerouslySetInnerHTML={{ __html: offerLetter }} />
            <button onClick={() => handleDownloadOfferLetter(profile)} className="btn btn-primary">Download Offer Letter</button>
          </div>
        )}

        <h2>Your Assigned Tasks</h2>
        {internTasks.length === 0 ? (
          <p>No tasks assigned to you yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                <th>Reward (INR)</th>
              </tr>
            </thead>
            <tbody>
              {internTasks.map(task => (
                <tr key={task._id}>
                  <td>{task.task_title}</td>
                  <td>{task.task_description}</td>
                  <td>{task.status}</td>
                  <td>₹{task.reward_amount_in_INR}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InternPanel;
