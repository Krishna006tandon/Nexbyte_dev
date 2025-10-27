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

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "nexbyte.dev@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

// @route   POST api/users
// @desc    Add a new user
// @access  Private (admin)
app.post('/api/users', auth, admin, async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
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
      role: role || 'user',
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Send welcome email
    const mailOptions = {
      from: '"NexByte" <nexbyte.dev@gmail.com>',
      to: email,
      subject: 'Welcome to NexByte!',
      html: `<p>Welcome! Your account has been created.</p><p>Your login email is:</p><p>Email: ${email}</p><p>Please proceed to reset your password.</p>`,
    };

    try {
      console.log('Attempting to send email...');
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    } catch (error) {
      console.error('Error sending email:', error);
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
  const { clientName, projectName, amount } = req.body;

  if (!clientName || !projectName || !amount) {
    return res.status(400).json({ message: 'Client name, project name, and amount are required' });
  }

  const promptText = `
    Generate a concise, professional bill description for the following:
    - Client: ${clientName}
    - Project: ${projectName}
    - Amount: ${amount}

    The description should be a single sentence, suitable for a bill. For example: "Payment for the development of the ${projectName} project."
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
    const bills = await Bill.find().populate('client', 'clientName').sort({ billDate: -1 });
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
  const { status } = req.body;

  try {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    bill.status = status;
    await bill.save();

    res.json(bill);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/bills/:billId/confirm
// @desc    Confirm a bill payment
// @access  Private (client)
app.put('/api/bills/:billId/confirm', auth, client, async (req, res) => {
  const { transactionId } = req.body;

  if (!transactionId) {
    return res.status(400).json({ message: 'Transaction ID is required' });
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

    bill.status = 'Verification Pending';
    bill.transactionId = transactionId;
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
          <p>We have received your payment confirmation for bill ID ${bill._id}.</p>
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

// @route   POST api/generate-tasks
// @desc    Generate tasks for a project using AI
// @access  Private (admin)
app.post('/api/generate-tasks', auth, admin, async (req, res) => {
    const {
        clientId,
        projectName,
        projectGoal,
        total_budget_in_INR,
        fixed_costs_in_INR,
        number_of_tasks_to_generate
    } = req.body;

    if (!clientId || !projectName || !projectGoal || !total_budget_in_INR || !fixed_costs_in_INR || !number_of_tasks_to_generate) {
        return res.status(400).json({ message: 'Please provide all required fields for task generation.' });
    }

    const promptText = `
        You are an AI project planner. Your goal is to generate practical, clear, and budget-aware tasks for a given project.

        INPUT:
        - project_name: "${projectName}"
        - project_goal: "${projectGoal}"
        - number_of_tasks_to_generate: ${number_of_tasks_to_generate}

        WHAT TO DO:
        1. Understand the project and divide it into ${number_of_tasks_to_generate} clear, actionable tasks.
        2. Each task must have:
           - task_title (short and action-oriented, max 8 words)
           - task_description (2-4 meaningful sentences)
           - estimated_effort_hours (numeric, roughly how much time it takes)
        3. Output tasks in valid JSON only.

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

    try {
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
            let reward = Math.max(300, proportionalReward); // Ensure minimum reward
            reward = Math.round(reward / 50) * 50; // Round to nearest 50

            return {
                ...task,
                reward_amount_in_INR: reward,
                client: clientId,
                status: 'To Do'
            };
        });

        const totalAllocated = tasksWithRewards.reduce((sum, task) => sum + task.reward_amount_in_INR, 0);
        if (totalAllocated > remaining_budget) {
            // Handle overallocation if necessary, for now, we'll just log it
            console.warn("Warning: Total allocated rewards exceed the remaining budget.");
        }

        await Task.insertMany(tasksWithRewards);
        res.status(201).json(tasksWithRewards);

    } catch (error) {
        console.error('Error generating or saving tasks with Gemini:', error);
        res.status(500).json({ message: 'Failed to generate or save tasks.', error: error.message });
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

        task.status = status;
        await task.save();

        res.json(task);
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
