const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');
const multer = require('multer');

// Prefer project-level env, then API-level env (without overriding already-set vars)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');


const User = require('./models/User');
const Bill = require('./models/Bill');
const Task = require('./models/Task');
const Diary = require('./models/Diary');
const Report = require('./models/Report');
const Notification = require('./models/Notification');
const GroupMeeting = require('./models/GroupMeeting');
const Resource = require('./models/Resource');
const Project = require('./models/Project');
const Internship = require('./models/Internship');
const InternshipApplication = require('./models/InternshipApplication');
const Certificate = require('./models/Certificate');
const AutomationState = require('./models/AutomationState');
const PresentationTopic = require('./models/PresentationTopic');
const { encryptCertificateData, decryptCertificateData } = require('./utils/certificateCrypto');
const internshipRoutes = require('./internship');
const mailSender = require('./mailSender');


const app = express();

// Trust proxy for rate limiting behind load balancers/proxies
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      "connect-src": ["'self'", "https://api.razorpay.com"],
      "frame-src": ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
      "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://*.razorpay.com"],
      "style-src": ["'self'", "'unsafe-inline'"],
    },
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  keyGenerator: (req) => {
    // Use the ipKeyGenerator helper for proper IPv6 handling
    return rateLimit.ipKeyGenerator(req);
  },
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all requests
app.use(limiter);

// CSRF protection
const csrfProtection = csurf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('Error: MONGODB_URI is not defined. Please set it in your environment variables.');
    process.exit(1);
}

