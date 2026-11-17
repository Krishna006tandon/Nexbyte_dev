import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaExternalLinkAlt, 
  FaLayerGroup, 
  FaCheckCircle, 
  FaQuoteLeft, 
  FaStar, 
  FaCodeBranch, 
  FaRocket,
  FaTimes,
  FaServer,
  FaDesktop,
  FaDatabase,
  FaFilter
} from 'react-icons/fa';
import './Projects.css';

const projects = [
  {
    id: 'poonam-cooking',
    category: 'web',
    categoryLabel: 'Full-Stack Web',
    title: 'Poonam Cooking & Baking Classes Platform',
    shortDesc: 'End-to-end digital transformation for an offline culinary academy with student portals and automated billing.',
    description: 'A full-stack web platform designed for a premier baking institute, eliminating manual phone bookings and digitizing course enrollments, student recipe material, and payment receipts.',
    problem: 'The academy was losing potential students due to friction in offline cash bookings, manual WhatsApp queries, and had zero secure infrastructure to distribute proprietary course recipes.',
    solution: 'Engineered a modern web portal with instant course catalog browsing, integrated payment gateway with real-time receipt generation, and an encrypted student vault for recipe access.',
    architecture: {
      frontend: 'React.js, Responsive CSS Modules, State Management',
      backend: 'Node.js, Express.js REST API with JWT Auth',
      database: 'MongoDB Atlas (Student records, course schedules)',
      integrations: 'Payment Gateway API, Automated Email Notifications, Vercel Edge'
    },
    metrics: [
      { label: 'Enrollment Growth', val: '+240%' },
      { label: 'Booking Time', val: '< 90 Sec' },
      { label: 'Admin Overhead', val: '-80%' },
      { label: 'Lighthouse Score', val: '98/100' }
    ],
    features: [
      'Interactive Course Exploration with video previews & syllabus breakdown',
      'Instant online checkout with automated invoice generation',
      'Protected Student Vault for proprietary recipe materials and notes',
      'Admin Dashboard for managing batches, students, and payment records',
      'Mobile-first responsive interface optimized for all screen sizes'
    ],
    techStack: ['React.js', 'Node.js', 'Express', 'MongoDB', 'Payment Gateway'],
    testimonial: {
      quote: 'Nexbyte completely revolutionized how we run our institute. What used to take hours of manual phone coordination is now 100% automated. Our admissions doubled in the very first month.',
      author: 'Poonam G.',
      role: 'Founder & Head Chef'
    },
    liveLink: 'https://poonamcookingclasses.vercel.app/'
  },
  {
    id: 'overxchange',
    category: 'saas',
    categoryLabel: 'B2B Marketplace & SaaS',
    title: 'OverXchange – B2B Surplus Food Trading Platform',
    shortDesc: 'A dual-dashboard B2B exchange bridging food suppliers and vendors to eliminate food wastage with automated licensing.',
    description: 'A robust B2B application designed to solve surplus perishable inventory in the food industry. Features automated supplier verification and a live vendor surplus marketplace.',
    problem: 'Wholesale suppliers routinely suffered heavy financial losses from surplus inventory approaching expiry, lacking any verified B2B network to liquidate goods to retail restaurants and vendors.',
    solution: 'Architected a dual-sided marketplace with automated government FSSAI food license validation, real-time inventory exchange (VendorNet), and an order management pipeline.',
    architecture: {
      frontend: 'HTML5, Modern CSS, Responsive JavaScript UI',
      backend: 'Python Flask REST Framework',
      database: 'MongoDB Document Database',
      integrations: 'Automated FSSAI License OCR/Validation, JWT Authentication'
    },
    metrics: [
      { label: 'Surplus Waste', val: '-45%' },
      { label: 'B2B Liquidation', val: '2.5x Faster' },
      { label: 'Vendor Network', val: '100% Verified' },
      { label: 'Query Latency', val: '< 150ms' }
    ],
    features: [
      'Dual-Role Portal: Independent interfaces for Food Suppliers and Retail Vendors',
      'VendorNet Marketplace: Direct surplus inventory trading between licensed vendors',
      'Automated FSSAI License Verification engine to eliminate fraudulent suppliers',
      'Supplier Analytics Dashboard showing stock valuation and order fulfillment rate',
      'Secure transaction logging with audit trails'
    ],
    techStack: ['Python', 'Flask', 'MongoDB', 'FSSAI API', 'JWT'],
    testimonial: {
      quote: 'The automated license verification and instant surplus trading board gave our vendors the trust and speed they needed to transact high-volume batches with zero friction.',
      author: 'A. Kulkarni',
      role: 'Head of Operations, OverXchange'
    },
    liveLink: 'https://over-xchange.vercel.app/'
  },
  {
    id: 'zenspace',
    category: 'saas',
    categoryLabel: 'Mindfulness & SaaS',
    title: 'ZenSpace – Emotional Wellness & Journaling App',
    shortDesc: 'A full-stack mental well-being platform combining personalized reflections, habit streaks, and glassmorphic UI.',
    description: 'A holistic digital sanctuary engineered to support daily mindfulness, self-reflection, and emotional growth through interactive check-ins and gamified habit building.',
    problem: 'Existing mindfulness apps are bloated with generic content, lack religious or philosophical personalization, and fail to sustain long-term journaling habits.',
    solution: 'Designed an ultra-clean glassmorphic web application with personalized spiritual quotes, reflection edit limits to encourage authenticity, and interactive streak analytics.',
    architecture: {
      frontend: 'React.js, Tailwind CSS, Framer Motion, Chart.js',
      backend: 'Node.js, Express.js micro-services',
      database: 'MongoDB with field-level encryption for private journal entries',
      integrations: 'Personalized Scripture Engine, Habit Analytics API'
    },
    metrics: [
      { label: '30-Day Retention', val: '68%' },
      { label: 'Reflections Logged', val: '15,000+' },
      { label: 'Average Session', val: '8.4 Min' },
      { label: 'User Rating', val: '4.9 / 5' }
    ],
    features: [
      'Daily Mood Check-ins with personalized scripture recommendations',
      'Encrypted Private Journal with deliberate edit limits for genuine reflection',
      'Gamified Meditation streaks with dynamic Chart.js progress tracking',
      'Premium dark glassmorphic UI with micro-interactions',
      'Spiritual context personalization across multiple philosophical paths'
    ],
    techStack: ['React.js', 'Tailwind CSS', 'Node.js', 'Chart.js', 'MongoDB'],
    testimonial: {
      quote: 'ZenSpace feels like an oasis. The calming glassmorphism and insightful reflection charts have helped thousands build a mindful habit they actually look forward to every day.',
      author: 'R. Mehta',
      role: 'Product Lead'
    },
    liveLink: 'https://zen-space-nine.vercel.app/'
  },
  {
    id: 'unexa',
    category: 'mobile',
    categoryLabel: 'Mobile & Real-Time',
    title: 'UNEXA – Real-Time Social & Communication SuperApp',
    shortDesc: 'Cross-platform SuperApp unifying instant messaging, ephemeral media stories, and WebRTC audio/video calls.',
    description: 'A next-generation mobile platform combining WhatsApp-speed messaging, Instagram-style stories, and Zoom-quality peer-to-peer calling into a unified application.',
    problem: 'Users frequently switch between multiple fragmented apps for team collaboration, media sharing, and quick video syncs, degrading productivity.',
    solution: 'Engineered a unified React Native SuperApp powered by low-latency Socket.IO WebSockets and Agora WebRTC for high-definition media broadcasting.',
    architecture: {
      frontend: 'React Native, Expo, Redux Toolkit',
      backend: 'Node.js, Express, Socket.IO WebSockets',
      database: 'MongoDB Replica Set with geospatial & chat indexing',
      integrations: 'Agora WebRTC SDK, Cloudinary Media CDN, Push Notifications'
    },
    metrics: [
      { label: 'Socket Latency', val: '< 65ms' },
      { label: 'Call Reliability', val: '99.9%' },
      { label: 'Code Sharing', val: '92% iOS & Android' },
      { label: 'Media Throughput', val: '4K Ready' }
    ],
    features: [
      'Instant messaging with real-time typing indicators and read receipts',
      'Peer-to-peer and group voice/video calling powered by WebRTC',
      'Ephemeral stories and photo/video media capture with filters',
      'Rich group channels, member permissions, and emoji reactions',
      'Cross-platform deployment with zero-delay push notifications'
    ],
    techStack: ['React Native', 'Expo', 'Socket.IO', 'Agora WebRTC', 'MongoDB'],
    testimonial: {
      quote: 'UNEXA demonstrates the incredible power of modern cross-platform engineering. We achieved sub-80ms chat delivery across iOS and Android with a single codebase.',
      author: 'Tech Architect',
      role: 'Nexbyte Core Labs'
    },
    liveLink: null
  },
  {
    id: 'digital-product-mart',
    category: 'ecommerce',
    categoryLabel: 'E-Commerce Platform',
    title: 'Digital Product Mart – Electronics E-Commerce',
    shortDesc: 'A lightning-fast electronic goods marketplace with dynamic faceted search, cart state, and order tracking.',
    description: 'An optimized e-commerce web platform engineered for electronic hardware and accessories, providing a frictionless checkout and robust inventory management.',
    problem: 'Legacy e-commerce templates were slow, suffered from cart abandonment, and failed to handle faceted filtering across diverse tech specs.',
    solution: 'Built a lightweight Python-backed shopping experience with sub-second catalog search, secure payment processing, and administrative inventory monitoring.',
    architecture: {
      frontend: 'Tailwind CSS, Vanilla JS, HTML5 Templates',
      backend: 'Python (Flask)',
      database: 'MongoDB (Product attributes, inventory levels, orders)',
      integrations: 'JWT Sessions, Checkout Gateway, Admin CMS'
    },
    metrics: [
      { label: 'Page Load Speed', val: '0.8s' },
      { label: 'Checkout Drop-off', val: '-32%' },
      { label: 'Product Queries', val: '< 90ms' },
      { label: 'SEO Score', val: '96/100' }
    ],
    features: [
      'Category-based faceted product search and price/spec filters',
      'Real-time shopping cart with tax and discount calculation',
      'Admin control panel for live inventory and order fulfillment',
      'Optimized responsive design with high conversion checkout'
    ],
    techStack: ['Python', 'Flask', 'MongoDB', 'Tailwind CSS', 'JavaScript'],
    testimonial: {
      quote: 'A blazingly fast online store that loads in under a second and makes finding electronics effortless for our customers.',
      author: 'Retail Partner',
      role: 'E-Commerce Director'
    },
    liveLink: null
  },
  {
    id: 'cuddlekins',
    category: 'ecommerce',
    categoryLabel: 'E-Commerce & Branding',
    title: 'Cuddlekins – Premium Pet Care Store',
    shortDesc: 'Modern responsive WooCommerce shop for pet supplies, food, and grooming accessories with custom theme design.',
    description: 'A branded online pet store customized with high-converting layouts, product bundles, automated shipping calculation, and SEO optimization.',
    problem: 'Generic pet retail themes failed to convey brand trust, lacked mobile responsiveness, and ranked poorly on search engines.',
    solution: 'Designed and deployed a custom high-performance theme with Yoast SEO integration, customer accounts, and advanced search filters.',
    architecture: {
      frontend: 'Custom Responsive PHP/CSS Theme, JavaScript',
      backend: 'WooCommerce, WordPress Core',
      database: 'MySQL Database',
      integrations: 'Payment Gateways, Shipping APIs, SEO Schema Markup'
    },
    metrics: [
      { label: 'Organic Traffic', val: '+180%' },
      { label: 'Mobile Sales', val: '64% Share' },
      { label: 'Average Order Value', val: '+22%' },
      { label: 'Uptime', val: '99.95%' }
    ],
    features: [
      'Tailored UI/UX reflecting warm, pet-loving brand aesthetics',
      'Advanced product filters by pet breed, dietary need, and size',
      'Customer order tracking portal and automated order status notifications',
      'Comprehensive on-page and technical SEO implementation'
    ],
    techStack: ['WordPress', 'WooCommerce', 'PHP', 'MySQL', 'SEO'],
    testimonial: {
      quote: 'Our pet store revenue soared after launching this platform. The search ranking improvements and seamless checkout made all the difference.',
      author: 'Store Owner',
      role: 'Cuddlekins Pet Care'
    },
    liveLink: null
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Projects' },
  { id: 'web', label: 'Full-Stack Web' },
  { id: 'saas', label: 'SaaS & Platforms' },
  { id: 'mobile', label: 'Mobile & Real-Time' },
  { id: 'ecommerce', label: 'E-Commerce' }
];

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  const openCaseStudy = (project) => {
    setSelectedCaseStudy(project);
    document.body.style.overflow = 'hidden';
  };

  const closeCaseStudy = () => {
    setSelectedCaseStudy(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <>
      <Helmet>
        <title>Portfolio & Deep Case Studies | NexByte Core</title>
        <meta name="description" content="Explore NexByte's engineering portfolio: live demos, technical architecture breakdowns, business outcomes, and client testimonials." />
      </Helmet>

      <div className="projects-page-wrapper">
        {/* Header */}
        <header className="projects-header text-center">
          <span className="projects-badge">Proof of Execution</span>
          <h1 className="projects-main-title">Featured Projects & Case Studies</h1>
          <p className="projects-subtitle">
            Every product we build is engineered with modern architecture, rock-solid security, and measurable business ROI. Explore our work below.
          </p>
        </header>

        {/* Filter Pills */}
        <div className="category-filter-bar">
          <span className="filter-icon"><FaFilter /> Filter:</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="projects-cards-grid">
          {filteredProjects.map((project) => (
            <div className="project-card-container" key={project.id}>
              <div className="project-card-inner">
                <div className="card-top-meta">
                  <span className="card-cat-tag">{project.categoryLabel}</span>
                  {project.liveLink && (
                    <span className="card-live-indicator">
                      <span className="dot"></span> Live in Production
                    </span>
                  )}
                </div>

                <h3 className="project-heading">{project.title}</h3>
                <p className="project-short-text">{project.shortDesc}</p>

                {/* Key Metrics Preview */}
                <div className="card-mini-metrics">
                  {project.metrics.slice(0, 2).map((m, idx) => (
                    <div className="mini-metric" key={idx}>
                      <strong>{m.val}</strong>
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>

                {/* Tech Stack Chips */}
                <div className="card-tech-stack">
                  {project.techStack.map((tech, i) => (
                    <span key={i} className="tech-badge">{tech}</span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="card-actions-row">
                  <button
                    type="button"
                    className="btn btn-case-study"
                    onClick={() => openCaseStudy(project)}
                  >
                    Deep Case Study
                  </button>

                  {project.liveLink ? (
                    <a
                      href={project.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-demo-link"
                    >
                      Live Demo <FaExternalLinkAlt />
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-demo-link enterprise-view"
                      onClick={() => openCaseStudy(project)}
                    >
                      Architecture View
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Deep Case Study Modal */}
        {selectedCaseStudy && (
          <div className="case-study-modal-overlay" onClick={closeCaseStudy}>
            <div className="case-study-modal-content" onClick={e => e.stopPropagation()}>
              <button className="case-modal-close-btn" onClick={closeCaseStudy}>
                <FaTimes />
              </button>

              <div className="modal-header-section">
                <div className="modal-tags">
                  <span className="tag-pill">{selectedCaseStudy.categoryLabel}</span>
                  {selectedCaseStudy.liveLink && (
                    <a
                      href={selectedCaseStudy.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="live-chip"
                    >
                      Visit Live System <FaExternalLinkAlt />
                    </a>
                  )}
                </div>
                <h2>{selectedCaseStudy.title}</h2>
                <p className="modal-tagline">{selectedCaseStudy.description}</p>
              </div>

              {/* Metrics Ribbon */}
              <div className="metrics-ribbon">
                {selectedCaseStudy.metrics.map((metric, i) => (
                  <div className="metric-box" key={i}>
                    <span className="metric-val">{metric.val}</span>
                    <span className="metric-name">{metric.label}</span>
                  </div>
                ))}
              </div>

              {/* Problem & Solution Columns */}
              <div className="problem-solution-grid">
                <div className="ps-card problem-card">
                  <h4>⚠️ The Challenge & Problem</h4>
                  <p>{selectedCaseStudy.problem}</p>
                </div>
                <div className="ps-card solution-card">
                  <h4>💡 The Nexbyte Solution</h4>
                  <p>{selectedCaseStudy.solution}</p>
                </div>
              </div>

              {/* Architecture & Engineering Stack */}
              <div className="modal-architecture-box">
                <h4>
                  <FaCodeBranch /> System Architecture & Technical Stack
                </h4>
                <div className="architecture-grid">
                  <div className="arch-item">
                    <div className="arch-icon"><FaDesktop /></div>
                    <div className="arch-details">
                      <strong>Frontend Client</strong>
                      <span>{selectedCaseStudy.architecture.frontend}</span>
                    </div>
                  </div>
                  <div className="arch-item">
                    <div className="arch-icon"><FaServer /></div>
                    <div className="arch-details">
                      <strong>Backend Application</strong>
                      <span>{selectedCaseStudy.architecture.backend}</span>
                    </div>
                  </div>
                  <div className="arch-item">
                    <div className="arch-icon"><FaDatabase /></div>
                    <div className="arch-details">
                      <strong>Database & Storage</strong>
                      <span>{selectedCaseStudy.architecture.database}</span>
                    </div>
                  </div>
                  <div className="arch-item">
                    <div className="arch-icon"><FaRocket /></div>
                    <div className="arch-details">
                      <strong>Integrations & Cloud</strong>
                      <span>{selectedCaseStudy.architecture.integrations}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Features List */}
              <div className="modal-features-list">
                <h4>Key Capabilities Delivered</h4>
                <ul>
                  {selectedCaseStudy.features.map((feature, i) => (
                    <li key={i}>
                      <FaCheckCircle className="check-icon" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Client Testimonial */}
              {selectedCaseStudy.testimonial && (
                <div className="modal-testimonial-box">
                  <FaQuoteLeft className="quote-icon" />
                  <p className="quote-text">"{selectedCaseStudy.testimonial.quote}"</p>
                  <div className="quote-meta">
                    <div className="author-details">
                      <strong>{selectedCaseStudy.testimonial.author}</strong>
                      <span>{selectedCaseStudy.testimonial.role}</span>
                    </div>
                    <div className="rating-stars">
                      <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="modal-bottom-actions">
                {selectedCaseStudy.liveLink && (
                  <a
                    href={selectedCaseStudy.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    Open Live Application <FaExternalLinkAlt />
                  </a>
                )}
                <a href="/#quote-calculator" className="btn btn-outline" onClick={closeCaseStudy}>
                  Estimate Similar Project Cost
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Projects;
