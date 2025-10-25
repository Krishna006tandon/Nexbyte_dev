const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, 'nexbyte-portfolio', 'api', '.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const frontend = spawn('npm', ['start'], {
  cwd: 'nexbyte-portfolio',
  shell: true,
  stdio: 'inherit'
});

const backend = spawn('node', ['api/index.js'], {
  cwd: 'nexbyte-portfolio',
  shell: true,
  stdio: 'inherit',
  env: { ...process.env, ...env }
});

frontend.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
});

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

