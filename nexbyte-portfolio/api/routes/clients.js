const express = require('express');
const jwt = require('jsonwebtoken');
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
    res.json(mockClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Create new client (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, phone, project, status } = req.body;
    
    const newClient = {
      _id: Date.now().toString(),
      name,
      email,
      phone,
      project,
      status: status || 'active',
      createdAt: new Date().toISOString()
    };
    
    mockClients.push(newClient);
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, phone, project, status } = req.body;
    
    const clientIndex = mockClients.findIndex(client => client._id === req.params.id);
    
    if (clientIndex === -1) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    mockClients[clientIndex] = {
      ...mockClients[clientIndex],
      name,
      email,
      phone,
      project,
      status
    };
    
    res.json(mockClients[clientIndex]);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const clientIndex = mockClients.findIndex(client => client._id === req.params.id);
    
    if (clientIndex === -1) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    mockClients.splice(clientIndex, 1);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

module.exports = router;
