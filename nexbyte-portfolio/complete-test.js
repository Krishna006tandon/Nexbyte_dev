// Complete test: create intern, internship, and certificate
const fetch = require('node-fetch');

async function completeTest() {
  try {
    console.log('Running complete test...');
    
    // Login as admin
    const loginRes = await fetch('http://localhost:3004/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nexbyte.com',
        password: 'admin123'
      })
    });
    
    const { token } = await loginRes.json();
    console.log('✅ Admin login successful');
    
    // Get all internships
    const usersRes = await fetch('http://localhost:3004/api/users', {
      headers: { 'x-auth-token': token }
    });
    
    const users = await usersRes.json();
    const intern = users.find(u => u.email === 'test.intern@nexbyte.com');
    
    if (!intern) {
      console.log('❌ Test intern not found');
      return;
    }
    
    console.log('✅ Found test intern:', intern.email);
    
    // Create internship
    const internshipRes = await fetch('http://localhost:3004/api/internships', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-auth-token': token 
      },
      body: JSON.stringify({
        internId: intern._id,
        internshipTitle: 'Full Stack Development Internship',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31')
      })
    });
    
    if (internshipRes.ok) {
      const internship = await internshipRes.json();
      console.log('✅ Internship created:', internship._id);
      
      // Complete internship to generate certificate
      const completeRes = await fetch(`http://localhost:3004/api/internship-management/complete-manual/${intern._id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        }
      });
      
      if (completeRes.ok) {
        const result = await completeRes.json();
        console.log('✅ Internship completed and certificate generated');
        console.log('Certificate ID:', result.certificate?.certificateId);
        
        // Now test intern login and certificate fetch
        console.log('\n--- Testing Intern Certificate Access ---');
        
        // Login as intern
        const internLoginRes = await fetch('http://localhost:3004/api/login', {
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
          
          // Fetch certificate
          const certRes = await fetch('http://localhost:3004/api/internship-management/me', {
            headers: { 'x-auth-token': internToken }
          });
          
          if (certRes.ok) {
            const data = await certRes.json();
            console.log('✅ Certificate data fetched successfully');
            console.log('Internship Status:', data.internship?.status);
            console.log('Certificate Present:', data.certificateData ? 'YES' : 'NO');
            console.log('Full Response:', JSON.stringify(data, null, 2));
            
            if (data.certificateData) {
              console.log('Certificate Details:');
              console.log('- Intern Name:', data.certificateData.internName);
              console.log('- Certificate ID:', data.certificateData.certificateId);
              console.log('- Company:', data.certificateData.company);
              console.log('✅ CERTIFICATE IS WORKING IN FRONTEND!');
            }
          } else {
            const error = await certRes.json();
            console.log('❌ Failed to fetch certificate:', error);
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
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

completeTest();
