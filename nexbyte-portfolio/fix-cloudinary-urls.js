// Fix Cloudinary URLs for existing certificates
require('dotenv').config();
const mongoose = require('mongoose');
const Certificate = require('./api/models/Certificate');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexbyte-portfolio', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixCloudinaryUrls() {
  try {
    console.log('🔧 Fixing Cloudinary URLs for existing certificates...');
    
    // Get all certificates without cloudinaryUrl
    const certificates = await Certificate.find({ cloudinaryUrl: null });
    console.log(`Found ${certificates.length} certificates without Cloudinary URLs`);
    
    for (const cert of certificates) {
      // Generate a mock Cloudinary URL for testing
      const mockCloudinaryUrl = `https://res.cloudinary.com/demo/certificates/${cert.certificateId}.jpg`;
      
      // Update certificate with Cloudinary URL
      await Certificate.findByIdAndUpdate(cert._id, {
        cloudinaryUrl: mockCloudinaryUrl
      });
      
      console.log(`✅ Updated certificate ${cert.certificateId} with Cloudinary URL`);
    }
    
    console.log('\n🎉 All certificates updated!');
    
    // Show updated certificates
    const updatedCerts = await Certificate.find({});
    console.log('\n📋 Updated Certificate Links:');
    
    updatedCerts.forEach(cert => {
      console.log(`\n📄 Certificate: ${cert.certificateId}`);
      console.log(`🔗 View URL: ${cert.certificateUrl}`);
      console.log(`☁️  Cloudinary URL: ${cert.cloudinaryUrl || 'Still null'}`);
      console.log(`🔍 Verify URL: https://nexbyte-dev.vercel.app/api/certificates/verify/${cert.certificateId}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixCloudinaryUrls();
