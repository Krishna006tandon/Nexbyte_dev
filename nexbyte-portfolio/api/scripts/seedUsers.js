const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    // Connect to MongoDB using production URI
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexbyte';
    console.log('Connecting to MongoDB:', mongoURI ? 'Using production URI' : 'Using localhost');
    
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');

    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users cleared');

    // Create sample users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@nexbyte.com',
        password: 'admin123',
        role: 'admin',
        credits: 1000
      },
      {
        name: 'John Doe',
        email: 'john.doe@nexbyte.com',
        password: 'intern123',
        role: 'intern',
        credits: 0,
        internshipStartDate: new Date('2024-01-01'),
        internshipEndDate: new Date('2024-06-01'),
        internType: 'stipend'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@nexbyte.com',
        password: 'intern123',
        role: 'intern',
        credits: 0,
        internshipStartDate: new Date('2024-02-01'),
        internshipEndDate: new Date('2024-07-01'),
        internType: 'free'
      },
      {
        name: 'Client User',
        email: 'client@nexbyte.com',
        password: 'client123',
        role: 'client',
        credits: 500
      }
    ];

    // Hash passwords and create users
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      console.log(`User created: ${userData.email}`);
    }

    console.log('Sample users created successfully!');
    
    // Create a test client as well
    const Client = require('../models/Client');
    const clientPassword = 'clientpass123';
    const hashedClientPassword = await bcrypt.hash(clientPassword, 10);
    
    const testClient = new Client({
      clientName: 'Test Production Client',
      contactPerson: 'Test Contact',
      email: 'production@client.com',
      phone: '+1234567890',
      companyAddress: '123 Production St',
      projectName: 'Production Test Project',
      projectType: 'Web Application',
      projectRequirements: 'Full stack application with MongoDB',
      projectDeadline: new Date('2024-12-31'),
      totalBudget: 10000,
      billingAddress: '123 Production St',
      gstNumber: 'GST123456',
      paymentTerms: '50% advance',
      paymentMethod: 'Bank transfer',
      domainRegistrarLogin: 'domain123',
      webHostingLogin: 'host123',
      logoAndBrandingFiles: 'logo.png',
      content: 'content.pdf',
      password: hashedClientPassword
    });
    
    await testClient.save();
    console.log('Test client created: production@client.com / clientpass123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();
