const fs = require('fs');
const path = require('path');

function walk(targetPath, onEntry) {
  if (!fs.existsSync(targetPath)) return;
  const stat = fs.lstatSync(targetPath);
  onEntry(targetPath, stat);

  if (stat.isDirectory()) {
    const entries = fs.readdirSync(targetPath);
    for (const entry of entries) {
      walk(path.join(targetPath, entry), onEntry);
    }
  }
}

function tryChmod(targetPath, mode) {
  try {
    fs.chmodSync(targetPath, mode);
  } catch {
    // Ignore on Windows/ACL restricted paths
  }
}

function main() {
  const buildDir = path.resolve(process.cwd(), 'build');
  if (!fs.existsSync(buildDir)) {
    console.log('build/ does not exist');
    return;
  }

  // Best-effort: make build artifacts writable so react-scripts can clean/rebuild
  walk(buildDir, (p, stat) => {
    if (stat.isDirectory()) {
      tryChmod(p, 0o777);
    } else {
      tryChmod(p, 0o666);
    }
  });

  console.log('Attempted to chmod build/ artifacts to writable.');
}

main();

