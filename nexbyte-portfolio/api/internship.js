const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Allow only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Mock data storage (in production, this would be a database)
let internshipApplications = [];
let emailSettings = {
  enabled: true,
  autoReply: true,
  approvalEmail: true,
  rejectionEmail: true,
  completionEmail: true,
  customTemplates: {
    applicationReceived: {
      subject: 'Application Received - NexByte Internship',
      body: `Dear {name},

Thank you for applying to the NexByte Internship program! We have received your application for the {role} position.

Application Details:
- Name: {name}
- Email: {email}
- Role: {role}
- Date Applied: {date}

Our team will review your application and get back to you within 3-5 business days.

Best regards,
NexByte Team`
    },
    applicationApproved: {
      subject: 'Congratulations! Your Internship Application is Approved - NexByte',
      body: `Dear {name},

Congratulations! We are pleased to inform you that your application for the {role} position at NexByte has been approved.

Next Steps:
1. You will receive a separate email with internship details
2. Please confirm your availability within 48 hours
3. We will schedule an onboarding call

Best regards,
NexByte Team`
    },
    applicationRejected: {
      subject: 'Regarding Your Internship Application - NexByte',
      body: `Dear {name},

Thank you for your interest in the NexByte Internship program.

After careful consideration, we regret to inform you that we are unable to offer you an internship at this time.

We encourage you to apply again in the future.

Best regards,
NexByte Team`
    },
    internshipCompleted: {
      subject: 'Internship Completion Certificate - NexByte',
      body: `Dear {name},

Congratulations on successfully completing your internship at NexByte!

Your certificate of completion is attached to this email.

Best regards,
NexByte Team`
    }
  }
};

let internshipRoles = [
  {
    id: 1,
    name: 'Web Development Intern',
    description: 'Learn full-stack web development with React, Node.js, and modern frameworks',
    duration: '3 months',
    isActive: true,
    requirements: 'Basic HTML, CSS, JavaScript knowledge',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
    mentor: 'John Doe',
    maxInterns: 5,
    currentInterns: 2
  },
  {
    id: 2,
    name: 'Frontend Intern',
    description: 'Focus on modern frontend technologies and UI/UX best practices',
    duration: '2 months',
    isActive: true,
    requirements: 'HTML, CSS, JavaScript basics',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue.js', 'TailwindCSS'],
    mentor: 'Jane Smith',
    maxInterns: 3,
    currentInterns: 1
  }
];

let emailLogs = [];

// GET all applications
router.get('/applications', (req, res) => {
  res.json(internshipApplications);
});

// POST new application
router.post('/applications', upload.single('resume'), (req, res) => {
  try {
    const application = {
      id: Date.now(),
      ...req.body,
      resume: req.file ? req.file.filename : null,
      dateApplied: new Date().toISOString(),
      status: 'new'
    };
    
    internshipApplications.push(application);
    
    // Send auto-reply email if enabled
    if (emailSettings.enabled && emailSettings.autoReply) {
      sendEmail(req.body.email, emailSettings.customTemplates.applicationReceived, req.body);
    }
    
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET application by ID
router.get('/applications/:id', (req, res) => {
  const application = internshipApplications.find(app => app.id === parseInt(req.params.id));
  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }
  res.json(application);
});

// UPDATE application status
router.put('/applications/:id/status', (req, res) => {
  const application = internshipApplications.find(app => app.id === parseInt(req.params.id));
  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }
  
  const { status } = req.body;
  application.status = status;
  
  // Send appropriate email based on status change
  if (emailSettings.enabled) {
    if (status === 'approved' && emailSettings.approvalEmail) {
      sendEmail(application.email, emailSettings.customTemplates.applicationApproved, application);
    } else if (status === 'rejected' && emailSettings.rejectionEmail) {
      sendEmail(application.email, emailSettings.customTemplates.applicationRejected, application);
    }
  }
  
  res.json(application);
});

// GET email settings
router.get('/email-settings', (req, res) => {
  res.json(emailSettings);
});

// UPDATE email settings
router.put('/email-settings', (req, res) => {
  emailSettings = { ...emailSettings, ...req.body };
  res.json(emailSettings);
});

// GET email logs
router.get('/email-logs', (req, res) => {
  res.json(emailLogs);
});

// GET internship roles
router.get('/roles', (req, res) => {
  res.json(internshipRoles);
});

// POST new role
router.post('/roles', (req, res) => {
  const role = {
    id: Date.now(),
    ...req.body,
    currentInterns: 0,
    isActive: true
  };
  internshipRoles.push(role);
  res.status(201).json(role);
});

// PUT update role
router.put('/roles/:id', (req, res) => {
  const roleIndex = internshipRoles.findIndex(role => role.id === parseInt(req.params.id));
  if (roleIndex === -1) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  internshipRoles[roleIndex] = { ...internshipRoles[roleIndex], ...req.body };
  res.json(internshipRoles[roleIndex]);
});

// DELETE role
router.delete('/roles/:id', (req, res) => {
  const roleIndex = internshipRoles.findIndex(role => role.id === parseInt(req.params.id));
  if (roleIndex === -1) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  internshipRoles.splice(roleIndex, 1);
  res.json({ message: 'Role deleted successfully' });
});

// POST send test email
router.post('/send-test-email', (req, res) => {
  const { email, templateType } = req.body;
  
  if (!email || !templateType) {
    return res.status(400).json({ message: 'Email and template type are required' });
  }
  
  const template = emailSettings.customTemplates[templateType];
  if (!template) {
    return res.status(400).json({ message: 'Template not found' });
  }
  
  // Send test email (mock implementation)
  sendEmail(email, template, { name: 'Test User', email: email, role: 'Test Role' });
  
  res.json({ message: 'Test email sent successfully' });
});

// Helper function to send emails (mock implementation)
function sendEmail(to, template, data) {
  // Replace template variables
  let subject = template.subject;
  let body = template.body;
  
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    subject = subject.replace(regex, data[key]);
    body = body.replace(regex, data[key]);
  });
  
  // Log the email (in production, this would use a real email service)
  const logEntry = {
    id: Date.now(),
    type: 'test',
    recipient: to,
    subject: subject,
    sentAt: new Date().toISOString(),
    status: 'sent'
  };
  
  emailLogs.push(logEntry);
  
  console.log('Email sent:', { to, subject, body: body.substring(0, 100) + '...' });
  
  return logEntry;
}

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

module.exports = router;
