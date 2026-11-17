import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUserTie, FaGraduationCap, FaLock, FaEnvelope, FaUser, FaBuilding, FaPhone, FaLaptopCode, FaCheckCircle } from 'react-icons/fa';
import '../components/Form.css';
import './Auth.css';

const Signup = () => {
  const [accountType, setAccountType] = useState('client'); // 'client' or 'intern'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [track, setTrack] = useState('Full-Stack Web Development');
  const [projectGoal, setProjectGoal] = useState('Custom Web Application');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const { setIsAdmin, setIsClient, setIsIntern, fetchUser } = useContext(AuthContext);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        email,
        password,
        role: accountType,
        accountType,
        phone,
        ...(accountType === 'client' && {
          companyName: companyName || name,
          projectName: projectGoal,
          projectRequirements: `New client account for ${projectGoal}`
        }),
        ...(accountType === 'intern' && {
          domain: track,
          track: track
        })
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`${accountType === 'client' ? 'Client' : 'Intern'} account created successfully! Redirecting...`);
        localStorage.setItem('token', data.token);

        setIsAdmin(false);
        setIsClient(accountType === 'client');
        setIsIntern(accountType === 'intern');

        await fetchUser();

        setTimeout(() => {
          if (accountType === 'client') {
            navigate('/client-panel');
          } else if (accountType === 'intern') {
            navigate('/intern-panel');
          } else {
            navigate('/dashboard');
          }
        }, 1200);
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError('A network or server error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container signup-container">
        <div className="auth-header">
          <span className="auth-badge">Join NexByte Core</span>
          <h1>Create Your Account</h1>
          <p className="auth-subtitle">Select your account purpose to get a customized experience</p>
        </div>

        {/* Role Toggle Selector */}
        <div className="account-type-selector">
          <button
            type="button"
            className={`type-card ${accountType === 'client' ? 'active' : ''}`}
            onClick={() => { setAccountType('client'); setError(''); }}
          >
            <div className="type-icon"><FaUserTie /></div>
            <div className="type-text">
              <span className="type-title">I'm a Client</span>
              <span className="type-desc">Build software, track milestones & billing</span>
            </div>
          </button>

          <button
            type="button"
            className={`type-card ${accountType === 'intern' ? 'active' : ''}`}
            onClick={() => { setAccountType('intern'); setError(''); }}
          >
            <div className="type-icon"><FaGraduationCap /></div>
            <div className="type-text">
              <span className="type-title">I'm an Intern</span>
              <span className="type-desc">Real-world tasks, learning & certification</span>
            </div>
          </button>
        </div>

        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <FaUser className="field-icon" /> Full Name
            </label>
            <input
              type="text"
              id="name"
              className="form-control"
              placeholder={accountType === 'client' ? 'e.g., Alex Morgan' : 'e.g., Priya Sharma'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FaEnvelope className="field-icon" /> {accountType === 'client' ? 'Work Email' : 'Email Address'}
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {accountType === 'client' ? (
            <>
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="companyName" className="form-label">
                    <FaBuilding className="field-icon" /> Company / Brand (Optional)
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    className="form-control"
                    placeholder="e.g., Acme Studios"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    <FaPhone className="field-icon" /> Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="projectGoal" className="form-label">
                  <FaLaptopCode className="field-icon" /> Primary Project Need
                </label>
                <select
                  id="projectGoal"
                  className="form-control"
                  value={projectGoal}
                  onChange={(e) => setProjectGoal(e.target.value)}
                >
                  <option value="Custom Web Application">Custom Web Application / SaaS</option>
                  <option value="Mobile App (iOS/Android)">Mobile App (iOS/Android)</option>
                  <option value="E-Commerce Platform">E-Commerce Platform & Payments</option>
                  <option value="AI Integration & Automation">AI Integration & Automation</option>
                  <option value="High-Performance Business Website">High-Performance Business Website</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="track" className="form-label">
                    <FaLaptopCode className="field-icon" /> Internship Track
                  </label>
                  <select
                    id="track"
                    className="form-control"
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                  >
                    <option value="Full-Stack Web Development">Full-Stack Web Development</option>
                    <option value="Frontend Development (React)">Frontend Development (React)</option>
                    <option value="Backend Development (Node.js/Python)">Backend Development (Node.js/Python)</option>
                    <option value="UI/UX & Product Design">UI/UX & Product Design</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="internPhone" className="form-label">
                    <FaPhone className="field-icon" /> Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    id="internPhone"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FaLock className="field-icon" /> Password
              </label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <FaLock className="field-icon" /> Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="form-control"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="alert-box error"><p>{error}</p></div>}
          {success && (
            <div className="alert-box success">
              <p><FaCheckCircle /> {success}</p>
            </div>
          )}

          <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : (accountType === 'client' ? 'Create Client Account' : 'Join Internship Program')}
          </button>
        </form>

        <p className="switch-auth">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
