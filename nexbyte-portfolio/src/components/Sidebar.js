import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { isAdmin, user } = useContext(AuthContext);

  const links = [
    { to: "/admin", text: "Dashboard" },
    { to: "/admin/billing", text: "Billing" },
    { to: "/admin/clients", text: "Clients" },
    { to: "/admin/messages", text: "Client Messages" },
    { to: "/admin/contacts", text: "Contact Messages" },
    { to: "/admin/members", text: "Members" },
    { to: "/admin/srs-generator", text: "SRS Generator" },
    { to: "/admin/tasks", text: "Task Manager" },
    
    
    ];

  

  links.sort((a, b) => a.text.localeCompare(b.text));

  return (
    <div className="sidebar">
      {user && (
        <div className="sidebar-profile">
          <img src="https://i.pravatar.cc/150?img=32" alt="User Avatar" />
          <div className="sidebar-profile-info">
            <span>{user.email}</span>
            <span>Credits: {user.credits}</span>
          </div>
        </div>
      )}
      <ul>
        {links.map(link => (
          <li key={link.to}><Link to={link.to}>{link.text}</Link></li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;


