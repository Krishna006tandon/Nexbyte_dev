// Direct test of certificate generation
const mongoose = require('mongoose');
const Certificate = require('./api/models/Certificate');
const Internship = require('./api/models/Internship');
const User = require('./api/models/User');
const { autoGenerateCertificate } = require('./api/middleware/certificateGenerator');

async function directTest() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/nexbyte-internships');
    console.log('Connected to MongoDB');

    // Find an intern
    const intern = await User.findOne({ role: 'intern' });
    if (!intern) {
      console.log('No intern found. Creating test intern...');
      
      const testIntern = new User({
        email: 'test.intern@example.com',
        password: 'test123',
        role: 'intern',
        firstName: 'Test',
        lastName: 'Intern',
        internshipStatus: 'in_progress'
      });
      
      await testIntern.save();
      console.log('Test intern created:', testIntern.email);
      
      // Create internship for test intern
      const internship = new Internship({
        intern: testIntern._id,
        internshipTitle: 'Test Development Internship',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        status: 'in_progress'
      });
      
      await internship.save();
      console.log('Test internship created');
    }

    // Find an active internship
    const internship = await Internship.findOne({ status: 'in_progress' }).populate('intern');
    if (!internship) {
      console.log('No active internship found');
      return;
    }

    console.log(`Testing certificate generation for: ${internship.intern.email}`);
    
    // Generate certificate
    const certificate = await autoGenerateCertificate(internship._id);
    
    if (certificate) {
      console.log('✅ Certificate generated successfully!');
      console.log('Certificate ID:', certificate.certificateId);
      console.log('Certificate URL:', certificate.certificateUrl);
      
      // Check if it's saved in database
      const savedCertificate = await Certificate.findById(certificate._id);
      if (savedCertificate) {
        console.log('✅ Certificate saved in database');
        console.log('Encrypted data length:', savedCertificate.encryptedData.length);
      } else {
        console.log('❌ Certificate not found in database');
      }
      
      // Check internship is updated
      const updatedInternship = await Internship.findById(internship._id);
      if (updatedInternship.certificate) {
        console.log('✅ Internship updated with certificate reference');
      } else {
        console.log('❌ Internship not updated');
      }
      
    } else {
      console.log('❌ Certificate generation failed');
    }

    // Check all certificates
    const allCertificates = await Certificate.find({});
    console.log(`Total certificates in database: ${allCertificates.length}`);
    
    allCertificates.forEach(cert => {
      console.log(`- Certificate ID: ${cert.certificateId}, Intern: ${cert.intern}`);
    });

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

directTest();
