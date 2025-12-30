import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Card from '../components/Card';
import { FaCode, FaMobileAlt, FaPaintBrush } from 'react-icons/fa';
import './Home.css';
import HomeSidebar from '../components/HomeSidebar'; // Import the sidebar

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Web Development Services in India | NexByte Studio</title>
        <meta name="description" content="Professional web development & SEO services. Fast, secure & mobile-friendly websites by NexByte Studio." />
        <meta name="keywords" content="web development services, website development, web design, SEO services, nexbyte, nexbyte studio, nexbyte core" />
        <link rel="canonical" href="https://nexbyte-dev.vercel.app/" />
      </Helmet>
      
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
            <h2 className="section-title">Our Web Development Services</h2>
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

          {/* Extended Content for SEO */}
          <section className="about-services">
            <h2>Why Choose Our Web Development Services?</h2>
            <p>At NexByte Studio, we specialize in delivering high-quality web development services that help businesses establish a strong online presence. Our team of experienced developers and designers work together to create custom solutions tailored to your specific needs.</p>
            
            <h3>Custom Web Development Solutions</h3>
            <p>Our web development services cover everything from simple static websites to complex web applications. We use modern technologies like React, Node.js, and Python to ensure your website is fast, secure, and scalable. Whether you need an e-commerce platform, a content management system, or a custom business application, our web development team has the expertise to deliver.</p>
            
            <h3>Professional Web Design & Development</h3>
            <p>We understand that your website is often the first impression customers have of your business. That's why our web development services include comprehensive web design that reflects your brand identity and engages your target audience. We focus on creating responsive, mobile-friendly designs that work seamlessly across all devices.</p>
            
            <h3>SEO-Optimized Web Development</h3>
            <p>Every website we develop is built with SEO best practices in mind. Our web development services include proper site structure, clean code, fast loading speeds, and mobile optimization - all crucial factors for search engine rankings. We ensure your website not only looks great but also performs well in search results.</p>
            
            <h3>Full-Stack Web Development Expertise</h3>
            <p>Our team offers comprehensive web development services covering both frontend and backend development. From intuitive user interfaces to robust server-side logic, we handle every aspect of web development. Our expertise includes database design, API development, and third-party integrations to create fully functional web applications.</p>
            
            <h3>Modern Web Development Technologies</h3>
            <p>We stay updated with the latest web development trends and technologies to deliver cutting-edge solutions. Our tech stack includes React, Vue.js, Angular for frontend, Node.js, Python, PHP for backend, and MySQL, MongoDB for databases. This ensures your website is built using the most suitable technology for your project requirements.</p>
            
            <h3>Web Development Maintenance & Support</h3>
            <p>Our relationship doesn't end after deployment. We offer ongoing web development support and maintenance services to keep your website running smoothly. This includes regular updates, security patches, performance optimization, and feature enhancements to ensure your website continues to meet your business needs.</p>
          </section>
        </div>
      </div>
    </>
  );
};

export default Home;
