import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });

  const { name, email, mobile, message } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.id]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      console.log(data);
      alert('Message sent successfully!');
      setFormData({
        name: '',
        email: '',
        mobile: '',
        message: ''
      });
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Contact Us</h1>
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