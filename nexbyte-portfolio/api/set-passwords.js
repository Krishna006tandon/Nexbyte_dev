const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setPasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexbyte');
    console.log('Connected to MongoDB');
    
    const User = require('./models/User');
    
    const usersAndPasswords = [
      { email: 'abhishekmutthalkar10@gmail.com', password: 'abhishek' },
      { email: 'krishna.a.tandon@gmail.com', password: 'krishna' },
      { email: 'Kajalmantapurwar02@gmail.com', password: 'kajal' },
      { email: 'rutviktayde73@gmail.com', password: 'tayde' },
      { email: 'ayushkashyap122009@gmail.com', password: 'ayush' }
    ];
    
    for (const userPass of usersAndPasswords) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userPass.password, salt);
      
      // Update user password
      const result = await User.updateOne(
        { email: userPass.email },
        { password: hashedPassword }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✓ Password updated for: ${userPass.email}`);
      } else {
        console.log(`✗ User not found or password not updated: ${userPass.email}`);
      }
    }
    
    console.log('\nPassword update completed!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

setPasswords();
