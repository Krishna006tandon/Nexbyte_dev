// Simple test for certificate generation
const fetch = require('node-fetch');

async function simpleTest() {
  try {
    console.log('Starting simple certificate test...');
    
    // Login as admin
    const loginRes = await fetch('http://localhost:3008/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nexbyte.com',
        password: 'admin123'
      })
    });
    
    if (!loginRes.ok) {
      throw new Error('Admin login failed');
    }
    
    const { token } = await loginRes.json();
    console.log('✅ Admin login successful');
    
    // Complete existing internship
    const completeRes = await fetch('http://localhost:3008/api/internship-management/complete-manual/69689b6d3d95bf2b7189037f', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-auth-token': token 
      }
    });
    
    if (completeRes.ok) {
      const result = await completeRes.json();
      console.log('✅ Certificate generated');
      console.log('Certificate ID:', result.certificate?.certificateId);
      console.log('Cloudinary URL:', result.certificate?.cloudinaryUrl || 'Not found');
    } else {
      console.log('❌ Failed to complete internship');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

simpleTest();
