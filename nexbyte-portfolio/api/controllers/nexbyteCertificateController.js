const NexbyteCertificate = require('../models/NexbyteCertificate');
const { put } = require('@vercel/blob');

// Generate unique ID based on category and year
const generateCertificateId = async (category) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `NBC-${category.toUpperCase()}-${year}`;
  
  // Find the last certificate with this prefix
  const lastCert = await NexbyteCertificate.findOne({ certificateId: new RegExp(`^${prefix}`) })
    .sort({ certificateId: -1 });

  let nextNumber = 1;
  if (lastCert) {
    const lastNumberStr = lastCert.certificateId.split('-').pop();
    nextNumber = parseInt(lastNumberStr, 10) + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(3, '0');
  return `${prefix}${paddedNumber}`;
};

// 1. POST /certificate - Admin only
exports.createCertificate = async (req, res) => {
  try {
    const { category, studentName, email, programName, awardName, issueDate, internshipDuration, revealDate, customId } = req.body;
    
    let certificateFileUrl = null;
    if (req.file) {
      const extension = req.file.originalname.split('.').pop();
      const filename = `certificates/${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
      const blob = await put(filename, req.file.buffer, {
        access: 'public',
      });
      certificateFileUrl = blob.url;
    }
    
    let certificateId = customId;
    if (!certificateId || certificateId.trim() === '') {
      certificateId = await generateCertificateId(category || 'INT');
    } else {
      // Ensure custom ID is unique
      const existing = await NexbyteCertificate.findOne({ certificateId });
      if (existing) {
        return res.status(400).json({ success: false, message: 'This Certificate ID is already in use.' });
      }
    }
    
    // Use the actual origin where the request came from, or fallback to the host
    const origin = req.headers.origin || (req.get('host') ? `https://${req.get('host')}` : null);
    const frontendUrl = origin || process.env.FRONTEND_URL || 'https://nexbyte-dev.vercel.app';
    const qrCodeUrl = `${frontendUrl}/certificate/${certificateId}`;

    const newCertificate = new NexbyteCertificate({
      certificateId,
      studentName,
      email,
      programName,
      awardName,
      issueDate,
      internshipDuration,
      status: 'Valid',
      qrCodeUrl,
      certificateFileUrl,
      revealDate: revealDate ? new Date(revealDate) : null
    });

    await newCertificate.save();
    res.status(201).json({ success: true, certificate: newCertificate });
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 2. GET /certificate/:certificateId - Public
exports.getCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const certificate = await NexbyteCertificate.findOne({ certificateId });
    
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate Not Found' });
    }
    
    res.status(200).json({ success: true, certificate });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 3. PUT /certificate/:certificateId - Admin only
exports.updateCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const updates = req.body;
    
    const certificate = await NexbyteCertificate.findOneAndUpdate(
      { certificateId },
      { $set: updates },
      { new: true }
    );
    
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate Not Found' });
    }
    
    res.status(200).json({ success: true, certificate });
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 4. DELETE /certificate/:certificateId - Admin only
exports.deleteCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const certificate = await NexbyteCertificate.findOneAndDelete({ certificateId });
    
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate Not Found' });
    }
    
    res.status(200).json({ success: true, message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 5. POST /verify - Public (same as GET but via POST for form submits)
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.body;
    const certificate = await NexbyteCertificate.findOne({ certificateId });
    
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'This Certificate ID does not exist in our records.' });
    }
    
    res.status(200).json({ success: true, certificate });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 6. GET /certificates - Admin only
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await NexbyteCertificate.find().sort({ createdAt: -1 });
    const total = certificates.length;
    const verified = certificates.filter(c => c.status === 'Valid').length;
    
    res.status(200).json({ 
      success: true, 
      total, 
      verified, 
      certificates 
    });
  } catch (error) {
    console.error('Error fetching all certificates:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 7. GET /intern/my-certificate - Intern only
exports.getInternCertificate = async (req, res) => {
  try {
    const email = req.user.email;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email not found in token' });
    }
    
    // Find valid certificate by email
    const certificate = await NexbyteCertificate.findOne({ email, status: 'Valid' }).sort({ createdAt: -1 });
    
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'No certificate found' });
    }
    
    res.status(200).json({ success: true, certificate });
  } catch (error) {
    console.error('Error fetching intern certificate:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
