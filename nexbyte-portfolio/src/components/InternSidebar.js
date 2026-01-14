import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './InternSidebar.css';

const InternSidebar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: "/intern-panel", text: "Dashboard", section: "dashboard" },
    { to: "/intern-panel/offer", text: "Offer Letter", section: "offer" },
    { to: "/intern-panel/tasks", text: "Tasks", section: "tasks" },
    { to: "/profile", text: "Profile", section: "profile" },
    { to: "/intern-panel/diary", text: "Daily Diary", section: "diary" },
    { to: "/intern-panel/reports", text: "Growth Report", section: "reports" },
    { to: "/intern-panel/certificate", text: "Certificate 🎓", className: "certificate-link", section: "certificate" },
    { to: "/intern-panel/resources", text: "Resources", section: "resources" },
    { to: "/settings", text: "Settings", section: "settings" },
  ];

  const handleNavigation = (link) => {
    if (link.section) {
      // For intern panel sections, update the active section
      navigate('/intern-panel', { state: { activeSection: link.section } });
      // Also update URL for better navigation
      window.history.pushState({}, '', link.to);
    } else {
      // For other routes, navigate normally
      navigate(link.to);
    }
  };

  const isActive = (link) => {
    if (link.section) {
      return location.pathname === '/intern-panel' && location.state?.activeSection === link.section;
    }
    return location.pathname === link.to;
  };

  return (
    <div className="intern-sidebar">
      {user && (
        <div className="intern-sidebar-profile">
          <div className="intern-sidebar-profile-info">
            <span>{user.email}</span>
            <span>Credits: {user.credits}</span>
          </div>
        </div>
      )}
      <ul>
        {links.map(link => (
          <li key={link.to}>
            <button 
              className={`${link.className || ''} ${isActive(link) ? 'active' : ''}`}
              onClick={() => handleNavigation(link)}
              style={link.className === 'certificate-link' ? {
                background: 'linear-gradient(135deg, #f59e0b, #d97706) !important',
                color: 'white !important',
                fontWeight: 'bold !important',
                border: '2px solid #f59e0b !important'
              } : {}}
            >
              {link.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InternSidebar;
