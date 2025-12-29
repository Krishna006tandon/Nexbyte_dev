const axios = require('axios');

const API_BASE = 'http://localhost:5002';

async function testAPI() {
  console.log('Testing API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing /api/health');
    const health = await axios.get(`${API_BASE}/api/health`);
    console.log('✓ Health check:', health.data);
    console.log('');

    // Test login to get token
    console.log('2. Testing /api/login');
    const loginResponse = await axios.post(`${API_BASE}/api/login`, {
      email: 'admin@nexbyte.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    console.log('✓ Login successful, token received');
    console.log('');

    const authHeaders = {
      'x-auth-token': token,
      'Content-Type': 'application/json'
    };

    // Test users endpoint
    console.log('3. Testing /api/users (GET)');
    const users = await axios.get(`${API_BASE}/api/users`, { headers: authHeaders });
    console.log('✓ Users fetched:', users.data.length, 'users');
    console.log('');

    // Test creating a user
    console.log('4. Testing /api/users (POST)');
    const newUser = await axios.post(`${API_BASE}/api/users`, {
      email: 'test.user@nexbyte.com',
      password: 'password123',
      role: 'intern',
      internType: 'free',
      internshipStartDate: '2024-01-01',
      internshipEndDate: '2024-06-01',
      acceptanceDate: '2023-12-15'
    }, { headers: authHeaders });
    console.log('✓ User created:', newUser.data.email);
    console.log('');

    // Test projects endpoint
    console.log('5. Testing /api/projects (GET)');
    const projects = await axios.get(`${API_BASE}/api/projects`, { headers: authHeaders });
    console.log('✓ Projects fetched:', projects.data.length, 'projects');
    console.log('');

    // Test clients endpoint
    console.log('6. Testing /api/clients (GET)');
    const clients = await axios.get(`${API_BASE}/api/clients`, { headers: authHeaders });
    console.log('✓ Clients fetched:', clients.data.length, 'clients');
    console.log('');

    // Test profile endpoint
    console.log('7. Testing /api/profile (GET)');
    const profile = await axios.get(`${API_BASE}/api/profile`, { headers: authHeaders });
    console.log('✓ Profile fetched:', profile.data.email);
    console.log('');

    console.log('🎉 All API tests passed! The application should now work without MongoDB.');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testAPI();
