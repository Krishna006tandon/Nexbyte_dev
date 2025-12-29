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

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all interns (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const interns = await User.find({ role: 'intern' })
      .select('name email role createdAt')
      .sort({ createdAt: -1 });
    
    // Add name field for frontend compatibility (using email prefix if name is not available)
    const internsWithName = interns.map(intern => ({
      ...intern.toObject(),
      name: intern.name || intern.email.split('@')[0]
    }));
    
    res.json(internsWithName);
  } catch (error) {
    console.error('Error fetching interns:', error);
    res.status(500).json({ error: 'Failed to fetch interns' });
  }
});

// Get intern by ID (admin only)
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const intern = await User.findOne({ _id: req.params.id, role: 'intern' })
      .select('name email role createdAt');
    
    if (!intern) {
      return res.status(404).json({ error: 'Intern not found' });
    }
    
    // Add name field for frontend compatibility
    const internWithName = {
      ...intern.toObject(),
      name: intern.name || intern.email.split('@')[0]
    };
    
    res.json(internWithName);
  } catch (error) {
    console.error('Error fetching intern:', error);
    res.status(500).json({ error: 'Failed to fetch intern' });
  }
});

// Update intern (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    // Only allow updating certain fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && ['intern', 'admin'].includes(role)) updateData.role = role;
    
    const intern = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'intern' },
      updateData,
      { new: true, runValidators: true }
    ).select('name email role createdAt');
    
    if (!intern) {
      return res.status(404).json({ error: 'Intern not found' });
    }
    
    res.json(intern);
  } catch (error) {
    console.error('Error updating intern:', error);
    res.status(500).json({ error: 'Failed to update intern' });
  }
});

// Delete intern (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const intern = await User.findOneAndDelete({ _id: req.params.id, role: 'intern' });
    
    if (!intern) {
      return res.status(404).json({ error: 'Intern not found' });
    }
    
    res.json({ message: 'Intern deleted successfully' });
  } catch (error) {
    console.error('Error deleting intern:', error);
    res.status(500).json({ error: 'Failed to delete intern' });
  }
});

// Get current user profile
router.get('/profile/me', authMiddleware, async (req, res) => {
  try {
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
