import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './InternSidebar.css';

const InternSidebar = () => {
  const { user } = useContext(AuthContext);

  const links = [
    { to: "/intern-panel", text: "Dashboard" },
    { to: "/intern-panel/offer", text: "Offer Letter" },
    { to: "/intern-panel/tasks", text: "Tasks" },
    { to: "/profile", text: "Profile" },
    { to: "/intern-panel/diary", text: "Daily Diary" },
    { to: "/intern-panel/reports", text: "Growth Report" },
    { to: "/intern-panel/certificate", text: "Certificate 🎓", className: "certificate-link" },
    { to: "/intern-panel/resources", text: "Resources" },
    { to: "/settings", text: "Settings" },
  ];

  links.sort((a, b) => a.text.localeCompare(b.text));

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
            <NavLink 
              to={link.to} 
              className={link.className || ''}
              style={link.className === 'certificate-link' ? {
                background: 'linear-gradient(135deg, #f59e0b, #d97706) !important',
                color: 'white !important',
                fontWeight: 'bold !important',
                border: '2px solid #f59e0b !important'
              } : {}}
            >
              {link.text}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InternSidebar;
