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

module.exports = router;
