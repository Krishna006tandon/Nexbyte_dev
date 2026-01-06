const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const InternshipApplication = require('./models/InternshipApplication');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads/resumes');
    cb(null, uploadsDir);
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
// let internshipApplications = [];

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
router.get('/applications', async (req, res) => {
  try {
    const applications = await InternshipApplication.find().sort({ dateApplied: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new application
router.post('/applications', upload.single('resume'), async (req, res) => {
  try {
    const application = new InternshipApplication({
      ...req.body,
      resume: req.file ? req.file.filename : null,
      dateApplied: new Date()
    });
    
    const savedApplication = await application.save();
    res.status(201).json(savedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET application by ID
router.get('/applications/:id', async (req, res) => {
  try {
    console.log('Fetching application with ID:', req.params.id);
    const application = await InternshipApplication.findById(req.params.id);
    if (!application) {
      console.log('Application not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Application not found' });
    }
    console.log('Application found:', application);
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE application status
router.put('/applications/:id/status', async (req, res) => {
  try {
    const application = await InternshipApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const { status, notes, interviewDate, rejectionReason } = req.body;
    application.status = status;
    if (notes) application.notes = notes;
    if (interviewDate) application.interviewDate = interviewDate;
    if (rejectionReason) application.rejectionReason = rejectionReason;
    
    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE application
router.delete('/applications/:id', async (req, res) => {
  try {
    const application = await InternshipApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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

// Create the full uploads directory path recursively
const uploadsDir = path.join(__dirname, '../uploads/resumes');
const uploadsParentDir = path.join(__dirname, '../uploads');

try {
  // Create parent uploads directory first
  if (!fs.existsSync(uploadsParentDir)) {
    fs.mkdirSync(uploadsParentDir, { recursive: true });
  }
  // Create resumes directory
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (error) {
  console.error('Error creating upload directories:', error);
}

module.exports = router;
