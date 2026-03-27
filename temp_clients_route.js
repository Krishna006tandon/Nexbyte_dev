const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Client = require('../models/Client');

// Optional email service - only load if email is configured
let emailService = null;
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    emailService = require('../services/emailService');
  }
} catch (error) {
  console.log('Email service not available:', error.message);
}

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Mock clients data - in real app, this would come from database
let mockClients = [
  {
    _id: '1',
    name: 'Tech Corp',
    email: 'contact@techcorp.com',
    phone: '+1-555-0123',
    project: 'Website Development',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'Digital Solutions',
    email: 'info@digitalsolutions.com',
    phone: '+1-555-0124',
    project: 'Mobile App',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    name: 'Innovation Labs',
    email: 'hello@innovationlabs.com',
    phone: '+1-555-0125',
    project: 'API Development',
    status: 'completed',
    createdAt: new Date().toISOString()
  }
];

// Debug endpoint to test JWT token
router.get('/debug-token', (req, res) => {
  const token = req.header('x-auth-token');
  res.json({
    message: 'Debug endpoint',
    token: token ? token.substring(0, 20) + '...' : 'No token found',
    envSecret: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 3) + '...' : 'No JWT_SECRET in env'
  });
});

// Get all clients (admin only) - temporarily removed auth for testing
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('Using mock clients data (MongoDB not connected)');
      return res.json(mockClients);
    }

    const clients = await Client.find().select('-password');
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    // Fallback to mock data on error
    console.log('Falling back to mock clients data due to error');
    res.json(mockClients);
  }
});

// Create new client (admin only) - temporarily removed auth for testing
router.post('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('Using mock client creation (MongoDB not connected)');
      
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
        password
      } = req.body;

      // Password is now required (admin must set it)
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      
      const newClient = {
        _id: Date.now().toString(),
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
        password: password,
        createdAt: new Date().toISOString()
      };
      
      mockClients.push(newClient);
      
      // Send email with credentials to client (only if email service is configured)
      if (emailService) {
        try {
          const emailResult = await emailService.sendClientCredentials(email, contactPerson, password, projectName);
          if (emailResult.success) {
            console.log(`Credentials email sent to ${email}`);
          } else {
            console.error(`Failed to send email to ${email}:`, emailResult.error);
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      } else {
        console.log('Email service not configured - skipping email send');
      }
      
      // Return client with plain password for admin to see
      const clientResponse = { ...newClient, password: password };
      return res.status(201).json(clientResponse);
    }

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
      password
    } = req.body;

    // Password is now required (admin must set it)
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Hash password
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
      password: hashedPassword
    });
    
    const savedClient = await newClient.save();
    
    // Send email with credentials to client (only if email service is configured)
    if (emailService) {
      try {
        const emailResult = await emailService.sendClientCredentials(email, contactPerson, password, projectName);
        if (emailResult.success) {
          console.log(`Credentials email sent to ${email}`);
        } else {
          console.error(`Failed to send email to ${email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    } else {
      console.log('Email service not configured - skipping email send');
    }
    
    // Return client with plain password for admin to see/email
    const clientResponse = savedClient.toObject();
    clientResponse.password = password;
    
    res.status(201).json(clientResponse);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client (admin only) - temporarily removed auth for testing
router.put('/:id', async (req, res) => {
  try {
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
      milestone
    } = req.body;
    
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { 
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
        milestone
      },
      { new: true }
    ).select('-password');

    if (!updatedClient) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client (admin only) - temporarily removed auth for testing
router.delete('/:id', async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    
    if (!deletedClient) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// Get client password (admin only) - temporarily removed auth for testing
router.get('/:id/password', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // For MongoDB clients, we cannot retrieve the hashed password
    // Return a message that password cannot be retrieved
    res.json({ 
      message: 'Password cannot be retrieved for security reasons. Please use the password reset functionality.',
      email: client.email,
      contactPerson: client.contactPerson || client.clientName
    });
  } catch (error) {
    console.error('Error getting client password:', error);
    res.status(500).json({ error: 'Failed to get client password' });
  }
});

// Get current client credentials (admin only) - returns current stored password if available
router.get('/:id/credentials', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Return client info without password for security
    res.json({
      email: client.email,
      contactPerson: client.contactPerson || client.clientName,
      projectName: client.projectName,
      message: 'Password is securely stored and cannot be retrieved. Client can change their own password or admin can reset it.'
    });
  } catch (error) {
    console.error('Error getting client credentials:', error);
    res.status(500).json({ error: 'Failed to get client credentials' });
  }
});

module.exports = router;
