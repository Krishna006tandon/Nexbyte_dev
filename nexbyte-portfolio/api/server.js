const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection with proper error handling
const mongoURI = process.env.MONGODB_URI;

// MongoDB connection options for production
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
};

// Connect to MongoDB with retry logic
const connectDB = async () => {
  if (!mongoURI) {
    console.log('MongoDB connection skipped - MONGODB_URI not provided');
    console.log('Using mock authentication only');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI, mongoOptions);
    console.log('MongoDB connected successfully:', conn.connection.host);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.log('Will retry connection in 5 seconds...');
    
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Initialize database connection
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const internRoutes = require('./routes/interns');
const profileRoutes = require('./routes/profile');
const internUserRoutes = require('./routes/intern');
const userRoutes = require('./routes/user');
const usersRoutes = require('./routes/users');
const clientsRoutes = require('./routes/clients');
const certificateRoutes = require('./routes/certificates');
const clientAuthRoutes = require('./routes/clientAuth');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/interns', internRoutes);
app.use('/api', profileRoutes);
app.use('/api/intern', internUserRoutes);
app.use('/api/user', userRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/client', clientAuthRoutes);

// Direct login endpoint for frontend compatibility
app.post('/api/login', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    const mongoose = require('mongoose');
    
    const { email, password } = req.body;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Mock authentication when MongoDB is not connected
      console.log('Using mock authentication (MongoDB not connected)');
      
      // Accept any email with password "admin123" for admin, or "intern123" for intern
      const mockUsers = [
        { email: 'admin@nexbyte.com', password: 'admin123', role: 'admin', name: 'Admin User' },
        { email: 'john.doe@nexbyte.com', password: 'intern123', role: 'intern', name: 'John Doe' },
        { email: 'jane.smith@nexbyte.com', password: 'intern123', role: 'intern', name: 'Jane Smith' }
      ];
      
      const mockUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!mockUser) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create token
      const token = jwt.sign(
        { userId: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: mockUser.email,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        }
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Force connect endpoint
app.post('/api/connect', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      return res.status(400).json({ message: 'MONGODB_URI not set' });
    }
    
    // Force connection
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    
    res.json({ 
      message: 'MongoDB connection attempted',
      uri: mongoURI ? 'SET' : 'NOT SET',
      state: mongoose.connection.readyState,
      connected: mongoose.connection.readyState === 1
    });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ 
      message: 'Connection failed', 
      error: error.message,
      state: mongoose.connection.readyState
    });
  }
});

// Seed data endpoint
app.post('/api/seed', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    const Client = require('./models/Client');
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: 'MongoDB not connected' });
    }
    
    // Clear existing data
    await User.deleteMany({});
    await Client.deleteMany({});
    
    // Create users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@nexbyte.com',
        password: 'admin123',
        role: 'admin',
        credits: 1000
      },
      {
        name: 'John Doe',
        email: 'john.doe@nexbyte.com',
        password: 'intern123',
        role: 'intern',
        credits: 0,
        internshipStartDate: new Date('2024-01-01'),
        internshipEndDate: new Date('2024-06-01'),
        internType: 'stipend'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@nexbyte.com',
        password: 'intern123',
        role: 'intern',
        credits: 0,
        internshipStartDate: new Date('2024-02-01'),
        internshipEndDate: new Date('2024-07-01'),
        internType: 'free'
      },
      {
        name: 'Client User',
        email: 'client@nexbyte.com',
        password: 'client123',
        role: 'client',
        credits: 500
      }
    ];
    
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({ ...userData, password: hashedPassword });
      await user.save();
    }
    
    // Create test client
    const clientPassword = 'clientpass123';
    const hashedClientPassword = await bcrypt.hash(clientPassword, 10);
    
    const testClient = new Client({
      clientName: 'Test Production Client',
      contactPerson: 'Test Contact',
      email: 'production@client.com',
      phone: '+1234567890',
      companyAddress: '123 Production St',
      projectName: 'Production Test Project',
      projectType: 'Web Application',
      projectRequirements: 'Full stack application with MongoDB',
      projectDeadline: new Date('2024-12-31'),
      totalBudget: 10000,
      billingAddress: '123 Production St',
      gstNumber: 'GST123456',
      paymentTerms: '50% advance',
      paymentMethod: 'Bank transfer',
      domainRegistrarLogin: 'domain123',
      webHostingLogin: 'host123',
      logoAndBrandingFiles: 'logo.png',
      content: 'content.pdf',
      password: hashedClientPassword
    });
    
    await testClient.save();
    
    res.json({ 
      message: 'Database seeded successfully!',
      users: users.length,
      clients: 1
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ message: 'Seeding failed', error: error.message });
  }
});

// Environment debug endpoint
app.get('/api/debug', (req, res) => {
  const mongoose = require('mongoose');
  res.json({ 
    status: 'Debug Info',
    environment: {
      mongodb_uri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      mongodb_connected: mongoose.connection.readyState === 1 ? 'YES' : 'NO',
      connection_state: mongoose.connection.readyState,
      jwt_secret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      node_env: process.env.NODE_ENV || 'development',
      smtp_user: process.env.SMTP_USER ? 'SET' : 'NOT SET',
      email_from: process.env.EMAIL_FROM ? 'SET' : 'NOT SET'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: {
      mongodb: process.env.MONGODB_URI ? 'CONNECTED' : 'NOT SET',
      jwt: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      email: process.env.SMTP_USER ? 'CONFIGURED' : 'NOT SET',
      node_env: process.env.NODE_ENV || 'development'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;