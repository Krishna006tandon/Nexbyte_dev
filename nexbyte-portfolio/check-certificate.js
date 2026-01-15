// Check certificate data in database
const mongoose = require('mongoose');
const Certificate = require('./api/models/Certificate');
const Internship = require('./api/models/Internship');

async function checkCertificate() {
  try {
    // Connect to MongoDB (using same connection as server)
    await mongoose.connect('mongodb://localhost:27017/nexbyte');
    console.log('Connected to MongoDB');
    
    // Find the test intern's certificate
    const certificates = await Certificate.find({}).sort({ createdAt: -1 }).limit(5);
    console.log('Recent certificates:', certificates.length);
    
    certificates.forEach((cert, index) => {
      console.log(`\nCertificate ${index + 1}:`);
      console.log('  ID:', cert.certificateId);
      console.log('  Cloudinary URL:', cert.cloudinaryUrl || 'Not found');
      console.log('  Certificate URL:', cert.certificateUrl);
      console.log('  Has encrypted data:', cert.encryptedData ? 'YES' : 'NO');
      console.log('  Created:', cert.createdAt);
    });
    
    // Check internships
    const internships = await Internship.find({}).populate('certificate').sort({ createdAt: -1 }).limit(3);
    console.log('\nRecent internships:', internships.length);
    
    internships.forEach((internship, index) => {
      console.log(`\nInternship ${index + 1}:`);
      console.log('  ID:', internship._id);
      console.log('  Status:', internship.status);
      console.log('  Certificate ID:', internship.certificate?.certificateId || 'Not found');
      console.log('  Certificate Cloudinary URL:', internship.certificate?.cloudinaryUrl || 'Not found');
    });
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCertificate();
