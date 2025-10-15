const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(express.json());

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('Error: MONGODB_URI is not defined. Please set it in your environment variables.');
}

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

app.get('/api/hello', (req, res) => {
    res.json({ message: "Hello from server!" });
});

// Define all your other API routes here. For example:
// app.get('/api/projects', (req, res) => { ... });

module.exports = app;
