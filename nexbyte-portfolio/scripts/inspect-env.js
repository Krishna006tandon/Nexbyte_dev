const fs = require('fs');
const path = require('path');

function parseEnvFile(envText) {
  const lines = envText.split(/\r?\n/);
  const result = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('#')) continue;

    const idx = line.indexOf('=');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    result.push({ key, value });
  }

  return result;
}

function maskValue(value) {
  if (!value) return '(empty)';
  const trimmed = value.replace(/^["']|["']$/g, '');
  if (!trimmed) return '(empty)';

  if (trimmed.length <= 4) return `${'*'.repeat(trimmed.length)} (len=${trimmed.length})`;
  return `${trimmed.slice(0, 2)}***${trimmed.slice(-2)} (len=${trimmed.length})`;
}

function inspectFile(filePath) {
  const abs = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(abs)) {
    console.log(`${filePath}: (missing)`);
    return;
  }

  const content = fs.readFileSync(abs, 'utf8');
  const entries = parseEnvFile(content);
  const keys = entries.map((e) => e.key).sort((a, b) => a.localeCompare(b));

  console.log(`${filePath}:`);
  for (const key of keys) {
    const value = entries.find((e) => e.key === key)?.value ?? '';
    const isSensitive = /pass|secret|token|key|uri/i.test(key);
    const shown = isSensitive ? maskValue(value) : value || '(empty)';
    console.log(`  ${key}=${shown}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const files = args.length ? args : ['.env', 'api/.env'];
  for (const f of files) inspectFile(f);
}

main();

