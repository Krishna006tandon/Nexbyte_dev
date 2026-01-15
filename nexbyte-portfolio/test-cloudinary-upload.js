// Test certificate generation with Cloudinary
require('dotenv').config();

// Set Cloudinary credentials temporarily (you need to add actual credentials)
process.env.CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
process.env.CLOUDINARY_API_KEY = 'your_api_key';
process.env.CLOUDINARY_API_SECRET = 'your_api_secret';

const { autoGenerateCertificate } = require('./api/middleware/certificateGenerator');

async function testCloudinaryUpload() {
  try {
    console.log('🧪 Testing certificate generation with Cloudinary...');
    
    // Use an existing internship ID
    const internshipId = '69689bc23d95bf2b71890386';
    
    const result = await autoGenerateCertificate(internshipId);
    
    if (result) {
      console.log('✅ Certificate generated successfully!');
      console.log('📄 Certificate ID:', result.certificateId);
      console.log('🔗 Certificate URL:', result.certificateUrl);
      console.log('☁️  Cloudinary URL:', result.cloudinaryUrl || 'Still null - check Cloudinary config');
      
      if (result.cloudinaryUrl) {
        console.log('\n🎉 SUCCESS! Certificate uploaded to Cloudinary!');
        console.log('🌐 Direct image link:', result.cloudinaryUrl);
      } else {
        console.log('\n⚠️  Cloudinary upload failed - check credentials');
        console.log('📋 To fix this:');
        console.log('1. Get Cloudinary credentials from cloudinary.com');
        console.log('2. Add them to your .env file:');
        console.log('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
        console.log('   CLOUDINARY_API_KEY=your_api_key');
        console.log('   CLOUDINARY_API_SECRET=your_api_secret');
      }
    } else {
      console.log('❌ Certificate generation failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCloudinaryUpload();
