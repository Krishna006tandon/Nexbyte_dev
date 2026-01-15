const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists.');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const adminUser = new User({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });

      await adminUser.save();
      console.log('Admin user created successfully.');
    }

    // Create a member user for testing
    const memberEmail = 'member@example.com';
    const memberPassword = 'member';

    const existingMember = await User.findOne({ email: memberEmail });
    if (existingMember) {
      console.log('Member user already exists.');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(memberPassword, salt);

      const memberUser = new User({
        email: memberEmail,
        password: hashedPassword,
        role: 'member',
      });

      await memberUser.save();
      console.log('Member user created successfully.');
    }

    // Create an intern user for testing
    const internEmail = 'intern@example.com';
    const internPassword = 'intern';

    const existingIntern = await User.findOne({ email: internEmail });
    if (existingIntern) {
      console.log('Intern user already exists.');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(internPassword, salt);

      const internUser = new User({
        email: internEmail,
        password: hashedPassword,
        role: 'intern',
        internshipStartDate: new Date(),
        internshipEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      });

      await internUser.save();
      console.log('Intern user created successfully.');
    }
  } catch (err) {
    console.error(err.message);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();
