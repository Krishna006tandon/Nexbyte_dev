const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const auth = require('../middleware/auth');
const { autoGenerateCertificate } = require('../middleware/certificateGenerator');
const { checkAndCompleteInternships, checkInternshipsNearingCompletion } = require('../middleware/autoCompletion');
const { decryptCertificateData } = require('../utils/certificateCrypto');

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

    console.log('Looking for internship for intern:', req.user.id);
    console.log('Intern email:', req.user.email);

    const internship = await Internship.findOne({ 
      intern: req.user.id,
      status: 'completed'
    }).populate('intern', 'name email firstName lastName internshipStatus')
    .populate('certificate')
    .sort({ createdAt: -1 }); // Get the latest completed internship

    console.log('Found internship:', internship ? 'YES' : 'NO');
    if (internship) {
      console.log('Internship ID:', internship._id);
      console.log('Internship Status:', internship.status);
      console.log('Certificate:', internship.certificate ? 'YES' : 'NO');
      if (internship.certificate) {
        console.log('Certificate Object:', {
          id: internship.certificate._id,
          certificateId: internship.certificate.certificateId,
          cloudinaryUrl: internship.certificate.cloudinaryUrl,
          hasEncryptedData: !!internship.certificate.encryptedData
        });
      }
    }

    if (!internship) {
      return res.status(404).json({ error: 'No internship found' });
    }

    let certificateData = null;
    
    // If certificate exists, decrypt the data
    if (internship.certificate && internship.certificate.encryptedData) {
      try {
        certificateData = decryptCertificateData(internship.certificate.encryptedData);
        console.log('Certificate decrypted successfully');
      } catch (error) {
        console.error('Failed to decrypt certificate data:', error);
        certificateData = null;
      }
    }

    res.json({
      internship: {
        ...internship.toObject(),
        certificate: undefined // Remove certificate from internship object
      },
      certificateData,
      cloudinaryUrl: internship.certificate?.cloudinaryUrl || null
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

// Test certificate generation (Admin only)
router.post('/test-certificate/:internId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { internId } = req.params;
    
    // Find intern's current internship
    const internship = await Internship.findOne({ 
      intern: internId,
      status: 'in_progress' 
    }).populate('intern');

    if (!internship) {
      return res.status(404).json({ error: 'No active internship found for this intern' });
    }

    console.log('Testing certificate generation for:', internship.intern.email);
    
    // Test certificate generation
    const certificate = await autoGenerateCertificate(internship._id);
    
    if (certificate) {
      console.log('✅ Test certificate generated successfully:', certificate.certificateId);
      res.json({
        message: 'Test certificate generated successfully',
        certificateId: certificate.certificateId,
        certificateUrl: certificate.certificateUrl
      });
    } else {
      res.status(500).json({ error: 'Failed to generate test certificate' });
    }

  } catch (error) {
    console.error('Error in test certificate generation:', error);
    res.status(500).json({ error: 'Failed to generate test certificate' });
  }
});

// Manual complete internship for testing (Admin only)
router.post('/complete-manual/:internId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { internId } = req.params;
    
    // Find the intern's current internship
    const internship = await Internship.findOne({ 
      intern: internId,
      status: 'in_progress' 
    }).populate('intern');

    if (!internship) {
      return res.status(404).json({ error: 'No active internship found for this intern' });
    }

    console.log(`Manually completing internship for: ${internship.intern.email}`);
    
    // Update internship status
    internship.status = 'completed';
    internship.endDate = internship.endDate || new Date();
    await internship.save();
    
    // Auto-generate certificate
    const certificate = await autoGenerateCertificate(internship._id);
    
    if (certificate) {
      console.log(`✅ Certificate generated: ${certificate.certificateId}`);
      
      // Update user status
      await User.findByIdAndUpdate(internship.intern._id, {
        internshipStatus: 'completed'
      });
      
      res.json({
        message: 'Internship completed successfully and certificate generated',
        internship,
        certificate
      });
    } else {
      res.status(500).json({ error: 'Failed to generate certificate' });
    }

  } catch (error) {
    console.error('Error in manual completion:', error);
    res.status(500).json({ error: 'Failed to complete internship' });
  }
});

module.exports = router;
