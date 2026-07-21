const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/nexbyteCertificateController');
const rateLimit = require('express-rate-limit');

// Simple middleware to mock admin check (you should replace this with your actual JWT middleware)
const adminAuthMiddleware = (req, res, next) => {
  // If you already have a verifyToken middleware, import and use it.
  // For now, this allows the route to be used or you can integrate your own.
  next();
};

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: 'Too many verification requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin Routes (Protect these with JWT Auth)
router.post('/certificate', adminAuthMiddleware, certificateController.createCertificate);
router.put('/certificate/:certificateId', adminAuthMiddleware, certificateController.updateCertificate);
router.delete('/certificate/:certificateId', adminAuthMiddleware, certificateController.deleteCertificate);
router.get('/certificates/all', adminAuthMiddleware, certificateController.getAllCertificates);

// Public Routes
router.get('/certificate/:certificateId', verifyLimiter, certificateController.getCertificate);
router.post('/verify', verifyLimiter, certificateController.verifyCertificate);

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
      xml += '  <url>\n';
      xml += `    <loc>${frontendUrl}/certificate/${cert.certificateId}</loc>\n`;
      xml += `    <lastmod>${cert.updatedAt.toISOString()}</lastmod>\n`;
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
