import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-center">Contact Us</h1>
      <form className="contact-form">
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" className="form-control dark-input" id="name" />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input type="email" className="form-control dark-input" id="email" />
        </div>
        <div className="mb-3">
          <label htmlFor="message" className="form-label">Message</label>
          <textarea className="form-control dark-input" id="message" rows="3"></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default Contact;