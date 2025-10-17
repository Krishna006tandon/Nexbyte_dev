import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li><Link to="/admin">Dashboard</Link></li>
        <li><Link to="/admin/contacts">Contact Messages</Link></li>
        <li><Link to="/admin/members">Members</Link></li>
        <li><Link to="/admin/clients">Clients</Link></li>
        <li><Link to="/admin/srs-generator">SRS Generator</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;