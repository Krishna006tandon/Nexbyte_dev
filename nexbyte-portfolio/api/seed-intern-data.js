const mongoose = require('mongoose');
const Resource = require('./models/Resource');
const Task = require('./models/Task');
const User = require('./models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Resource.deleteMany({});
    await Task.deleteMany({});

    // Create sample resources
    const resources = [
      {
        title: 'React Documentation',
        description: 'Official React documentation and tutorials',
        type: 'documentation',
        url: 'https://react.dev',
        category: 'frontend',
        difficulty: 'beginner',
        tags: ['react', 'javascript', 'frontend']
      },
      {
        title: 'MDN Web Docs',
        description: 'Comprehensive web development documentation',
        type: 'documentation',
        url: 'https://developer.mozilla.org',
        category: 'general',
        difficulty: 'beginner',
        tags: ['html', 'css', 'javascript', 'web']
      },
      {
        title: 'JavaScript.info',
        description: 'Modern JavaScript tutorial',
        type: 'tutorial',
        url: 'https://javascript.info',
        category: 'frontend',
        difficulty: 'intermediate',
        tags: ['javascript', 'programming']
      },
      {
        title: 'CSS Tricks',
        description: 'CSS articles, tutorials, and guides',
        type: 'article',
        url: 'https://css-tricks.com',
        category: 'frontend',
        difficulty: 'intermediate',
        tags: ['css', 'frontend', 'design']
      },
      {
        title: 'Node.js Documentation',
        description: 'Official Node.js runtime documentation',
        type: 'documentation',
        url: 'https://nodejs.org/docs',
        category: 'backend',
        difficulty: 'intermediate',
        tags: ['nodejs', 'backend', 'javascript']
      },
      {
        title: 'Express.js Guide',
        description: 'Express.js framework guide and API reference',
        type: 'documentation',
        url: 'https://expressjs.com',
        category: 'backend',
        difficulty: 'intermediate',
        tags: ['express', 'nodejs', 'backend']
      },
      {
        title: 'MongoDB University',
        description: 'Free MongoDB courses and tutorials',
        type: 'tutorial',
        url: 'https://university.mongodb.com',
        category: 'backend',
        difficulty: 'intermediate',
        tags: ['mongodb', 'database', 'nosql']
      },
      {
        title: 'Git Tutorial',
        description: 'Learn Git version control system',
        type: 'tutorial',
        url: 'https://www.atlassian.com/git',
        category: 'devops',
        difficulty: 'beginner',
        tags: ['git', 'version-control', 'devops']
      }
    ];

    const insertedResources = await Resource.insertMany(resources);
    console.log(`${insertedResources.length} resources created`);

    // Find intern users to assign tasks to
    const interns = await User.find({ role: 'intern' });
    
    if (interns.length === 0) {
      console.log('No intern users found. Creating sample tasks without assignment.');
    }

    // Create sample tasks
    const tasks = [
      {
        title: 'Complete React Tutorial',
        description: 'Finish the advanced React tutorial and build a small project',
        estimated_effort_hours: 8,
        reward_amount_in_INR: 500,
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedTo: interns.length > 0 ? interns[0]._id : null
      },
      {
        title: 'Build Portfolio Website',
        description: 'Create a personal portfolio website using React and modern CSS',
        estimated_effort_hours: 12,
        reward_amount_in_INR: 800,
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        assignedTo: interns.length > 0 ? interns[0]._id : null
      },
      {
        title: 'JavaScript Algorithms Practice',
        description: 'Practice common algorithms and data structures in JavaScript',
        estimated_effort_hours: 6,
        reward_amount_in_INR: 400,
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        assignedTo: interns.length > 0 ? interns[0]._id : null
      },
      {
        title: 'Learn Node.js Basics',
        description: 'Complete Node.js fundamentals course and build a simple API',
        estimated_effort_hours: 10,
        reward_amount_in_INR: 600,
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        assignedTo: interns.length > 0 ? interns[0]._id : null
      },
      {
        title: 'CSS Grid and Flexbox Mastery',
        description: 'Master CSS layout techniques with practical exercises',
        estimated_effort_hours: 4,
        reward_amount_in_INR: 300,
        status: 'completed',
        priority: 'low',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        assignedTo: interns.length > 0 ? interns[0]._id : null
      }
    ];

    const insertedTasks = await Task.insertMany(tasks);
    console.log(`${insertedTasks.length} tasks created`);

    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
