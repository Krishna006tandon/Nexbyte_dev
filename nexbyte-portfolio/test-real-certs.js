// Test real certificate verification
const fetch = require('node-fetch');

async function testRealCertificates() {
  try {
    console.log('🔍 Testing real certificate verification...');
    
    const certificates = [
      'NEX-mkfdiufg-8997D9',
      'NEX-mkfdk7of-C8A39F', 
      'NEX-mkfdl8ns-A20E6E'
    ];
    
    for (const certId of certificates) {
      console.log(`\n📄 Testing Certificate: ${certId}`);
      
      try {
        // Test verification endpoint
        const verifyRes = await fetch(`http://localhost:3001/api/certificates/verify/${certId}`);
        console.log(`🔍 Verify Status: ${verifyRes.status}`);
        
        if (verifyRes.ok) {
          const data = await verifyRes.json();
          console.log('✅ Verification successful!');
          console.log(`   Valid: ${data.valid}`);
          console.log(`   Internship: ${data.certificate?.internshipTitle}`);
        } else {
          const error = await verifyRes.json();
          console.log('❌ Verification failed:', error.error);
        }
        
        // Test view endpoint
        const viewRes = await fetch(`http://localhost:3001/api/certificates/view/${certId}`);
        console.log(`👁️  View Status: ${viewRes.status}`);
        
        if (viewRes.ok) {
          const data = await viewRes.json();
          console.log('✅ View successful!');
          console.log(`   Certificate ID: ${data.certificate?.certificateId}`);
          console.log(`   Intern Name: ${data.data?.internName || 'N/A'}`);
        } else {
          const error = await viewRes.json();
          console.log('❌ View failed:', error.error);
        }
        
        // Test direct certificate URL (frontend)
        const certUrl = `https://nexbyte-dev.vercel.app/certificate/${certId}`;
        console.log(`🌐 Certificate URL: ${certUrl}`);
        
      } catch (error) {
        console.log('❌ Request failed:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRealCertificates();
