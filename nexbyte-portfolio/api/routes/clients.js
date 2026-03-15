const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Client = require('../models/Client');
const { sendClientCredentials, sendPasswordReset } = require('../services/emailService');

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
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

// Get all clients (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const clients = await Client.find().select('-password');
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Create new client (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
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
      content
    } = req.body;

    // Generate a random password
    const generatePassword = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const plainPassword = generatePassword();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
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
    
    // Send email with credentials to client
    try {
      const emailResult = await sendClientCredentials(email, contactPerson, plainPassword, projectName);
      if (emailResult.success) {
        console.log(`Credentials email sent to ${email}`);
      } else {
        console.error(`Failed to send email to ${email}:`, emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }
    
    // Return client with plain password for admin to see/email
    const clientResponse = savedClient.toObject();
    clientResponse.password = plainPassword;
    
    res.status(201).json(clientResponse);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
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

// Delete client (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
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

// Get client password (admin only)
router.get('/:id/password', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Generate a new temporary password for the client
    const generatePassword = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };
    
    const newPassword = generatePassword();
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update client password
    await Client.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    
    // Send password reset email to client
    try {
      const emailResult = await sendPasswordReset(client.email, client.contactPerson, newPassword);
      if (emailResult.success) {
        console.log(`Password reset email sent to ${client.email}`);
      } else {
        console.error(`Failed to send password reset email to ${client.email}:`, emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
    }
    
    res.json({ password: newPassword });
  } catch (error) {
    console.error('Error getting client password:', error);
    res.status(500).json({ error: 'Failed to get client password' });
  }
});

module.exports = router;
