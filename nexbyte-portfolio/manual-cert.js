// Manually generate certificate and get link
const fetch = require('node-fetch');

async function manualCertificateGeneration() {
  try {
    console.log('🔧 Manually generating new certificate...');
    
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
    
    // Get users to find an intern
    const usersRes = await fetch('http://localhost:3001/api/users', {
      headers: { 'x-auth-token': token }
    });
    
    if (!usersRes.ok) {
      console.log('❌ Failed to fetch users');
      return;
    }
    
    const users = await usersRes.json();
    const intern = users.find(u => u.role === 'intern');
    
    if (!intern) {
      console.log('❌ No intern found');
      return;
    }
    
    console.log(`👤 Found intern: ${intern.email}`);
    
    // Create a new internship first
    const newInternship = {
      intern: intern._id,
      internshipTitle: 'Test Certificate Generation',
      status: 'in_progress',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString()
    };
    
    const createInternshipRes = await fetch('http://localhost:3001/api/internships', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-auth-token': token 
      },
      body: JSON.stringify(newInternship)
    });
    
    if (!createInternshipRes.ok) {
      console.log('❌ Failed to create internship');
      return;
    }
    
    const createdInternship = await createInternshipRes.json();
    console.log(`✅ Created internship: ${createdInternship._id}`);
    
    // Now complete the internship to generate certificate
    const completeRes = await fetch(`http://localhost:3001/api/internship-management/complete/${createdInternship._id}`, {
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
      
      console.log('\n🎉 NEW CERTIFICATE GENERATED:');
      console.log('📄 Certificate ID:', certificateId);
      console.log('🔗 Certificate URL:', certificateUrl);
      console.log('☁️  Cloudinary URL:', cloudinaryUrl || 'Not uploaded');
      
      console.log('\n📱 IMPORTANT LINKS:');
      console.log('1️⃣ View Certificate:', certificateUrl);
      console.log('2️⃣ Verify Certificate:', `https://nexbyte-dev.vercel.app/api/certificates/verify/${certificateId}`);
      console.log('3️⃣ Admin Panel:', 'https://nexbyte-dev.vercel.app/admin/certificates');
      
      if (cloudinaryUrl) {
        console.log('4️⃣ Direct Image Link:', cloudinaryUrl);
      }
      
      console.log('\n🌐 OPEN THIS LINK TO VIEW CERTIFICATE:');
      console.log(certificateUrl);
      
      return certificateUrl;
      
    } else {
      const error = await completeRes.json();
      console.log('❌ Certificate generation failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

manualCertificateGeneration();
