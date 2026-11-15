const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/nexbyteCertificateController');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const extractToken = (req) => {
  const cookieToken = req.cookies?.token;
  if (cookieToken) return cookieToken;
  const headerToken = req.header('x-auth-token');
  if (headerToken) return headerToken;
  const authHeader = req.header('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
};

const adminAuthMiddleware = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Token is not valid' });
    }
    const user = await User.findById(userId).select('role email');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }
    req.user = { ...decoded.user, role: user.role, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: 'Too many verification requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin Routes (Protected with JWT Admin Auth)
router.post('/certificate', adminAuthMiddleware, upload.single('certificateFile'), certificateController.createCertificate);
router.put('/certificate/:certificateId', adminAuthMiddleware, certificateController.updateCertificate);
router.delete('/certificate/:certificateId', adminAuthMiddleware, certificateController.deleteCertificate);
router.get('/certificates/all', adminAuthMiddleware, certificateController.getAllCertificates);

// Public Routes
router.get('/certificate/:certificateId', verifyLimiter, certificateController.getCertificate);
router.post('/verify', verifyLimiter, certificateController.verifyCertificate);

// Intern Route: Fetch own certificate
const internAuthMiddleware = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;

    // Quick check if they are intern
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'intern') {
      return res.status(403).json({ message: 'Access denied, not an intern' });
    }

    req.user.email = user.email; // attach email so controller can find cert
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

router.get('/intern/my-certificate', internAuthMiddleware, certificateController.getInternCertificate);

// Dynamic Sitemap Route for Google SEO
router.get('/sitemap.xml', async (req, res) => {
  try {
    const NexbyteCertificate = require('../models/NexbyteCertificate');
    const certificates = await NexbyteCertificate.find({ status: 'Valid' });

    // Default frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'https://nexbytecore.com';

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add main verify page
    xml += '  <url>\n';
    xml += `    <loc>${frontendUrl}/verify</loc>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';

    // Add all valid certificates
    certificates.forEach(cert => {
      const lastMod = cert.updatedAt ? new Date(cert.updatedAt).toISOString() : new Date().toISOString();
      xml += '  <url>\n';
      xml += `    <loc>${frontendUrl}/certificate/${cert.certificateId}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += '    <changefreq>never</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap Error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
