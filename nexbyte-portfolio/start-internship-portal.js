#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting NexByte Internship Portal Setup...\n');

// Check if required directories exist
const requiredDirs = [
  'api/uploads/resumes',
  'api/routes',
  'api/models',
  'api/middleware',
  'src/components',
  'src/pages'
];

console.log('📁 Checking directories...');
requiredDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Missing directory: ${dir}`);
    try {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } catch (error) {
      console.log(`❌ Failed to create ${dir}:`, error.message);
    }
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

// Check if required files exist
const requiredFiles = [
  'api/models/InternshipListing.js',
  'api/models/InternshipApplication.js',
  'api/routes/internshipListings.js',
  'api/routes/applications.js',
  'api/routes/certificates.js',
  'api/middleware/auth.js',
  'src/components/InternshipListingCard.js',
  'src/components/ApplicationForm.js',
  'src/components/StudentDashboard.js',
  'src/components/CertificateGenerator.js',
  'src/pages/InternshipPortal.js',
  'tailwind.config.js',
  'postcss.config.js'
];

console.log('\n📄 Checking files...');
requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ File exists: ${file}`);
  } else {
    console.log(`❌ Missing file: ${file}`);
  }
});

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = require('./package.json');
const requiredDeps = [
  'react',
  'react-router-dom',
  'express',
  'mongoose',
  'bcryptjs',
  'jsonwebtoken',
  'multer',
  'qrcode.react',
  'date-fns',
  'html2canvas',
  'react-toastify'
];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ Dependency exists: ${dep}@${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ Missing dependency: ${dep}`);
  }
});

console.log('\n🎯 Setup complete!');
console.log('\n📋 Next Steps:');
console.log('1. Copy .env.example to .env and configure your environment variables');
console.log('2. Run: npm install (if you haven\'t already)');
console.log('3. Start MongoDB service');
console.log('4. Run: npm start');
console.log('5. Visit: http://localhost:3000/internships');

console.log('\n✨ Your NexByte Internship Portal is ready!');
