const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

// Optional email service - only load if email is configured
let emailService = null;
try {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
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

// Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Return mock data when MongoDB is not connected
      const mockUsers = [
        {
          _id: '1',
          email: 'admin@nexbyte.com',
          role: 'admin',
          name: 'Admin User',
          internType: undefined,
          internshipStartDate: undefined,
          internshipEndDate: undefined,
          acceptanceDate: undefined
        },
        {
          _id: '2',
          email: 'john.doe@nexbyte.com',
          role: 'intern',
          name: 'John Doe',
          internType: 'paid',
          internshipStartDate: '2024-01-01',
          internshipEndDate: '2024-06-01',
          acceptanceDate: '2023-12-15'
        },
        {
          _id: '3',
          email: 'jane.smith@nexbyte.com',
          role: 'intern',
          name: 'Jane Smith',
          internType: 'free',
          internshipStartDate: '2024-02-01',
          internshipEndDate: '2024-07-01',
          acceptanceDate: '2024-01-15'
        }
      ];
      return res.json(mockUsers);
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create new user (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Return mock response when MongoDB is not connected
      const { email, role, internType, internshipStartDate, internshipEndDate, acceptanceDate } = req.body;
      const mockUser = {
        _id: Date.now().toString(),
        email,
        role: role || 'intern',
        name: email.split('@')[0],
        internType: role === 'intern' ? internType : undefined,
        internshipStartDate: role === 'intern' ? internshipStartDate : undefined,
        internshipEndDate: role === 'intern' ? internshipEndDate : undefined,
        acceptanceDate: role === 'intern' ? acceptanceDate : undefined
      };
      
      // Send email with credentials to user (only if email service is configured)
      if (emailService && password) {
        try {
          const emailResult = await emailService.sendClientCredentials(
            email, 
            email.split('@')[0], // Use email prefix as name
            password, 
            `${role.charAt(0).toUpperCase() + role.slice(1)} Account`
          );
          if (emailResult.success) {
            console.log(`Credentials email sent to ${email} for role: ${role}`);
          } else {
            console.error(`Failed to send email to ${email}:`, emailResult.error);
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      } else {
        console.log('Email service not configured or no password provided - skipping email send');
      }
      
      return res.status(201).json(mockUser);
    }

    const { email, password, role, internType, internshipStartDate, internshipEndDate, acceptanceDate } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || 'intern',
      internType: role === 'intern' ? internType : undefined,
      internshipStartDate: role === 'intern' ? internshipStartDate : undefined,
      internshipEndDate: role === 'intern' ? internshipEndDate : undefined,
      acceptanceDate: role === 'intern' ? acceptanceDate : undefined
    });

    const savedUser = await newUser.save();
    
    // Send email with credentials to user (only if email service is configured)
    if (emailService) {
      try {
        const emailResult = await emailService.sendClientCredentials(
          email, 
          email.split('@')[0], // Use email prefix as name
          password, 
          `${role.charAt(0).toUpperCase() + role.slice(1)} Account`
        );
        if (emailResult.success) {
          console.log(`Credentials email sent to ${email} for role: ${role}`);
        } else {
          console.error(`Failed to send email to ${email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    } else {
      console.log('Email service not configured - skipping email send');
    }
    
    // Return user without password
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { email, role, internType, internshipStartDate, internshipEndDate, acceptanceDate } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { 
        email,
        role,
        internType: role === 'intern' ? internType : undefined,
        internshipStartDate: role === 'intern' ? internshipStartDate : undefined,
        internshipEndDate: role === 'intern' ? internshipEndDate : undefined,
        acceptanceDate: role === 'intern' ? acceptanceDate : undefined
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user report (admin only)
router.get('/intern-report/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mock report data for now
    const reportData = {
      totalTasks: 24,
      completedTasks: 18,
      completionRate: '75%',
      priorityTasks: 12,
      recentActivity: [
        { date: new Date().toISOString(), description: 'Completed Task: React Dashboard' },
        { date: new Date(Date.now() - 86400000).toISOString(), description: 'Submitted Diary Entry' },
        { date: new Date(Date.now() - 172800000).toISOString(), description: 'Started Task: API Integration' }
      ],
      growthReports: [
        {
          _id: '1',
          date: new Date().toISOString(),
          skillsLearned: ['React', 'Chart.js'],
          performanceScore: 90,
          feedback: 'Excellent work on data visualization.'
        },
        {
          _id: '2',
          date: new Date(Date.now() - 2592000000).toISOString(),
          skillsLearned: ['Node.js', 'Express'],
          performanceScore: 82,
          feedback: 'Solid understanding of backend routes.'
        }
      ]
    };

    res.json(reportData);
  } catch (error) {
    console.error('Error fetching user report:', error);
    res.status(500).json({ error: 'Failed to fetch user report' });
  }
});

module.exports = router;
