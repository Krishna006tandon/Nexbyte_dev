import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  const links = [
    { to: "/admin", text: "Dashboard" },
    { to: "/admin/billing", text: "Billing" },
    { to: "/admin/clients", text: "Clients" },
    { to: "/admin/projects", text: "Projects" },
    { to: "/admin/messages", text: "Client Messages" },
    { to: "/admin/contacts", text: "Contact Messages" },
    { to: "/admin/members", text: "Members" },
    { to: "/admin/reports", text: "User Reports" },
    { to: "/admin/srs-generator", text: "SRS Generator" },
    { to: "/admin/tasks", text: "Task Generator" },
    { to: "/admin/task-management", text: "Task Management" },
    
    
    ];

  

  links.sort((a, b) => a.text.localeCompare(b.text));

  return (
    <div className="sidebar">
      {user && (
        <div className="sidebar-profile">
          
          <div className="sidebar-profile-info">
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

export default Sidebar;


