// Simple test to check if backend is responding
const testLogin = async () => {
  try {
    const response = await fetch('https://nexbyte-dev.vercel.app/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      }),
    });
    
    const data = await response.json();
    console.log('Test login response:', data);
    console.log('Response status:', response.status);
  } catch (error) {
    console.error('Test login error:', error);
  }
};

testLogin();
