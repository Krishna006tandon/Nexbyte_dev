// Create test intern with known password
const fetch = require('node-fetch');

async function createTestIntern() {
  try {
    console.log('Creating test intern...');
    
    // Login as admin
    const loginRes = await fetch('http://localhost:3002/api/login', {
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
    
    // Create test intern
    const internRes = await fetch('http://localhost:3002/api/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-auth-token': token 
      },
      body: JSON.stringify({
        email: 'test.intern@nexbyte.com',
        password: 'test123',
        role: 'intern',
        firstName: 'Test',
        lastName: 'Intern',
        internshipType: 'free',
        internshipStartDate: new Date('2024-01-01'),
        internshipEndDate: new Date('2024-03-31')
      })
    });
    
    if (internRes.ok) {
      const intern = await internRes.json();
      console.log('✅ Test intern created:', intern.email);
      
      // Create internship for this intern
      const internshipRes = await fetch('http://localhost:3002/api/internships', {
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
        console.log('✅ Internship created for test intern');
        
        // Complete the internship to generate certificate
        const completeRes = await fetch(`http://localhost:3002/api/internship-management/complete-manual/${intern._id}`, {
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
        } else {
          console.log('❌ Failed to complete internship');
        }
        
      } else {
        console.log('❌ Failed to create internship');
      }
      
    } else {
      const error = await internRes.json();
      console.log('❌ Failed to create intern:', error);
    }
    
  } catch (error) {
    console.error('Failed:', error);
  }
}

createTestIntern();
