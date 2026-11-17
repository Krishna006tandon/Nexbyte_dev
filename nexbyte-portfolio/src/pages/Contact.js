import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt, 
  FaClock, 
  FaCheckCircle, 
  FaWhatsapp, 
  FaGoogle, 
  FaComments,
  FaMapMarkerAlt
} from 'react-icons/fa';
import '../components/Form.css';
import './Contact.css';

const TIME_SLOTS = [
  '10:00 AM - 10:15 AM',
  '11:30 AM - 11:45 AM',
  '02:30 PM - 02:45 PM',
  '04:00 PM - 04:15 PM',
  '05:30 PM - 05:45 PM',
  '07:00 PM - 07:15 PM'
];

const MEETING_TOPICS = [
  'Custom Web App / SaaS Architecture',
  'Mobile App Development (React Native)',
  'AI Integration & Automation Workflows',
  'E-Commerce & Payment Infrastructure',
  'Codebase Audit & Performance Scaling',
  'Internship & Career Opportunities'
];

const Contact = () => {
  const [activeTab, setActiveTab] = useState('call'); // 'call' or 'message'

  // Booking Form State
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);
  const [selectedTopic, setSelectedTopic] = useState(MEETING_TOPICS[0]);
  const [bookName, setBookName] = useState('');
  const [bookEmail, setBookEmail] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [bookNotes, setBookNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // General Message State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });
  const [alert, setAlert] = useState({ message: null, type: null });

  // Generate upcoming 6 business dates
  const availableDates = useMemo(() => {
    const dates = [];
    const now = new Date();
    let count = 0;
    let dayOffset = 1;

    while (count < 6) {
      const d = new Date(now);
      d.setDate(now.getDate() + dayOffset);
      const dayOfWeek = d.getDay();
      // Skip Sundays (0)
      if (dayOfWeek !== 0) {
        const dateStr = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
        const isoStr = d.toISOString().split('T')[0];
        dates.push({ label: dateStr, value: isoStr });
        count++;
      }
      dayOffset++;
    }
    return dates;
  }, []);

  // Set default date
  React.useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0].value);
    }
  }, [availableDates, selectedDate]);

  const onMessageChange = e => setFormData({ ...formData, [e.target.id]: e.target.value });

  const showMessageAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: null, type: null }), 5000);
  };

  // Submit General Message
  const onMessageSubmit = async e => {
    e.preventDefault();
    const { name, email, mobile, message } = formData;
    if (!name || !email || !mobile || !message) {
      return showMessageAlert('Please fill in all fields', 'danger');
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        showMessageAlert('Message sent successfully! We will get back to you shortly.', 'success');
        setFormData({ name: '', email: '', mobile: '', message: '' });
      } else {
        showMessageAlert(data.message || 'Error sending message', 'danger');
      }
    } catch (err) {
      console.error(err);
      showMessageAlert('Failed to send message. Please try WhatsApp.', 'danger');
    }
  };

  // Submit Discovery Call Booking
  const onBookingSubmit = async e => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');

    try {
      const res = await fetch('/api/schedule-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookName,
          email: bookEmail,
          phone: bookPhone,
          date: selectedDate,
          timeSlot: selectedSlot,
          topic: selectedTopic,
          notes: bookNotes
        })
      });

      const data = await res.json();
      if (res.ok) {
        setBookingSuccess(true);
      } else {
        setBookingError(data.message || 'Failed to schedule meeting.');
      }
    } catch (err) {
      console.error(err);
      setBookingError('Network error. You can also connect directly on WhatsApp.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Build Google Calendar Add Link
  const googleCalendarUrl = useMemo(() => {
    if (!selectedDate || !selectedSlot) return '';
    const title = encodeURIComponent(`15-Min Discovery Session: ${bookName || 'Client'} x Nexbyte`);
    const details = encodeURIComponent(`Meeting Focus: ${selectedTopic}\nClient: ${bookName}\nEmail: ${bookEmail}\nPhone: ${bookPhone}\nNotes: ${bookNotes}\n\nNexbyte Contact: nexbyte.dev@gmail.com`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=Google+Meet`;
  }, [selectedDate, selectedSlot, bookName, selectedTopic, bookEmail, bookPhone, bookNotes]);

  return (
    <>
      <Helmet>
        <title>Contact & Schedule Discovery Call | NexByte Core</title>
        <meta name="description" content="Schedule a 15-minute technical discovery call with NexByte Core or send our engineering team an inquiry." />
      </Helmet>

      <div className="contact-page">
        <header className="page-header text-center">
          <span className="contact-badge">Let's Connect</span>
          <h1 className="page-title">Start Your Next Big Build</h1>
          <p className="page-subtitle">
            Schedule a 15-minute consultation with our lead technical architect, or send us a quick inquiry below.
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="contact-tabs-container">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'call' ? 'active' : ''}`}
            onClick={() => setActiveTab('call')}
          >
            <FaCalendarAlt /> Book 15-Min Discovery Call
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'message' ? 'active' : ''}`}
            onClick={() => setActiveTab('message')}
          >
            <FaComments /> Send a Direct Message
          </button>
        </div>

        <div className="contact-main-grid">
          {/* Left: Contact Info & Value Prop */}
          <div className="contact-info-card">
            <h3>Direct Channels</h3>
            <p className="info-intro">
              Whether you're exploring an MVP or seeking technical guidance, we respond promptly.
            </p>

            <div className="info-list">
              <a href="mailto:nexbyte.dev@gmail.com" className="info-row">
                <div className="info-icon"><FaEnvelope /></div>
                <div>
                  <strong>Email Us</strong>
                  <span>nexbyte.dev@gmail.com</span>
                </div>
              </a>

              <a href="tel:+919175603240" className="info-row">
                <div className="info-icon"><FaPhone /></div>
                <div>
                  <strong>Call Directly</strong>
                  <span>+91 9175603240</span>
                </div>
              </a>

              <a 
                href="https://wa.me/919175603240?text=Hi%20Nexbyte!%20I'd%20like%20to%20discuss%20a%20project." 
                target="_blank" 
                rel="noopener noreferrer" 
                className="info-row whatsapp-highlight"
              >
                <div className="info-icon whatsapp-icon"><FaWhatsapp /></div>
                <div>
                  <strong>WhatsApp Chat</strong>
                  <span>Instant response in minutes</span>
                </div>
              </a>

              <div className="info-row">
                <div className="info-icon"><FaMapMarkerAlt /></div>
                <div>
                  <strong>Headquarters</strong>
                  <span>Pune / Remote Worldwide</span>
                </div>
              </div>
            </div>

            <div className="consultation-perks">
              <h4>What happens on the 15-Min Call?</h4>
              <ul>
                <li>✓ Clarify core technical scope & feasibility</li>
                <li>✓ Recommended tech stack & timeline options</li>
                <li>✓ Ballpark estimate & architectural roadmap</li>
                <li>✓ Zero pressure, zero sales pitch</li>
              </ul>
            </div>
          </div>

          {/* Right: Tab Content */}
          <div className="contact-interactive-panel">
            {activeTab === 'call' ? (
              <div className="booking-panel">
                {!bookingSuccess ? (
                  <>
                    <div className="panel-head">
                      <h3>Schedule 15-Min Technical Consultation</h3>
                      <p>Select your preferred date & time slot for a Google Meet / Phone session.</p>
                    </div>

                    <form onSubmit={onBookingSubmit} className="booking-form">
                      {/* Step 1: Select Date */}
                      <div className="booking-step">
                        <label className="step-label">1. Choose Date</label>
                        <div className="date-picker-pills">
                          {availableDates.map(d => (
                            <button
                              key={d.value}
                              type="button"
                              className={`date-pill ${selectedDate === d.value ? 'active' : ''}`}
                              onClick={() => setSelectedDate(d.value)}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 2: Select Time Slot */}
                      <div className="booking-step">
                        <label className="step-label">2. Select Time Slot (IST)</label>
                        <div className="slots-grid">
                          {TIME_SLOTS.map(slot => (
                            <button
                              key={slot}
                              type="button"
                              className={`slot-pill ${selectedSlot === slot ? 'active' : ''}`}
                              onClick={() => setSelectedSlot(slot)}
                            >
                              <FaClock /> {slot}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 3: Meeting Focus */}
                      <div className="booking-step">
                        <label className="step-label">3. Meeting Focus</label>
                        <select
                          className="form-control"
                          value={selectedTopic}
                          onChange={e => setSelectedTopic(e.target.value)}
                        >
                          {MEETING_TOPICS.map((topic, i) => (
                            <option key={i} value={topic}>{topic}</option>
                          ))}
                        </select>
                      </div>

                      {/* Step 4: Contact Information */}
                      <div className="booking-step">
                        <label className="step-label">4. Your Details</label>
                        <div className="form-row-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Your Name *"
                            value={bookName}
                            onChange={e => setBookName(e.target.value)}
                            required
                          />
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Email Address *"
                            value={bookEmail}
                            onChange={e => setBookEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-row-2 mt-2">
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="Phone / WhatsApp Number"
                            value={bookPhone}
                            onChange={e => setBookPhone(e.target.value)}
                          />
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Brief project notes (optional)"
                            value={bookNotes}
                            onChange={e => setBookNotes(e.target.value)}
                          />
                        </div>
                      </div>

                      {bookingError && <div className="alert-box error"><p>{bookingError}</p></div>}

                      <button type="submit" className="btn btn-primary submit-booking-btn" disabled={bookingLoading}>
                        {bookingLoading ? 'Reserving Slot...' : 'Confirm 15-Min Discovery Call'}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="booking-success-box text-center">
                    <FaCheckCircle className="success-icon" />
                    <h3>Session Successfully Scheduled!</h3>
                    <p className="success-sub">
                      We have reserved your 15-minute consultation on <strong>{selectedDate}</strong> during <strong>{selectedSlot}</strong>.
                    </p>
                    <p className="confirm-note">A confirmation email has been dispatched to <strong>{bookEmail}</strong>.</p>

                    <div className="success-action-btns">
                      <a
                        href={googleCalendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-calendar"
                      >
                        <FaGoogle /> Add to Google Calendar
                      </a>
                      <a
                        href={`https://wa.me/919175603240?text=Hi%20Nexbyte!%20I%20just%20booked%20a%20call%20for%20${selectedDate}%20at%20${selectedSlot}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp"
                      >
                        <FaWhatsapp /> Ping on WhatsApp
                      </a>
                    </div>

                    <button
                      type="button"
                      className="btn btn-ghost mt-3"
                      onClick={() => { setBookingSuccess(false); setBookName(''); setBookEmail(''); }}
                    >
                      Schedule Another Session
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="message-panel">
                <div className="panel-head">
                  <h3>Send a Written Inquiry</h3>
                  <p>Leave us a message with your project details and we will reply within 24 hours.</p>
                </div>

                {alert.message && (
                  <div className={`alert-box ${alert.type === 'danger' ? 'error' : 'success'}`}>
                    <p>{alert.message}</p>
                  </div>
                )}

                <form onSubmit={onMessageSubmit} className="message-form">
                  <div className="form-group">
                    <label htmlFor="name">Your Name *</label>
                    <input
                      type="text"
                      id="name"
                      className="form-control"
                      placeholder="e.g., Alex Parker"
                      value={formData.name}
                      onChange={onMessageChange}
                      required
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={onMessageChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="mobile">Mobile Number (10 digits) *</label>
                      <input
                        type="tel"
                        id="mobile"
                        className="form-control"
                        placeholder="e.g., 9876543210"
                        value={formData.mobile}
                        onChange={onMessageChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      rows="5"
                      className="form-control"
                      placeholder="Describe your project, goals, or questions..."
                      value={formData.message}
                      onChange={onMessageChange}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary submit-btn">
                    Send Message
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
