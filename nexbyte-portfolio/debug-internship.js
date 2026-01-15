// Debug internship status
const fetch = require('node-fetch');

async function debugInternship() {
  try {
    console.log('Debugging internship status...');
    
    // Login as admin
    const loginRes = await fetch('http://localhost:3002/api/login', {
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
    const internshipsRes = await fetch('http://localhost:3002/api/internship-management', {
      headers: { 'x-auth-token': token }
    });
    
    console.log('Internships response status:', internshipsRes.status);
    
    if (internshipsRes.ok) {
      const response = await internshipsRes.json();
      console.log('Response type:', typeof response);
      console.log('Response:', response);
      
      const internships = response.internships || response;
      console.log(`Found ${Array.isArray(internships) ? internships.length : 'not an array'} internships:`);
      
      if (Array.isArray(internships)) {
        internships.forEach(internship => {
          console.log(`- ID: ${internship._id}`);
          console.log(`  Intern: ${internship.intern?.email || 'N/A'}`);
          console.log(`  Status: ${internship.status}`);
          console.log(`  Certificate: ${internship.certificate ? 'Yes' : 'No'}`);
          console.log(`  Start: ${internship.startDate}`);
          console.log(`  End: ${internship.endDate}`);
          console.log('---');
        });
      }
      
      // Get test intern
      const usersRes = await fetch('http://localhost:3002/api/users', {
        headers: { 'x-auth-token': token }
      });
      
      const users = await usersRes.json();
      const intern = users.find(u => u.email === 'test.intern@nexbyte.com');
      
      if (intern) {
        console.log(`\nTest intern details:`);
        console.log(`- ID: ${intern._id}`);
        console.log(`- Email: ${intern.email}`);
        console.log(`- Internship Status: ${intern.internshipStatus}`);
        console.log(`- Current Internship: ${intern.currentInternship}`);
        
        // Find internship for this intern
        const internInternship = internships.find(i => i.intern?._id === intern._id);
        if (internInternship) {
          console.log(`\nFound internship for test intern:`);
          console.log(`- Internship ID: ${internInternship._id}`);
          console.log(`- Status: ${internInternship.status}`);
          console.log(`- Certificate ID: ${internInternship.certificate}`);
        } else {
          console.log(`\n❌ No internship found for test intern`);
        }
      }
    } else {
      console.log('❌ Failed to fetch internships');
    }
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugInternship();
