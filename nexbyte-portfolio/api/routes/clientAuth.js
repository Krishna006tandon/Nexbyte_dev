const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Client = require('../models/Client');

// Client login with password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      // Mock authentication when MongoDB is not connected
      console.log('Using mock client authentication (MongoDB not connected)');
      
      const mockClients = [
        { email: 'dveep@gmail.com', password: 'myCustomPass123', clientName: 'Durga Battery House' },
        { email: 'client@example.com', password: 'password123', clientName: 'Test Client' }
      ];
      
      const mockClient = mockClients.find(c => c.email === email && c.password === password);
      
      if (!mockClient) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Create token
      const token = jwt.sign(
        { clientId: mockClient.email, role: 'client' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        client: {
          id: mockClient.email,
          name: mockClient.clientName,
          email: mockClient.email,
          role: 'client'
        }
      });
    }

    // Check if client exists
    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { clientId: client._id, role: 'client' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      client: {
        id: client._id,
        name: client.clientName,
        email: client.email,
        projectName: client.projectName,
        role: 'client'
      }
    });
  } catch (error) {
    console.error('Client login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get client profile (protected route)
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      // Mock client data
      return res.json({
        id: decoded.clientId,
        name: 'Durga Battery House',
        email: decoded.clientId,
        projectName: 'Durga STE',
        role: 'client'
      });
    }

    const client = await Client.findById(decoded.clientId).select('-password');
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({
      id: client._id,
      name: client.clientName,
      email: client.email,
      projectName: client.projectName,
      projectType: client.projectType,
      projectDeadline: client.projectDeadline,
      totalBudget: client.totalBudget,
      role: 'client'
    });
  } catch (error) {
    console.error('Get client profile error:', error);
    res.status(500).json({ error: 'Failed to get client profile' });
  }
});

// Change client password (protected route)
router.post('/change-password', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      // Mock password change
      console.log('Using mock password change (MongoDB not connected)');
      
      // In mock mode, we'll just return success
      return res.json({ message: 'Password changed successfully' });
    }

    // Get client from database
    const client = await Client.findById(decoded.clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, client.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password in database
    await Client.findByIdAndUpdate(decoded.clientId, { password: hashedNewPassword });

    // Send password change confirmation email (only if email service is configured)
    let emailService = null;
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        emailService = require('../services/emailService');
      }
    } catch (error) {
      console.log('Email service not available:', error.message);
    }

    if (emailService) {
      try {
        const emailResult = await emailService.sendPasswordChangeNotification(
          client.email, 
          client.contactPerson || client.clientName
        );
        if (emailResult.success) {
          console.log(`Password change notification sent to ${client.email}`);
        } else {
          console.error(`Failed to send password change notification to ${client.email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending password change notification:', emailError);
      }
    } else {
      console.log('Email service not configured - skipping password change notification');
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
