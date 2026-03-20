const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

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

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Return mock data when MongoDB is not connected
      // Handle both mock users (email as userId) and real users (ObjectId as userId)
    //   let mockUser;
      
    //   if (req.user.userId && req.user.userId.includes('@')) {
    //     // Mock user - email is used as userId
    //     // const mockUsers = {
    //     //   'admin@nexbyte.com': { name: 'Admin User', role: 'admin' },
    //     //   'dveep@gmail.com': { name: 'Durga Battery House', role: 'client' },
    //     //   'intern@nexbyte.com': { name: 'Test Intern', role: 'intern' }
    //     // };
    //     // mockUser = mockUsers[req.user.userId] || { name: 'User', role: 'intern' };
    //     // mockUser._id = req.user.userId;
    //     // mockUser.email = req.user.userId;
    //   } else {
    //     // Real user format fallback
    //     mockUser = {
    //       _id: req.user.userId,
    //       name: req.user.name || 'User',
    //       email: req.user.email || 'user@example.com',
    //       role: req.user.role || 'intern'
    //     };
    //   }
      
    //   mockUser.createdAt = new Date().toISOString();
    //   return res.json(mockUser);
    // }

    const user = await User.findById(req.user.userId)
      .select('name email role createdAt');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

module.exports = router;
