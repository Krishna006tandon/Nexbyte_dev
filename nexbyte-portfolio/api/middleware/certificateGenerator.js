const Certificate = require('../models/Certificate');
const Internship = require('../models/Internship');
const User = require('../models/User');
const crypto = require('crypto');
const { encryptCertificateData } = require('../utils/certificateCrypto');
const cloudinary = require('cloudinary').v2;
const { Buffer } = require('buffer');
const puppeteer = require('puppeteer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateCertificateHTML = (certificateData) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Internship Completion Certificate</title>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Crimson+Text:wght@400;600&display=swap');

* { box-sizing: border-box; }

body {
  margin: 0;
  background: #e6e2d8;
}

.certificate {
  width: 1200px;
  height: 850px;
  margin: 40px auto;
  background: #f4f1ea;
  font-family: 'Crimson Text', serif;
  color: #2b2f3a;
  position: relative;
  overflow: hidden;
}

/* parchment grain */
.certificate::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px);
  background-size: 3px 3px;
  opacity: 0.3;
}

/* Inline floral SVG */
.floral {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  opacity: 0.12;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20 Q30 10 40 20 T60 20 Q70 10 80 20 T100 20' stroke='%23d4af37' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3Cpath d='M10 40 Q20 30 30 40 T50 40 Q60 30 70 40 T90 40' stroke='%23d4af37' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3Cpath d='M30 60 Q40 50 50 60 T70 60 Q80 50 90 60' stroke='%23d4af37' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3C/svg%3E") repeat-y;
  background-size: 100px 100px;
}

/* ribbon seal */
.ribbon {
  position: absolute;
  top: 80px;
  right: 220px;
  width: 120px;
  height: 120px;
  background: #111;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  text-align: center;
  font-weight: 600;
}

.ribbon::after,
.ribbon::before {
  content: "";
  position: absolute;
  bottom: -20px;
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 20px solid #111;
}

.ribbon::before { 
  left: -5px; 
  transform: rotate(-30deg);
}

.ribbon::after { 
  right: -5px; 
  transform: rotate(30deg);
}

/* headings */
.header {
  text-align: center;
  margin-top: 110px;
}

.header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 60px;
  letter-spacing: 4px;
  margin: 0;
}

.header h2 {
  font-size: 28px;
  letter-spacing: 3px;
  margin-top: 10px;
  color: #2c3e5c;
}

.award {
  text-align: center;
  margin-top: 60px;
  font-size: 16px;
  letter-spacing: 2px;
}

/* name */
.name {
  text-align: center;
  margin-top: 35px;
  font-family: 'Playfair Display', serif;
  font-size: 54px;
  letter-spacing: 2px;
}

/* divider */
.divider {
  width: 60%;
  margin: 20px auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.divider span {
  flex: 1;
  height: 1px;
  background: #2c3e5c;
}

.divider i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2c3e5c;
}

/* description */
.desc {
  width: 65%;
  max-width: 500px;
  margin: 30px auto 0;
  text-align: center;
  font-size: 18px;
  line-height: 1.9;
  letter-spacing: 0.5px;
}

/* verified stamp */
.stamp {
  margin: 55px auto 0;
  width: 130px;
  height: 130px;
  border: 2px solid #4b5fd3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5fd3;
  font-weight: 600;
  letter-spacing: 2px;
  position: relative;
}

.stamp::before {
  content: "NEXBYTE CORE • LEARNING • BUILDING • GROWING";
  position: absolute;
  inset: 8px;
  border: 1px dashed #4b5fd3;
  border-radius: 50%;
  font-size: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 8px;
  line-height: 1.2;
}

/* footer */
.footer {
  position: absolute;
  bottom: 90px;
  width: 100%;
  display: flex;
  justify-content: space-around;
  font-size: 16px;
}

.sig {
  text-align: center;
}

.sig-line {
  width: 220px;
  height: 1px;
  background: #2c3e5c;
  margin-bottom: 8px;
}

/* certificate id */
.cert-id {
  position: absolute;
  bottom: 30px;
  left: 50px;
  font-size: 14px;
}
</style>
</head>

<body>
<div class="certificate">

  <div class="floral"></div>

  <div class="ribbon">NEXBYTE<br/>CORE</div>

  <div class="header">
    <h1>INTERNSHIP</h1>
    <h2>COMPLETION CERTIFICATE</h2>
  </div>

  <div class="award">THE FOLLOWING AWARD IS GIVEN TO</div>

  <div class="name">${certificateData.internName}</div>

  <div class="divider">
    <span></span><i></i><span></span>
  </div>

  <div class="desc">
    This certificate is given to ${certificateData.internName}<br/>
    for his achievement in the field of education and proves that he is competent in his field.
  </div>

  <div class="stamp">VERIFIED</div>

  <div class="footer">
    <div class="sig">
      <div class="sig-line"></div>
      Manager<br/>Nexbyte_Core
    </div>
    <div class="sig">
      <div class="sig-line"></div>
      Mentor<br/>Nexbyte_Core
    </div>
  </div>

  <div class="cert-id">
    Certificate ID: ${certificateData.certificateId}
  </div>

