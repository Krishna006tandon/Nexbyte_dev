const axios = require('axios');

async function testPasswordFetch() {
  try {
    console.log('Testing client password fetch...');
    
    // First get all clients to find a client ID
    const clientsRes = await axios.get('http://localhost:5001/api/clients');
    const clients = clientsRes.data;
    
    if (clients.length === 0) {
      console.log('❌ No clients found. Please create a client first.');
      return;
    }
    
    const clientId = clients[0]._id;
    console.log(`📋 Found client: ${clients[0].clientName || clients[0].email} (ID: ${clientId})`);
    
    // Test password fetch using new endpoint
    console.log('\n🔐 Testing credentials fetch...');
    const credentialsRes = await axios.get(`http://localhost:5001/api/clients/${clientId}/credentials`);
    
    console.log('✅ Credentials fetched successfully!');
    console.log('📧 Email:', credentialsRes.data.email);
    console.log('👤 Contact:', credentialsRes.data.contactPerson);
    console.log('🔐 Password:', credentialsRes.data.password);
    console.log('📨 Email should have been sent to client with new credentials');
    
  } catch (error) {
    console.error('❌ Error testing password fetch:', error.response?.data || error.message);
  }
}

testPasswordFetch();
