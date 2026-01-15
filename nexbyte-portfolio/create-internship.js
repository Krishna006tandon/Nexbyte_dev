// Create internship for existing intern
const fetch = require('node-fetch');

async function createInternship() {
  try {
    console.log('Creating internship for existing intern...');
    
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
    
    // Get users to find intern
    const usersRes = await fetch('http://localhost:3002/api/users', {
      headers: { 'x-auth-token': token }
    });
    
    const users = await usersRes.json();
    const intern = users.find(u => u.role === 'intern');
    
    if (!intern) {
      console.log('❌ No intern found');
      return;
    }
    
    console.log(`Found intern: ${intern.email}`);
    
    // Create internship
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
      console.log('✅ Internship created successfully:', internship._id);
      
      // Now test certificate generation
      const certRes = await fetch(`http://localhost:3002/api/internship-management/test-certificate/${intern._id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        }
      });
      
      if (certRes.ok) {
        const result = await certRes.json();
        console.log('✅ Certificate generated successfully:', result);
        console.log('Certificate ID:', result.certificateId);
        console.log('Certificate URL:', result.certificateUrl);
      } else {
        const error = await certRes.json();
        console.log('❌ Certificate generation failed:', error);
      }
      
    } else {
      const error = await internshipRes.json();
      console.log('❌ Internship creation failed:', error);
    }
    
  } catch (error) {
    console.error('Failed:', error);
  }
}

createInternship();