</div>
</body>
</html>
`;
};

// Upload certificate to Cloudinary
const uploadCertificateToCloudinary = async (certificateHTML, certificateId) => {
  try {
    console.log('Starting Cloudinary upload for certificate:', certificateId);
    
    // Use Puppeteer to convert HTML to image
    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      
      // Set content and wait for it to load
      await page.setContent(certificateHTML, { waitUntil: 'networkidle0' });
      
      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: true
      });
      
      await browser.close();
      
      // Upload screenshot to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            public_id: `certificate_${certificateId}`,
            folder: 'certificates',
            format: 'jpg',
            transformation: [
              { width: 800, height: 600, crop: 'fit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('Cloudinary upload successful:', result.secure_url);
              resolve(result);
            }
          }
        ).end(screenshot);
      });
      
      console.log('✅ Certificate uploaded to Cloudinary:', result.secure_url);
      return result;
      
    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      if (browser) await browser.close();
      throw puppeteerError;
    }
    
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Generate unique certificate ID
const generateCertificateId = () => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `NEX-${timestamp}-${random}`;
};

// Encrypt certificate data
const encryptData = (data) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.createHash('sha256').update(process.env.CERT_SECRET || 'default-secret-key').digest();
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
};

// Auto-generate certificate when internship is completed
const autoGenerateCertificate = async (internshipId) => {
  try {
    console.log('Auto-generating certificate for internship:', internshipId);
    
    // Get internship details
    const internship = await Internship.findById(internshipId).populate('intern');
    
    if (!internship) {
      console.error('Internship not found for certificate generation');
      return null;
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      intern: internship.intern._id,
      internship: internshipId
    });

    if (existingCertificate) {
      console.log('Certificate already exists for this internship');
      return existingCertificate;
    }

    const certificateId = generateCertificateId();
    const issuedAt = new Date();

    // Prepare certificate data
    const certificateData = {
      internName: internship.intern.email,
      internshipTitle: internship.internshipTitle,
      startDate: internship.startDate,
      endDate: internship.endDate || issuedAt,
      issuedDate: issuedAt,
      certificateId,
      company: 'NexByte Core'
    };

    console.log('Generating certificate image...');
    
    // Generate certificate HTML
    const certificateHTML = generateCertificateHTML(certificateData);
    console.log('Certificate HTML generated, length:', certificateHTML.length);
    
    // Upload to Cloudinary
    let cloudinaryUrl = null;
    try {
      console.log('Starting Cloudinary upload...');
      const cloudinaryResult = await uploadCertificateToCloudinary(certificateHTML, certificateId);
      cloudinaryUrl = cloudinaryResult.secure_url;
      console.log('✅ Certificate uploaded to Cloudinary:', cloudinaryUrl);
    } catch (cloudinaryError) {
      console.error('❌ Failed to upload to Cloudinary:', cloudinaryError);
      console.error('Cloudinary error details:', cloudinaryError.message || cloudinaryError);
      // Continue without Cloudinary - still save encrypted data
    }

    // Encrypt sensitive data
    let encryptedData;
    try {
      encryptedData = encryptCertificateData(certificateData);
    } catch (error) {
      console.error('Encryption failed, using fallback method:', error);
      // Fallback to simple encryption if main method fails
      const algorithm = 'aes-256-cbc';
      const key = crypto.createHash('sha256').update(process.env.CERT_SECRET || 'nexbyte-certificate-key-2024').digest();
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(JSON.stringify(certificateData), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      encryptedData = iv.toString('hex') + ':' + encrypted;
    }

    // Create certificate
    const certificate = new Certificate({
      intern: internship.intern._id,
      internship: internshipId,
      certificateId,
      certificateUrl: cloudinaryUrl || `${process.env.CLIENT_URL || 'https://nexbyte-dev.vercel.app'}/certificate/${certificateId}`,
      encryptedData,
      cloudinaryUrl: cloudinaryUrl // Store Cloudinary URL separately
    });

    await certificate.save();

    // Update internship with certificate reference
    await Internship.findByIdAndUpdate(internshipId, {
      certificate: certificate._id
    });

    // Update user's internship status
    await User.findByIdAndUpdate(internship.intern._id, {
      internshipStatus: 'completed'
    });

    console.log('Certificate generated successfully:', certificateId);
    if (cloudinaryUrl) {
      console.log('✅ Certificate image available at:', cloudinaryUrl);
    }
    return certificate;

  } catch (error) {
    console.error('Error auto-generating certificate:', error);
    return null;
  }
};

// Check and generate certificate for completed internships
const checkAndGenerateCertificates = async () => {
  try {
    console.log('Checking for completed internships without certificates...');
    
    // Find all completed internships without certificates
    const completedInternships = await Internship.find({
      status: 'completed',
      certificate: { $exists: false }
    }).populate('intern');

    console.log(`Found ${completedInternships.length} completed internships without certificates`);

    for (const internship of completedInternships) {
      await autoGenerateCertificate(internship._id);
    }

  } catch (error) {
    console.error('Error checking and generating certificates:', error);
  }
};

module.exports = {
  autoGenerateCertificate,
  checkAndGenerateCertificates
};
