// Test Cloudinary configuration
const cloudinary = require('cloudinary').v2;

console.log('🔍 Testing Cloudinary Configuration...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

// Try to configure Cloudinary
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✅ Cloudinary configured successfully');
} catch (error) {
  console.log('❌ Cloudinary configuration failed:', error.message);
}

// Test a simple upload
console.log('\n🧪 Testing simple upload...');
const buffer = Buffer.from('<html><body><h1>Test</h1></body></html>');

cloudinary.uploader.upload_stream(
  {
    resource_type: 'image',
    public_id: 'test_upload',
    folder: 'test',
    format: 'jpg'
  },
  (error, result) => {
    if (error) {
      console.log('❌ Upload failed:', error.message || error);
    } else {
      console.log('✅ Upload successful:', result.secure_url);
    }
  }
).end(buffer);
