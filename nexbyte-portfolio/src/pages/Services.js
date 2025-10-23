import React from 'react';
import { FaCode, FaMobileAlt, FaPaintBrush, FaRocket, FaShieldAlt, FaSync } from 'react-icons/fa';
import './Services.css';

const services = [
  {
    icon: <FaCode />,
    title: 'Custom Web Development',
    description: 'We build bespoke, high-performance websites and web applications tailored to your specific business needs. From single-page applications to complex enterprise-level systems, we deliver scalable and secure solutions.',
    tags: ['React', 'Node.js', 'Python', 'JAMstack', 'Headless CMS'],
  },
  {
    icon: <FaMobileAlt />,
    title: 'Mobile App Development',
    description: 'Engage your users on the go with our native and cross-platform mobile applications. We design and develop intuitive, high-performance apps for both iOS and Android platforms.',
    tags: ['iOS', 'Android', 'React Native', 'Flutter', 'Swift'],
  },
  {
    icon: <FaPaintBrush />,
    title: 'UI/UX Design',
    description: 'Our design process is centered around your users. We create beautiful, intuitive, and accessible interfaces that provide a seamless user experience and elevate your brand identity.',
    tags: ['User Research', 'Wireframing', 'Prototyping', 'Figma', 'Adobe XD'],
  },
  {
    icon: <FaRocket />,
    title: 'Deployment & DevOps',
    description: 'We streamline your development and deployment pipeline with modern DevOps practices, ensuring faster release cycles, improved reliability, and scalable infrastructure.',
    tags: ['CI/CD', 'Docker', 'Kubernetes', 'AWS', 'Vercel'],
  },
  {
    icon: <FaShieldAlt />,
    title: 'Security & Auditing',
    description: 'Protect your digital assets with our comprehensive security services. We conduct thorough audits, identify vulnerabilities, and implement robust security measures to safeguard your applications.',
    tags: ['Penetration Testing', 'Code Review', 'OWASP', 'GDPR', 'SOC 2'],
  },
  {
    icon: <FaSync />,
    title: 'Maintenance & Support',
    description: 'Our commitment doesn’t end at launch. We offer ongoing maintenance and support plans to ensure your application remains up-to-date, secure, and performs optimally.',
    tags: ['24/7 Support', 'Performance Monitoring', 'Bug Fixes', 'Updates'],
  },
];

const Services = () => {
  return (
    <div className="services-page">
      <header className="page-header">
        <h1 className="page-title">Our Services</h1>
        <p className="page-subtitle">
          We offer a comprehensive suite of services to bring your digital vision to life. 
          From initial concept to final deployment and beyond, we are your trusted technology partner.
        </p>
      </header>

      <div className="services-content">
        {services.map((service, index) => (
          <div className="service-item" key={index}>
            <div className="service-icon">{service.icon}</div>
            <div className="service-details">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul>
                {service.tags.map((tag, i) => (
                  <li key={i}>{tag}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;