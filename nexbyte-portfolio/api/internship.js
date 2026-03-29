const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const InternshipApplication = require('./models/InternshipApplication');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mailSender = require('./mailSender');
const { createTransporter, getFromAddress, getPreviewUrl } = require('./utils/emailTransport');

const getUploadsDir = () =>
  process.env.VERCEL ? '/tmp/uploads/resumes' : path.join(__dirname, '../uploads/resumes');

const ensureUploadsDir = (uploadsDir) => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

const sanitizeFilename = (name) => String(name || 'resume.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');

const saveResumeToLocal = (file) => {
  const uploadsDir = getUploadsDir();
  ensureUploadsDir(uploadsDir);
  const filename = `${Date.now()}-${sanitizeFilename(file.originalname)}`;
  fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
  return filename;
};

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
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return sha1(`${toSign}${apiSecret}`);
};

const uploadResumeToCloudinary = async (file) => {
  const cfg = getCloudinaryConfig();
  if (!cfg) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `nexbyte_resume_${crypto.randomUUID()}`;
  const signature = buildCloudinarySignature({ public_id: publicId, timestamp }, cfg.apiSecret);

  const form = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype || 'application/pdf' });
  form.append('file', blob, file.originalname || 'resume.pdf');
  form.append('api_key', cfg.apiKey);
  form.append('timestamp', String(timestamp));
  form.append('public_id', publicId);
  form.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${cfg.cloudName}/raw/upload`;
  const response = await fetch(url, { method: 'POST', body: form });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg =
      data && data.error && data.error.message
        ? data.error.message
        : `Cloudinary upload failed (${response.status})`;
    throw new Error(msg);
  }

  return { publicId: data.public_id, secureUrl: data.secure_url };
};

const isHttpUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value);

const buildCloudinaryRawUrl = (publicId) => {
  const cfg = getCloudinaryConfig();
  if (!cfg || !publicId) return null;
  const encodedPublicId = String(publicId)
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `https://res.cloudinary.com/${cfg.cloudName}/raw/upload/${encodedPublicId}`;
};

const getApplicationResumeRedirectUrl = (application) => {
  if (!application) return null;
  if (isHttpUrl(application.resumeUrl)) return application.resumeUrl;
  if (isHttpUrl(application.resume)) return application.resume;
  if (application.resumePublicId) return buildCloudinaryRawUrl(application.resumePublicId);
  return null;
};

// Configure multer for file uploads (memory storage; Cloudinary upload in route)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    // Allow only PDF files
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Mock data storage (in production, this would be a database)
// let internshipApplications = [];

let internshipRoles = [
  {
    id: 1,
    name: 'Web Development Intern',
    description: 'Learn full-stack web development with React, Node.js, and modern frameworks',
    duration: '3 months',
    isActive: true,
    requirements: 'Basic HTML, CSS, JavaScript knowledge',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
    mentor: 'John Doe',
    maxInterns: 5,
    currentInterns: 2
  },
  {
    id: 2,
    name: 'Frontend Intern',
    description: 'Focus on modern frontend technologies and UI/UX best practices',
    duration: '2 months',
    isActive: true,
    requirements: 'HTML, CSS, JavaScript basics',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue.js', 'TailwindCSS'],
    mentor: 'Jane Smith',
    maxInterns: 3,
    currentInterns: 1
  }
];

let emailLogs = [];
let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;
  try {
    cachedTransporter = createTransporter();
    return cachedTransporter;
  } catch (e) {
    console.warn('WARNING: Email transport is not configured. Internship emails will not be sent.', e.message);
    cachedTransporter = null;
    return null;
  }
};

const logEmail = ({ type, recipient, subject, status, error, messageId, previewUrl }) => {
  emailLogs.push({
    id: Date.now(),
    type,
    recipient,
    subject,
    sentAt: new Date().toISOString(),
    status,
    error,
    messageId,
    previewUrl,
  });
};

