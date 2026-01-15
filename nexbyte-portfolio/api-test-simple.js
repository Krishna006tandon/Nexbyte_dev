// Simple API test
const fetch = require('node-fetch');

async function apiTest() {
  try {
    console.log('Testing API endpoints...');
    
    // Test server health
    const healthRes = await fetch('http://localhost:3011/api/health');
    console.log('Health check:', healthRes.ok ? '✅ OK' : '❌ Failed');
    
    // Login as admin
    const loginRes = await fetch('http://localhost:3011/api/login', {
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
      
      // Get users
      const usersRes = await fetch('http://localhost:3011/api/users', {
        headers: { 'x-auth-token': token }
      });
      
      if (usersRes.ok) {
        const users = await usersRes.json();
        console.log('✅ Users fetched:', users.length);
        
        const testIntern = users.find(u => u.email === 'test.intern@nexbyte.com');
        if (testIntern) {
          console.log('✅ Test intern found:', testIntern._id);
          
          // Create internship
          const internshipRes = await fetch('http://localhost:3011/api/internships', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-auth-token': token 
            },
            body: JSON.stringify({
              internId: testIntern._id,
              internshipTitle: 'Cloudinary Test',
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-03-31')
            })
          });
          
          if (internshipRes.ok) {
            const internship = await internshipRes.json();
            console.log('✅ Internship created:', internship._id);
            
            // Complete internship
            const completeRes = await fetch(`http://localhost:3011/api/internship-management/complete-manual/${testIntern._id}`, {
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
              const error = await completeRes.json();
              console.log('❌ Complete failed:', error);
            }
          } else {
            const error = await internshipRes.json();
            console.log('❌ Internship creation failed:', error);
          }
        } else {
          console.log('❌ Test intern not found');
        }
      } else {
        console.log('❌ Failed to fetch users');
      }
    } else {
      console.log('❌ Admin login failed');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

apiTest();
