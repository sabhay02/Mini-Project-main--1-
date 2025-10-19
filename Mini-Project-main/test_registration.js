// Simple test script to verify registration endpoint (no OTP required)
const axios = require('axios');

const testData = {
  name: "Test User",
  email: "test@example.com",
  phone: "9876543210",
  password: "password123",
  confirmPassword: "password123",
  address: "Test Village, Test District, Test State, 123456"
};

async function testRegistration() {
  try {
    console.log('Testing simplified registration endpoint (no OTP)...');
    console.log('Test data:', testData);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', testData);
    
    console.log('✅ Registration successful! User is automatically logged in.');
    console.log('Response:', response.data);
    
    if (response.data.data.token) {
      console.log('✅ JWT token received for automatic login');
    }
  } catch (error) {
    console.log('❌ Registration failed!');
    console.log('Error:', error.response?.data || error.message);
  }
}

testRegistration();
