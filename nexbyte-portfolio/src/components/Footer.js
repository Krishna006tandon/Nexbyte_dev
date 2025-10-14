import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-white text-center py-3 mt-auto">
      <div className="container">
        <div className="social-icons mb-2">
          <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
          <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
          <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
          <a href="#" className="social-icon"><i className="fab fa-github"></i></a>
        </div>
        <span>&copy; {new Date().getFullYear()} Nexbyte. All Rights Reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;