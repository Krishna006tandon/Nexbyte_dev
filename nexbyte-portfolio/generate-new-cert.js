// Generate new certificate and get link
const fetch = require('node-fetch');

async function generateNewCertificate() {
  try {
    console.log('🔧 Generating new certificate...');
    
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
    
    // Get available internships without certificates
    const internshipsRes = await fetch('http://localhost:3001/api/internships', {
      headers: { 'x-auth-token': token }
    });
    
    if (!internshipsRes.ok) {
      console.log('❌ Failed to fetch internships');
      return;
    }
    
    const internships = await internshipsRes.json();
    
    // Find internship without certificate
    const availableInternship = internships.find(internship => 
      internship.intern && !internship.certificate
    );
    
    if (!availableInternship) {
      console.log('❌ No available internships without certificates found');
      return;
    }
    
    console.log(`📋 Found internship: ${availableInternship.internshipTitle}`);
    console.log(`👤 Intern: ${availableInternship.intern?.email || 'N/A'}`);
    
    // Complete internship and generate certificate
    const completeRes = await fetch(`http://localhost:3001/api/internship-management/complete/${availableInternship._id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-auth-token': token 
      }
    });
    
    if (completeRes.ok) {
      const data = await completeRes.json();
      console.log('✅ Certificate generated successfully!');
      
      const certificateId = data.certificate?.certificateId;
      const certificateUrl = data.certificate?.certificateUrl;
      const cloudinaryUrl = data.certificate?.cloudinaryUrl;
      
      console.log('\n🎉 CERTIFICATE DETAILS:');
      console.log('📄 Certificate ID:', certificateId);
      console.log('🔗 Certificate URL:', certificateUrl);
      console.log('☁️  Cloudinary URL:', cloudinaryUrl || 'Not uploaded');
      
      console.log('\n📱 LINKS TO ACCESS CERTIFICATE:');
      console.log('1. View Certificate:', `${certificateUrl}`);
      console.log('2. Verify Certificate:', `https://nexbyte-dev.vercel.app/api/certificates/verify/${certificateId}`);
      console.log('3. Download Certificate:', `https://nexbyte-dev.vercel.app/api/certificates/${data.certificate._id}/download`);
      
      if (cloudinaryUrl) {
        console.log('4. Direct Image:', cloudinaryUrl);
      }
      
      console.log('\n🔍 Test the certificate by visiting:', certificateUrl);
      
      return {
        certificateId,
        certificateUrl,
        cloudinaryUrl,
        verificationUrl: `https://nexbyte-dev.vercel.app/api/certificates/verify/${certificateId}`
      };
      
    } else {
      const error = await completeRes.json();
      console.log('❌ Certificate generation failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generateNewCertificate();
