import React, { useState } from 'react';

const SrsForm = ({ onSubmit }) => {
  const [srsData, setSrsData] = useState({
    projectOverview: {
      title: 'NexByte Studio Website',
      version: '1.0',
      date: new Date().toISOString().split('T')[0],
      author: 'NexByte Studio',
      purpose: 'Company portfolio, service listing, client contact, and admin content management system for NexByte Studio.',
    },
    introduction: {
      purpose: 'This document provides the Software Requirements Specification (SRS) for the official website of NexByte Studio. The aim is to clearly specify functional and non-functional requirements to make development and testing easier.',
      scope: [
        'Public-facing portfolio pages',
        'Blog/articles',
        'Client contact form',
        'Project showcase',
        'Admin dashboard to manage content',
        'Authentication',
        'Basic analytics',
      ],
      definitions: [
        { acronym: 'CMS', definition: 'Content Management System' },
        { acronym: 'API', definition: 'Application Programming Interface' },
        { acronym: 'UI', definition: 'User Interface' },
        { acronym: 'UX', definition: 'User Experience' },
        { acronym: 'SLA', definition: 'Service Level Agreement' },
        { acronym: 'JWT', definition: 'JSON Web Token' },
      ],
      references: [
        'NexByte internal brand guide',
        'Hosting provider docs (AWS/GCP/Heroku)',
        'Payment/Banking API docs (if integrated later)',
      ],
    },
    overallDescription: {
        productPerspective: 'Standalone web application with RESTful backend. Responsive frontend for desktop and mobile. Admin users manage content via dashboard.',
        productFunctions: [
            'Public pages: Home, Services, Projects, About, Blog, Contact',
            'Project showcase with filters & tags',
            'Contact form to send inquiries to admin email',
            'Admin authentication & role management',
            'Admin CRUD for projects, blog posts, testimonials, team members',
            'Generate downloadable invoices (basic)',
            'View simple analytics (visitors, contact count)',
        ],
        userClasses: [
            { class: 'Visitor', description: 'Can browse public pages, search projects, and contact via form.' },
            { class: 'Admin', description: 'Authenticated user who manages content, views inquiries, and analytics.' },
            { class: 'Manager', description: 'Admin with analytics and billing access.' },
        ],
        operatingEnvironment: 'Modern web browsers (Chrome, Edge, Firefox, Safari). Backend hosted on Linux server with Node/Python stack; Database: PostgreSQL or MySQL.',
        designConstraints: [
            'Responsive design required',
            'HTTPS mandatory',
            'Password storage with bcrypt/argon2',
            'API rate limiting for contact endpoint',
        ],
        assumptionsAndDependencies: [
            'SMTP or transactional email service available (SendGrid/Mailgun)',
            'Hosting with SSL support',
            'Third-party libraries for rich text editor in admin',
        ],
    },
    specificRequirements: {
        functionalRequirements: [
            { id: 'FR-001', title: 'Public Home Page', description: 'Home page shows hero section, services overview, featured projects, latest blog posts, and footer.', inputs: 'None (public content pulled from DB)', outputs: 'Rendered HTML/CSS/JS', priority: 'High', acceptanceCriteria: 'Loads under 2.5s on broadband, hero image responsive, featured projects show 3 latest.' },
        ],
        nonFunctionalRequirements: {
            performance: 'Homepage ≤ 3s on broadband; admin pages ≤ 2s\nHandle 200 concurrent users for public pages',
            security: 'HTTPS only\nPasswords hashed; PII encrypted at rest\nFollow OWASP top 10 protections',
            usability: 'Responsive design: 320px–1920px\nAccessibility: WCAG 2.1 AA recommended',
            reliability: '99.9% uptime target\nDaily DB backups; weekly full backups',
            maintainability: 'Code style: ESLint/Prettier or Flake8/Black\nUnit tests for critical modules; integration tests for APIs',
            scalability: 'Stateless backend for horizontal scaling; managed DB with read replicas if needed',
        },
    },
    externalInterfaceRequirements: {
        userInterfaces: 'Public Home: Hero, Services, Featured Projects, Testimonials, Footer\nProject List: Filter Dropdowns, Search Box, Pagination, Project Cards\nAdmin Dashboard: Sidebar nav, CRUD tables, Rich text editor, Image uploader',
        hardwareInterfaces: 'Server (Linux), optional image CDN',
        softwareInterfaces: 'Email Service (SMTP/Third-party) to send contact and password reset emails',
        communicationInterfaces: 'HTTPS REST APIs, JSON payloads',
    },
    systemModels: {
        useCases: 'UC-01: Visitor browses projects → Opens Project List, filters by tag, opens detail.\nUC-02: Admin manages project → Logs in, creates project with images, publishes.\nUC-03: Visitor sends inquiry → Fills contact form, inquiry stored, admin notified.',
        erDiagram: 'Entities:\nUser: id PK, name, email, password_hash, role, created_at\nProject: id PK, title, slug, description, client, tech_stack (JSON), tags (array), published, published_at, created_at, updated_at\nBlogPost: id PK, title, slug, content, excerpt, featured_image, published, published_at\nInquiry: id PK, name, email, subject, message, status, created_at\nProjectImage: id PK, project_id FK, url, alt_text, order\n\nRelations:\nProjectImage.project_id → Project',
    },
  });

  const handleProjectOverviewChange = (e) => {
    const { name, value } = e.target;
    setSrsData(prevData => ({
      ...prevData,
      projectOverview: {
        ...prevData.projectOverview,
        [name]: value,
      },
    }));
  };

  const handleIntroductionChange = (e) => {
    const { name, value } = e.target;
    setSrsData(prevData => ({
      ...prevData,
      introduction: {
        ...prevData.introduction,
        [name]: value,
      },
    }));
  };

  const handleScopeChange = (index, value) => {
    const newScope = [...srsData.introduction.scope];
    newScope[index] = value;
    setSrsData(prevData => ({
      ...prevData,
      introduction: {
        ...prevData.introduction,
        scope: newScope,
      },
    }));
  };

  const addScopeItem = () => {
    setSrsData(prevData => ({
      ...prevData,
      introduction: {
        ...prevData.introduction,
        scope: [...prevData.introduction.scope, ''],
      },
    }));
  };

  const removeScopeItem = (index) => {
    const newScope = [...srsData.introduction.scope];
    newScope.splice(index, 1);
    setSrsData(prevData => ({
        ...prevData,
        introduction: {
            ...prevData.introduction,
            scope: newScope,
        },
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(srsData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Project Overview</h2>
      <input type="text" name="title" placeholder="Project Title" value={srsData.projectOverview.title} onChange={handleProjectOverviewChange} />
      <input type="text" name="version" placeholder="Version" value={srsData.projectOverview.version} onChange={handleProjectOverviewChange} />
      <input type="date" name="date" placeholder="Date" value={srsData.projectOverview.date} onChange={handleProjectOverviewChange} />
      <input type="text" name="author" placeholder="Author" value={srsData.projectOverview.author} onChange={handleProjectOverviewChange} />
      <textarea name="purpose" placeholder="Purpose" value={srsData.projectOverview.purpose} onChange={handleProjectOverviewChange}></textarea>

      <h2>Introduction</h2>
      <textarea name="purpose" placeholder="Purpose" value={srsData.introduction.purpose} onChange={handleIntroductionChange}></textarea>

      <h3>Scope</h3>
      {srsData.introduction.scope.map((item, index) => (
        <div key={index}>
          <input
            type="text"
            value={item}
            onChange={(e) => handleScopeChange(index, e.target.value)}
          />
          <button type="button" onClick={() => removeScopeItem(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addScopeItem}>Add Scope Item</button>

      {/* ... Definitions and References sections to be added ... */}

      <button type="submit">Generate SRS</button>
    </form>
  );
};

export default SrsForm;
