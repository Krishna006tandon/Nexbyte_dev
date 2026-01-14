const express = require('express');
const path = require('path');

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads/resumes');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Serve static files from uploads directory
const setupStaticFiles = (app) => {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
};

module.exports = { setupStaticFiles };
