const Certificate = require('../models/Certificate');
const Internship = require('../models/Internship');
const User = require('../models/User');
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

// Auto-generate certificate when internship is completed
const autoGenerateCertificate = async (internshipId) => {
  try {
    console.log('Auto-generating certificate for internship:', internshipId);
    
    // Get internship details
    const internship = await Internship.findById(internshipId).populate('intern');
    
    if (!internship) {
      console.error('Internship not found for certificate generation');
      return null;
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      intern: internship.intern._id,
      internship: internshipId
    });

    if (existingCertificate) {
      console.log('Certificate already exists for this internship');
      return existingCertificate;
    }

    const certificateId = generateCertificateId();
    const issuedAt = new Date();

    // Prepare certificate data
    const certificateData = {
      internName: internship.intern.name || internship.intern.firstName + ' ' + internship.intern.lastName,
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
      intern: internship.intern._id,
      internship: internshipId,
      certificateId,
      certificateUrl: `${process.env.CLIENT_URL || 'https://nexbyte-dev.vercel.app'}/certificate/${certificateId}`,
      encryptedData
    });

    await certificate.save();

    // Update internship with certificate reference
    await Internship.findByIdAndUpdate(internshipId, {
      certificate: certificate._id
    });

    // Update user's internship status
    await User.findByIdAndUpdate(internship.intern._id, {
      internshipStatus: 'completed'
    });

    console.log('Certificate generated successfully:', certificateId);
    return certificate;

  } catch (error) {
    console.error('Error auto-generating certificate:', error);
    return null;
  }
};

// Check and generate certificate for completed internships
const checkAndGenerateCertificates = async () => {
  try {
    console.log('Checking for completed internships without certificates...');
    
    // Find all completed internships without certificates
    const completedInternships = await Internship.find({
      status: 'completed',
      certificate: { $exists: false }
    }).populate('intern');

    console.log(`Found ${completedInternships.length} completed internships without certificates`);

    for (const internship of completedInternships) {
      await autoGenerateCertificate(internship._id);
    }

  } catch (error) {
    console.error('Error checking and generating certificates:', error);
  }
};

module.exports = {
  autoGenerateCertificate,
  checkAndGenerateCertificates
};
