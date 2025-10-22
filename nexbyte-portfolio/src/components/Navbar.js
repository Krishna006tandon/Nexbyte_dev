import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  return (
    <header className="header">
      <nav className="navbar">
        <NavLink className="nav-logo" to="/">Nexbyte</NavLink>
        <div className={`nav-menu collapse ${!isNavCollapsed ? 'show' : ''}`}>
          <NavLink className="nav-link" to="/" end>Home</NavLink>
          <NavLink className="nav-link" to="/about">About</NavLink>
          <NavLink className="nav-link" to="/services">Services</NavLink>
          <NavLink className="nav-link" to="/contact">Contact</NavLink>
          <NavLink className="nav-link" to="/dashboard">Dashboard</NavLink>
          <NavLink className="nav-link" to="/profile">Profile</NavLink>
          
          {/* Spacing element */}
          <div style={{ flexGrow: 1 }}></div>

          {/* All buttons visible for review */}
          <NavLink className="nav-link nav-link-button" to="/login">Login</NavLink>
          <NavLink className="nav-link nav-link-button btn-primary" to="/signup">Sign Up</NavLink>
          <NavLink className="nav-link nav-link-button" to="/">Logout</NavLink>
        </div>
        <button className="nav-toggler" type="button" onClick={handleNavCollapse}>
          <span className="toggler-icon"></span>
          <span className="toggler-icon"></span>
          <span className="toggler-icon"></span>
        </button>
      </nav>
    </header>
  );
};

export default Navbar;