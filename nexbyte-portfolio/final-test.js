// Final test: Create new internship and check Cloudinary
const fetch = require('node-fetch');

async function finalTest() {
  try {
    console.log('Final test: Create new internship with Cloudinary...');
    
    // Login as admin
    const loginRes = await fetch('http://localhost:3017/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nexbyte.com',
        password: 'admin123'
      })
    });
    
    if (loginRes.ok) {
      const { token } = await loginRes.json();
      console.log('✅ Admin login successful');
      
      // Create new internship
      const internshipRes = await fetch('http://localhost:3017/api/internships', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify({
          internId: '69689b6d3d95bf2b7189037f',
          internshipTitle: 'Final Cloudinary Test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31')
        })
      });
      
      if (internshipRes.ok) {
        const internship = await internshipRes.json();
        console.log('✅ New internship created:', internship._id);
        
        // Complete the internship
        const completeRes = await fetch('http://localhost:3017/api/internship-management/complete-manual/69689b6d3d95bf2b7189037f', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token 
          }
        });
        
        if (completeRes.ok) {
          const result = await completeRes.json();
          console.log('✅ Internship completed');
          console.log('Certificate ID:', result.certificate?.certificateId);
          console.log('Cloudinary URL:', result.certificate?.cloudinaryUrl || 'Not found');
          
          // Now test intern access
          console.log('\n--- Testing Intern Access ---');
          
          const internLoginRes = await fetch('http://localhost:3017/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'test.intern@nexbyte.com',
              password: 'test123'
            })
          });
          
          if (internLoginRes.ok) {
            const { token: internToken } = await internLoginRes.json();
            console.log('✅ Intern login successful');
            
            const certRes = await fetch('http://localhost:3017/api/internship-management/me', {
              headers: { 'x-auth-token': internToken }
            });
            
            if (certRes.ok) {
              const data = await certRes.json();
              console.log('✅ Certificate data fetched successfully');
              console.log('Cloudinary URL:', data.cloudinaryUrl || 'Not found');
              console.log('Certificate data present:', data.certificateData ? 'YES' : 'NO');
              console.log('Internship status:', data.internship?.status || 'Not found');
              
              if (data.cloudinaryUrl) {
                console.log('🎉🎉🎉 SUCCESS: Certificate is available via Cloudinary!');
                console.log('Intern can view and download the certificate from:', data.cloudinaryUrl);
              } else {
                console.log('⚠️ Cloudinary URL still not found');
              }
            } else {
              console.log('❌ Failed to fetch certificate');
            }
          } else {
            console.log('❌ Intern login failed');
          }
        } else {
          console.log('❌ Failed to complete internship');
        }
      } else {
        console.log('❌ Failed to create internship');
      }
    } else {
      console.log('❌ Admin login failed');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

finalTest();
