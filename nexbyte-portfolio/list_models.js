const fetch = require('node-fetch');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('GEMINI_API_KEY is not set in the .env file.');
  process.exit(1);
}

async function listGenerativeModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Available Generative AI Models:');
    data.models.forEach(model => {
      console.log(`- ${model.name} (displayName: ${model.displayName || 'N/A'})`);
    });
  } catch (error) {
    console.error('Error fetching models:', error);
  }
}

listGenerativeModels();
