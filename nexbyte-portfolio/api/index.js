const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');


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
        res.json({ token, role: role });
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
    res.json(users);
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
app.get('/api/client/data', auth, client, async (req, res) => {
  try {
    const client = await Client.findById(req.user.id).select('-password');
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({
      message: `Welcome, ${client.clientName}`,
      clientData: {
        project: client.projectName,
        status: 'In Progress',
        dueDate: client.projectDeadline,
      },
    });
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

  try {
    // Manually construct the SRS document in HTML format with professional dark theme styling
    const srsContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #e0e0e0;
            background-color: #1a1a1a;
            margin: 0;
            padding: 20px;
          }
          .srs-container {
            max-width: 800px;
            margin: auto;
            background: #2c2c2c;
            padding: 30px;
            border: 1px solid #444;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
          }
          h1, h2, h3 {
            color: #5dade2;
            border-bottom: 2px solid #555;
            padding-bottom: 10px;
            margin-top: 20px;
          }
          h1 {
            text-align: center;
            font-size: 2.5em;
            margin-bottom: 0;
          }
          h2 {
            text-align: center;
            font-size: 1.5em;
            margin-top: 0;
            border-bottom: none;
          }
          p {
            margin-bottom: 10px;
          }
          strong {
            color: #5dade2;
          }
          div {
            padding-left: 20px;
            border-left: 3px solid #444;
          }
        </style>
      </head>
      <body>
        <div class="srs-container">
          <h1>Software Requirements Specification (SRS)</h1>
          <h2>for</h2>
          <h1>${projectName}</h1>
          <br/>
          
          <h3>1. Introduction</h3>
          <p><strong>1.1 Purpose:</strong> The purpose of this document is to provide a detailed description of the requirements for the ${projectName}.</p>
          <p><strong>1.2 Scope:</strong> The system will ${projectDescription}.</p>
          <p><strong>1.3 Overview:</strong> This document outlines the functional and non-functional requirements for the project.</p>
          
          <h3>2. Overall Description</h3>
          <p><strong>2.1 Product Perspective:</strong> To be defined.</p>
          <p><strong>2.2 Product Functions:</strong> The system will allow users to perform the functions outlined in the functional requirements section.</p>
          <p><strong>2.3 User Characteristics:</strong> The target audience for this system is ${targetAudience || 'Not specified'}.</p>
          <p><strong>2.4 Constraints:</strong> To be defined.</p>
          <p><strong>2.5 Assumptions and Dependencies:</strong> To be defined.</p>
          
          <h3>3. System Features</h3>
          <p><strong>3.1 Functional Requirements:</strong></p>
          <div>${functionalRequirements || 'No functional requirements specified.'}</div>
          
          <h3>4. External Interface Requirements</h3>
          <p><strong>4.1 User Interfaces:</strong> To be defined.</p>
          <p><strong>4.2 Hardware Interfaces:</strong> To be defined.</p>
          <p><strong>4.3 Software Interfaces:</strong> To be defined.</p>
          <p><strong>4.4 Communications Interfaces:</strong> To be defined.</p>

          <h3>5. Non-functional Requirements</h3>
          <div>${nonFunctionalRequirements || 'No non-functional requirements specified.'}</div>
        </div>
      </body>
    </html>
    `;

    res.json({ srs: srsContent });
    
  } catch (err) {
    console.error('Error generating SRS:', err);
    res.status(500).json({ message: 'An unexpected error occurred during SRS generation.' });
  }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`Server listening on port ${port}`));
}