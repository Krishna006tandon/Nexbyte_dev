const express = require('express');
const jwt = require('jsonwebtoken');
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

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all tasks (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name');
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Update task
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Update task status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// Assign task to user
router.put('/:id/assign', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ error: 'Failed to assign task' });
  }
});

// Bulk assign tasks
router.put('/bulk-assign', authMiddleware, async (req, res) => {
  try {
    const { taskIds, assignedTo } = req.body;
    const tasks = await Task.updateMany(
      { _id: { $in: taskIds } },
      { assignedTo },
      { new: true, runValidators: true }
    );
    
    // Fetch updated tasks
    const updatedTasks = await Task.find({ _id: { $in: taskIds } })
      .populate('assignedTo', 'name email');
    
    res.json(updatedTasks);
  } catch (error) {
    console.error('Error bulk assigning tasks:', error);
    res.status(500).json({ error: 'Failed to bulk assign tasks' });
  }
});

// Bulk update task status
router.put('/bulk-status', authMiddleware, async (req, res) => {
  try {
    const { taskIds, status } = req.body;
    const tasks = await Task.updateMany(
      { _id: { $in: taskIds } },
      { status },
      { new: true, runValidators: true }
    );
    
    // Fetch updated tasks
    const updatedTasks = await Task.find({ _id: { $in: taskIds } })
      .populate('assignedTo', 'name email');
    
    res.json(updatedTasks);
  } catch (error) {
    console.error('Error bulk updating task status:', error);
    res.status(500).json({ error: 'Failed to bulk update task status' });
  }
});

// Bulk delete tasks
router.delete('/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { taskIds } = req.body;
    const result = await Task.deleteMany({ _id: { $in: taskIds } });
    res.json({ message: `${result.deletedCount} tasks deleted successfully` });
  } catch (error) {
    console.error('Error bulk deleting tasks:', error);
    res.status(500).json({ error: 'Failed to bulk delete tasks' });
  }
});

module.exports = router;
