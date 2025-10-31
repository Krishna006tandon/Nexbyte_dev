const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
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


const app = express();

app.use(express.json());
app.use(helmet());
app.use(cookieParser());

const csrfProtection = csurf({ cookie: true });

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

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    let role = 'user';
    let userId = '';

    if (user) {
      role = user.role;
      userId = user.id;
    } else {
      const client = await Client.findOne({ email });
      if (!client) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      user = client;
      role = 'client';
      userId = client.id;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
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

const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer'); // Import puppeteer

// Helper function to generate offer letter content
const generateOfferLetter = (email, duration) => {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const durationText = duration ? `<p>Your internship will be for a duration of <strong>${duration}</strong>.</p>` : '';
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Subject: Offer of Internship at NexByte_Dev</strong></p>
      <p>Dear ${email},</p>
      <p>We are pleased to offer you an internship position at NexByte_Dev. We were very impressed with your qualifications and believe you would be a valuable addition to our team.</p>
      ${durationText}
      <p>This internship will provide you with an excellent opportunity to gain practical experience and contribute to real-world projects. We are excited to have you join us.</p>
      <p>Further details regarding your internship, including start date, duration, and responsibilities, will be communicated to you shortly.</p>
      <p>We look forward to welcoming you to NexByte_Dev!</p>
      <p>Sincerely,</p>
      <p>The NexByte_Dev Team</p>
    </div>
  `;
};

// Check for EMAIL_PASSWORD environment variable
if (!process.env.EMAIL_PASSWORD) {
  console.warn('WARNING: process.env.EMAIL_PASSWORD is not set. Email sending may fail. Please ensure it is configured in your .env file.');
}

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "nexbyte.dev@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true, // Enable debug output
  logger: true // Enable console logging
});

// @route   POST api/users
// @desc    Add a new user
// @access  Private (admin)
app.post('/api/users', auth, admin, async (req, res) => {
  const { email, password, role, internshipDuration } = req.body;

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
    let offerLetterPdfBuffer = null;

    if (role === 'intern') {
      offerLetterContent = generateOfferLetter(email, internshipDuration);
      // Generate PDF from HTML content using Puppeteer
      let browser;
      try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(offerLetterContent, { waitUntil: 'networkidle0' });
        offerLetterPdfBuffer = await page.pdf({ format: 'A4' });
      } catch (pdfError) {
        console.error('Error generating PDF with Puppeteer:', pdfError.message, pdfError.stack);
        // Continue without PDF if generation fails
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    }

    user = new User({
      email,
      password,
      role: role || 'user',
      offerLetter: offerLetterContent, // Save offer letter HTML if generated
      internshipDuration: role === 'intern' ? internshipDuration : undefined, // Save internship duration
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Send welcome email
    let emailHtml = `<p>Welcome! Your account has been created.</p><p>Your login email is: <strong>${email}</strong></p><p>Your temporary password is: <strong>${plainTextPassword}</strong></p><p>Please log in and consider changing your password.</p>`;

    if (offerLetterContent) {
      emailHtml += `<p>Please find your offer letter attached.</p>`;
    }

    const mailOptions = {
      from: '"NexByte" <nexbyte.dev@gmail.com>',
      to: email,
      subject: 'Welcome to NexByte!',
      html: emailHtml,
      attachments: []
    };

    if (offerLetterPdfBuffer) {
      mailOptions.attachments.push({
        filename: 'OfferLetter.pdf',
        content: offerLetterPdfBuffer,
        contentType: 'application/pdf'
      });
    }

    // Explicitly check EMAIL_PASSWORD before attempting to send mail
    if (!process.env.EMAIL_PASSWORD) {
      console.error('Email not sent: process.env.EMAIL_PASSWORD is not defined. Please set it in your .env file.');
      return res.status(500).json({ message: 'User created, but email could not be sent due to missing email password configuration.' });
    }

    try {
      console.log('Attempting to send email...');
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    } catch (error) {
      console.error('Error sending welcome email:', error.message, error.stack);
      // Provide more specific guidance based on common errors
      if (error.code === 'EAUTH') {
        console.error('Authentication error: Check your EMAIL_PASSWORD. For Gmail, ensure you are using an App Password if 2FA is enabled, or have "Less secure app access" enabled.');
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.error('Connection error: The server could not reach the email host. Check network, firewall, and host/port settings.');
      }
      return res.status(500).json({ message: 'User created, but email could not be sent. Check server logs for details.' });
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
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
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
    const password = generatePassword();
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

    // Send welcome email
    const mailOptions = {
      from: '"NexByte" <nexbyte.dev@gmail.com>',
      to: email,
      subject: 'Welcome to NexByte!',
      html: `
        <p>Welcome! Your project "${projectName}" has been registered with us.</p>
        <h2>Client Details:</h2>
        <ul>
          <li><strong>Client/Company Name:</strong> ${clientName}</li>
          <li><strong>Contact Person's Name:</strong> ${contactPerson}</li>
          <li><strong>Email Address:</strong> ${email}</li>
          <li><strong>Phone Number:</strong> ${phone}</li>
          <li><strong>Company Address:</strong> ${companyAddress}</li>
        </ul>
        <h2>Project Details:</h2>
        <ul>
          <li><strong>Project Name:</strong> ${projectName}</li>
          <li><strong>Project Type:</strong> ${projectType}</li>
          <li><strong>Project Requirements:</strong> ${projectRequirements}</li>
          <li><strong>Project Deadline:</strong> ${projectDeadline}</li>
          <li><strong>Total Budget:</strong> ${totalBudget}</li>
        </ul>
        <h2>Billing and Payment Information:</h2>
        <ul>
          <li><strong>Billing Address:</strong> ${billingAddress}</li>
          <li><strong>GST Number:</strong> ${gstNumber}</li>
          <li><strong>Payment Terms:</strong> ${paymentTerms}</li>
          <li><strong>Payment Method:</strong> ${paymentMethod}</li>
        </ul>
        <h2>Technical Details:</h2>
        <ul>
          <li><strong>Domain Registrar Login:</strong> ${domainRegistrarLogin}</li>
          <li><strong>Web Hosting Login:</strong> ${webHostingLogin}</li>
          <li><strong>Logo and Branding Files:</strong> ${logoAndBrandingFiles}</li>
          <li><strong>Content:</strong> ${content}</li>
        </ul>
        <h2>Login Credentials:</h2>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li>Please reset your password on the first login.</li>
        </ul>
      `,
    };

    try {
      console.log('Attempting to send email...');
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    } catch (error) {
      console.error('Error sending email:', error);
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

// @route   POST api/bills
// @desc    Create a new bill
// @access  Private (admin)
app.post('/api/bills', auth, admin, async (req, res) => {
  const { client, amount, dueDate, status, description } = req.body;

  try {
    const newBill = new Bill({
      client,
      amount,
      dueDate,
      status,
      description,
    });

    await newBill.save();
    res.json(newBill);
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
        from: '"NexByte" <nexbyte.dev@gmail.com>',
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
        const info = await transporter.sendMail(mailOptions);
        console.log('Payment confirmation email sent:', info.response);
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
      from: '"NexByte" <nexbyte.dev@gmail.com>',
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
      const info = await transporter.sendMail(mailOptions);
      console.log('SRS Email sent:', info.response);
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








const Task = require('./models/Task');

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
        fixed_costs_in_INR
    } = req.body;

    if (!clientId || !projectName || !projectGoal || !total_budget_in_INR || !fixed_costs_in_INR) {
        return res.status(400).json({ message: 'Please provide all required fields for task generation.' });
    }

    try {
        // Fetch client to get SRS document
        const client = await Client.findById(clientId);
        const srsContent = client ? client.srsDocument : 'No SRS provided.';

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
            4. Each task must have:
               - task_title (short, action-oriented, max 8 words, e.g., "Develop User Login API")
               - task_description (2-4 meaningful sentences explaining the task)
               - estimated_effort_hours (a numeric estimate of hours required)
            5. The tasks should be broken down into logical, manageable chunks.
            6. Output the list of tasks in valid JSON only. Do not output markdown or any other text.

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

        const remaining_budget = total_budget_in_INR - fixed_costs_in_INR;
        const total_effort = generatedTasks.reduce((sum, task) => sum + task.estimated_effort_hours, 0);

        if (total_effort === 0) {
            return res.status(400).json({ message: 'Total estimated effort is zero, cannot allocate budget.' });
        }

        const tasksWithRewards = generatedTasks.map(task => {
            const proportionalReward = (task.estimated_effort_hours / total_effort) * remaining_budget;
            let reward = Math.max(300, proportionalReward);
            reward = Math.round(reward / 50) * 50;

            return {
                ...task,
                reward_amount_in_INR: reward,
                client: clientId,
                status: 'To Do'
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
        await Task.insertMany(tasks);
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

        task.assignedTo = userId;
        await task.save();

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

    const tasks = await Task.find({ client: clientId });

    let newMilestone = 'Planning'; // Default milestone

    if (tasks.length > 0) {
      const taskStatuses = tasks.map(task => task.status);

      if (taskStatuses.every(status => status === 'Done')) {
        newMilestone = 'Completed';
      } else if (taskStatuses.some(status => status === 'Needs Review' || status === 'Defect')) {
        newMilestone = 'Testing';
      } else if (taskStatuses.some(status => status === 'In Progress' || status === 'Done')) {
        newMilestone = 'Development';
      } else if (taskStatuses.every(status => status === 'To Do')) {
        newMilestone = 'Planning';
      }
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

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`Server listening on port ${port}`));
}
