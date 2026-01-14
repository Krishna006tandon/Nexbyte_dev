const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { autoGenerateCertificate } = require('../middleware/certificateGenerator');
const { checkAndCompleteInternships, checkInternshipsNearingCompletion } = require('../middleware/autoCompletion');

// Complete internship and generate certificate
router.put('/complete/:internshipId', auth, async (req, res) => {
  try {
    const { internshipId } = req.params;

    // Only admin can complete internship
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Find internship
    const internship = await Internship.findById(internshipId).populate('intern');
    
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Check if already completed
    if (internship.status === 'completed') {
      return res.status(400).json({ error: 'Internship already completed' });
    }

    // Update internship status
    internship.status = 'completed';
    internship.endDate = internship.endDate || new Date();
    await internship.save();

    // Auto-generate certificate
    const certificate = await autoGenerateCertificate(internshipId);

    if (!certificate) {
      return res.status(500).json({ error: 'Failed to generate certificate' });
    }

    res.json({
      message: 'Internship completed successfully',
      internship,
      certificate
    });

  } catch (error) {
    console.error('Error completing internship:', error);
    res.status(500).json({ error: 'Failed to complete internship' });
  }
});

// Get intern's current internship
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.role !== 'intern') {
      return res.status(403).json({ error: 'Intern access required' });
    }

    const internship = await Internship.findOne({ 
      intern: req.user._id 
    }).populate('intern', 'name email firstName lastName')
    .populate('certificate');

    if (!internship) {
      return res.status(404).json({ error: 'No internship found' });
    }

    res.json({
      internship,
      certificateData: internship.certificate || null
    });

  } catch (error) {
    console.error('Error fetching internship:', error);
    res.status(500).json({ error: 'Failed to fetch internship' });
  }
});

// Update internship progress (for tracking completion)
router.put('/progress/:internshipId', auth, async (req, res) => {
  try {
    const { internshipId } = req.params;
    const { progress, notes } = req.body;

    // Only admin can update progress
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const internship = await Internship.findById(internshipId);
    
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Update progress
    internship.progress = progress || internship.progress;
    internship.notes = notes || internship.notes;

    // If progress is 100%, mark as completed
    if (progress >= 100 && internship.status !== 'completed') {
      internship.status = 'completed';
      internship.endDate = new Date();
      
      // Auto-generate certificate
      const certificate = await autoGenerateCertificate(internshipId);
      
      await internship.save();
      
      return res.json({
        message: 'Internship completed and certificate generated',
        internship,
        certificate
      });
    }

    await internship.save();

    res.json({
      message: 'Progress updated successfully',
      internship
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get all internships (Admin only)
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

    const internships = await Internship.find(filter)
      .populate('intern', 'name email firstName lastName')
      .populate('certificate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Internship.countDocuments(filter);

    res.json({
      internships,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ error: 'Failed to fetch internships' });
  }
});

// Manual trigger for checking completions (Admin only)
router.post('/check-completions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log('🔍 Manual check for internship completions triggered by admin');
    
    // Run the completion check
    await checkAndCompleteInternships();
    await checkInternshipsNearingCompletion();

    res.json({
      message: 'Completion check completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in manual completion check:', error);
    res.status(500).json({ error: 'Failed to check completions' });
  }
});

module.exports = router;
