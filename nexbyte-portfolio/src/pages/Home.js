import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { FaCode, FaMobileAlt, FaPaintBrush } from 'react-icons/fa';
import './Home.css';
import HomeSidebar from '../components/HomeSidebar'; // Import the sidebar

const Home = () => {
  return (
    <div className="home-container"> {/* New container for flexbox */}
      <HomeSidebar /> {/* Add the sidebar */}
      <div className="home-page">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">Build Your Digital Future</h1>
          <p className="hero-subtitle">We create stunning and powerful web and mobile applications, designed for the modern world.</p>
          <Link to="/contact" className="btn btn-primary">Get in Touch</Link>
        </section>

        {/* Services Section */}
        <section className="services-section">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            <Card className="service-card">
              <div className="icon"><FaCode /></div>
              <h3>Web Development</h3>
              <p>We build responsive and scalable web applications using the latest technologies.</p>
            </Card>
            <Card className="service-card">
              <div className="icon"><FaMobileAlt /></div>
              <h3>Mobile Development</h3>
              <p>We create native and cross-platform mobile apps for Android and iOS.</p>
            </Card>
            <Card className="service-card">
              <div className="icon"><FaPaintBrush /></div>
              <h3>UI/UX Design</h3>
              <p>We design beautiful and intuitive user interfaces that your users will love.</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
