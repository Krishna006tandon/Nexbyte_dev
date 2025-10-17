const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(express.json());

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

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

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
        if (err) throw err;
        res.json({ token, role: user.role });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/hello', (req, res) => {
    res.json({ message: "Hello from server!" });
});

const Contact = require('./models/Contact');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');

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

app.post('/api/contact', async (req, res) => {
  const { name, email, mobile, message } = req.body;

  if (!name || !email || !mobile || !message) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  const emailRegex = /^(([^<>()[\\]\\.,;:\s@\"]+(\.[^<>()[\\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\\.)+[a-zA-Z]{2,}))$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({ message: 'Invalid mobile number format' });
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
    pass: "huwt cbde ccev xxnu",
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
      html: `<p>Welcome! Your account has been created.</p><p>Your login credentials are:</p><p>Email: ${email}</p><p>Password: ${password}</p>`,
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
          <li><strong>Password:</strong> ${password}</li>
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
    const client = await Client.findById(req.params.id).select('password');
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ password: client.password });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/generate-srs
// @desc    Generate SRS document
// @access  Private (admin)
app.post('/api/generate-srs', auth, admin, async (req, res) => {
  const { projectName, projectDescription, targetAudience, functionalRequirements, nonFunctionalRequirements } = req.body;

  if (!projectName || !projectDescription) {
    return res.status(400).json({ message: 'Project name and description are required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ message: 'Gemini API key not configured' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = `
      Create a comprehensive Software Requirements Specification (SRS) document based on the following details:

      **Project Name:** ${projectName}

      **Project Description:** ${projectDescription}

      **Target Audience:** ${targetAudience}

      **Functional Requirements:** 
      ${functionalRequirements}

      **Non-Functional Requirements:**
      ${nonFunctionalRequirements}

      Please structure the SRS with the following sections:
      1.  **Introduction**: 
          - Purpose of the document
          - Scope of the project
          - Overview of the system
      2.  **Overall Description**:
          - Product Perspective
          - Product Functions
          - User Characteristics
          - Constraints
          - Assumptions and Dependencies
      3.  **System Features**:
          - Detailed breakdown of functional requirements. For each, describe the feature and its purpose.
      4.  **External Interface Requirements**:
          - User Interfaces
          - Hardware Interfaces
          - Software Interfaces
          - Communications Interfaces
      5.  **Non-functional Requirements**:
          - Performance Requirements
          - Safety Requirements
          - Security Requirements
          - Software Quality Attributes
      
      Generate a detailed and professional SRS document in HTML format.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
  } catch (err) {
    console.error('Error generating SRS:', err);
    res.status(500).json({ message: err.message || 'An unexpected error occurred during SRS generation.' });
  }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`Server listening on port ${port}`));
}