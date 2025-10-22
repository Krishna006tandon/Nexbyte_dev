import React from 'react';
import { Link } from 'react-router-dom';
import './HomeSidebar.css';

const HomeSidebar = () => {
  return (
    <div className="home-sidebar">
      <ul>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/services">Services</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </div>
  );
};

export default HomeSidebar;
