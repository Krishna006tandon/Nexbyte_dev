import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Card from '../components/Card';
import Hero3DScene from '../components/Hero3DScene';
import ProjectEstimator from '../components/ProjectEstimator';
import { 
  FaCode, 
  FaMobileAlt, 
  FaPaintBrush, 
  FaRobot, 
  FaRocket, 
  FaArrowRight, 
  FaCalendarAlt, 
  FaShieldAlt,
  FaCheckCircle
} from 'react-icons/fa';
import './Home.css';

export const metadata = {
  title: "NexByte Core | Full-Stack Web, Mobile & AI Engineering Studio",
  description:
    "NexByte Core engineers scalable web apps, mobile solutions, and custom AI systems. Instant project cost estimator, transparent pricing, and rapid delivery.",
};

const Home = () => {
  const navigate = useNavigate();
  const [verifyId, setVerifyId] = useState('');

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (verifyId.trim()) {
      navigate(`/certificate/${verifyId.trim()}`);
    }
  };

  const scrollToEstimator = () => {
    const el = document.getElementById('quote-calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content="web development services, mobile app development, React developers, AI automation, nexbyte, nexbyte core, instant quote calculator" />
        <link rel="canonical" href="https://nexbyte-dev.vercel.app/" />
      </Helmet>
      
      <div className="home-page">
        {/* Modern 3D Interactive Hero Section */}
        <section className="hero-section modern-hero">
          <div className="hero-content-col">
            <div className="hero-status-badge">
              <span className="pulsing-dot"></span>
              <span>Available for New Projects • Q1/Q2 Delivery</span>
            </div>

            <h1 className="hero-title">
              Engineering Next-Gen <span className="text-gradient">Digital Products</span> & Intelligent Systems
            </h1>

            <p className="hero-subtitle">
              We partner with founders and forward-thinking businesses to build fast, secure, and beautiful web applications, cross-platform mobile apps, and custom AI workflows.
            </p>

            <div className="hero-cta-group">
              <button 
                type="button" 
                onClick={scrollToEstimator}
                className="btn btn-primary hero-btn primary-glow"
              >
                <FaRocket /> Calculate Project Quote
              </button>
              <Link to="/projects" className="btn btn-outline hero-btn">
                View Case Studies <FaArrowRight />
              </Link>
              <Link to="/contact" className="btn btn-ghost hero-btn">
                <FaCalendarAlt /> Book 15-Min Call
              </Link>
            </div>

            {/* Live Trust Metrics */}
            <div className="hero-metrics-bar">
              <div className="metric-item">
                <span className="metric-number">15+</span>
                <span className="metric-label">Products Shipped</span>
              </div>
              <div className="metric-item">
                <span className="metric-number">99.4%</span>
                <span className="metric-label">On-Time Delivery</span>
              </div>
              <div className="metric-item">
                <span className="metric-number">5.0 ★</span>
                <span className="metric-label">Client Rating</span>
              </div>
              <div className="metric-item">
                <span className="metric-number">100%</span>
                <span className="metric-label">Code Ownership</span>
              </div>
            </div>
          </div>

          <div className="hero-visual-col">
            <div className="hero-3d-container">
              <Hero3DScene />
              <div className="floating-hero-pill">
                <FaRobot className="pill-icon" />
                <div>
                  <strong>AI-Enhanced Engineering</strong>
                  <span>Fast, robust & production-ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Showcase */}
        <section className="services-section">
          <div className="section-head text-center">
            <span className="badge-tag">What We Build</span>
            <h2 className="section-title">End-to-End Engineering Services</h2>
            <p className="section-desc">
              From conception to deployment, we deliver modern software solutions tailored to your operational goals.
            </p>
          </div>

          <div className="services-grid">
            <Card className="service-card">
              <div className="icon"><FaCode /></div>
              <h3>Full-Stack Web Apps</h3>
              <p>Scalable web applications built with React, Node.js, Express, and MongoDB with modern authentication and clean API design.</p>
              <div className="service-tags">
                <span>React.js</span>
                <span>Node.js</span>
                <span>REST / GraphQL</span>
              </div>
            </Card>

            <Card className="service-card">
              <div className="icon"><FaMobileAlt /></div>
              <h3>Mobile Applications</h3>
              <p>Native-feel cross-platform mobile apps for iOS and Android powered by React Native and Expo.</p>
              <div className="service-tags">
                <span>React Native</span>
                <span>Expo</span>
                <span>Offline Sync</span>
              </div>
            </Card>

            <Card className="service-card">
              <div className="icon"><FaRobot /></div>
              <h3>AI & Automation Workflows</h3>
              <p>Intelligent agent workflows, custom LLM copilots, automated document processors, and generative interfaces.</p>
              <div className="service-tags">
                <span>Gemini API</span>
                <span>OpenAI</span>
                <span>RAG & Agents</span>
              </div>
            </Card>

            <Card className="service-card">
              <div className="icon"><FaPaintBrush /></div>
              <h3>UI/UX & Product Design</h3>
              <p>Modern glassmorphism, responsive component systems, interactive micro-interactions, and conversion-optimized flows.</p>
              <div className="service-tags">
                <span>Figma</span>
                <span>Design Systems</span>
                <span>Accessibility</span>
              </div>
            </Card>
          </div>
        </section>

        {/* Feature 2: Interactive Project Cost / Scope Estimator */}
        <ProjectEstimator />

        {/* Certificate Verification Section */}
        <section className="certificate-verification-section">
          <div className="verify-inner-card">
            <div className="verify-badge">
              <FaShieldAlt /> Credential Verification
            </div>
            <h2 className="verify-title">Verify Official NexByte Core Certificate</h2>
            <p className="verify-subtitle">
              Verify credentials issued to our interns, apprentices, and software contributors with our cryptographic verification portal.
            </p>
            
            <form onSubmit={handleVerifySubmit} className="verify-form">
              <input 
                type="text" 
                placeholder="Enter Certificate ID (e.g. NBC-INT-26001)" 
                value={verifyId}
                onChange={(e) => setVerifyId(e.target.value)}
                className="verify-input"
                required
              />
              <button type="submit" className="btn btn-primary verify-btn">
                <FaCheckCircle /> Verify Authenticity
              </button>
            </form>
          </div>
        </section>

        {/* Internship Section */}
        <section className="internship-section">
          <div className="section-head text-center">
            <span className="badge-tag">Talent & Learning</span>
            <h2 className="section-title">Join The NexByte Internship Program</h2>
            <p className="internship-subtitle">
              Learn by building real startup systems with code reviews, weekly sprint demos, and accredited certificates.
            </p>
          </div>

          <div className="internship-features">
            <div className="internship-feature">
              <h3>🎓 Hands-on Mentorship</h3>
              <p>Direct architectural reviews and daily guidance on modern full-stack engineering.</p>
            </div>
            <div className="internship-feature">
              <h3>💼 Real Startup Work</h3>
              <p>Ship features to production and build an indisputable GitHub portfolio.</p>
            </div>
            <div className="internship-feature">
              <h3>🏆 Verifiable Certificate</h3>
              <p>Earn an encrypted, 1-click shareable credential with recommendation letters.</p>
            </div>
          </div>
          <div className="text-center mt-4">
            <Link to="/signup" className="btn btn-internship">
              Create Intern Account <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* Extended SEO Information */}
        <section className="about-services">
          <h2>Why Businesses Choose NexByte Core</h2>
          <p>
            At NexByte Core, we blend engineering excellence with transparent collaboration. Whether you are a founder looking to launch a fast MVP or an established business modernizing legacy systems, our modular development process ensures high velocity, strict data security, and long-term maintainability.
          </p>
          
          <h3>Full Source Code & Architecture Ownership</h3>
          <p>
            Unlike traditional agencies that lock you in, every project delivered by NexByte includes 100% intellectual property rights, automated testing, documentation, and clean deployment scripts.
          </p>
        </section>
      </div>
    </>
  );
};

export default Home;
