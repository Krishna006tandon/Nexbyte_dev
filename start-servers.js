const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};
  const envText = fs.readFileSync(filePath, 'utf8');
  const out = {};

  envText.split(/\r?\n/).forEach((raw) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;

    const cleaned = line.startsWith('export ') ? line.slice('export '.length).trim() : line;
    const idx = cleaned.indexOf('=');
    if (idx === -1) return;

    const key = cleaned.slice(0, idx).trim();
    let value = cleaned.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  });

  return out;
};

// Precedence: process.env (highest) > nexbyte-portfolio/.env > nexbyte-portfolio/api/.env (lowest)
const rootEnvPath = path.resolve(__dirname, 'nexbyte-portfolio', '.env');
const apiEnvPath = path.resolve(__dirname, 'nexbyte-portfolio', 'api', '.env');
const fileEnvApi = parseEnvFile(apiEnvPath);
const fileEnvRoot = parseEnvFile(rootEnvPath);
const env = { ...fileEnvApi, ...fileEnvRoot, ...process.env };

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

