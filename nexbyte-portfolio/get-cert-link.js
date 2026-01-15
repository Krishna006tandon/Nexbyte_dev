// Get existing certificate link
const fetch = require('node-fetch');

async function getCertificateLink() {
  try {
    console.log('🔍 Getting existing certificate link...');
    
    // Login as admin
    const loginRes = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nexbyte.com',
        password: 'admin123'
      })
    });
    
    if (!loginRes.ok) {
      console.log('❌ Admin login failed');
      return;
    }
    
    const { token } = await loginRes.json();
    console.log('✅ Admin login successful');
    
    // Get certificates
    const certsRes = await fetch('http://localhost:3001/api/certificates', {
      headers: { 'x-auth-token': token }
    });
    
    if (!certsRes.ok) {
      console.log('❌ Failed to fetch certificates');
      return;
    }
    
    const certsData = await certsRes.json();
    const latestCert = certsData.certificates[0]; // Get latest certificate
    
    if (!latestCert) {
      console.log('❌ No certificates found');
      return;
    }
    
    console.log('\n🎉 LATEST CERTIFICATE DETAILS:');
    console.log('📄 Certificate ID:', latestCert.certificateId);
    console.log('👤 Intern Email:', latestCert.intern?.email || 'N/A');
    console.log('🔗 Certificate URL:', latestCert.certificateUrl);
    console.log('☁️  Cloudinary URL:', latestCert.cloudinaryUrl || 'Not uploaded');
    
    console.log('\n📱 CERTIFICATE LINKS:');
    console.log('1️⃣ View Certificate:', latestCert.certificateUrl);
    console.log('2️⃣ Verify Certificate:', `https://nexbyte-dev.vercel.app/api/certificates/verify/${latestCert.certificateId}`);
    console.log('3️⃣ Admin Dashboard:', 'https://nexbyte-dev.vercel.app/admin/certificates');
    
    if (latestCert.cloudinaryUrl) {
      console.log('4️⃣ Direct Image:', latestCert.cloudinaryUrl);
    }
    
    console.log('\n🌐 CLICK HERE TO VIEW CERTIFICATE:');
    console.log('👇👇👇👇👇');
    console.log(latestCert.certificateUrl);
    console.log('👆👆👆👆👆');
    
    return latestCert.certificateUrl;
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getCertificateLink();
