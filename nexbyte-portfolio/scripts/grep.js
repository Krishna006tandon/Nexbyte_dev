const fs = require('fs');
const path = require('path');

function walk(dir, onFile) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip big/unhelpful folders
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'build' || entry.name === 'coverage') {
        continue;
      }
      walk(full, onFile);
    } else if (entry.isFile()) {
      onFile(full);
    }
  }
}

function main() {
  const pattern = process.argv.slice(2).join(' ');
  if (!pattern) {
    console.error('Usage: node scripts/grep.js <pattern>');
    process.exitCode = 2;
    return;
  }

  const cwd = process.cwd();
  const needle = pattern.toLowerCase();

  walk(cwd, (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.js', '.jsx', '.ts', '.tsx', '.json', '.env', '.md'].includes(ext)) return;

    let content;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch {
      return;
    }

    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(needle)) {
        const rel = path.relative(cwd, filePath);
        process.stdout.write(`${rel}:${i + 1}:${lines[i]}\n`);
      }
    }
  });
}

main();

