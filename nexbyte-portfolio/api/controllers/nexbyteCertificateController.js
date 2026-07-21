const NexbyteCertificate = require('../models/NexbyteCertificate');

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
    const { category, studentName, email, programName, awardName, issueDate, internshipDuration } = req.body;
    
    const certificateId = await generateCertificateId(category || 'INT');
    
    // Base URL could be environment based. Let's use request host or env var
    // For React/Next apps often they run on port 3000 locally. We can default to request origin
    // But since it's a direct URL to frontend, it's better to pass origin from frontend or use a static env var
    const frontendUrl = process.env.FRONTEND_URL || 'https://nexbytecore.com';
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
      qrCodeUrl
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
