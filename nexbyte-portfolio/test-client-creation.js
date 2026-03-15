const axios = require('axios');

async function testClientCreation() {
  try {
    console.log('Testing client creation API...');
    
    // Test data without password (should auto-generate)
    const clientData = {
      clientName: 'Test Client',
      contactPerson: 'John Doe',
      email: 'test@example.com',
      phone: '+1-555-0123',
      companyAddress: '123 Test St',
      projectName: 'Test Project',
      projectType: 'Website',
      projectRequirements: 'Test requirements',
      projectDeadline: '2024-12-31',
      totalBudget: '5000',
      billingAddress: '123 Test St',
      gstNumber: '123456789',
      paymentTerms: 'Net 30',
      paymentMethod: 'Bank Transfer',
      domainRegistrarLogin: 'test',
      webHostingLogin: 'test',
      logoAndBrandingFiles: '',
      content: ''
    };

    const response = await axios.post('http://localhost:5001/api/clients', clientData);
    
    console.log('✅ Client created successfully!');
    console.log('Response:', response.data);
    
    if (response.data.password) {
      console.log('✅ Password was generated:', response.data.password);
      console.log('✅ Email should have been sent to:', response.data.email);
    } else {
      console.log('❌ No password in response');
    }
    
  } catch (error) {
    console.error('❌ Error testing client creation:', error.response?.data || error.message);
  }
}

testClientCreation();
