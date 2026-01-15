const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Internship = require('../models/Internship');
const User = require('../models/User');
const auth = require('../middleware/auth');
const crypto = require('crypto');

// Generate unique certificate ID
const generateCertificateId = () => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `NEX-${timestamp}-${random}`;
};

// Encrypt certificate data
const encryptData = (data) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.createHash('sha256').update(process.env.CERT_SECRET || 'default-secret-key').digest();
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
};

// Decrypt certificate data (for verification)
const decryptData = (encryptedData) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.createHash('sha256').update(process.env.CERT_SECRET || 'default-secret-key').digest();
  
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
};

// Generate certificate (Admin only)
router.post('/generate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { internId, internshipId } = req.body;

    // Verify intern and internship exist
    const intern = await User.findById(internId);
    const internship = await Internship.findById(internshipId);

    if (!intern || !internship) {
      return res.status(404).json({ error: 'Intern or internship not found' });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      intern: internId,
      internship: internshipId
    });

    if (existingCertificate) {
      return res.status(400).json({ error: 'Certificate already exists for this internship' });
    }

    const certificateId = generateCertificateId();
    const issuedAt = new Date();

    // Prepare certificate data
    const certificateData = {
      internName: intern.email,
      internshipTitle: internship.internshipTitle,
      startDate: internship.startDate,
      endDate: internship.endDate || issuedAt,
      issuedDate: issuedAt,
      certificateId,
      company: 'NexByte Core'
    };

    // Encrypt sensitive data
    const encryptedData = encryptData(certificateData);

    // Create certificate
    const certificate = new Certificate({
      intern: internId,
      internship: internshipId,
      certificateId,
      certificateUrl: `https://nexbyte-dev.vercel.app/certificate/${certificateId}`,
      encryptedData
    });

    await certificate.save();

    // Update internship with certificate reference
    await Internship.findByIdAndUpdate(internshipId, {
      certificate: certificate._id,
      status: 'completed'
    });

    // Update user's internship status
    await User.findByIdAndUpdate(internId, {
      internshipStatus: 'completed'
    });

    res.status(201).json({
      certificate,
      certificateData
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

// Get all certificates (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { page = 1, limit = 10 } = req.query;

    const certificates = await Certificate.find()
      .populate('intern', 'name email')
      .populate('internship', 'internshipTitle startDate endDate')
      .sort({ issuedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Certificate.countDocuments();

    res.json({
      certificates,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Get certificates by user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only see their own certificates
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const certificates = await Certificate.find({ intern: userId })
      .populate('internship', 'internshipTitle startDate endDate')
      .sort({ issuedAt: -1 });

    res.json(certificates);
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Get single certificate by certificate ID
router.get('/view/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate('intern', 'name email')
      .populate('internship', 'internshipTitle startDate endDate');

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Decrypt the certificate data
    const { decryptCertificateData } = require('../utils/certificateCrypto');
    let decryptedData = null;
    
    try {
      decryptedData = decryptCertificateData(certificate.encryptedData);
    } catch (decryptError) {
      console.error('Failed to decrypt certificate data:', decryptError);
      return res.status(500).json({ error: 'Failed to decrypt certificate data' });
    }

    res.json({
      certificate: {
        _id: certificate._id,
        certificateId: certificate.certificateId,
        issuedAt: certificate.issuedAt,
        certificateUrl: certificate.certificateUrl,
      },
      data: decryptedData
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// Get single certificate
router.get('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('intern', 'name email')
      .populate('internship', 'internshipTitle startDate endDate');

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json(certificate);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// Verify certificate by ID (Public endpoint)
router.get('/verify/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate('intern', 'name email')
      .populate('internship', 'internshipTitle startDate endDate');

    if (!certificate) {
      return res.status(404).json({ 
        error: 'Certificate not found',
        valid: false
      });
    }

    res.json({
      valid: true,
      certificate: {
        certificateId: certificate.certificateId,
        internName: certificate.intern.name,
        internshipTitle: certificate.internship.internshipTitle,
        startDate: certificate.internship.startDate,
        endDate: certificate.internship.endDate,
        issuedAt: certificate.issuedAt,
        verificationUrl: `https://nexbyte-dev.vercel.app/api/certificates/verify/${certificateId}`
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ 
      error: 'Failed to verify certificate',
      valid: false
    });
  }
});

// Download certificate PDF
router.get('/:id/download', auth, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('intern', 'name email')
      .populate('internship', 'internshipTitle startDate endDate');

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Users can only download their own certificates
    if (req.user._id.toString() !== certificate.intern._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate PDF (you would use a library like puppeteer here)
    // For now, we'll return the certificate data
    res.json({
      message: 'Certificate download endpoint',
      certificateData: certificate,
      downloadUrl: certificate.certificateUrl
    });
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ error: 'Failed to download certificate' });
  }
});

// Delete certificate (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const certificate = await Certificate.findByIdAndDelete(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Remove certificate reference from internship
    await Internship.findByIdAndUpdate(certificate.internship, {
      $unset: { certificate: 1 }
    });

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

// Get certificate statistics (Admin only)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const stats = await Certificate.aggregate([
      {
        $group: {
          _id: null,
          totalCertificates: { $sum: 1 },
          certificatesThisMonth: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$issuedAt',
                    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const recentCertificates = await Certificate.find()
      .populate('intern', 'name')
      .populate('internship', 'internshipTitle')
      .sort({ issuedAt: -1 })
      .limit(5);

    res.json({
      overview: stats[0] || { totalCertificates: 0, certificatesThisMonth: 0 },
      recentCertificates
    });
  } catch (error) {
    console.error('Error fetching certificate stats:', error);
    res.status(500).json({ error: 'Failed to fetch certificate statistics' });
  }
});

module.exports = router;
