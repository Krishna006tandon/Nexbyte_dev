import React, { useState } from 'react';
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import '../components/Form.css';
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
    <div className="contact-page">
      <header className="page-header">
        <h1 className="page-title">Contact Us</h1>
        <p className="page-subtitle">
          Have a project in mind or just want to say hello? We'd love to hear from you. 
          Fill out the form below or send us an email.
        </p>
      </header>

      <div className="contact-content">
        <div className="contact-info-wrapper">
          <h3>Get in Touch</h3>
          <p>We are available by email or phone.</p>
          <div className="contact-info-item">
            <div className="icon"><FaEnvelope /></div>
            <span>nexbyte.dev@gmail.com</span>
          </div>
          <div className="contact-info-item">
            <div className="icon"><FaPhone /></div>
            <span>+91 9175603240</span>
          </div>
        </div>

        <div className="contact-form-wrapper">
          <h3>Send a Message</h3>
          <Alert message={alert.message} type={alert.type} />
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <input type="text" className="form-control" id="name" value={name} onChange={onChange} />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email" value={email} onChange={onChange} />
            </div>
            <div className="form-group">
              <label htmlFor="mobile" className="form-label">Mobile</label>
              <input type="text" className="form-control" id="mobile" value={mobile} onChange={onChange} />
            </div>
            <div className="form-group">
              <label htmlFor="message" className="form-label">Message</label>
              <textarea className="form-control" id="message" value={message} onChange={onChange}></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
