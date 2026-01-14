const express = require('express');
const router = express.Router();
const InternshipApplication = require('../models/InternshipApplication');
const InternshipListing = require('../models/InternshipListing');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// Submit new application
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      education,
      experience,
      skills,
      coverLetter,
      internshipId,
      internshipTitle
    } = req.body;

    // Check if user has already applied for this internship
    const existingApplication = await InternshipApplication.findOne({
      email,
      internshipTitle
    });

    if (existingApplication) {
      return res.status(400).json({ 
        error: 'You have already applied for this internship' 
      });
    }

    // Check if internship is still active and has capacity
    const internship = await InternshipListing.findById(internshipId);
    if (!internship || !internship.isActive) {
      return res.status(400).json({ 
        error: 'This internship is no longer available' 
      });
    }

    if (internship.currentApplicants >= internship.maxApplicants) {
      return res.status(400).json({ 
        error: 'This internship has reached maximum number of applicants' 
      });
    }

    // Create application
    const applicationData = {
      name,
      email,
      phone,
      role: internshipTitle,
      education,
      experience,
      skills,
      coverLetter,
      resume: req.file ? req.file.filename : null,
      internshipId,
      internshipTitle
    };

    const application = new InternshipApplication(applicationData);
    await application.save();

    // Update internship applicant count
    await InternshipListing.findByIdAndUpdate(internshipId, {
      $inc: { currentApplicants: 1 }
    });

    // Populate and return the application
    const populatedApplication = await InternshipApplication.findById(application._id);

    res.status(201).json(populatedApplication);
  } catch (error) {
    console.error('Error submitting application:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'You have already applied for this internship' 
      });
    }
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get all applications (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const applications = await InternshipApplication.find(filter)
      .sort({ dateApplied: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InternshipApplication.countDocuments(filter);

    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get applications by user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only see their own applications
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const applications = await InternshipApplication.find({ email: req.user.email })
      .sort({ dateApplied: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get single application
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await InternshipApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Users can only see their own applications
    if (req.user.email !== application.email && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Update application status (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, notes, interviewDate, rejectionReason } = req.body;

    const application = await InternshipApplication.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes,
        interviewDate,
        rejectionReason
      },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Delete application (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const application = await InternshipApplication.findByIdAndDelete(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update internship applicant count
    if (application.internshipId) {
      await InternshipListing.findByIdAndUpdate(application.internshipId, {
        $inc: { currentApplicants: -1 }
      });
    }

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// Get application statistics (Admin only)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const stats = await InternshipApplication.aggregate([
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          newApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
          },
          reviewingApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'reviewing'] }, 1, 0] }
          },
          approvedApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    const recentApplications = await InternshipApplication.find()
      .sort({ dateApplied: -1 })
      .limit(5);

    res.json({
      overview: stats[0] || {
        totalApplications: 0,
        newApplications: 0,
        reviewingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0
      },
      recentApplications
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ error: 'Failed to fetch application statistics' });
  }
});

module.exports = router;
