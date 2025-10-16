import React, { useState } from 'react';
import './Contact.css';

const Alert = ({ message, type }) => {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} role="alert">
      {message}
    </div>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });
  const [alert, setAlert] = useState({ message: null, type: null });

  const { name, email, mobile, message } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.id]: e.target.value });

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: null, type: null }), 5000);
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!name || !email || !mobile || !message) {
      return showAlert('Please fill in all fields', 'danger');
    }
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
      return showAlert('Invalid email format', 'danger');
    }
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      return showAlert('Invalid mobile number format', 'danger');
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('Message sent successfully!', 'success');
        setFormData({
          name: '',
          email: '',
          mobile: '',
          message: ''
        });
      } else {
        showAlert(data.message, 'danger');
      }
    } catch (err) {
      console.error(err);
      showAlert('Something went wrong!', 'danger');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Contact Us</h1>
      <Alert message={alert.message} type={alert.type} />
      <form className="contact-form" onSubmit={onSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" className="form-control dark-input" id="name" value={name} onChange={onChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input type="email" className="form-control dark-input" id="email" value={email} onChange={onChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="mobile" className="form-label">Mobile</label>
          <input type="text" className="form-control dark-input" id="mobile" value={mobile} onChange={onChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="message" className-="form-label">Message</label>
          <textarea className="form-control dark-input" id="message" rows="3" value={message} onChange={onChange}></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default Contact;