const sendMailLogged = async ({ type, to, subject, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    logEmail({ type, recipient: to, subject, status: 'skipped', error: 'SMTP not configured' });
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: getFromAddress('NexByte'),
      to,
      subject,
      html,
    });

    const previewUrl = getPreviewUrl(info);
    logEmail({ type, recipient: to, subject, status: 'sent', messageId: info.messageId, previewUrl });
    if (previewUrl) console.log('Email preview URL:', previewUrl);
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (e) {
    logEmail({ type, recipient: to, subject, status: 'failed', error: e.message });
    return { success: false, error: e.message };
  }
};

const generateTempPassword = () => {
  // 10 chars temp password
  return Math.random().toString(36).slice(-10);
};

const parseDateOrNull = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const parseAvailabilitySlots = (raw) => {
  if (!raw) return [];

  let values = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      values = parsed;
    } catch (e) {
      values = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  if (!Array.isArray(values)) values = [values];

  const seen = new Set();
  const slots = [];
  for (const v of values) {
    const d = parseDateOrNull(v);
    if (!d) continue;
    const key = d.toISOString();
    if (seen.has(key)) continue;
    seen.add(key);
    slots.push(d);
    if (slots.length >= 10) break;
  }

  return slots;
};

const generateOfferLetterHtml = (email, startDate, endDate, acceptanceDate) => {
  const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD');
  const date = fmt(new Date());
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Subject: Offer of Internship at NexByte_Core</strong></p>
      <p>Dear ${email},</p>
      <p>We are pleased to offer you an internship position at NexByte_Core.</p>
      <p>Your internship will be from <strong>${fmt(startDate)}</strong> to <strong>${fmt(endDate)}</strong>.</p>
      <p>Please confirm your acceptance of this offer by <strong>${fmt(acceptanceDate)}</strong>.</p>
      <p>Sincerely,</p>
      <p>The Nexbyte_Core Team</p>
    </div>
  `;
};

// GET all applications
router.get('/applications', async (req, res) => {
  try {
    const applications = await InternshipApplication.find().sort({ dateApplied: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new application
router.post('/applications', upload.single('resume'), async (req, res) => {
  try {
    let resume = null;
    let resumeUrl = null;
    let resumePublicId = null;
    let resumeOriginalName = null;

    if (req.file) {
      resumeOriginalName = req.file.originalname || null;
      try {
        const uploaded = await uploadResumeToCloudinary(req.file);
        if (uploaded) {
          resume = uploaded.publicId;
          resumePublicId = uploaded.publicId;
          resumeUrl = uploaded.secureUrl;
        } else {
          resume = saveResumeToLocal(req.file);
        }
      } catch (e) {
        console.warn('Cloudinary resume upload failed; falling back to local storage.', e.message);
        resume = saveResumeToLocal(req.file);
      }
    }

    const interviewAvailability = parseAvailabilitySlots(req.body.interviewAvailability);

    const application = new InternshipApplication({
      ...req.body,
      resume,
      resumeUrl,
      resumePublicId,
      resumeOriginalName,
      interviewAvailability,
      dateApplied: new Date()
    });
    
    const savedApplication = await application.save();

    // Send applicant confirmation + admin notification (do not block the request on email issues)
    const applicantSubject = 'Application Received - NexByte Internship';
    const applicantHtml = `
      <p>Dear ${savedApplication.name},</p>
      <p>Thank you for applying to the NexByte Internship program. We have received your application.</p>
      <p><strong>Role:</strong> ${savedApplication.role}</p>
      <p><strong>Date Applied:</strong> ${new Date(savedApplication.dateApplied).toLocaleString()}</p>
      <p>We will review your application and get back to you soon.</p>
      <p>Regards,<br/>NexByte Team</p>
    `;

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER || '';
    const adminSubject = `New Internship Application - ${savedApplication.role}`;
    const adminHtml = `
      <p>New internship application received.</p>
      <ul>
        <li><strong>Name:</strong> ${savedApplication.name}</li>
        <li><strong>Email:</strong> ${savedApplication.email}</li>
        <li><strong>Phone:</strong> ${savedApplication.phone}</li>
        <li><strong>Role:</strong> ${savedApplication.role}</li>
        <li><strong>Date Applied:</strong> ${new Date(savedApplication.dateApplied).toLocaleString()}</li>
      </ul>
    `;

    await sendMailLogged({ type: 'application_received', to: savedApplication.email, subject: applicantSubject, html: applicantHtml });
    if (adminEmail) {
      await sendMailLogged({ type: 'application_received_admin', to: adminEmail, subject: adminSubject, html: adminHtml });
    }

    res.status(201).json(savedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET application by ID
router.get('/applications/:id', async (req, res) => {
  try {
    console.log('Fetching application with ID:', req.params.id);
    const application = await InternshipApplication.findById(req.params.id);
    if (!application) {
      console.log('Application not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Application not found' });
    }
    console.log('Application found:', application);
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET application resume by application ID
router.get('/applications/:id/resume', async (req, res) => {
  try {
    const application = await InternshipApplication.findById(req.params.id).select(
      'resume resumeUrl resumePublicId'
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const redirectUrl = getApplicationResumeRedirectUrl(application);
    if (redirectUrl) {
      return res.redirect(redirectUrl);
    }

    if (application.resume && !isHttpUrl(application.resume)) {
      const uploadsDir = getUploadsDir();
      const filePath = path.join(uploadsDir, application.resume);
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
      if (fs.existsSync(absolutePath)) {
        return res.sendFile(absolutePath);
      }
    }

    return res.status(404).json({ message: 'Resume file not found' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// GET resume file
router.get('/resumes/:filename', async (req, res) => {
  const filename = req.params.filename;
  const uploadsDir = getUploadsDir();
  const filePath = path.join(uploadsDir, filename);

  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
  
  if (fs.existsSync(absolutePath)) {
    res.sendFile(absolutePath);
  } else {
    try {
      const application = await InternshipApplication.findOne({
        $or: [{ resume: filename }, { resumePublicId: filename }],
      }).select('resume resumeUrl resumePublicId');
      const redirectUrl = getApplicationResumeRedirectUrl(application);
      if (redirectUrl) {
        return res.redirect(redirectUrl);
      }
    } catch (e) {
      // ignore and fall through
    }
    res.status(404).json({ message: 'Resume file not found' });
  }
});

// UPDATE application status
router.put('/applications/:id/status', async (req, res) => {
  try {
    const application = await InternshipApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const previousStatus = application.status;
    const { status, notes, interviewDate, interviewMeetLink, rejectionReason, internType, internshipStartDate, internshipEndDate, acceptanceDate } = req.body;

    if (status) application.status = status;
    if (typeof notes === 'string') application.notes = notes;
    if (typeof rejectionReason === 'string') application.rejectionReason = rejectionReason;

    if (typeof interviewDate !== 'undefined') {
      const parsedInterview = parseDateOrNull(interviewDate);
      application.interviewDate = parsedInterview;
    }

    if (typeof interviewMeetLink === 'string') {
      application.interviewMeetLink = interviewMeetLink.trim();
    }

    // If moving to interview stage, interview date + meet link are required
    if (status === 'interview') {
      if (!application.interviewDate) {
        return res.status(400).json({ message: 'Interview date is required for interview status' });
      }
      if (!application.interviewMeetLink) {
        return res.status(400).json({ message: 'Google Meet link is required for interview status' });
      }
      if (!/^https?:\/\//i.test(application.interviewMeetLink)) {
        return res.status(400).json({ message: 'Interview meet link must be a valid URL' });
      }
    }
    
    const updatedApplication = await application.save();

    // Send status email if status changed (best-effort)
    if (status && status !== previousStatus) {
      if (status === 'reviewing') {
        await sendMailLogged({
          type: 'application_reviewing',
          to: updatedApplication.email,
          subject: 'Your Internship Application is Under Review - NexByte',
          html: `
            <p>Dear ${updatedApplication.name},</p>
            <p>Your application for <strong>${updatedApplication.role}</strong> is now under review.</p>
            <p>We will reach out with next steps soon.</p>
            <p>Regards,<br/>NexByte Team</p>
          `,
        });
      } else if (status === 'interview') {
        const tz = process.env.AUTOMATION_TIMEZONE || 'Asia/Kolkata';
        const when = updatedApplication.interviewDate
          ? new Date(updatedApplication.interviewDate).toLocaleString('en-IN', {
              timeZone: tz,
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : null;

        const meetLink = updatedApplication.interviewMeetLink || '';
        await sendMailLogged({
          type: 'application_interview',
          to: updatedApplication.email,
          subject: 'Interview Scheduled - NexByte Internship',
          html: `
            <p>Dear ${updatedApplication.name},</p>
            <p>Your application for <strong>${updatedApplication.role}</strong> has moved to the interview stage.</p>
            ${when ? `<p><strong>Interview Date & Time:</strong> ${when} (${tz})</p>` : ``}
            ${meetLink ? `<p><strong>Google Meet Link:</strong> <a href="${meetLink}">${meetLink}</a></p>` : ``}
            <p>Please join the meeting on time. If you need to reschedule, reply to this email.</p>
            <p>Regards,<br/>NexByte Team</p>
          `,
        });
      } else if (status === 'approved') {
        // Auto-create intern account + email credentials (only once, to avoid resetting password repeatedly)
        if (!application.internUser) {
          const oneDayMs = 24 * 60 * 60 * 1000;
          const start = parseDateOrNull(internshipStartDate) || new Date();
          const end = parseDateOrNull(internshipEndDate) || new Date(Date.now() + 90 * oneDayMs);
          const acceptBy = parseDateOrNull(acceptanceDate) || new Date(Date.now() + 2 * oneDayMs);
          const safeInternType = internType === 'stipend' ? 'stipend' : 'free';

          const offerLetterContent = generateOfferLetterHtml(updatedApplication.email, start, end, acceptBy);
          const plainPassword = generateTempPassword();
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(plainPassword, salt);

          let internUserDoc = await User.findOne({ email: updatedApplication.email });
          if (!internUserDoc) {
            internUserDoc = new User({
              email: updatedApplication.email,
              password: hashedPassword,
              role: 'intern',
              internType: safeInternType,
              internshipStartDate: start,
              internshipEndDate: end,
              acceptanceDate: acceptBy,
              offerLetter: offerLetterContent,
              offerStatus: 'pending',
              internshipStatus: 'not_started',
            });
          } else {
            internUserDoc.password = hashedPassword;
            internUserDoc.role = 'intern';
            internUserDoc.internType = safeInternType;
            internUserDoc.internshipStartDate = start;
            internUserDoc.internshipEndDate = end;
            internUserDoc.acceptanceDate = acceptBy;
            internUserDoc.offerLetter = offerLetterContent;
            internUserDoc.offerStatus = internUserDoc.offerStatus || 'pending';
          }

          await internUserDoc.save();
          application.internUser = internUserDoc._id;
          application.internAccountCreatedAt = new Date();
          await application.save();

          const emailResult = await mailSender.sendUserCredentials(updatedApplication.email, {
            role: 'intern',
            password: plainPassword,
            internshipStartDate: start,
            internshipEndDate: end,
            acceptanceDate: acceptBy,
            offerLetterContent,
          });

          logEmail({
            type: 'intern_credentials',
            recipient: updatedApplication.email,
            subject: '🎓 Welcome to NexByte - Internship Account Created',
            status: emailResult.success ? 'sent' : 'failed',
            error: emailResult.success ? undefined : emailResult.error,
            messageId: emailResult.messageId,
            previewUrl: emailResult.previewUrl,
          });
        } else {
          await sendMailLogged({
            type: 'application_approved',
            to: updatedApplication.email,
            subject: 'Your Internship Application is Approved - NexByte',
            html: `
              <p>Dear ${updatedApplication.name},</p>
              <p>Your application for <strong>${updatedApplication.role}</strong> has been approved.</p>
              <p>Your intern account is already created. Please use your existing credentials to login. If you don’t remember your password, use the “Forgot Password” option.</p>
              <p>Regards,<br/>NexByte Team</p>
            `,
          });
        }
      } else if (status === 'rejected') {
        await sendMailLogged({
          type: 'application_rejected',
          to: updatedApplication.email,
          subject: 'Regarding Your Internship Application - NexByte',
          html: `
            <p>Dear ${updatedApplication.name},</p>
            <p>Thank you for applying for <strong>${updatedApplication.role}</strong>.</p>
            <p>After careful consideration, we are unable to proceed with your application at this time.</p>
            ${updatedApplication.rejectionReason ? `<p><strong>Reason:</strong> ${updatedApplication.rejectionReason}</p>` : ''}
            <p>We wish you the best in your future endeavors.</p>
            <p>Regards,<br/>NexByte Team</p>
          `,
        });
      } else if (status === 'hired') {
        await sendMailLogged({
          type: 'application_hired',
          to: updatedApplication.email,
          subject: 'Welcome Onboard - NexByte Internship',
          html: `
            <p>Dear ${updatedApplication.name},</p>
            <p>Great news! You have been marked as <strong>Hired</strong> for the <strong>${updatedApplication.role}</strong> internship.</p>
            <p>Please login to your intern dashboard for next steps. If you need help accessing your account, use “Forgot Password” or reply to this email.</p>
            <p>Regards,<br/>NexByte Team</p>
          `,
        });
      }
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE application
router.delete('/applications/:id', async (req, res) => {
  try {
    const application = await InternshipApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET email logs
router.get('/email-logs', (req, res) => {
  res.json(emailLogs);
});

// GET internship roles
router.get('/roles', (req, res) => {
  res.json(internshipRoles);
});

// POST new role
router.post('/roles', (req, res) => {
  const role = {
    id: Date.now(),
    ...req.body,
    currentInterns: 0,
    isActive: true
  };
  internshipRoles.push(role);
  res.status(201).json(role);
});

// PUT update role
router.put('/roles/:id', (req, res) => {
  const roleIndex = internshipRoles.findIndex(role => role.id === parseInt(req.params.id));
  if (roleIndex === -1) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  internshipRoles[roleIndex] = { ...internshipRoles[roleIndex], ...req.body };
  res.json(internshipRoles[roleIndex]);
});

// DELETE role
router.delete('/roles/:id', (req, res) => {
  const roleIndex = internshipRoles.findIndex(role => role.id === parseInt(req.params.id));
  if (roleIndex === -1) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  internshipRoles.splice(roleIndex, 1);
  res.json({ message: 'Role deleted successfully' });
});

// Note: Email sending is implemented via SMTP using utils/emailTransport.

// Create uploads directory if it doesn't exist (local dev only)
if (!process.env.VERCEL) {
  const uploadsDirLocal = path.join(__dirname, '../uploads/resumes');
  const uploadsParentDirLocal = path.join(__dirname, '../uploads');

  try {
    // Create parent uploads directory first
    if (!fs.existsSync(uploadsParentDirLocal)) {
      fs.mkdirSync(uploadsParentDirLocal, { recursive: true });
    }
    // Create resumes directory
    if (!fs.existsSync(uploadsDirLocal)) {
      fs.mkdirSync(uploadsDirLocal, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating local upload directories:', error);
  }
}

module.exports = router;
