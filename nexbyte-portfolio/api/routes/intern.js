const express = require('express');
const jwt = require('jsonwebtoken');
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

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, skills } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName, phone, bio, skills },
      { new: true, runValidators: true }
    ).select('name email role firstName lastName phone bio skills');
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Accept offer
router.post('/accept-offer', authMiddleware, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { offerStatus: 'accepted' },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Offer accepted successfully' });
  } catch (error) {
    console.error('Error accepting offer:', error);
    res.status(500).json({ error: 'Failed to accept offer' });
  }
});

// Reject offer
router.post('/reject-offer', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        offerStatus: 'rejected',
        rejectionReason: reason 
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Offer rejected successfully' });
  } catch (error) {
    console.error('Error rejecting offer:', error);
    res.status(500).json({ error: 'Failed to reject offer' });
  }
});

module.exports = router;
