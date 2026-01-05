import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAdmin, isClient, setIsAdmin, setIsClient } = useContext(AuthContext);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const navigate = useNavigate();
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAdmin(false);
    setIsClient(false);
    navigate('/');
  };

  const loggedIn = isAdmin || isClient;

  return (
    <header className="header">
      <nav className="navbar">
        <NavLink className="nav-logo" to="/">Nexbyte_Core</NavLink>
        <div className={`nav-menu collapse ${!isNavCollapsed ? 'show' : ''}`}>
          <NavLink className="nav-link" to="/" end>Home</NavLink>
          <NavLink className="nav-link" to="/about">About</NavLink>
          <NavLink className="nav-link" to="/services">Services</NavLink>
          <NavLink className="nav-link" to="/internship">Internship</NavLink>
          <NavLink className="nav-link" to="/contact">Contact</NavLink>
          {isAdmin && <NavLink className="nav-link" to="/admin">Admin</NavLink>}
          {isClient && <NavLink className="nav-link" to="/client-panel">Client Panel</NavLink>}
          
          <div style={{ flexGrow: 1 }}></div>

          {loggedIn ? (
            <>
              <NavLink className="nav-link" to="/profile">Profile</NavLink>
              <button className="nav-link nav-link-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink className="nav-link nav-link-button" to="/login">Login</NavLink>
              <NavLink className="nav-link nav-link-button btn-primary" to="/signup">Sign Up</NavLink>
            </>
          )}
        </div>
        <button className={`nav-toggler ${!isNavCollapsed ? 'active' : ''}`} type="button" onClick={handleNavCollapse}>
          <span className="toggler-icon"></span>
          <span className="toggler-icon"></span>
          <span className="toggler-icon"></span>
        </button>
      </nav>
    </header>
  );
};

export default Navbar;