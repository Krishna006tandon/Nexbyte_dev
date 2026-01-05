import React, { useState } from 'react';
import './Internship.css';

const Internship = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    college: '',
    role: '',
    resume: null,
    message: ''
  });

  const [showFAQ, setShowFAQ] = useState({});

  const roles = [
    'Web Development Intern',
    'Frontend Intern',
    'Backend Intern',
    'UI/UX Intern',
    'Digital Marketing Intern'
  ];

  const faqs = [
    { q: 'Is this internship paid?', a: 'No, this is an unpaid learning-focused internship.' },
    { q: 'Will I get a certificate?', a: 'Yes, after successful completion of the internship.' },
    { q: 'Is it remote?', a: 'Yes, this is a remote internship.' },
    { q: 'How long is the internship?', a: '1, 2, or 3 months based on your preference and performance.' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Application submitted:', formData);
    alert('Application submitted successfully! We will contact you soon.');
    setFormData({
      fullName: '',
      email: '',
      college: '',
      role: '',
      resume: null,
      message: ''
    });
  };

  const toggleFAQ = (index) => {
    setShowFAQ(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="internship-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Start your tech journey with NexByte</h1>
          <p className="hero-subtitle">Learn by building real-world projects with a growing startup.</p>
          <button className="apply-btn" onClick={() => document.getElementById('application-form').scrollIntoView({ behavior: 'smooth' })}>
            👉 Apply for Internship
          </button>
        </div>
      </section>

      {/* Internship Type */}
      <section className="internship-type">
        <div className="container">
          <h2>Internship Details</h2>
          <div className="type-grid">
            <div className="type-item">
              <strong>Type:</strong> Unpaid / Free Internship
            </div>
            <div className="type-item">
              <strong>Mode:</strong> Remote
            </div>
            <div className="type-item">
              <strong>Duration:</strong> 1 / 2 / 3 months
            </div>
          </div>
          <p className="honest-line">This is a learning-focused, unpaid internship designed for students and freshers.</p>
        </div>
      </section>

      {/* Who Can Apply */}
      <section className="who-can-apply">
        <div className="container">
          <h2>Who Can Apply</h2>
          <div className="eligibility-list">
            <div className="eligibility-item">✓ Students (any year)</div>
            <div className="eligibility-item">✓ Freshers</div>
            <div className="eligibility-item">✓ Basic knowledge required</div>
            <div className="eligibility-item">✓ Passion to learn & build</div>
          </div>
        </div>
      </section>

      {/* Available Roles */}
      <section className="available-roles">
        <div className="container">
          <h2>Available Internship Roles</h2>
          <div className="roles-grid">
            {roles.map((role, index) => (
              <div key={index} className="role-card">
                <h3>{role}</h3>
                <button className="role-apply-btn" onClick={() => {
                  setFormData(prev => ({ ...prev, role }));
                  document.getElementById('application-form').scrollIntoView({ behavior: 'smooth' });
                }}>
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="what-you-learn">
        <div className="container">
          <h2>What You'll Learn</h2>
          <div className="learning-grid">
            <div className="learning-item">🚀 Real project experience</div>
            <div className="learning-item">🏭 Industry workflow</div>
            <div className="learning-item">👥 Team collaboration</div>
            <div className="learning-item">📝 Code reviews & task-based work</div>
            <div className="learning-item">🏢 How startups actually work</div>
          </div>
        </div>
      </section>

      {/* Internship Benefits */}
      <section className="internship-benefits">
        <div className="container">
          <h2>Internship Benefits</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">🎓</div>
              <h3>Internship Certificate</h3>
              <p>Official certificate upon successful completion</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">📋</div>
              <h3>Letter of Recommendation</h3>
              <p>Performance-based recommendation letter</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">💼</div>
              <h3>Portfolio-worthy Projects</h3>
              <p>Build real projects for your portfolio</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🎯</div>
              <h3>Mentorship & Guidance</h3>
              <p>Direct mentorship from industry professionals</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🌟</div>
              <h3>Startup Exposure</h3>
              <p>Experience how real startups operate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Internship Rules */}
      <section className="internship-rules">
        <div className="container">
          <h2>Internship Rules</h2>
          <div className="rules-list">
            <div className="rule-item">• This is an unpaid internship</div>
            <div className="rule-item">• No stipend provided</div>
            <div className="rule-item">• Certificate only after successful completion</div>
            <div className="rule-item">• Work consistency required</div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="application-form" className="application-form">
        <div className="container">
          <h2>Apply Now</h2>
          <form onSubmit={handleSubmit} className="internship-form">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>College / Background *</label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Internship Role *</label>
              <select name="role" value={formData.role} onChange={handleInputChange} required>
                <option value="">Select a role</option>
                {roles.map((role, index) => (
                  <option key={index} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Resume (Optional)</label>
              <input
                type="file"
                name="resume"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
              />
            </div>
            <div className="form-group">
              <label>Why do you want to learn with NexByte? *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="4"
              ></textarea>
            </div>
            <button type="submit" className="submit-btn">Apply Now</button>
          </form>
        </div>
      </section>

      {/* FAQs */}
      <section className="faqs">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="faq-question" onClick={() => toggleFAQ(index)}>
                  <h3>{faq.q}</h3>
                  <span className={`faq-toggle ${showFAQ[index] ? 'active' : ''}`}>+</span>
                </div>
                {showFAQ[index] && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="contact-section">
        <div className="container">
          <h2>Get in Touch</h2>
          <p>For queries: <a href="mailto:nexbyte.dev@gmail.com">nexbyte.dev@gmail.com</a></p>
          <p>Mobile: <a href="tel:+919175603240">+91 9175603240</a></p>
        </div>
      </section>
    </div>
  );
};

export default Internship;
