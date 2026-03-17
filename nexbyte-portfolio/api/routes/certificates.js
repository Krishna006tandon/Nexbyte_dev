const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Certificate = require('../models/Certificate');

const router = express.Router();

// Simple auth middleware (mirrors other route files)
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Util: build professional certificate file path (static for now – integrates with HTML template later)
const ensureCertificatesDir = () => {
  const dir = path.join(__dirname, '..', '..', 'public', 'certificates');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Admin: mark internship completed & issue certificate
router.post('/issue/:internId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const internId = req.params.internId;
    const { internshipTitle, startDate, endDate } = req.body;

    const user = await User.findById(internId);
    if (!user || user.role !== 'intern') {
      return res.status(404).json({ error: 'Intern not found' });
    }

    // Avoid duplicate certificates
    if (user.internshipStatus === 'completed' && user.certificateId && user.certificateUrl) {
      const existing = await Certificate.findOne({ intern: internId, certificateId: user.certificateId });
      return res.json({
        message: 'Internship already marked as completed. Returning existing certificate.',
        user,
        certificate: existing,
      });
    }

    const certificateId = `NB-${uuidv4().slice(0, 8).toUpperCase()}`;

    const effectiveTitle = internshipTitle || user.internshipTitle || 'Internship at Nexbyte Core';
    const effectiveStart = startDate || user.internshipStartDate || new Date();
    const effectiveEnd = endDate || user.internshipEndDate || new Date();

    const certificatesDir = ensureCertificatesDir();
    const fileName = `${certificateId}.pdf`;
    const filePath = path.join(certificatesDir, fileName);

    // For now, generate a very simple placeholder PDF-like file.
    // In production, replace this with a proper HTML->PDF pipeline (e.g., Puppeteer).
    const certificateText = `
      Nexbyte Core Internship Certificate

      This is to certify that ${user.name || user.email} has successfully completed
      the internship "${effectiveTitle}" from ${new Date(effectiveStart).toDateString()} 
      to ${new Date(effectiveEnd).toDateString()}.

      Certificate ID: ${certificateId}
      Issued At: ${new Date().toDateString()}
    `;

    fs.writeFileSync(filePath, certificateText);

    const relativeUrl = `/certificates/${fileName}`;

    const certificate = await Certificate.create({
      intern: internId,
      internshipTitle: effectiveTitle,
      startDate: effectiveStart,
      endDate: effectiveEnd,
      certificateId,
      url: relativeUrl,
    });

    user.internshipStatus = 'completed';
    user.internshipTitle = effectiveTitle;
    user.internshipStartDate = effectiveStart;
    user.internshipEndDate = effectiveEnd;
    user.certificateId = certificateId;
    user.certificateUrl = relativeUrl;
    user.certificateIssuedAt = new Date();
    await user.save();

    res.status(201).json({ message: 'Certificate issued successfully', user, certificate });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({ error: 'Failed to issue certificate' });
  }
});

// Intern/Admin: get certificate meta for logged-in user (or specific intern as admin)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      'name email role internshipStatus internshipTitle internshipStartDate internshipEndDate certificateId certificateUrl certificateIssuedAt'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const certificate = await Certificate.findOne({ intern: user._id }).sort({ issuedAt: -1 });

    res.json({ user, certificate });
  } catch (error) {
    console.error('Error fetching certificate for user:', error);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

router.get('/intern/:internId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { internId } = req.params;
    const user = await User.findById(internId).select(
      'name email role internshipStatus internshipTitle internshipStartDate internshipEndDate certificateId certificateUrl certificateIssuedAt'
    );

    if (!user || user.role !== 'intern') {
      return res.status(404).json({ error: 'Intern not found' });
    }

    const certificate = await Certificate.findOne({ intern: internId }).sort({ issuedAt: -1 });

    res.json({ user, certificate });
  } catch (error) {
    console.error('Error fetching certificate for intern:', error);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

module.exports = router;

