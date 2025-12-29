const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');

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

// Get all projects
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Return mock data when MongoDB is not connected
      const mockProjects = [
        {
          _id: '1',
          name: 'Website Development',
          description: 'Complete website redesign and development',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-03-01',
          assignedTo: null,
          tasks: []
        },
        {
          _id: '2',
          name: 'Mobile App',
          description: 'iOS and Android mobile application',
          status: 'active',
          startDate: '2024-02-01',
          endDate: '2024-05-01',
          assignedTo: null,
          tasks: []
        },
        {
          _id: '3',
          name: 'API Development',
          description: 'RESTful API for backend services',
          status: 'completed',
          startDate: '2023-12-01',
          endDate: '2024-01-15',
          assignedTo: null,
          tasks: []
        }
      ];
      return res.json(mockProjects);
    }

    const projects = await Project.find().populate('assignedTo', 'name email');
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('assignedTo', 'name email');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', authMiddleware, async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    // Also delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Get tasks for a specific project
router.get('/:projectId/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ error: 'Failed to fetch project tasks' });
  }
});

// Create task for a specific project
router.post('/:projectId/tasks', authMiddleware, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      project: req.params.projectId
    };
    const task = new Task(taskData);
    await task.save();
    await task.populate('assignedTo', 'name email');
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

module.exports = router;