mongoose.connect(uri);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  if (err.message.includes('Authentication failed')) {
    console.error('MongoDB Authentication failed. Check your MONGODB_URI environment variable.');
    console.error('Ensure the username and password are correct in MongoDB Atlas.');
  }
  process.exit(1);
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  // Set content type to JSON
  res.setHeader('Content-Type', 'application/json');

  try {
    let user = await User.findOne({ email });
    let role = 'member'; // Default role is now 'member' instead of 'user'
    let userId = '';

    if (user) {
      // Ensure the role is set correctly from the user document
      role = user.role || 'member'; // Fallback to 'member' if role is not set
      userId = user.id;
      
      // For backward compatibility, convert 'user' role to 'member'
      if (role === 'user') {
        role = 'member';
        // Optional: Update the user's role in the database
        await User.findByIdAndUpdate(userId, { role: 'member' });
      }
    } else {
      // Handle client login
      const client = await Client.findOne({ email });
      if (!client) {
        return res.status(400).json({ message: 'Invalid credentials', unlockForgotPassword: true });
      }
      user = client;
      role = 'client';
      userId = client.id;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials', unlockForgotPassword: true });
    }

    const payload = {
      user: {
        id: userId,
        role: role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error signing token' });
        }
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.json({ token, role: role });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/forgot-password
// @desc    Forgot password (public)
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check in Users first
    let user = await User.findOne({ email });
    let isClient = false;
    
    if (!user) {
      user = await Client.findOne({ email });
      isClient = true;
    }

    if (!user) {
      return res.status(404).json({ message: 'Account not found with this email' });
    }

    // Generate new temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Update password in the database
    if (isClient) {
      user.password = hashedPassword;
      await user.save();
    } else {
      user.password = hashedPassword;
      await user.save();
    }

    // Send the password via email
    try {
      console.log(`Attempting to send password reset email to ${email}...`);
      const emailResult = await mailSender.sendPasswordReset(
        email, 
        isClient ? (user.contactPerson || user.clientName) : (user.name || email), 
        tempPassword
      );
      
      if (emailResult.success) {
        return res.json({ message: 'A new temporary password has been sent to your email.', previewUrl: emailResult.previewUrl || null });
      } else {
        console.error('Failed to send reset email:', emailResult.error);
        return res.status(500).json({ message: 'Account found, but could not send email. Please contact support.', previewUrl: emailResult.previewUrl || null });
      }
    } catch (emailError) {
      console.error('Error in sendPasswordReset notification:', emailError);
      return res.status(500).json({ message: 'Error sending reset email.' });
    }
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.get('/api/hello', (req, res) => {
    res.json({ message: "Hello from server!" });
});

const Contact = require('./models/Contact');

const auth = (req, res, next) => {
  const token = req.cookies.token || req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

const client = (req, res, next) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

app.post('/api/contact', [
    body('name').trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('mobile').isMobilePhone('any').escape(),
    body('message').trim().escape()
  ], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, mobile, message } = req.body;

  if (!name || !email || !mobile || !message) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const newContact = new Contact({
      name,
      email,
      mobile,
      message
    });

    await newContact.save();
    res.json({ message: 'Contact form submitted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/contacts', auth, admin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

const { createTransporter, getFromAddress, getPreviewUrl, getSmtpConfig } = require('./utils/emailTransport');

// Helper function to generate offer letter content
const generateOfferLetter = (email, startDate, endDate, acceptanceDate) => {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const startDateFormatted = new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const endDateFormatted = new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const acceptanceDateFormatted = new Date(acceptanceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const durationText = startDate && endDate ? `<p>Your internship will be from <strong>${startDateFormatted}</strong> to <strong>${endDateFormatted}</strong>.</p>` : '';
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Subject: Offer of Internship at Nexbyte_Core</strong></p>
      <p>Dear ${email},</p>
      <p>We are pleased to offer you an internship position at Nexbyte_Core. We were very impressed with your qualifications and believe you would be a valuable addition to our team.</p>
      ${durationText}
      <p>This internship will provide you with an excellent opportunity to gain practical experience and contribute to real-world projects. We are excited to have you join us.</p>
      <p>Please confirm your acceptance of this offer by <strong>${acceptanceDateFormatted}</strong>.</p>
      <p>We look forward to welcoming you to Nexbyte_Core!</p>
      <p>Sincerely,</p>
      <p>The Nexbyte_Core Team</p>
    </div>
  `;
};

let transporter = null;
try {
  transporter = createTransporter();
} catch (e) {
  const cfg = getSmtpConfig();
  if (!cfg.allowNoAuth) {
    console.warn('WARNING: Email transport is not configured. Emails will not be sent.');
    console.warn('Set SMTP_USER and SMTP_PASS (recommended) or EMAIL_USER and EMAIL_PASSWORD/EMAIL_PASS.');
    console.warn('Details:', e.message);
  }
}

const sendMailSafe = async (mailOptions, label) => {
  if (!transporter) {
    console.warn(`Skipping email (${label}): SMTP not configured`);
    return { success: false, error: 'SMTP not configured' };
  }
  try {
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = getPreviewUrl(info);
    if (previewUrl) console.log('Email preview URL:', previewUrl);
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(`Error sending email (${label}):`, error);
    return { success: false, error: error.message };
  }
};

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return null;
  }
  return { keyId, keySecret };
};

const getBillRemainingAmount = (bill) => Math.max(0, Number(bill.amount || 0) - Number(bill.paidAmount || 0));

const callRazorpayApi = async (endpoint, payload) => {
  const config = getRazorpayConfig();
  if (!config) {
    throw new Error('Razorpay is not configured');
  }

  const response = await fetch(`https://api.razorpay.com/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage =
      data?.error?.description ||
      data?.error?.message ||
      `Razorpay request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const config = getRazorpayConfig();
  if (!config) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', config.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
};

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      (typeof file.originalname === 'string' && file.originalname.toLowerCase().endsWith('.pdf'));
    if (isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const getCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
};

const sha1 = (input) => crypto.createHash('sha1').update(String(input)).digest('hex');

const buildCloudinarySignature = (params, apiSecret) => {
  const toSign = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return sha1(`${toSign}${apiSecret}`);
};

const uploadPdfToCloudinary = async (file, folderPrefix) => {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error('Cloudinary is not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${folderPrefix}_${crypto.randomUUID()}`;
  const signature = buildCloudinarySignature({ public_id: publicId, timestamp }, config.apiSecret);

  const form = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype || 'application/pdf' });
  form.append('file', blob, file.originalname || 'document.pdf');
  form.append('api_key', config.apiKey);
  form.append('timestamp', String(timestamp));
  form.append('public_id', publicId);
  form.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/raw/upload`, {
    method: 'POST',
    body: form,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage =
      data?.error?.message || `Cloudinary upload failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
  };
};

const formatTaskDueDate = (value) => {
  if (!value) return 'Not specified';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not specified';
  return date.toLocaleString('en-IN', {
    timeZone: process.env.AUTOMATION_TIMEZONE || 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const sendTaskAssignmentEmail = async (taskInput, options = {}) => {
  const assignedUserId =
    taskInput?.assignedTo?._id ||
    taskInput?.assignedTo?.id ||
    taskInput?.assignedTo;

  if (!assignedUserId) {
    return { skipped: true, reason: 'No assigned user' };
  }

  const previousAssignedUserId =
    options.previousAssignedTo?._id ||
    options.previousAssignedTo?.id ||
    options.previousAssignedTo;

  if (
    previousAssignedUserId &&
    String(previousAssignedUserId) === String(assignedUserId) &&
    !options.force
  ) {
    return { skipped: true, reason: 'Assignment unchanged' };
  }

  const [assignedUser, project] = await Promise.all([
    User.findById(assignedUserId).select('email role'),
    taskInput.project ? Project.findById(taskInput.project).select('projectName') : Promise.resolve(null)
  ]);

  if (!assignedUser || !assignedUser.email) {
    return { skipped: true, reason: 'Assigned user email not found' };
  }

  const actionText = options.isNewTask ? 'A new task has been assigned to you.' : 'A task has been assigned or updated for you.';
  const mailOptions = {
    from: getFromAddress('NexByte'),
    to: assignedUser.email,
    subject: `Task Assigned - ${taskInput.title || 'NexByte Task'}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Dear ${assignedUser.email.split('@')[0]},</p>
        <p>${actionText}</p>
        <ul>
          <li><strong>Task:</strong> ${taskInput.title || 'Untitled Task'}</li>
          <li><strong>Description:</strong> ${taskInput.description || 'No description provided'}</li>
          <li><strong>Priority:</strong> ${taskInput.priority || 'Not specified'}</li>
          <li><strong>Status:</strong> ${taskInput.status || 'pending'}</li>
          <li><strong>Due Date:</strong> ${formatTaskDueDate(taskInput.dueDate)}</li>
          <li><strong>Project:</strong> ${project?.projectName || 'General Task'}</li>
        </ul>
        <p>Please check your intern dashboard for full details.</p>
        <p>Regards,<br/>NexByte Team</p>
      </div>
    `
  };

  return sendMailSafe(mailOptions, options.isNewTask ? 'task-assigned-create' : 'task-assigned-update');
};

// =========================
// Portal automations
// =========================
let portalAutomationsStarted = false;

function getZonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const out = {};
  for (const p of parts) {
    if (p.type !== 'literal') out[p.type] = p.value;
  }
  return out;
}

async function expirePendingOffersAndNotify({ now = new Date(), dryRun = false } = {}) {
  const expiredInterns = await User.find({
    role: 'intern',
    offerStatus: 'pending',
    acceptanceDate: { $exists: true, $ne: null, $lt: now },
  }).select('email acceptanceDate');

  if (expiredInterns.length === 0) return { expiredCount: 0 };

  if (!dryRun) {
    await User.updateMany(
      { _id: { $in: expiredInterns.map(i => i._id) } },
      { $set: { offerStatus: 'expired', offerExpiredDate: now, internshipStatus: 'not_started' } }
    );
  }

  const admins = await User.find({ role: 'admin' }).select('email');
  const adminEmails = admins.map(a => a.email).filter(Boolean);

  const rows = expiredInterns
    .map(i => `<li>${i.email} (deadline: ${new Date(i.acceptanceDate).toLocaleDateString()})</li>`)
    .join('');

  if (adminEmails.length > 0) {
    const adminMailOptions = {
      from: getFromAddress('NexByte'),
      to: adminEmails.join(','),
      subject: `Offer Expiry Alert (${expiredInterns.length}) - NexByte`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Expired Internship Offers</h2>
          <p>The following intern offers have been marked as <strong>expired</strong> because the acceptance deadline passed:</p>
          <ul>${rows}</ul>
          <p>Time: ${now.toISOString()}</p>
        </div>
      `,
    };
    await sendMailSafe(adminMailOptions, 'offer-expiry-admin');
  }

  // Notify interns (best-effort)
  for (const intern of expiredInterns) {
    const internMailOptions = {
      from: getFromAddress('NexByte'),
      to: intern.email,
      subject: 'Internship Offer Expired - NexByte',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Dear ${intern.email},</p>
          <p>Your internship offer has expired because we did not receive an acceptance by the deadline (${new Date(intern.acceptanceDate).toLocaleDateString()}).</p>
          <p>If you are still interested, please contact the NexByte team.</p>
          <p>Regards,<br/>NexByte Team</p>
        </div>
      `,
    };
    await sendMailSafe(internMailOptions, 'offer-expiry-intern');
  }

  return { expiredCount: expiredInterns.length, expiredEmails: expiredInterns.map(i => i.email) };
}

async function sendWeeklyProgressSummaries({ now = new Date(), force = false, dryRun = false } = {}) {
  const oneDay = 24 * 60 * 60 * 1000;
  const threshold = new Date(now.getTime() - 6 * oneDay);

  await AutomationState.updateOne({ key: 'weekly_progress' }, { $setOnInsert: { key: 'weekly_progress' } }, { upsert: true });
  if (!force) {
    const state = await AutomationState.findOne({ key: 'weekly_progress' }).select('lastRunAt');
    if (state?.lastRunAt && state.lastRunAt > threshold) {
      return { skipped: true, reason: 'recently_run', lastRunAt: state.lastRunAt };
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    return { skipped: true, reason: 'GEMINI_API_KEY_not_configured' };
  }

  const since = new Date(now.getTime() - 7 * oneDay);
  const interns = await User.find({ role: 'intern', internshipStatus: 'in_progress' }).select('email');
  if (interns.length === 0) return { sent: 0 };

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  let sent = 0;
  for (const intern of interns) {
    const [completedTasks, recentTasks] = await Promise.all([
      Task.find({ assignedTo: intern._id, completedAt: { $gte: since, $lt: now } })
        .sort({ completedAt: -1 })
        .limit(20)
        .select('title completedAt status'),
      Task.find({ assignedTo: intern._id, createdAt: { $gte: since, $lt: now } })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('title status'),
    ]);

    const payload = {
      internEmail: intern.email,
      range: { since: since.toISOString(), until: now.toISOString() },
      completedTasks: completedTasks.map(t => ({ title: t.title, status: t.status, completedAt: t.completedAt })),
      recentTasks: recentTasks.map(t => ({ title: t.title, status: t.status })),
      metrics: { completedCount: completedTasks.length, createdCount: recentTasks.length },
    };

    const promptText = `
You are an internship mentor. Write a concise weekly progress summary email for the intern.
Keep it friendly, actionable, and short (max 120 words).
Include:
1) 2-4 bullet highlights (completed work)
2) 1-2 next steps for next week
Do not include any JSON or markdown fences.
Data:
${JSON.stringify(payload)}
    `.trim();

    let summaryText = '';
    try {
      const result = await model.generateContent(promptText);
      const response = await result.response;
      summaryText = String(response.text() || '').trim();
    } catch (e) {
      summaryText = `This week you completed ${completedTasks.length} task(s). Next week: pick 1 high-impact task and share a short update daily.`;
      console.error('Weekly summary AI error for', intern.email, e?.message || e);
    }

    const mailOptions = {
      from: getFromAddress('NexByte'),
      to: intern.email,
      subject: 'Weekly Progress Summary - NexByte Internship',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Weekly Progress Summary</h2>
          <p>${summaryText.replace(/\n/g, '<br/>')}</p>
          <p style="color:#6b7280;font-size:12px;">Range: ${since.toLocaleDateString()} - ${now.toLocaleDateString()}</p>
        </div>
      `,
    };

    if (!dryRun) {
      const result = await sendMailSafe(mailOptions, 'weekly-progress');
      if (result.success) sent += 1;
    }
  }

  if (!dryRun) {
    await AutomationState.updateOne({ key: 'weekly_progress' }, { $set: { lastRunAt: now } });
  }

  return { sent };
}

function startPortalAutomationJobs() {
  if (portalAutomationsStarted) return;
  portalAutomationsStarted = true;

  if (process.env.AUTOMATION_ENABLED && String(process.env.AUTOMATION_ENABLED).trim().toLowerCase() === 'false') {
    console.log('Portal automations disabled via AUTOMATION_ENABLED=false');
    return;
  }

  // Vercel serverless functions should not rely on long-running timers.
  // Use the protected /api/automation/cron/* endpoints via an external scheduler / Vercel Cron instead.
  if (process.env.VERCEL) {
    console.log('Portal automations disabled in Vercel serverless runtime. Use /api/automation/cron/* endpoints.');
    return;
  }

  // Offer expiry check (hourly) + run once at startup
  expirePendingOffersAndNotify().catch(e => console.error('Offer expiry job error:', e));
  setInterval(() => {
    expirePendingOffersAndNotify().catch(e => console.error('Offer expiry job error:', e));
  }, 60 * 60 * 1000);

  // Weekly progress summaries: every 15 minutes, run only on Monday 09:00-09:14 (configured TZ)
  const tz = process.env.AUTOMATION_TIMEZONE || 'Asia/Kolkata';
  setInterval(() => {
    try {
      const parts = getZonedParts(new Date(), tz);
      const weekday = parts.weekday;
      const hour = Number(parts.hour);
      const minute = Number(parts.minute);
      if (weekday === 'Mon' && hour === 9 && minute >= 0 && minute < 15) {
        sendWeeklyProgressSummaries().catch(e => console.error('Weekly progress job error:', e));
      }
    } catch (e) {
      console.error('Automation scheduler error:', e);
    }
  }, 15 * 60 * 1000);
}

function startPortalAutomationJobsWhenReady() {
  if (portalAutomationsStarted) return;
  if (connection.readyState === 1) return startPortalAutomationJobs();
  connection.once('open', () => startPortalAutomationJobs());
}

startPortalAutomationJobsWhenReady();

// @route   POST api/register
// @desc    Register a new user (public)
// @access  Public
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      email,
      password,
      role: 'member', // Default role for public registration
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error signing token' });
        }
        res.json({ token, role: user.role });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/users
// @desc    Add a new user
// @access  Private (admin)
app.post('/api/users', auth, admin, async (req, res) => {
  const { email, password, role, internType, internshipStartDate, internshipEndDate, acceptanceDate } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const plainTextPassword = password; // Store plain text password before hashing
    let offerLetterContent = null;

    if (role === 'intern') {
      offerLetterContent = generateOfferLetter(email, internshipStartDate, internshipEndDate, acceptanceDate);
    }

    user = new User({
      email,
      password,
      role: role || 'member', // Changed default role from 'user' to 'member'
      internType: role === 'intern' ? internType : undefined,
      offerLetter: offerLetterContent, // Save offer letter HTML if generated
      internshipStartDate: role === 'intern' ? internshipStartDate : undefined,
      internshipEndDate: role === 'intern' ? internshipEndDate : undefined,
      acceptanceDate: role === 'intern' ? acceptanceDate : undefined,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Send welcome email using the new mailSender service
    try {
      console.log(`Attempting to send ${role} credentials email to ${email}...`);
      const emailResult = await mailSender.sendUserCredentials(email, {
        role,
        password: plainTextPassword,
        internshipStartDate: role === 'intern' ? internshipStartDate : undefined,
        internshipEndDate: role === 'intern' ? internshipEndDate : undefined,
        acceptanceDate: role === 'intern' ? acceptanceDate : undefined,
        offerLetterContent: offerLetterContent
      });

      if (emailResult.success) {
        console.log(`${role} credentials email sent successfully to ${email}`);
        return res.json({ message: 'User created successfully and welcome email sent.', previewUrl: emailResult.previewUrl || null });
      } else {
        console.error(`Failed to send ${role} welcome email:`, emailResult.error);
        return res.status(201).json({ 
          message: 'User created successfully, but welcome email could not be sent. Please provide credentials manually.',
          warning: emailResult.error,
          previewUrl: emailResult.previewUrl || null
        });
      }
    } catch (emailError) {
      console.error('Error in sendUserCredentials notification:', emailError);
      return res.status(201).json({ 
        message: 'User created successfully, but an error occurred while sending the email.',
        warning: emailError.message
      });
    }

    res.json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users
// @desc    Get all users
// @access  Private (admin)
app.get('/api/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/profile
// @desc    Get current user profile
// @access  Private
app.get('/api/profile', auth, async (req, res) => {
  try {
    if (req.user.role === 'client') {
      const client = await Client.findById(req.user.id).select('-password');
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      return res.json({ ...client.toObject(), role: 'client' });
    }

    let user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // For backward compatibility, convert 'user' role to 'member'
    if (user.role === 'user') {
      user.role = 'member';
      // Optional: Update the user's role in the database
      await User.findByIdAndUpdate(user._id, { role: 'member' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/profile
// @desc    Update current user profile
// @access  Private
app.put('/api/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, skills } = req.body;
    
    // Find user and update profile
    let user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update profile fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : [];
    
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Private (admin)
app.delete('/api/users/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

const Client = require('./models/Client');

// Function to generate a random password
const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
};

// @route   POST api/clients
// @desc    Add a new client
// @access  Private (admin)
app.post('/api/clients', auth, admin, async (req, res) => {
  const {
    clientName,
    contactPerson,
    email,
    phone,
    companyAddress,
    projectName,
    projectType,
    projectRequirements,
    projectDeadline,
    totalBudget,
    billingAddress,
    gstNumber,
    paymentTerms,
    paymentMethod,
    domainRegistrarLogin,
    webHostingLogin,
    logoAndBrandingFiles,
    content,
  } = req.body;

  try {
    const password = req.body.password || generatePassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newClient = new Client({
      clientName,
      contactPerson,
      email,
      phone,
      companyAddress,
      projectName,
      projectType,
      projectRequirements,
      projectDeadline,
      totalBudget,
      billingAddress,
      gstNumber,
      paymentTerms,
      paymentMethod,
      domainRegistrarLogin,
      webHostingLogin,
      logoAndBrandingFiles,
      content,
      password: hashedPassword,
    });

    await newClient.save();

    // Send welcome email using the new mailSender service
    try {
      console.log('Attempting to send client credentials email...');
      const emailResult = await mailSender.sendClientCredentials(email, {
        clientName,
        contactPerson,
        password,
        projectName,
        phone,
        companyAddress,
        projectType,
        projectDeadline,
        totalBudget
      });
      if (emailResult.success) {
        console.log('Client credentials email sent successfully');
      } else {
        console.error('Failed to send client credentials email:', emailResult.error);
      }
    } catch (error) {
      console.error('Error in sendClientCredentials:', error);
    }

    res.json({ message: 'Client added successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/clients
// @desc    Get all clients
// @access  Private (admin)
app.get('/api/clients', auth, admin, async (req, res) => {
  try {
    const clients = await Client.find().select('-password').sort({ date: -1 });
    res.json(clients);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/clients/:id/srs
// @desc    Get SRS for a client
// @access  Private (admin)
app.get('/api/clients/:id/srs', auth, admin, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('srsDocument');
    if (!client || !client.srsDocument) {
      return res.status(404).json({ message: 'SRS not found for this client' });
    }
    res.json({ srsDocument: client.srsDocument });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/clients/:id
// @desc    Delete a client
// @access  Private (admin)
app.delete('/api/clients/:id', auth, admin, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ message: 'Client removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/clients/:id/password
// @desc    Get client password
// @access  Private (admin)
app.get('/api/clients/:id/password', auth, admin, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('email clientName contactPerson password');
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Since passwords are hashed, we can't retrieve the original
    // Instead, we'll generate a new temporary password
    const tempPassword = generatePassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);
    
    // Update client with new temporary password
    await Client.findByIdAndUpdate(req.params.id, { password: hashedPassword });

    // Send password reset email using the new mailSender service
    try {
      console.log('Attempting to send password reset email...');
      const emailResult = await mailSender.sendPasswordReset(
        client.email, 
        client.contactPerson || client.clientName, 
        tempPassword
      );
      if (emailResult.success) {
        console.log('Password reset email sent successfully');
      } else {
        console.error('Failed to send password reset email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Error in sendPasswordReset notification:', emailError);
    }
    
    res.json({ password: tempPassword });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/client/data
// @desc    Get client data for client panel
// @access  Private (client)
app.get('/api/client/data', auth, client, async (req, res) => {
  try {
    const client = await Client.findById(req.user.id).select('-password');
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({
      message: `Welcome, ${client.clientName}`,
      clientData: {
        id: client._id,
        name: client.clientName,
        contactPerson: client.contactPerson,
        email: client.email,
        project: client.projectName,
        status: 'In Progress',
        dueDate: client.projectDeadline,
        srsDocument: client.srsDocument,
        totalBudget: client.totalBudget,
        billingAddress: client.billingAddress,
        gstNumber: client.gstNumber,
        paymentTerms: client.paymentTerms,
        paymentMethod: client.paymentMethod,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server. Please try again later' });
  }
});

// @route   PUT api/client/change-password
// @desc    Change client password
// @access  Private (client)
app.put('/api/client/change-password', auth, client, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const clientRecord = await Client.findById(req.user.id);
    if (!clientRecord) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, clientRecord.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await Client.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    // Send password change notification using the new mailSender service
    try {
      console.log('Attempting to send password change notification...');
      const emailResult = await mailSender.sendPasswordChangeNotification(
        clientRecord.email, 
        clientRecord.contactPerson || clientRecord.clientName
      );
      if (emailResult.success) {
        console.log('Password change notification sent successfully');
      } else {
        console.error('Failed to send password change notification:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Error in sendPasswordChangeNotification:', emailError);
    }

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Project Management Routes

// @route   POST api/projects
// @desc    Add a new project
// @access  Private (admin)
app.post('/api/projects', auth, admin, async (req, res) => {
  const {
    projectName,
    projectType,
    projectDescription,
    totalBudget,
    projectDeadline,
    clientType,
    associatedClient
  } = req.body;

  try {
    const newProject = new Project({
      projectName,
      projectType,
      projectDescription,
      totalBudget,
      projectDeadline,
      clientType: clientType || 'non-client',
      associatedClient: clientType === 'client' ? associatedClient : null
    });

    await newProject.save();
    
    // Populate client data if it's a client project
    const populatedProject = await Project.findById(newProject._id)
      .populate('associatedClient', 'clientName projectName email');

    res.json(populatedProject);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/projects
// @desc    Get all projects
// @access  Private (admin)
app.get('/api/projects', auth, admin, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('associatedClient', 'clientName projectName email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/projects/all
// @desc    Get all projects for task generator (both client and non-client)
// @access  Private (admin)
app.get('/api/projects/all', auth, admin, async (req, res) => {
  try {
    console.log('Fetching projects for task generator...');
    const projects = await Project.find()
      .populate('associatedClient', 'clientName projectName email')
      .sort({ createdAt: -1 });
    
    console.log('Found projects:', projects.length);
    
    // Also include client projects as separate entries for task generator
    const clients = await Client.find().select('_id clientName projectName projectRequirements totalBudget projectDeadline');
    console.log('Found clients:', clients.length);
    
    const clientProjects = clients.map(client => ({
      _id: `client-${client._id}`,
      projectName: client.projectName,
      projectType: 'Client Project',
      projectDescription: client.projectRequirements,
      totalBudget: client.totalBudget,
      projectDeadline: client.projectDeadline,
      clientType: 'client',
      associatedClient: client._id,
      isClientProject: true,
      clientName: client.clientName
    }));
    
    const allProjects = [...projects, ...clientProjects];
    console.log('Total projects for task generator:', allProjects.length);
    res.json(allProjects);
  } catch (err) {
    console.error('Error in /api/projects/all:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/projects/:id
// @desc    Get a single project
// @access  Private (admin)
app.get('/api/projects/:id', auth, admin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('associatedClient', 'clientName projectName email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/projects/:id
// @desc    Delete a project
// @access  Private (admin)
app.delete('/api/projects/:id', auth, admin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/bills
// @desc    Create a new bill
// @access  Private (admin)
app.post('/api/bills', auth, admin, async (req, res) => {
  const { client, amount, dueDate, status, description } = req.body;

  try {
    const clientData = await Client.findById(client).select('clientName email projectName');
    if (!clientData) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const newBill = new Bill({
      client,
      amount,
      dueDate,
      status,
      description,
    });

    await newBill.save();

    const billLinkBase = process.env.PUBLIC_APP_URL || process.env.CLIENT_URL || '';
    const billLink = billLinkBase ? `${billLinkBase.replace(/\/$/, '')}/client` : '';

    await sendMailSafe(
      {
        from: getFromAddress('NexByte'),
        to: clientData.email,
        subject: `New Bill Generated - ${clientData.projectName || 'NexByte Project'}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <p>Dear ${clientData.clientName},</p>
            <p>A new bill has been generated for your project.</p>
            <ul>
              <li><strong>Bill ID:</strong> ${newBill._id}</li>
              <li><strong>Project:</strong> ${clientData.projectName || 'N/A'}</li>
              <li><strong>Amount:</strong> INR ${Number(amount || 0).toFixed(2)}</li>
              <li><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString('en-IN')}</li>
              <li><strong>Status:</strong> ${status || 'Unpaid'}</li>
              <li><strong>Description:</strong> ${description || 'N/A'}</li>
            </ul>
            ${billLink ? `<p>You can review and pay the bill from your client dashboard: <a href="${billLink}">${billLink}</a></p>` : ''}
            <p>Regards,<br/>NexByte Team</p>
          </div>
        `,
      },
      'bill-created-client'
    );

    const populatedBill = await Bill.findById(newBill._id).populate('client', 'clientName projectName totalBudget');
    res.json(populatedBill);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/generate-bill-description
// @desc    Generate a bill description using AI
// @access  Private (admin)
app.post('/api/generate-bill-description', auth, admin, async (req, res) => {
  const { clientName, projectName, amount, tasks } = req.body;

  if (!clientName || !projectName || !amount) {
    return res.status(400).json({ message: 'Client name, project name, and amount are required' });
  }

  let tasksPrompt = '';
  if (tasks && tasks.length > 0) {
    tasksPrompt = `
      The bill covers the following completed tasks:
      - ${tasks.join('\n- ')}
    `;
  }

  const promptText = `
    Generate a concise, professional bill description for the following:
    - Client: ${clientName}
    - Project: ${projectName}
    - Amount: ${amount}
    ${tasksPrompt}

    The description should be a single sentence, suitable for a bill, and should summarize the work done. For example: "Payment for the development of the ${projectName} project, including the implementation of user authentication and profile management features."
  `;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});

  try {
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const description = response.text();
    res.status(200).json({ description });
  } catch (error) {
    console.error('Error generating bill description with Gemini:', error);
    res.status(500).json({ message: 'Failed to generate bill description with Gemini.', error: error.message });
  }
});

// @route   GET api/bills/client/:clientId
// @desc    Get all bills for a client
// @access  Private (client)
app.get('/api/bills/client/:clientId', auth, client, async (req, res) => {
  try {
    const bills = await Bill.find({ client: req.params.clientId }).sort({ billDate: -1 });
    res.json(bills);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/bills
// @desc    Get all bills
// @access  Private (admin)
app.get('/api/bills', auth, admin, async (req, res) => {
  try {
    const bills = await Bill.find().populate('client', 'clientName projectName totalBudget').sort({ billDate: -1 });
    res.json(bills);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/bills/:billId
// @desc    Update a bill
// @access  Private (admin)
app.put('/api/bills/:billId', auth, admin, async (req, res) => {
  const { status, paidAmount } = req.body;

  try {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (status) {
        bill.status = status;
    }
    if (paidAmount !== undefined) {
        bill.paidAmount = paidAmount;
    }
    
    await bill.save();

    const populatedBill = await bill.populate('client', 'clientName projectName totalBudget');
    res.json(populatedBill);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/bills/:billId/razorpay-order
// @desc    Create a Razorpay order for bill payment
// @access  Private (client)
app.post('/api/bills/:billId/razorpay-order', auth, client, async (req, res) => {
  try {
    const config = getRazorpayConfig();
    if (!config) {
      return res.status(500).json({ message: 'Razorpay is not configured' });
    }

    const bill = await Bill.findById(req.params.billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.client.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const remainingAmount = getBillRemainingAmount(bill);
    if (remainingAmount <= 0) {
      return res.status(400).json({ message: 'This bill is already fully paid' });
    }

    const amountInPaise = Math.round(remainingAmount * 100);
    const order = await callRazorpayApi('orders', {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `bill_${bill._id}_${Date.now()}`.slice(0, 40),
      notes: {
        billId: String(bill._id),
        clientId: String(bill.client),
      },
    });

    bill.razorpayOrders.push({
      orderId: order.id,
      amount: remainingAmount,
      status: 'created',
    });
    await bill.save();

    return res.json({
      key: config.keyId,
      orderId: order.id,
      amount: amountInPaise,
      currency: order.currency || 'INR',
      billId: String(bill._id),
      clientName: req.user.email ? req.user.email.split('@')[0] : 'Client',
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err.message);
    return res.status(500).json({ message: err.message || 'Failed to create Razorpay order' });
  }
});

// @route   POST api/bills/:billId/verify-razorpay-payment
// @desc    Verify Razorpay payment and mark bill as paid
// @access  Private (client)
app.post('/api/bills/:billId/verify-razorpay-payment', auth, client, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Payment verification details are required' });
  }

  try {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.client.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const orderEntry = bill.razorpayOrders.find(
      (entry) => entry.orderId === razorpay_order_id
    );

    if (!orderEntry) {
      return res.status(404).json({ message: 'Razorpay order not found for this bill' });
    }

    if (orderEntry.status === 'paid') {
      const populatedBill = await Bill.findById(bill._id).populate('client', 'clientName projectName totalBudget');
      return res.json(populatedBill);
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      orderEntry.status = 'failed';
      await bill.save();
      return res.status(400).json({ message: 'Invalid Razorpay payment signature' });
    }

    orderEntry.paymentId = razorpay_payment_id;
    orderEntry.signature = razorpay_signature;
    orderEntry.status = 'paid';
    orderEntry.verifiedAt = new Date();

    bill.paidAmount = Number(bill.paidAmount || 0) + Number(orderEntry.amount || 0);
    bill.status = bill.paidAmount >= bill.amount ? 'Paid' : 'Partially Paid';
    await bill.save();

    const [populatedBill, clientData] = await Promise.all([
      Bill.findById(bill._id).populate('client', 'clientName projectName totalBudget'),
      Client.findById(bill.client),
    ]);

    if (clientData?.email) {
      await sendMailSafe(
        {
          from: getFromAddress('NexByte'),
          to: clientData.email,
          subject: 'Payment Successful',
          html: `
            <p>Dear ${clientData.clientName},</p>
            <p>Your payment for bill ID ${bill._id} has been received successfully.</p>
            <p><strong>Amount:</strong> INR ${Number(orderEntry.amount || 0).toFixed(2)}</p>
            <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
            <p>Thank you,</p>
            <p>The NexByte Team</p>
          `,
        },
        'razorpay-payment-success'
      );
    }

    return res.json(populatedBill);
  } catch (err) {
    console.error('Error verifying Razorpay payment:', err.message);
    return res.status(500).json({ message: err.message || 'Failed to verify Razorpay payment' });
  }
});

app.put('/api/bills/:billId/confirm', auth, client, async (req, res) => {
  const { transactionId, amount } = req.body;

  if (!transactionId || !amount) {
    return res.status(400).json({ message: 'Transaction ID and amount are required' });
  }

  try {
    const bill = await Bill.findById(req.params.billId);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Check if the bill belongs to the authenticated client
    if (bill.client.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    bill.pendingPayments.push({ amount, transactionId });
    bill.status = 'Verification Pending';
    await bill.save();

    // Find client to get email
    const clientData = await Client.findById(bill.client);
    if (clientData && clientData.email) {
      // Send confirmation email
      const mailOptions = {
        from: getFromAddress('NexByte'),
        to: clientData.email,
        subject: 'Payment Confirmation Received',
        html: `
          <p>Dear ${clientData.clientName},</p>
          <p>We have received your payment confirmation for bill ID ${bill._id} of amount ${amount}.</p>
          <p>We will update your payment status shortly after verification.</p>
          <p>Thank you,</p>
          <p>The NexByte Team</p>
        `,
      };

      try {
        console.log('Attempting to send payment confirmation email...');
        const result = await sendMailSafe(mailOptions, 'payment-confirmation');
        if (result.success) console.log('Payment confirmation email sent:', result.messageId);
      } catch (error) {
        console.error('Error sending payment confirmation email:', error);
        // We don't want to fail the whole request if the email fails
      }
    }

    res.json({ message: 'Payment confirmation submitted successfully. You will be notified once the payment is verified.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/bills/:billId/approve-payment
// @desc    Approve a pending payment
// @access  Private (admin)
app.put('/api/bills/:billId/approve-payment', auth, admin, async (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ message: 'Payment ID is required' });
  }

  try {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const payment = bill.pendingPayments.id(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Pending payment not found' });
    }

    bill.paidAmount += payment.amount;
    bill.pendingPayments.pull(paymentId);

    if (bill.paidAmount >= bill.amount) {
      bill.status = 'Paid';
    } else {
      bill.status = 'Partially Paid';
    }
    
    await bill.save();

    const foundBill = await Bill.findById(bill._id).populate('client', 'clientName projectName totalBudget');
    res.json(foundBill);
  } catch (err) {
    console.error('Error in approve-payment route:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT api/bills/:billId/reject-payment
// @desc    Reject a pending payment
// @access  Private (admin)
app.put('/api/bills/:billId/reject-payment', auth, admin, async (req, res) => {
    const { paymentId } = req.body;

    if (!paymentId) {
        return res.status(400).json({ message: 'Payment ID is required' });
    }

    try {
        const bill = await Bill.findById(req.params.billId);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        const payment = bill.pendingPayments.id(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Pending payment not found' });
        }

        bill.pendingPayments.pull(paymentId);
        
        if (bill.pendingPayments.length === 0 && bill.status === 'Verification Pending') {
            bill.status = bill.paidAmount > 0 ? 'Partially Paid' : 'Unpaid';
        }

        await bill.save();

        const foundBill = await Bill.findById(bill._id).populate('client', 'clientName projectName totalBudget');
        res.json(foundBill);
    } catch (err) {
        console.error('Error in reject-payment route:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// @route   POST api/generate-srs
// @desc    Generate SRS document
// @access  Private (admin)
app.post('/api/generate-srs', auth, admin, async (req, res) => {
  // Log to check if the API key is loaded
  console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);

  const {
    projectName,
    projectDescription,
    targetAudience,
    functionalRequirements,
    nonFunctionalRequirements,
    client,
  } = req.body;

  if (!projectName) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  const promptText = `
    Generate a detailed Software Requirement Specification (SRS) document based on the following details:

    **Project Name:** ${projectName}

    **Client Information:**
    - **Client Name:** ${client?.clientName || 'N/A'}
    - **Contact Person:** ${client?.contactPerson || 'N/A'}
    - **Email:** ${client?.email || 'N/A'}

    **1. Introduction:**
       1.1. **Project Overview:** ${projectDescription || 'Provide a detailed overview of the project.'}
       1.2. **Scope:** Define the scope of the project based on the requirements.
       1.3. **Target Audience:** ${targetAudience || 'Describe the target audience for this project.'}

    **2. Overall Description:**
       2.1. **Product Perspective:** Describe the product's relationship to other products or projects.
       2.2. **User Characteristics:** Describe the intended users.
       2.3. **Assumptions and Dependencies:** List any assumptions or dependencies.

    **3. System Features and Requirements:**
       3.1. **Functional Requirements:**
            ${functionalRequirements || 'Detail the functional requirements. These should be specific and measurable.'}

       3.2. **Non-Functional Requirements:**
            ${nonFunctionalRequirements || 'Detail the non-functional requirements, such as performance, security, reliability, and usability.'}

    **4. External Interface Requirements:**
       4.1. **User Interfaces:** Describe the user interface requirements.
       4.2. **Hardware Interfaces:** Describe any hardware interfaces.
       4.3. **Software Interfaces:** Describe any software interfaces.
       4.4. **Communications Interfaces:** Describe any communications interfaces.

    **5. Other Appendices:**
       - Include any other relevant information, such as a glossary, analysis models, or issues list.

    Please generate a comprehensive and well-structured SRS document based on this information. The output should be in Markdown format. Do not include any conversational pleasantries, preambles, or apologies in your response. Respond only with the raw Markdown document content starting from the main title.
  `;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});

  try {
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const srsContent = response.text();
    res.status(200).json({ srsContent });
  } catch (error) {
    console.error('Error generating SRS with Gemini:', error);
    res.status(500).json({ message: 'Failed to generate SRS with Gemini.', error: error.message });
  }
});

// @route   POST api/save-srs
// @desc    Save SRS document to a client
// @access  Private (admin)
app.post('/api/save-srs', auth, admin, async (req, res) => {
  const { clientId, srsContent } = req.body;

  if (!clientId || !srsContent) {
    return res.status(400).json({ message: 'Client ID and SRS content are required' });
  }

  try {
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.srsDocument = srsContent;
    await client.save();

    res.json({ message: 'SRS document saved successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error while saving SRS' });
  }
});

// @route   POST api/send-srs-to-client
// @desc    Send SRS to client
// @access  Private (admin)
app.post('/api/send-srs-to-client', auth, admin, async (req, res) => {
  const { clientId, srsContent } = req.body;

  if (!clientId || !srsContent) {
    return res.status(400).json({ message: 'Client ID and SRS content are required' });
  }

  try {
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.srsDocument = srsContent;
    await client.save();

    // Send email to client
    const mailOptions = {
      from: getFromAddress('NexByte'),
      to: client.email,
      subject: `SRS for ${client.projectName} is Ready`,
      html: `
        <p>Dear ${client.clientName},</p>
        <p>The Software Requirement Specification (SRS) for your project, <strong>${client.projectName}</strong>, is now ready for your review.</p>
        <p>You can view the SRS by logging into your client panel.</p>
        <p>Thank you,</p>
        <p>The NexByte Team</p>
      `,
    };

    try {
      console.log('Attempting to send SRS email to client...');
      const result = await sendMailSafe(mailOptions, 'srs-to-client');
      if (result.success) console.log('SRS email sent:', result.messageId);
    } catch (error) {
      console.error('Error sending SRS email:', error);
      // We don't want to fail the whole request if the email fails
    }

    res.json({ message: 'SRS saved and email sent successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error while sending SRS to client' });
  }
});

// @route   POST api/edit-srs
// @desc    Edit SRS document with AI
// @access  Private (admin)
app.post('/api/edit-srs', auth, admin, async (req, res) => {
  const { srsContent, aiPrompt } = req.body;

  if (!srsContent || !aiPrompt) {
    return res.status(400).json({ message: 'SRS content and AI prompt are required' });
  }

  const promptText = `
    Based on the following document, please perform the requested edit.

    **Instruction:**
    ${aiPrompt}

    **Document:**
    ---
    ${srsContent}
    ---

    Return only the full, edited document with the changes applied. Do not include any conversational pleasantries, preambles, or apologies.
  `;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});

  try {
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const editedSrs = response.text();
    res.status(200).json({ srsContent: editedSrs });

  } catch (error) {
    console.error('Error making direct fetch call to Gemini for AI edit:', error);
    res.status(500).json({ message: 'Failed to edit SRS with AI.', error: error.message });
  }
});



// @route   POST api/summarize-srs
// @desc    Generate a summary for an SRS document
// @access  Private (admin)
app.post('/api/summarize-srs', auth, admin, async (req, res) => {
  const { srsContent } = req.body;

  if (!srsContent) {
    return res.status(400).json({ message: 'SRS content is required' });
  }

  try {
    const promptText = `
      Please provide a concise, one-paragraph summary of the following Software Requirement Specification (SRS) document.
      This summary will be used as a high-level project description.

      **SRS Document:**
      ---
      ${srsContent}
      ---

      Generate only the summary paragraph. Do not include any conversational text, preambles, or titles.
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(promptText);
    const response = await result.response;
    const summary = response.text();

    res.json({ summary });

  } catch (error) {
    console.error('Error summarizing SRS with Gemini:', error);
    res.status(500).json({ message: 'Failed to summarize SRS with AI.', error: error.message });
  }
});

const Message = require('./models/Message');

// @route   POST /api/client/message
// @desc    Client send message
// @access  Private (client)
app.post('/api/client/message', auth, client, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    const newMessage = new Message({
      client: req.user.id,
      message,
    });

    await newMessage.save();

    res.json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages
// @desc    Get all messages
// @access  Private (admin)
app.get('/api/messages', auth, admin, async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('client', 'clientName')
      .sort({ date: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});








// @route   POST api/generate-project-description
// @desc    Generate a project description using AI
// @access  Private (admin)
app.post('/api/generate-project-description', auth, admin, async (req, res) => {
    const { projectName, projectRequirements } = req.body;

    if (!projectName || !projectRequirements) {
        return res.status(400).json({ message: 'Project name and requirements are required.' });
    }

    const promptText = `
        Based on the following project name and requirements, generate a concise, one-paragraph project description or goal.

        - Project Name: "${projectName}"
        - Project Requirements: "${projectRequirements}"

        Generate only the summary paragraph. Do not include any conversational text, preambles, or titles.
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        const result = await model.generateContent(promptText);
        const response = await result.response;
        const description = response.text();
        res.status(200).json({ description });
    } catch (error) {
        console.error('Error generating project description with Gemini:', error);
        res.status(500).json({ message: 'Failed to generate project description.', error: error.message });
    }
});


// @route   POST api/preview-tasks
// @desc    Generate a preview of tasks for a project using AI
// @access  Private (admin)
app.post('/api/preview-tasks', auth, admin, async (req, res) => {
    const {
        clientId,
        projectName,
        projectGoal,
        total_budget_in_INR,
        fixed_costs_in_INR,
        isFreeProject = false,
        selectedProject // ✅ Add selectedProject from request
    } = req.body;

    // Validate required fields
    if (!projectName || !projectGoal) {
        return res.status(400).json({ message: 'Please provide project name and requirements.' });
    }

    let totalBudget = 0;
    let fixedCosts = 0;

    // Only validate budget for non-free projects
    if (!isFreeProject) {
        // Validate budget values
        totalBudget = parseFloat(total_budget_in_INR);
        fixedCosts = parseFloat(fixed_costs_in_INR);

        if (isNaN(totalBudget) || isNaN(fixedCosts)) {
            return res.status(400).json({ message: 'Budget values must be valid numbers.' });
        }

        if (totalBudget <= 0) {
            return res.status(400).json({ message: 'Total Budget must be greater than 0.' });
        }

        if (fixedCosts < 0) {
            return res.status(400).json({ message: 'Fixed Costs must be 0 or greater.' });
        }

        if (fixedCosts >= totalBudget) {
            return res.status(400).json({ message: 'Fixed Costs must be less than Total Budget.' });
        }

        // Check if remaining budget is sufficient
        const remainingBudget = totalBudget - fixedCosts;
        if (remainingBudget < 1000) {
            return res.status(400).json({ message: 'Remaining budget after fixed costs should be at least ₹1000 for proper reward distribution.' });
        }
    }

    try {
        // Fetch client to get SRS document if clientId is provided
        let srsContent = 'No SRS provided.';
        if (clientId) {
            const client = await Client.findById(clientId);
            srsContent = client ? client.srsDocument : 'No SRS provided.';
        }

        const promptText = `
            You are an expert AI project planner specializing in software development. Your goal is to generate a detailed, practical, and budget-aware task list for a given project.

            INPUT:
            - Project Name: "${projectName}"
            - Project Goal & Requirements: "${projectGoal}"
            - Software Requirement Specification (SRS) Document:
            ---
            ${srsContent || 'No SRS provided.'}
            ---

            WHAT TO DO:
            1. Analyze all provided documents to create a comprehensive task list for the entire software development lifecycle.
            2. IMPORTANT: The tasks must be strictly technical development tasks. DO NOT include project management, client communication, meetings, or any other non-technical administrative tasks. Focus only on the work required to build and deploy the software.
            3. This includes planning, UI/UX design, frontend development, backend development, database management, testing, and deployment.
            4. CRITICAL: Plan tasks to be completed 3 weeks BEFORE the project deadline. This buffer time is for testing, revisions, and deployment.
            5. Each task must have:
               - task_title (short, action-oriented, max 8 words, e.g., "Develop User Login API")
               - task_description (2-4 meaningful sentences explaining the task)
               - estimated_effort_hours (a numeric estimate of hours required, considering the 3-week buffer)
            6. The tasks should be broken down into logical, manageable chunks that can realistically be completed within the timeline (deadline minus 3 weeks).
            7. Output the list of tasks in valid JSON only. Do not output markdown or any other text.

            OUTPUT FORMAT:
            [
              {
                "task_title": "string",
                "task_description": "string",
                "estimated_effort_hours": number
              }
            ]
        `;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(promptText);
        const response = await result.response;
        const tasksJson = response.text().replace(/```json|```/g, '').trim();
        let generatedTasks = JSON.parse(tasksJson);

        const remaining_budget = isFreeProject ? 0 : (totalBudget - fixedCosts);
        const total_effort = generatedTasks.reduce((sum, task) => sum + task.estimated_effort_hours, 0);

        console.log('Budget Calculation:', {
            isFreeProject,
            totalBudget,
            fixedCosts,
            remaining_budget,
            total_effort,
            taskCount: generatedTasks.length
        });

        if (total_effort === 0) {
            return res.status(400).json({ message: 'Total estimated effort is zero, cannot allocate budget.' });
        }

        const tasksWithRewards = generatedTasks.map(task => {
            let reward = 0;
            
            if (!isFreeProject) {
                // Calculate equal reward for all tasks (not based on effort)
                const equalReward = remaining_budget / generatedTasks.length;
                // Use exact amount without rounding
                reward = equalReward;
                
                // No minimum reward - use actual calculated amount
            }

            console.log(`Task "${task.task_title}":`, {
                effort: task.estimated_effort_hours,
                isFreeProject,
                equalShare: isFreeProject ? 0 : remaining_budget / generatedTasks.length,
                finalReward: reward
            });

            return {
                title: task.task_title,
                description: task.task_description,
                estimated_effort_hours: task.estimated_effort_hours,
                reward_amount_in_INR: reward,
                client: clientId || null,
                project: selectedProject || null, // ✅ Add project field
                status: 'To Do',
                isFreeProject: isFreeProject
            };
        });
        
        res.status(200).json(tasksWithRewards);

    } catch (error) {
        console.error('Error generating task preview with Gemini:', error);
        res.status(500).json({ message: 'Failed to generate task preview.', error: error.message });
    }
});

// @route   POST api/save-tasks
// @desc    Save generated tasks to the database
// @access  Private (admin)
app.post('/api/save-tasks', auth, admin, async (req, res) => {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ message: 'A non-empty array of tasks is required.' });
    }

    try {
        console.log('Raw tasks received:', tasks); // Debug log
        
        // Fix field names and add missing required fields
        const fixedTasks = tasks.map(task => {
            console.log('Processing task:', task); // Debug log
            return {
                title: task.title || task.task_title, // Handle both field names
                description: task.description || task.task_description, // Handle both field names
                priority: task.priority || 'medium',
                status: task.status || 'pending',
                estimated_effort_hours: task.estimated_effort_hours || 8, // Default 8 hours
                                reward_amount_in_INR: task.reward_amount_in_INR || 0, // Default  0
                project: task.project || task.projectId, // Handle both field names
                client: task.client || null,
                assignedTo: task.assignedTo || null,
                dueDate: task.dueDate || null
            };
        });

        console.log('Fixed tasks to save:', fixedTasks); // Debug log
        const savedTasks = await Task.insertMany(fixedTasks);
        console.log('Tasks saved successfully:', savedTasks.length); // Debug log
        res.status(201).json({ message: 'Tasks saved successfully.' });
    } catch (error) {
        console.error('Error saving tasks:', error);
        res.status(500).json({ message: 'Failed to save tasks.', error: error.message });
    }
});

// @route   GET api/tasks
// @desc    Get all tasks for a client
// @access  Private (client or admin)
app.get('/api/tasks', auth, async (req, res) => {
    try {
        let tasks;
        if (req.user.role === 'admin') {
            // Admin can see all tasks, or filter by clientId if provided
            const { clientId } = req.query;
            if (clientId) {
                tasks = await Task.find({ client: clientId }).sort({ createdAt: -1 });
            } else {
                tasks = await Task.find().sort({ createdAt: -1 });
            }
        } else if (req.user.role === 'intern') {
            // Intern can only see tasks assigned to them
            tasks = await Task.find({ assignedTo: req.user.id }).sort({ createdAt: -1 });
        } else {
            // A client can only see their own tasks
            tasks = await Task.find({ client: req.user.id }).sort({ createdAt: -1 });
        }
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT api/tasks/:id
// @desc    Update a task's status
// @access  Private (admin)
app.put('/api/tasks/:id', auth, admin, async (req, res) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if status is changing to 'Done' to award credits
        if (status === 'Done' && task.status !== 'Done') {
            if (task.assignedTo && task.reward_amount_in_INR > 0) {
                const user = await User.findById(task.assignedTo);
                if (user) {
                    user.credits = (user.credits || 0) + task.reward_amount_in_INR;
                    await user.save();
                }
            }
            task.completedAt = new Date();
        }

        task.status = status;
        await task.save();

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET api/users/intern-report/:internId
// @desc    Get user growth and performance report (supports all user types)
// @access  Private (admin)
app.get('/api/users/intern-report/:internId', auth, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.internId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get all tasks assigned to this user
        const tasks = await Task.find({ assignedTo: req.params.internId })
            .populate('comments.user', 'email')
            .sort({ createdAt: -1 });

        // Calculate statistics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'Done').length;
        const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
        const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
        
        // Calculate total earnings
        const totalEarnings = tasks
            .filter(task => task.status === 'Done')
            .reduce((sum, task) => sum + (task.reward_amount_in_INR || 0), 0);

        // Task completion rate
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;

        // Tasks by priority
        const highPriorityTasks = tasks.filter(task => task.priority === 'High');
        const mediumPriorityTasks = tasks.filter(task => task.priority === 'Medium');
        const lowPriorityTasks = tasks.filter(task => task.priority === 'Low');

        const highPriorityCompleted = highPriorityTasks.filter(task => task.status === 'Done').length;
        const mediumPriorityCompleted = mediumPriorityTasks.filter(task => task.status === 'Done').length;
        const lowPriorityCompleted = lowPriorityTasks.filter(task => task.status === 'Done').length;

        // Monthly task completion trend
        const monthlyStats = {};
        tasks.forEach(task => {
            if (task.status === 'Done' && task.updatedAt) {
                const month = new Date(task.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                monthlyStats[month] = (monthlyStats[month] || 0) + 1;
            }
        });

        // Recent activity
        const recentTasks = tasks.slice(0, 5);

        const report = {
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                internshipStartDate: user.internshipStartDate,
                internshipEndDate: user.internshipEndDate,
                acceptanceDate: user.acceptanceDate,
                internType: user.internType,
                createdAt: user.createdAt
            },
            statistics: {
                totalTasks,
                completedTasks,
                inProgressTasks,
                pendingTasks,
                completionRate: parseFloat(completionRate),
                totalEarnings,
                averageTaskValue: totalTasks > 0 ? (totalEarnings / totalTasks).toFixed(2) : 0
            },
            priorityBreakdown: {
                high: {
                    total: highPriorityTasks.length,
                    completed: highPriorityCompleted,
                    completionRate: highPriorityTasks.length > 0 ? (highPriorityCompleted / highPriorityTasks.length * 100).toFixed(1) : 0
                },
                medium: {
                    total: mediumPriorityTasks.length,
                    completed: mediumPriorityCompleted,
                    completionRate: mediumPriorityTasks.length > 0 ? (mediumPriorityCompleted / mediumPriorityTasks.length * 100).toFixed(1) : 0
                },
                low: {
                    total: lowPriorityTasks.length,
                    completed: lowPriorityCompleted,
                    completionRate: lowPriorityTasks.length > 0 ? (lowPriorityCompleted / lowPriorityTasks.length * 100).toFixed(1) : 0
                }
            },
            monthlyTrend: monthlyStats,
            recentActivity: recentTasks.map(task => ({
                id: task._id,
                title: task.title,
                status: task.status,
                priority: task.priority,
                reward: task.reward_amount_in_INR || 0,
                completedAt: task.status === 'Done' ? task.updatedAt : null,
                comments: task.comments.length
            }))
        };

        res.json(report);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET api/tasks/my-tasks
// @desc    Get tasks assigned to current user
// @access  Private
app.get('/api/tasks/my-tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id })
            .populate('assignedTo', 'email')
            .populate('comments.user', 'email')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET api/tasks/:id
// @desc    Get a single task by ID
// @access  Private
app.get('/api/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'email')
            .populate('comments.user', 'email');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT api/tasks/:id/assign
// @desc    Assign a user to a task
// @access  Private (admin)
app.put('/api/tasks/:id/assign', auth, admin, async (req, res) => {
    const { userId } = req.body;

    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const previousAssignedTo = task.assignedTo;
        task.assignedTo = userId;
        await task.save();
        await sendTaskAssignmentEmail(task, { previousAssignedTo });

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST api/tasks/:id/comments
// @desc    Add a comment to a task
// @access  Private
app.post('/api/tasks/:id/comments', auth, async (req, res) => {
    const { body } = req.body;

    if (!body) {
        return res.status(400).json({ message: 'Comment body is required' });
    }

    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const newComment = {
            body,
            user: req.user.id,
        };

        task.comments.unshift(newComment);
        await task.save();

        // Populate user info for the new comment before sending back
        const populatedTask = await Task.findById(req.params.id)
            .populate('assignedTo', 'email')
            .populate('comments.user', 'email');

        res.json(populatedTask);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// @route   GET api/clients/:clientId/milestone
// @desc    Get and update client project milestone
// @access  Private (admin or client)
app.get('/api/clients/:clientId/milestone', auth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const relatedProjects = await Project.find({ associatedClient: clientId }).select('_id');
    const relatedProjectIds = relatedProjects.map((project) => project._id);
    const taskQuery = relatedProjectIds.length > 0
      ? {
          $or: [
            { client: clientId },
            { project: { $in: relatedProjectIds } }
          ]
        }
      : { client: clientId };

    const tasks = await Task.find(taskQuery);

    const normalizedStatuses = tasks.map((task) => String(task.status || '').trim().toLowerCase());
    const hasSrs = Boolean(client.srsDocument && client.srsDocument.trim());
    const currentMilestone = client.milestone || 'Planning';
    const planningStatuses = ['pending', 'to do', 'on hold', 'on-hold'];
    const developmentStatuses = ['in progress', 'in-progress', 'defect', 'done', 'approved', 'completed'];
    const testingStatuses = ['needs review', 'review', 'under review', 'testing'];
    const completionStatuses = ['done', 'approved', 'completed', 'cancelled'];
    const allTasksCompleted =
      normalizedStatuses.length > 0 &&
      normalizedStatuses.every((status) => completionStatuses.includes(status));
    const hasTestingTasks = normalizedStatuses.some((status) =>
      testingStatuses.includes(status)
    );
    const hasDevelopmentTasks = normalizedStatuses.some((status) =>
      developmentStatuses.includes(status)
    );
    const allTasksPending =
      normalizedStatuses.length > 0 &&
      normalizedStatuses.every((status) => planningStatuses.includes(status));

    let newMilestone = 'Planning';

    if (allTasksCompleted) {
      newMilestone = ['Deployment', 'Completed'].includes(currentMilestone) ? 'Completed' : 'Deployment';
    } else if (hasDevelopmentTasks) {
      newMilestone = 'Development';
    } else if (hasTestingTasks) {
      newMilestone = 'Testing';
    } else if (allTasksPending || hasSrs) {
      newMilestone = hasSrs ? 'Design' : 'Planning';
    }

    if (client.milestone !== newMilestone) {
      client.milestone = newMilestone;
      client.milestoneHistory.push({ milestone: newMilestone, date: new Date() });
      await client.save();
    }

    res.json(client);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/intern/accept-offer
// @desc    Accept internship offer
// @access  Private (intern)
app.post('/api/intern/accept-offer', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Find the user and update their offer status
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'intern') {
      return res.status(403).json({ message: 'Only interns can accept offers' });
    }
    
    // Update the user's offer status
    user.offerStatus = 'accepted';
    user.offerAcceptedDate = new Date();
    user.internshipStatus = 'in_progress';

    // Create/link Internship record (so intern dashboard becomes "working")
    let internship = null;
    if (user.currentInternship) {
      internship = await Internship.findById(user.currentInternship);
    }

    if (!internship) {
      internship = await Internship.findOne({ intern: user._id, status: { $in: ['in_progress', 'completed'] } }).sort({ createdAt: -1 });
    }

    if (!internship) {
      const application = await InternshipApplication.findOne({ internUser: user._id }).sort({ updatedAt: -1 });
      const titleFromApp = application?.role ? `${application.role} Internship` : null;

      internship = await Internship.create({
        intern: user._id,
        application: application?._id,
        internshipTitle: titleFromApp || 'Nexbyte_Core Internship Program',
        status: 'in_progress',
        startDate: user.internshipStartDate || new Date(),
        endDate: user.internshipEndDate || undefined,
      });
    }

    user.currentInternship = internship._id;
    await user.save();

    // AUTO-ASSIGN ONBOARDING TASKS
    try {
      const onboardingTasks = [
        {
          title: 'Complete Intern Profile',
          description: 'Update your first name, last name, phone, bio and skills in the Profile Settings section of your dashboard.',
          priority: 'High',
          status: 'To Do',
          reward_amount_in_INR: 100,
          assignedTo: user._id,
        },
        {
          title: 'Setup Dev Environment',
          description: 'Follow the repository readme to set up your local development environment and ensure the project runs successfully.',
          priority: 'High',
          status: 'To Do',
          reward_amount_in_INR: 200,
          assignedTo: user._id,
        },
        {
          title: 'Review Company Processes',
          description: 'Read the company onboarding documents and understand the sprint cycles and reporting requirements.',
          priority: 'Medium',
          status: 'To Do',
          reward_amount_in_INR: 50,
          assignedTo: user._id,
        }
      ];

      // Check if tasks already exist to avoid duplicates
      const existingOnboardingTasks = await Task.find({ 
        assignedTo: user._id, 
        title: { $in: onboardingTasks.map(t => t.title) } 
      });

      if (existingOnboardingTasks.length === 0) {
        await Task.insertMany(onboardingTasks);
        console.log(`Successfully assigned ${onboardingTasks.length} onboarding tasks to ${user.email}`);
      }
    } catch (taskError) {
      console.error('Error creating onboarding tasks:', taskError);
    }
    
    // Send confirmation email
    const mailOptions = {
      from: getFromAddress('NexByte'),
      to: user.email,
      subject: 'Internship Offer Accepted - Confirmation',
      html: `
        <p>Dear ${user.email},</p>
        <p>Thank you for accepting your internship offer at Nexbyte_Core!</p>
        <p>We are excited to have you join our team. Your acceptance has been recorded and we will be in touch with next steps.</p>
        <p>Acceptance Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>Welcome aboard!</p>
        <p>Sincerely,</p>
        <p>The Nexbyte_Core Team</p>
      `,
    };
    
    try {
      const result = await sendMailSafe(mailOptions, 'intern-offer-accepted');
      if (result.success) console.log('Offer acceptance email sent to:', user.email);
    } catch (emailError) {
      console.error('Error sending acceptance email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.json({ 
      message: 'Offer accepted successfully',
      offerStatus: 'accepted',
      internshipStatus: user.internshipStatus,
      currentInternship: user.currentInternship,
    });
    
  } catch (err) {
    console.error('Error accepting offer:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/intern/reject-offer
// @desc    Reject internship offer
// @access  Private (intern)
app.post('/api/intern/reject-offer', auth, async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    // Find the user and update their offer status
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'intern') {
      return res.status(403).json({ message: 'Only interns can reject offers' });
    }
    
    // Update the user's offer status
    user.offerStatus = 'rejected';
    user.rejectionReason = reason.trim();
    user.offerRejectedDate = new Date();
    user.internshipStatus = 'not_started';
    user.currentInternship = undefined;
    await user.save();
    
    // Send rejection notification email
    const mailOptions = {
      from: getFromAddress('NexByte'),
      to: user.email,
      subject: 'Internship Offer Rejection Received',
      html: `
        <p>Dear ${user.email},</p>
        <p>We have received your decision to decline the internship offer at Nexbyte_Core.</p>
        <p>Rejection Reason: ${reason.trim()}</p>
        <p>We understand that career decisions are important and we respect your choice. We wish you the best in your future endeavors.</p>
        <p>Rejection Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>Thank you for your time and consideration.</p>
        <p>Sincerely,</p>
        <p>The Nexbyte_Core Team</p>
      `,
    };
    
    // Also notify admin about the rejection
    const adminMailOptions = {
      from: getFromAddress('NexByte System'),
      to: process.env.ADMIN_EMAIL || 'nexbyte.dev@gmail.com',
      subject: 'Internship Offer Rejected - Notification',
      html: `
        <p>Admin Notification:</p>
        <p>The following intern has rejected their offer:</p>
        <ul>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>Rejection Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
          <li><strong>Reason:</strong> ${reason.trim()}</li>
        </ul>
      `,
    };
    
    try {
      await sendMailSafe(mailOptions, 'intern-offer-rejected');
      await sendMailSafe(adminMailOptions, 'intern-offer-rejected-admin');
      console.log('Rejection emails sent for:', user.email);
    } catch (emailError) {
      console.error('Error sending rejection emails:', emailError);
      // Don't fail the request if email fails
    }
    
    res.json({ 
      message: 'Offer rejection received. Thank you for your response.',
      offerStatus: 'rejected'
    });
    
  } catch (err) {
    console.error('Error rejecting offer:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// =========================
// Automation (admin-only)
// =========================
app.post('/api/automation/offers/expire', auth, admin, async (req, res) => {
  try {
    const dryRun = Boolean(req.body && req.body.dryRun);
    const result = await expirePendingOffersAndNotify({ dryRun });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Error running offer expiry automation:', err);
    return res.status(500).json({ ok: false, message: 'Failed to run offer expiry automation', error: err.message });
  }
});

app.post('/api/automation/weekly-progress', auth, admin, async (req, res) => {
  try {
    const dryRun = Boolean(req.body && req.body.dryRun);
    const force = Boolean(req.body && req.body.force);
    const result = await sendWeeklyProgressSummaries({ dryRun, force });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Error running weekly progress automation:', err);
    return res.status(500).json({ ok: false, message: 'Failed to run weekly progress automation', error: err.message });
  }
});

// Cron-friendly automation endpoints (no JWT; protected by AUTOMATION_SECRET)
const isValidAutomationSecret = (req) => {
  const expected = String(process.env.AUTOMATION_SECRET || '').trim();
  if (!expected) return false;
  const provided = String(req.query?.secret || req.params?.secret || req.header('x-automation-secret') || '').trim();
  return provided && provided === expected;
};

app.get('/api/automation/cron/offers-expire', async (req, res) => {
  try {
    if (!isValidAutomationSecret(req)) return res.status(403).json({ ok: false, message: 'Forbidden' });
    const dryRun = String(req.query?.dryRun || '').toLowerCase() === 'true';
    const result = await expirePendingOffersAndNotify({ dryRun });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Cron offers-expire error:', err);
    return res.status(500).json({ ok: false, message: 'Cron run failed', error: err.message });
  }
});

app.get('/api/automation/cron/offers-expire/:secret', async (req, res) => {
  try {
    if (!isValidAutomationSecret(req)) return res.status(403).json({ ok: false, message: 'Forbidden' });
    const dryRun = String(req.query?.dryRun || '').toLowerCase() === 'true';
    const result = await expirePendingOffersAndNotify({ dryRun });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Cron offers-expire error:', err);
    return res.status(500).json({ ok: false, message: 'Cron run failed', error: err.message });
  }
});

app.get('/api/automation/cron/weekly-progress', async (req, res) => {
  try {
    if (!isValidAutomationSecret(req)) return res.status(403).json({ ok: false, message: 'Forbidden' });
    const dryRun = String(req.query?.dryRun || '').toLowerCase() === 'true';
    const result = await sendWeeklyProgressSummaries({ dryRun, force: true });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Cron weekly-progress error:', err);
    return res.status(500).json({ ok: false, message: 'Cron run failed', error: err.message });
  }
});

app.get('/api/automation/cron/weekly-progress/:secret', async (req, res) => {
  try {
    if (!isValidAutomationSecret(req)) return res.status(403).json({ ok: false, message: 'Forbidden' });
    const dryRun = String(req.query?.dryRun || '').toLowerCase() === 'true';
    const result = await sendWeeklyProgressSummaries({ dryRun, force: true });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Cron weekly-progress error:', err);
    return res.status(500).json({ ok: false, message: 'Cron run failed', error: err.message });
  }
});

// Intern Panel API Endpoints

// Middleware to verify token and check if user is intern
const verifyIntern = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    
    // Check if user is intern
    User.findById(req.user.id).then(user => {
      if (!user || user.role !== 'intern') {
        return res.status(403).json({ message: 'Access denied. Intern role required.' });
      }
      req.userObj = user;
      next();
    }).catch(err => {
      res.status(401).json({ message: 'Token is not valid' });
    });
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get intern tasks
app.get('/api/tasks', verifyIntern, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'firstName lastName email')
      .populate('client', 'companyName email');
    
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get intern diary entries
app.get('/api/diary', verifyIntern, async (req, res) => {
  try {
    const diaryEntries = await Diary.find({ intern: req.user.id })
      .sort({ date: -1 });
    
    res.json(diaryEntries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create diary entry
app.post('/api/diary', verifyIntern, async (req, res) => {
  try {
    const { content, mood } = req.body;
    
    const newDiaryEntry = new Diary({
      intern: req.user.id,
      content,
      mood: mood || 'neutral'
    });
    
    const diaryEntry = await newDiaryEntry.save();
    res.json(diaryEntry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get intern reports
app.get('/api/reports', verifyIntern, async (req, res) => {
  try {
    const reports = await Report.find({ intern: req.user.id })
      .sort({ date: -1 });
    
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

const tryParseJsonObject = (text) => {
  if (!text) return null;
  const trimmed = String(text).trim();

  // Fast path: exact JSON
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    // continue
  }

  // Fallback: extract first {...} block
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;

  const slice = trimmed.slice(firstBrace, lastBrace + 1);
  try {
    const parsed = JSON.parse(slice);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

// AI Growth analysis for intern dashboard
app.post('/api/intern/growth-analysis', verifyIntern, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
    }

    const windowDaysRaw = Number(req.body?.windowDays);
    const windowDays = Number.isFinite(windowDaysRaw) ? windowDaysRaw : 30;
    const safeWindowDays = Math.max(7, Math.min(180, Math.floor(windowDays)));

    const since = new Date(Date.now() - safeWindowDays * 24 * 60 * 60 * 1000);

    const [tasks, reports, diary] = await Promise.all([
      Task.find({ assignedTo: req.user.id, createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(50),
      Report.find({ intern: req.user.id, date: { $gte: since } }).sort({ date: -1 }).limit(20),
      Diary.find({ intern: req.user.id, date: { $gte: since } }).sort({ date: -1 }).limit(20),
    ]);

    const normalizeStatus = (s) => String(s || '').trim().toLowerCase();
    const isCompleted = (status) => {
      const st = normalizeStatus(status);
      return st === 'completed' || st === 'done' || st === 'approved';
    };

    const completedTasks = tasks.filter(t => isCompleted(t.status));
    const inProgressTasks = tasks.filter(t => {
      const st = normalizeStatus(t.status);
      return st === 'in-progress' || st === 'in progress' || st === 'review' || st === 'testing';
    });

    const sum = (arr, pick) => arr.reduce((acc, x) => acc + (Number(pick(x)) || 0), 0);

    const metrics = {
      windowDays: safeWindowDays,
      tasks: {
        total: tasks.length,
        completed: completedTasks.length,
        inProgress: inProgressTasks.length,
        estimatedHoursTotal: sum(tasks, t => t.estimated_effort_hours),
        rewardInrCompleted: sum(completedTasks, t => t.reward_amount_in_INR),
      },
      reports: {
        count: reports.length,
        avgPerformanceScore:
          reports.length ? Math.round(sum(reports, r => r.performanceScore) / reports.length) : null,
        totalHoursWorked: sum(reports, r => r.hoursWorked),
      },
      diary: {
        count: diary.length,
        moods: diary.reduce((acc, d) => {
          const mood = String(d.mood || 'neutral');
          acc[mood] = (acc[mood] || 0) + 1;
          return acc;
        }, {}),
      },
    };

    const payload = {
      metrics,
      tasks: tasks.slice(0, 25).map(t => ({
        title: t.title,
        status: t.status,
        estimated_effort_hours: t.estimated_effort_hours,
        reward_amount_in_INR: t.reward_amount_in_INR,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
      })),
      reports: reports.slice(0, 12).map(r => ({
        date: r.date,
        performanceScore: r.performanceScore,
        tasksCompleted: r.tasksCompleted,
        hoursWorked: r.hoursWorked,
        skillsLearned: r.skillsLearned,
        feedback: r.feedback,
      })),
      diary: diary.slice(0, 10).map(d => ({
        date: d.date,
        mood: d.mood,
        content: String(d.content || '').slice(0, 500),
      })),
    };

    const promptText = `
You are an internship performance coach. Analyze the intern's activity for the last ${safeWindowDays} days.
Return ONLY valid JSON (no markdown, no extra text).
Schema:
{
  "overall_score": number (0-100 integer),
  "summary": string,
  "strengths": string[],
  "improvement_areas": string[],
  "next_7_days_plan": string[],
  "suggested_skills": string[],
  "risk_flags": string[]
}
If data is insufficient, be honest and keep arrays short.
Data:
${JSON.stringify(payload)}
    `.trim();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(promptText);
    const response = await result.response;
    const text = response.text();
    const parsed = tryParseJsonObject(text);

    return res.json({
      metrics,
      analysis: parsed || { summary: text },
    });
  } catch (err) {
    console.error('Error generating intern growth analysis:', err);
    return res.status(500).json({ message: 'Failed to generate growth analysis', error: err.message });
  }
});

// Get intern notifications
app.get('/api/notifications', verifyIntern, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(20);
    
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get group meetings for admin
app.get('/api/group-meetings', auth, admin, async (req, res) => {
  try {
    const meetings = await GroupMeeting.find()
      .populate('invitedInterns', 'email')
      .populate('createdBy', 'email')
      .sort({ scheduledAt: 1, createdAt: -1 });

    res.json(meetings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a group meeting for interns
app.post('/api/group-meetings', auth, admin, async (req, res) => {
  try {
    const {
      title,
      description,
      meetLink,
      scheduledAt,
      durationMinutes,
      audience = 'all',
      invitedInterns = [],
    } = req.body;

    if (!title || !description || !meetLink || !scheduledAt) {
      return res.status(400).json({ message: 'Title, description, meet link and scheduled date/time are required' });
    }

    const normalizedAudience = audience === 'selected' ? 'selected' : 'all';
    const normalizedInvitedInterns = Array.isArray(invitedInterns)
      ? invitedInterns.filter(Boolean)
      : [];

    let targetInterns = [];
    if (normalizedAudience === 'selected') {
      if (normalizedInvitedInterns.length === 0) {
        return res.status(400).json({ message: 'Select at least one intern for a selected group meet' });
      }

      targetInterns = await User.find({
        _id: { $in: normalizedInvitedInterns },
        role: 'intern',
      }).select('email');

      if (targetInterns.length !== normalizedInvitedInterns.length) {
        return res.status(400).json({ message: 'One or more selected interns are invalid' });
      }
    } else {
      targetInterns = await User.find({ role: 'intern' }).select('email');
    }

    const meeting = new GroupMeeting({
      title: String(title).trim(),
      description: String(description).trim(),
      meetLink: String(meetLink).trim(),
      scheduledAt,
      durationMinutes: Number(durationMinutes) || 60,
      audience: normalizedAudience,
      invitedInterns: normalizedAudience === 'selected' ? normalizedInvitedInterns : [],
      createdBy: req.user.id,
    });

    await meeting.save();

    const meetingDate = new Date(scheduledAt);
    const formattedDate = meetingDate.toLocaleDateString('en-IN');
    const formattedTime = meetingDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (targetInterns.length > 0) {
      await Notification.insertMany(
        targetInterns.map((intern) => ({
          user: intern._id,
          title: `Group Meet: ${meeting.title}`,
          message: `A group meet is scheduled on ${formattedDate} at ${formattedTime}. Join via the shared meeting link.`,
          type: 'general',
          date: meetingDate,
        }))
      );

      await Promise.all(
        targetInterns.map((intern) =>
          sendMailSafe(
            {
              from: getFromAddress('NexByte'),
              to: intern.email,
              subject: `Group Meet Scheduled: ${meeting.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <p>Dear ${intern.email.split('@')[0]},</p>
                  <p>A group meet has been scheduled for interns.</p>
                  <ul>
                    <li><strong>Title:</strong> ${meeting.title}</li>
                    <li><strong>Date:</strong> ${formattedDate}</li>
                    <li><strong>Time:</strong> ${formattedTime}</li>
                    <li><strong>Duration:</strong> ${meeting.durationMinutes} minutes</li>
                  </ul>
                  <p><strong>Agenda:</strong> ${meeting.description}</p>
                  <p><a href="${meeting.meetLink}" target="_blank" rel="noreferrer">Join Group Meet</a></p>
                  <p>Regards,<br/>NexByte Team</p>
                </div>
              `,
            },
            'group-meeting-scheduled'
          )
        )
      );
    }

    const populatedMeeting = await GroupMeeting.findById(meeting._id)
      .populate('invitedInterns', 'email')
      .populate('createdBy', 'email');

    res.status(201).json(populatedMeeting);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get group meetings for current intern
app.get('/api/intern/group-meetings', verifyIntern, async (req, res) => {
  try {
    const meetings = await GroupMeeting.find({
      $or: [
        { audience: 'all' },
        { audience: 'selected', invitedInterns: req.user.id },
      ],
    })
      .populate('createdBy', 'email')
      .sort({ scheduledAt: 1, createdAt: -1 });

    res.json(meetings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT api/intern/tasks/:id
// @desc    Update task status (intern only)
// @access  Private (intern)
app.put('/api/intern/tasks/:id', verifyIntern, async (req, res) => {
  try {
    const { status } = req.body;
    
    console.log('DEBUG: Intern task update request:', {
      taskId: req.params.id,
      userId: req.user.id,
      status: status
    });
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Find the task and ensure it's assigned to this intern
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      console.log('DEBUG: Task not found:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('DEBUG: Found task:', {
      taskId: task._id,
      assignedTo: task.assignedTo,
      userId: req.user.id,
      currentStatus: task.status
    });

    // Check if task is assigned to this intern
    if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
      console.log('DEBUG: Access denied - task not assigned to user');
      return res.status(403).json({ message: 'Access denied. Task not assigned to you.' });
    }

    // Update the task status
    task.status = status;
    const updatedTask = await task.save();
    
    console.log('DEBUG: Task updated successfully:', updatedTask.status);

    // Populate user info for response
    await updatedTask.populate('assignedTo', 'firstName lastName email');
    await updatedTask.populate('client', 'companyName email');

    res.json(updatedTask);
  } catch (err) {
    console.error('ERROR in intern task update:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   PUT api/member/tasks/:id
// @desc    Update task status (member only)
// @access  Private (member)
app.put('/api/member/tasks/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    console.log('DEBUG: Member task update request:', {
      taskId: req.params.id,
      userId: req.user.id,
      status: status
    });
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Find the task and ensure it's assigned to this member
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      console.log('DEBUG: Task not found:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('DEBUG: Found task:', {
      taskId: task._id,
      assignedTo: task.assignedTo,
      userId: req.user.id,
      currentStatus: task.status
    });

    // Check if task is assigned to this member
    if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
      console.log('DEBUG: Access denied - task not assigned to user');
      return res.status(403).json({ message: 'Access denied. Task not assigned to you.' });
    }

    // Update the task status
    task.status = status;
    const updatedTask = await task.save();
    
    console.log('DEBUG: Task updated successfully:', updatedTask.status);

    // Populate user info for response
    await updatedTask.populate('assignedTo', 'firstName lastName email');
    await updatedTask.populate('client', 'companyName email');

    res.json(updatedTask);
  } catch (err) {
    console.error('ERROR in member task update:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get resources
app.get('/api/resources', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'intern') {
      query = {
        $or: [
          { assignmentMode: 'all' },
          { assignmentMode: 'selected', assignedInterns: req.user.id }
        ]
      };
    }

    const resources = await Resource.find(query)
      .populate('assignedInterns', 'email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json(resources);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create resource
app.post('/api/resources', auth, admin, async (req, res) => {
  try {
    const { title, description, type, url, category, difficulty, tags, assignmentMode, assignedInterns } = req.body;

    if (!title || !description || !url) {
      return res.status(400).json({ message: 'Title, description and URL are required' });
    }

    const normalizedTags = Array.isArray(tags)
      ? tags
      : String(tags || '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);

    const normalizedAssignedInterns = Array.isArray(assignedInterns)
      ? assignedInterns
      : String(assignedInterns || '')
          .split(',')
          .map((internId) => internId.trim())
          .filter(Boolean);

    if (assignmentMode === 'selected') {
      if (normalizedAssignedInterns.length === 0) {
        return res.status(400).json({ message: 'Select at least one intern for targeted resources' });
      }

      const validInternCount = await User.countDocuments({
        _id: { $in: normalizedAssignedInterns },
        role: 'intern'
      });

      if (validInternCount !== normalizedAssignedInterns.length) {
        return res.status(400).json({ message: 'One or more selected interns are invalid' });
      }
    }

    const resource = new Resource({
      title: String(title).trim(),
      description: String(description).trim(),
      type,
      url: String(url).trim(),
      category,
      difficulty,
      tags: normalizedTags,
      assignmentMode: assignmentMode === 'selected' ? 'selected' : 'all',
      assignedInterns: assignmentMode === 'selected' ? normalizedAssignedInterns : [],
    });

    await resource.save();
    const populatedResource = await Resource.findById(resource._id).populate('assignedInterns', 'email');
    res.status(201).json(populatedResource);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete resource
app.delete('/api/resources/:id', auth, admin, async (req, res) => {
  try {
    const deletedResource = await Resource.findByIdAndDelete(req.params.id);
    if (!deletedResource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get presentation topics (admin)
app.get('/api/presentation-topics', auth, admin, async (req, res) => {
  try {
    const topics = await PresentationTopic.find()
      .populate('intern', 'email')
      .populate('assignedBy', 'email')
      .sort({ createdAt: -1 });

    res.json(topics);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Assign presentation topic to intern
app.post('/api/presentation-topics', auth, admin, async (req, res) => {
  try {
    const { internId, title, description, dueDate } = req.body;

    if (!internId || !title || !description) {
      return res.status(400).json({ message: 'Intern, title and description are required' });
    }

    const intern = await User.findOne({ _id: internId, role: 'intern' }).select('email');
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    const topic = new PresentationTopic({
      intern: internId,
      assignedBy: req.user.id,
      title: String(title).trim(),
      description: String(description).trim(),
      dueDate: dueDate || undefined,
    });

    await topic.save();

    await sendMailSafe(
      {
        from: getFromAddress('NexByte'),
        to: intern.email,
        subject: `Presentation Topic Assigned - ${topic.title}`,
        html: `
          <p>Dear ${intern.email.split('@')[0]},</p>
          <p>A new presentation topic has been assigned to you.</p>
          <ul>
            <li><strong>Topic:</strong> ${topic.title}</li>
            <li><strong>Description:</strong> ${topic.description}</li>
            <li><strong>Due Date:</strong> ${topic.dueDate ? new Date(topic.dueDate).toLocaleDateString('en-IN') : 'Not specified'}</li>
          </ul>
          <p>Please open your intern panel to review the topic and submit your research paper in PDF format.</p>
          <p>Regards,<br/>NexByte Team</p>
        `,
      },
      'presentation-topic-assigned'
    );

    const populatedTopic = await PresentationTopic.findById(topic._id)
      .populate('intern', 'email')
      .populate('assignedBy', 'email');

    res.status(201).json(populatedTopic);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get presentation topics for current intern
app.get('/api/intern/presentation-topics', verifyIntern, async (req, res) => {
  try {
    const topics = await PresentationTopic.find({ intern: req.user.id })
      .populate('assignedBy', 'email')
      .sort({ createdAt: -1 });

    res.json(topics);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Submit research paper for a presentation topic
app.post('/api/intern/presentation-topics/:id/submit', verifyIntern, uploadPdf.single('researchPaper'), async (req, res) => {
  try {
    const topic = await PresentationTopic.findOne({ _id: req.params.id, intern: req.user.id })
      .populate('assignedBy', 'email')
      .populate('intern', 'email');

    if (!topic) {
      return res.status(404).json({ message: 'Presentation topic not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Research paper PDF is required' });
    }

    const uploadedPaper = await uploadPdfToCloudinary(req.file, 'nexbyte_presentation_paper');
    topic.researchPaperUrl = uploadedPaper.secureUrl;
    topic.researchPaperPublicId = uploadedPaper.publicId;
    topic.researchPaperOriginalName = req.file.originalname || 'research-paper.pdf';
    topic.submissionNotes = req.body.submissionNotes ? String(req.body.submissionNotes).trim() : '';
    topic.status = 'submitted';
    topic.submittedAt = new Date();
    await topic.save();

    if (topic.assignedBy?.email) {
      await sendMailSafe(
        {
          from: getFromAddress('NexByte'),
          to: topic.assignedBy.email,
          subject: `Research Paper Submitted - ${topic.title}`,
          html: `
            <p>The assigned intern has submitted a research paper.</p>
            <ul>
              <li><strong>Intern:</strong> ${topic.intern?.email || 'Intern'}</li>
              <li><strong>Topic:</strong> ${topic.title}</li>
              <li><strong>Submitted At:</strong> ${topic.submittedAt ? new Date(topic.submittedAt).toLocaleString('en-IN') : 'Now'}</li>
              <li><strong>Paper:</strong> <a href="${topic.researchPaperUrl}">Open Research Paper</a></li>
            </ul>
            ${topic.submissionNotes ? `<p><strong>Notes:</strong> ${topic.submissionNotes}</p>` : ''}
          `,
        },
        'presentation-topic-submitted'
      );
    }

    res.json(topic);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get team members (all users except current user)
app.get('/api/team', verifyIntern, async (req, res) => {
  try {
    const teamMembers = await User.find({ 
      _id: { $ne: req.user.id },
      role: { $in: ['admin', 'client', 'member'] }
    })
      .select('firstName lastName email role')
      .sort({ lastName: 1, firstName: 1 });
    
    res.json(teamMembers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/intern-payment/:internId
// @desc    Calculate intern payment based on type and growth
// @access  Private
app.get('/api/intern-payment/:internId', auth, async (req, res) => {
  try {
    const intern = await User.findById(req.params.internId);
    
    if (!intern || intern.role !== 'intern') {
      return res.status(404).json({ message: 'Intern not found' });
    }

    if (intern.internType === 'free') {
      // Free intern - company gets money
      res.json({
        internType: 'free',
        paymentToIntern: 0,
        paymentToCompany: 5000, // Example amount
        description: 'Free intern - Company receives payment'
      });
    } else if (intern.internType === 'stipend') {
      // Stipend intern - intern gets money based on growth
      // Fetch intern's growth reports to calculate stipend
      const reports = await Report.find({ user: req.params.internId });
      const avgPerformance = reports.length > 0 
        ? reports.reduce((sum, report) => sum + (report.performanceScore || 0), 0) / reports.length 
        : 0;
      
      const baseStipend = 3000;
      const performanceBonus = avgPerformance > 80 ? 2000 : avgPerformance > 60 ? 1000 : 0;
      const totalStipend = baseStipend + performanceBonus;
      
      res.json({
        internType: 'stipend',
        paymentToIntern: totalStipend,
        paymentToCompany: 0,
        avgPerformance,
        description: `Stipend intern - Intern receives ₹${totalStipend} based on performance`
      });
    } else {
      res.json({
        internType: 'unknown',
        paymentToIntern: 0,
        paymentToCompany: 0,
        description: 'Intern type not specified'
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/interns
// @desc    Get all interns (users with role 'intern')
// @access  Private (admin)
app.get('/api/interns', auth, admin, async (req, res) => {
  try {
    // Get all users (admins, members, and interns) for task assignment
    const users = await User.find({ 
      role: { $in: ['admin', 'intern', 'user', 'member'] } // Include all roles that can be assigned tasks
    })
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Add name field for frontend compatibility
    const usersWithName = users.map(user => ({
      ...user.toObject(),
      name: user.email.split('@')[0] // Use email prefix as name
    }));
    
    console.log('Found users for assignment:', usersWithName.length); // Debug log
    res.json(usersWithName);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   POST api/projects/:projectId/tasks
// @desc    Create a new task for a project
// @access  Private (admin)
app.post('/api/projects/:projectId/tasks', auth, admin, async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo, status } = req.body;
    
    const newTask = new Task({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      status,
      project: req.params.projectId
    });

    await newTask.save();
    await sendTaskAssignmentEmail(newTask, { isNewTask: true });
    
    const populatedTask = await Task.findById(newTask._id)
      .populate('assignedTo', 'email');
    
    // Add name field for frontend compatibility
    if (populatedTask.assignedTo) {
      populatedTask.assignedTo.name = populatedTask.assignedTo.email.split('@')[0];
    }
    
    res.json(populatedTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/tasks/:id/status
// @desc    Update task status
// @access  Private (admin)
app.put('/api/tasks/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('assignedTo', 'email');
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Add name field for frontend compatibility
    if (updatedTask.assignedTo) {
      updatedTask.assignedTo.name = updatedTask.assignedTo.email.split('@')[0];
    }
    
    res.json(updatedTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/tasks/bulk-assign
// @desc    Bulk assign tasks to an intern
// @access  Private (admin)
app.put('/api/tasks/bulk-assign', auth, admin, async (req, res) => {
  try {
    const { taskIds, assignedTo } = req.body;
    const existingTasks = await Task.find({ _id: { $in: taskIds } }).select('assignedTo');
    
    await Task.updateMany(
      { _id: { $in: taskIds } },
      { assignedTo },
      { new: true }
    );
    
    const populatedTasks = await Task.find({ _id: { $in: taskIds } })
      .populate('assignedTo', 'email');
    
    // Add name field for frontend compatibility
    const tasksWithNames = populatedTasks.map(task => {
      if (task.assignedTo) {
        task.assignedTo.name = task.assignedTo.email.split('@')[0];
      }
      return task;
    });

    const previousAssignmentsById = new Map(
      existingTasks.map((task) => [String(task._id), task.assignedTo])
    );

    await Promise.allSettled(
      populatedTasks.map((task) =>
        sendTaskAssignmentEmail(task, {
          previousAssignedTo: previousAssignmentsById.get(String(task._id)),
        })
      )
    );
    
    res.json(tasksWithNames);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/tasks/bulk-status
// @desc    Bulk update task status
// @access  Private (admin)
app.put('/api/tasks/bulk-status', auth, admin, async (req, res) => {
  try {
    const { taskIds, status } = req.body;
    
    const updatedTasks = await Task.updateMany(
      { _id: { $in: taskIds } },
      { status },
      { new: true }
    );
    
    const populatedTasks = await Task.find({ _id: { $in: taskIds } })
      .populate('assignedTo', 'email');
    
    // Add name field for frontend compatibility
    const tasksWithNames = populatedTasks.map(task => {
      if (task.assignedTo) {
        task.assignedTo.name = task.assignedTo.email.split('@')[0];
      }
      return task;
    });
    
    res.json(tasksWithNames);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/tasks/bulk-delete
// @desc    Bulk delete tasks
// @access  Private (admin)
app.delete('/api/tasks/bulk-delete', auth, admin, async (req, res) => {
  try {
    const { taskIds } = req.body;
    
    await Task.deleteMany({ _id: { $in: taskIds } });
    
    res.json({ message: 'Tasks deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/projects/:projectId/tasks
// @desc    Get all tasks for a specific project
// @access  Private (admin)
app.get('/api/projects/:projectId/tasks', auth, admin, async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log('Fetching tasks for projectId:', projectId); // Debug log
    
    // First check if any tasks exist at all
    const allTasks = await Task.find({});
    console.log('Total tasks in database:', allTasks.length); // Debug log
    
    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'email')
      .sort({ createdAt: -1 });
    
    console.log('Found tasks for project:', tasks.length); // Debug log
    
    // Add name field for frontend compatibility
    const tasksWithNames = tasks.map(task => {
      if (task.assignedTo) {
        task.assignedTo.name = task.assignedTo.email.split('@')[0];
      }
      return task;
    });
    
    console.log('Sending tasks:', tasksWithNames); // Debug log
    res.json(tasksWithNames);
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/projects/:projectId/tasks
// @desc    Create a new task for a project
// @access  Private (admin)
app.post('/api/projects/:projectId/tasks', auth, admin, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, dueDate, assignedTo, status, estimated_effort_hours, reward_amount_in_INR } = req.body;
    
    console.log('Creating task with data:', { title, description, projectId }); // Debug log
    
    const newTask = new Task({
      title, // Fixed: use 'title' instead of 'task_title'
      description, // Fixed: use 'description' instead of 'task_description'
      priority,
      dueDate,
      assignedTo,
      status,
      estimated_effort_hours: estimated_effort_hours || 8, // Default 8 hours
      reward_amount_in_INR: reward_amount_in_INR ?? 500, // Default 500 INR only if undefined
      project: projectId
    });
    
    await newTask.save();
    await sendTaskAssignmentEmail(newTask, { isNewTask: true });
    console.log('Task saved successfully:', newTask._id); // Debug log
    
    const populatedTask = await Task.findById(newTask._id)
      .populate('assignedTo', 'email');
    
    // Add name field for frontend compatibility
    if (populatedTask.assignedTo) {
      populatedTask.assignedTo.name = populatedTask.assignedTo.email.split('@')[0];
    }
    
    res.json(populatedTask);
  } catch (err) {
    console.error('Error creating task:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a single task
// @access  Private (admin)
app.delete('/api/tasks/:id', auth, admin, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Use internship routes
app.use('/api/internship', internshipRoutes);

// =========================
// Internship & Certificate APIs (secured)
// =========================

// Helper to generate human-friendly certificate IDs
const generateCertificateId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NBINT-${ts}-${rand}`;
};

// @route   POST api/internships
// @desc    Create a new internship for an intern (admin only)
// @access  Private (admin)
app.post('/api/internships', auth, admin, async (req, res) => {
  try {
    const { internId, internshipTitle, startDate, endDate, applicationId } = req.body;

    if (!internId || !internshipTitle || !startDate) {
      return res.status(400).json({ message: 'internId, internshipTitle and startDate are required' });
    }

    const intern = await User.findById(internId);
    if (!intern || intern.role !== 'intern') {
      return res.status(404).json({ message: 'Intern not found' });
    }

    const internship = await Internship.create({
      intern: internId,
      internshipTitle,
      startDate,
      endDate,
      application: applicationId || null,
      status: 'in_progress',
    });

    intern.internshipStatus = 'in_progress';
    intern.currentInternship = internship._id;
    if (!intern.internshipStartDate) {
      intern.internshipStartDate = startDate;
    }
    if (endDate && !intern.internshipEndDate) {
      intern.internshipEndDate = endDate;
    }
    await intern.save();

    res.status(201).json(internship);
  } catch (err) {
    console.error('Error creating internship:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/internships/:id/complete
// @desc    Mark internship as completed and generate certificate
// @access  Private (admin)
app.post('/api/internships/:id/complete', auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { endDate } = req.body;

    const internship = await Internship.findById(id).populate('intern');
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    if (internship.status === 'completed' && internship.certificate) {
      const existingCert = await Certificate.findById(internship.certificate);
      return res.json(existingCert);
    }

    internship.status = 'completed';
    if (endDate) {
      internship.endDate = endDate;
    } else if (!internship.endDate) {
      internship.endDate = new Date();
    }

    const intern = internship.intern;
    const internName = `${intern.firstName || ''} ${intern.lastName || ''}`.trim() || intern.email;

    const certificateId = generateCertificateId();
    const certificateUrl = `/certificate/${certificateId}`;
    const payload = {
      internName,
      internshipTitle: internship.internshipTitle,
      startDate: internship.startDate,
      endDate: internship.endDate,
      certificateId,
    };

    const encryptedData = encryptCertificateData(payload);

    const certificate = await Certificate.create({
      intern: intern._id,
      internship: internship._id,
      certificateId,
      certificateUrl,
      encryptedData,
    });

    internship.certificate = certificate._id;
    await internship.save();

    intern.internshipStatus = 'completed';
    intern.currentInternship = internship._id;
    intern.internshipEndDate = internship.endDate;
    await intern.save();

    // AUTO-NOTIFY INTERN ABOUT COMPLETION
    try {
      const publicBaseUrl = String(process.env.PUBLIC_APP_URL || '').replace(/\/$/, '');
      const certificateLink = publicBaseUrl ? `${publicBaseUrl}${certificateUrl}` : certificateUrl;

      const mailOptions = {
        from: getFromAddress('NexByte'),
        to: intern.email,
        subject: '🎉 Congratulations on Completing Your Internship! - NexByte',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Congratulations, ${internName}!</h2>
            <p>We are thrilled to inform you that you have successfully completed your internship as <strong>${internship.internshipTitle}</strong> at NexByte Core.</p>
            <p>Your hard work and contributions have been greatly appreciated.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #dee2e6;">
              <p style="margin: 0;"><strong>Certificate ID:</strong> ${certificateId}</p>
              <p style="margin: 5px 0 0 0;">Certificate Link: <a href="${certificateLink}">${certificateLink}</a></p>
              <p style="margin: 5px 0 0 0;">You can also view and download your digital certificate from your intern dashboard.</p>
            </div>
            <p>We wish you all the best for your future career. Feel free to stay in touch!</p>
            <p>Regards,<br/>The NexByte Core Team</p>
          </div>
        `,
      };
      
      const result = await sendMailSafe(mailOptions, 'internship-completion');
      if (result.success) console.log('Completion email sent to:', intern.email);
    } catch (emailError) {
      console.error('Error sending completion email:', emailError);
    }

    res.status(201).json(certificate);
  } catch (err) {
    console.error('Error completing internship / generating certificate:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



// @route   GET api/internships/me
// @desc    Get current intern's internship & certificate
// @access  Private (intern)
app.get('/api/internships/me', verifyIntern, async (req, res) => {
  try {
    const internUser = await User.findById(req.user.id).select('currentInternship');

    let internship = null;
    if (internUser?.currentInternship) {
      internship = await Internship.findById(internUser.currentInternship).populate('certificate');
      if (internship && internship.intern.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (!internship) {
      internship = await Internship.findOne({ intern: req.user.id })
        .sort({ createdAt: -1 })
        .populate('certificate');
    }

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    let certificate = null;
    let certificateData = null;
    if (internship.certificate && internship.certificate.encryptedData) {
      certificate = internship.certificate;
      try {
        certificateData = decryptCertificateData(certificate.encryptedData);
      } catch (e) {
        console.error('Failed to decrypt certificate data:', e);
      }
    }

    res.json({
      internship,
      certificate,
      certificateData,
    });
  } catch (err) {
    console.error('Error fetching intern internship:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/certificates/me
// @desc    Get all certificates for logged-in intern
// @access  Private (intern)
app.get('/api/certificates/me', verifyIntern, async (req, res) => {
  try {
    const certificates = await Certificate.find({ intern: req.user.id }).sort({ issuedAt: -1 });
    const result = certificates.map(c => {
      let data = null;
      try {
        data = decryptCertificateData(c.encryptedData);
      } catch (e) {
        console.error('Failed to decrypt certificate data for', c._id, e);
      }
      return { certificate: c, data };
    });
    res.json(result);
  } catch (err) {
    console.error('Error fetching certificates:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/certificates/:certificateId
// @desc    Get a single certificate by public certificateId
// @access  Private (admin or owning intern)
app.get('/api/certificates/:certificateId', auth, async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certificateId }).populate('intern');
    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    if (req.user.role !== 'admin' && cert.intern._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let data = null;
    try {
      data = decryptCertificateData(cert.encryptedData);
    } catch (e) {
      console.error('Failed to decrypt certificate data:', e);
    }

    res.json({ certificate: cert, data });
  } catch (err) {
    console.error('Error fetching certificate:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`Server listening on port ${port}`));
}
