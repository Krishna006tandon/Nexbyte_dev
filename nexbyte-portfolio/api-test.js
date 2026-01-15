// Test API directly
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test server health
    const healthRes = await fetch('http://localhost:3002/api/users');
    console.log('Server health check:', healthRes.status);
    
    if (healthRes.status === 401) {
      console.log('✅ Server is running and requires authentication');
    } else {
      console.log('❌ Server response unexpected');
      return;
    }
    
    // Try to create a test admin user first
    try {
      const createRes = await fetch('http://localhost:3002/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@nexbyte.com',
          password: 'admin123',
          role: 'admin'
        })
      });
      
      if (createRes.status === 200) {
        console.log('✅ Admin user created');
      } else if (createRes.status === 400) {
        console.log('Admin user already exists');
      }
    } catch (e) {
      console.log('Admin creation failed:', e.message);
    }
    
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
      const errorText = await loginRes.text();
      console.log('Error response:', errorText);
      return;
    }
    
    const { token } = await loginRes.json();
    console.log('✅ Admin login successful');
    
    // Get all users
    const usersRes = await fetch('http://localhost:3002/api/users', {
      headers: { 'x-auth-token': token }
    });
    
    if (usersRes.ok) {
      const users = await usersRes.json();
      console.log(`Found ${users.length} users`);
      
      const intern = users.find(u => u.role === 'intern');
      if (intern) {
        console.log(`✅ Found intern: ${intern.email}`);
        
        // Test certificate generation
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
        } else {
          const error = await certRes.json();
          console.log('❌ Certificate generation failed:', error);
        }
      } else {
        console.log('❌ No intern found');
        
        // Create test intern
        const internRes = await fetch('http://localhost:3002/api/users', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token 
          },
          body: JSON.stringify({
            email: 'test.intern@example.com',
            password: 'test123',
            role: 'intern',
            firstName: 'Test',
            lastName: 'Intern',
            internshipType: 'free',
            internshipStartDate: new Date().toISOString().split('T')[0],
            internshipEndDate: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0]
          })
        });
        
        if (internRes.ok) {
          console.log('✅ Test intern created');
        } else {
          const error = await internRes.json();
          console.log('❌ Intern creation failed:', error);
        }
      }
    } else {
      console.log('❌ Failed to fetch users');
    }
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();
