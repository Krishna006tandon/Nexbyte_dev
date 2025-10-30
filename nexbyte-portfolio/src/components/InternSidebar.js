import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './InternSidebar.css';

const InternSidebar = () => {
  const { user } = useContext(AuthContext);

  const links = [
    { to: "/intern-panel", text: "Dashboard" },
    { to: "/profile", text: "Profile" },
    { to: "/settings", text: "Settings" },
    // Add more intern-specific links here
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
          <li key={link.to}><NavLink to={link.to}>{link.text}</NavLink></li>
        ))}
      </ul>
    </div>
  );
};

export default InternSidebar;
