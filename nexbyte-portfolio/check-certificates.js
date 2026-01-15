const mongoose = require('mongoose');
const Certificate = require('./api/models/Certificate');
const Internship = require('./api/models/Internship');

mongoose.connect('mongodb://localhost:27017/nexbyte-internships')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Check if any certificates exist
  const certificates = await Certificate.find({});
  console.log('Total certificates in DB:', certificates.length);
  
  // Check internships without certificates
  const internships = await Internship.find({}).populate('intern');
  console.log('Total internships:', internships.length);
  
  internships.forEach(internship => {
    console.log(`Intern: ${internship.intern?.email || 'N/A'}, Status: ${internship.status}, Certificate: ${internship.certificate ? 'Yes' : 'No'}`);
  });
  
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
