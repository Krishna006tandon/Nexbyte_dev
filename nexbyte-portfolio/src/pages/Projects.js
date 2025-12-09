import React from 'react';
import './Projects.css';

const projects = [
  {
    title: 'OverXchange',
    description: 'A web application designed to bridge the gap between suppliers and vendors in the food industry. The platform provides a robust solution for order management, inventory tracking, and analytics.',
    features: [
      'Dual-User System: Separate dashboards and functionalities for both Suppliers and Vendors.',
      'Stock & Order Management: Suppliers can easily manage their inventory, while vendors can place and track orders in real-time.',
      'Analytics Dashboard: A powerful analytics dashboard for suppliers, offering business insights into sales, stock value, and product performance.',
      'VendorNet B2B Marketplace: A unique feature that allows vendors to trade, collaborate, and exchange surplus stock among themselves.',
      'Automated License Verification: A built-in system to automatically verify the authenticity of a supplier\'s food license (FSSAI).',
      'Secure Authentication & Payments: Secure login using JWT (JSON Web Tokens) and a secure structure for payment processing.'
    ],
    techStack: 'Python, Flask, MongoDB, HTML, CSS, JavaScript',
    liveLink: 'https://over-xchange-zrvi.vercel.app/'
  },
  {
    title: 'ZenSpace',
    description: 'A full-stack wellness & mindfulness web app to promote daily emotional well-being, self-reflection, and spiritual growth.',
    features: [
      'Mood Check-in with personalized scripture quotes',
      'Secure Journal with edit limits',
      'Meditation sessions with gamification',
      'Streaks & Analytics charts',
      'Premium UI/UX with glassmorphism & animations',
      'User Personalization based on mood & religion'
    ],
    techStack: 'React.js, Tailwind CSS, Framer Motion, Chart.js, Node.js, Express.js, MongoDB',
    liveLink: 'https://zen-space-nine.vercel.app/'
  },
  {
    title: 'Digital Product Mart',
    description: 'A full-featured e-commerce website for electronic products, offering a seamless and secure shopping experience.',
    features: [
      'Product listings with categories and filters',
      'Shopping cart & secure checkout',
      'User authentication with JWT',
      'Admin panel for product management'
    ],
    techStack: 'Python (Flask), MongoDB, HTML, Tailwind CSS, JavaScript',
    liveLink: null
  },
  {
    title: 'Hotel Management System',
    description: 'A desktop application to manage day-to-day hotel operations, automating manual processes and improving efficiency.',
    features: [
      'Room booking and guest management',
      'Check-in/check-out processing',
      'Billing and invoice generation',
      'Staff management functionalities'
    ],
    techStack: 'Java, Java Swing/JavaFX, MySQL/SQLite',
    liveLink: null
  },
  {
    title: 'Cuddlekins Pet Store',
    description: 'A modern, responsive e-commerce website for a pet store, built with WordPress and WooCommerce.',
    features: [
      'Custom WordPress Theme Design',
      'WooCommerce for product and order management',
      'Responsive design for all devices',
      'Advanced product filters and search',
      'Customer account and order tracking',
      'SEO Optimization with Yoast SEO'
    ],
    techStack: 'WordPress, WooCommerce, PHP, MySQL, JavaScript',
    liveLink: null
  }
];

const Projects = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-5">My Projects</h1>
      <div className="row gy-4">
        {projects.map((project, index) => (
          <div className="col-lg-4 col-md-6" key={index}>
            <div className="card project-card h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{project.title}</h5>
                <p className="card-text">{project.description}</p>
                <h6>Core Features:</h6>
                <ul>
                  {project.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
                <h6>Tech Stack:</h6>
                <p>{project.techStack}</p>
                {project.liveLink && (
                  <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-auto">
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;