// Check intern and internship data
const mongoose = require('mongoose');
const User = require('./api/models/User');
const Internship = require('./api/models/Internship');

async function checkIntern() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexbyte');
    console.log('Connected to MongoDB');
    
    // Find test intern
    const intern = await User.findOne({ email: 'test.intern@nexbyte.com' });
    console.log('Test intern found:', intern ? 'YES' : 'NO');
    if (intern) {
      console.log('Intern ID:', intern._id);
      console.log('Intern role:', intern.role);
    }
    
    // Find internships for this intern
    const internships = await Internship.find({ intern: intern?._id });
    console.log('Internships found:', internships.length);
    internships.forEach((internship, index) => {
      console.log(`Internship ${index + 1}:`, {
        id: internship._id,
        title: internship.internshipTitle,
        status: internship.status,
        startDate: internship.startDate,
        endDate: internship.endDate
      });
    });
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkIntern();
