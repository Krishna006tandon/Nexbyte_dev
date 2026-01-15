// Deployment checklist for Nexbyte Portfolio
console.log('🚀 NEXBYTE PORTFOLIO DEPLOYMENT CHECKLIST\n');

const fs = require('fs');
const path = require('path');

// Check required files
const requiredFiles = [
  'package.json',
  'vercel.json',
  'api/index.js',
  'api/server.js',
  '.env'
];

console.log('📋 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check environment variables
console.log('\n🔧 Environment Variables Check:');
console.log('Required for deployment:');
console.log('- MONGODB_URI');
console.log('- JWT_SECRET');
console.log('- CLOUDINARY_CLOUD_NAME');
console.log('- CLOUDINARY_API_KEY');
console.log('- CLOUDINARY_API_SECRET');
console.log('- CERT_SECRET');

console.log('\n🌐 Deployment Options:');
console.log('1️⃣ Vercel (Recommended - Already configured)');
console.log('2️⃣ Netlify');
console.log('3️⃣ Heroku');
console.log('4️⃣ AWS Amplify');

console.log('\n📝 For Vercel Deployment:');
console.log('1. Install Vercel CLI: npm i -g vercel');
console.log('2. Login: vercel login');
console.log('3. Deploy: vercel --prod');
console.log('4. Set environment variables in Vercel dashboard');

console.log('\n⚠️  Important Notes:');
console.log('- Add environment variables in Vercel dashboard');
console.log('- MongoDB connection string required');
console.log('- Cloudinary credentials required for certificate images');
console.log('- Build command: npm run build');
console.log('- Output directory: build');

console.log('\n🎉 Ready to Deploy!');
