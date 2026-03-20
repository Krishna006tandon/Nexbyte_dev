const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexbyte');
    console.log('Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Count all users
    const totalUsers = await User.countDocuments();
    console.log('Total users:', totalUsers);
    
    // Get all users
    const users = await User.find().select('-password');
    
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      console.log('\nUsers list:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Role: ${user.role}, Name: ${user.name || 'N/A'}`);
      });
    }
    
    // Count by role
    const adminCount = await User.countDocuments({ role: 'admin' });
    const internCount = await User.countDocuments({ role: 'intern' });
    const clientCount = await User.countDocuments({ role: 'client' });
    
    console.log('\nUsers by role:');
    console.log('Admins:', adminCount);
    console.log('Interns:', internCount);
    console.log('Clients:', clientCount);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkUsers();
