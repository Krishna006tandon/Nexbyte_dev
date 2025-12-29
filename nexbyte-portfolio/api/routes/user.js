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

// Get user's tasks
router.get('/my-tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await User.findById(req.user.userId)
      .populate({
        path: 'tasks',
        populate: {
          path: 'assignedTo',
          select: 'name email'
        }
      })
      .select('tasks');
    
    if (!tasks) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(tasks.tasks || []);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Mock data endpoints for InternPanel
router.get('/diary', authMiddleware, async (req, res) => {
  try {
    // Mock diary data - in real app, this would come from database
    const diaryData = [
      {
        _id: '1',
        content: 'Today I learned about React hooks and implemented useState and useEffect in my project.',
        date: new Date().toISOString(),
        user: req.user.userId
      }
    ];
    
    res.json(diaryData);
  } catch (error) {
    console.error('Error fetching diary:', error);
    res.status(500).json({ error: 'Failed to fetch diary' });
  }
});

router.post('/diary', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    
    // Mock save - in real app, this would save to database
    console.log('Diary entry:', content);
    
    res.json({ message: 'Diary entry saved successfully' });
  } catch (error) {
    console.error('Error saving diary:', error);
    res.status(500).json({ error: 'Failed to save diary entry' });
  }
});

router.get('/reports', authMiddleware, async (req, res) => {
  try {
    // Mock reports data
    const reportsData = [
      {
        _id: '1',
        date: new Date().toISOString(),
        skillsLearned: ['React', 'Node.js', 'MongoDB'],
        performanceScore: 85,
        feedback: 'Good progress on frontend development'
      },
      {
        _id: '2',
        date: new Date(Date.now() - 86400000).toISOString(),
        skillsLearned: ['Express.js', 'REST APIs', 'Authentication'],
        performanceScore: 78,
        feedback: 'Improved backend architecture understanding'
      }
    ];
    
    res.json(reportsData);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    // Mock notifications data
    const notificationsData = [
      {
        _id: '1',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: "Implement User Dashboard"',
        type: 'task',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: 'Task Deadline Approaching',
        message: 'Task "React Component Development" is due in 2 days',
        type: 'deadline',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    
    res.json(notificationsData);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.get('/resources', authMiddleware, async (req, res) => {
  try {
    // Mock resources data
    const resourcesData = [
      {
        _id: '1',
        title: 'React Documentation',
        description: 'Official React documentation and tutorials',
        url: 'https://react.dev',
        type: 'documentation'
      },
      {
        _id: '2',
        title: 'JavaScript Best Practices',
        description: 'Comprehensive guide to JavaScript best practices',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        type: 'documentation'
      },
      {
        _id: '3',
        title: 'Node.js Tutorial',
        description: 'Complete Node.js tutorial for beginners',
        url: 'https://nodejs.org/en/docs/',
        type: 'tutorial'
      }
    ];
    
    res.json(resourcesData);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

router.get('/team', authMiddleware, async (req, res) => {
  try {
    // Mock team data
    const teamData = [
      {
        _id: '1',
        name: 'John Doe',
        role: 'Senior Developer',
        email: 'john.doe@nexbyte.com',
        avatar: 'https://picsum.photos/seed/john/200/200.jpg'
      },
      {
        _id: '2',
        name: 'Jane Smith',
        role: 'Team Lead',
        email: 'jane.smith@nexbyte.com',
        avatar: 'https://picsum.photos/seed/jane/200/200.jpg'
      }
    ];
    
    res.json(teamData);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

module.exports = router;
