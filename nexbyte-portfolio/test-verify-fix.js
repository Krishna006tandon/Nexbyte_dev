// Test certificate verification fix
const fetch = require('node-fetch');

async function testVerification() {
  try {
    console.log('🔍 Testing certificate verification endpoint...');
    
    const certificateId = 'NEX-mkfdl8ns-A20E6E';
    
    // Test different URL formats
    const urls = [
      `http://localhost:3001/api/certificates/verify/${certificateId}`,
      `http://localhost:3001/api/certificates/${certificateId}`,
      `http://localhost:3001/api/certificates/view/${certificateId}`
    ];
    
    for (const url of urls) {
      console.log(`\n🌐 Testing: ${url}`);
      
      try {
        const response = await fetch(url);
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Success!');
          console.log('Response:', JSON.stringify(data, null, 2));
        } else {
          const errorText = await response.text();
          console.log('❌ Error:', errorText.substring(0, 200));
        }
      } catch (error) {
        console.log('❌ Request failed:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testVerification();
