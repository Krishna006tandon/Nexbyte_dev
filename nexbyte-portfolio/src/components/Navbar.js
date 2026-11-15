import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const {
    isAdmin,
    isClient,
    isIntern,
    user,
    setIsAdmin,
    setIsClient,
    setIsIntern,
    setUser,
    logout,
  } = useContext(AuthContext);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const navigate = useNavigate();
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);
  const closeNav = () => setIsNavCollapsed(true);

  const handleLogout = () => {
    if (typeof logout === 'function') {
      logout();
    } else {
      localStorage.removeItem('token');
      setIsAdmin?.(false);
      setIsClient?.(false);
      setIsIntern?.(false);
      setUser?.(null);
    }
    setIsNavCollapsed(true);
    navigate('/');
  };

  const loggedIn = Boolean(user || isAdmin || isClient || isIntern);

  return (
    <header className="header">
      <nav className="navbar">
        <NavLink className="nav-logo" to="/" onClick={closeNav}>Nexbyte_Core</NavLink>
        <div className={`nav-menu ${!isNavCollapsed ? 'show' : ''}`}>
          <NavLink className="nav-link" to="/" end onClick={closeNav}>Home</NavLink>
          <NavLink className="nav-link" to="/about" onClick={closeNav}>About</NavLink>
          <NavLink className="nav-link" to="/services" onClick={closeNav}>Services</NavLink>
          <NavLink className="nav-link" to="/contact" onClick={closeNav}>Contact</NavLink>
          {isAdmin && <NavLink className="nav-link" to="/admin" onClick={closeNav}>Admin</NavLink>}
          {isClient && <NavLink className="nav-link" to="/client-panel" onClick={closeNav}>Client Panel</NavLink>}
          {isIntern && <NavLink className="nav-link" to="/intern-panel" onClick={closeNav}>Intern Panel</NavLink>}
          {user?.role === 'member' && <NavLink className="nav-link" to="/member" onClick={closeNav}>Member</NavLink>}

          <div style={{ flexGrow: 1 }}></div>

          {loggedIn ? (
            <>
              <NavLink className="nav-link" to="/profile" onClick={closeNav}>Profile</NavLink>
              <button className="nav-link nav-link-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink className="nav-link nav-link-button" to="/login" onClick={closeNav}>Login</NavLink>
              <NavLink className="nav-link nav-link-button btn-primary" to="/signup" onClick={closeNav}>Sign Up</NavLink>
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
