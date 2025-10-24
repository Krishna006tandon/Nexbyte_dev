import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { isAdmin } = useContext(AuthContext);

  const links = [
    { to: "/admin/billing", text: "Billing" },
    { to: "/admin/clients", text: "Clients" },
    { to: "/admin/messages", text: "Client Messages" },
    { to: "/admin/contacts", text: "Contact Messages" },
    { to: "/admin", text: "Dashboard" },
    { to: "/admin/members", text: "Members" },
    { to: "/admin/srs-generator", text: "SRS Generator" },
    { to: "/admin/task-generator", text: "Task Generator" },
    { to: "/admin/task-list", text: "Task List" },
    { to: "/admin/contributions", text: "Contributions" },
  ];

  if (isAdmin) {
    links.push({ to: "/admin/worklist", text: "Worklist" });
  }

  links.sort((a, b) => a.text.localeCompare(b.text));

  return (
    <div className="sidebar">
      <ul>
        {links.map(link => (
          <li key={link.to}><Link to={link.to}>{link.text}</Link></li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;


