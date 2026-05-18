/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const buildDir = path.join(__dirname, '..', 'build');

function makeWritableRecursive(targetPath) {
  let entries;
  try {
    entries = fs.readdirSync(targetPath, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const entryPath = path.join(targetPath, entry.name);
    try {
      fs.chmodSync(entryPath, 0o666);
    } catch {}

    if (entry.isDirectory()) {
      makeWritableRecursive(entryPath);
    }
  }
}

function removeDirWithRetries(targetPath, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (process.platform === 'win32') {
        const powershellPath =
          process.env.SystemRoot
            ? path.join(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
            : 'powershell.exe';

        spawnSync('cmd.exe', ['/c', 'attrib', '-R', `${targetPath}\\*`, '/S', '/D'], {
          stdio: 'ignore',
        });
        const ps = spawnSync(
          powershellPath,
          ['-NoProfile', '-Command', `Remove-Item -LiteralPath '${targetPath}' -Recurse -Force -ErrorAction SilentlyContinue`],
          { stdio: 'ignore' }
        );
        if (!fs.existsSync(targetPath)) return true;
        if (ps.error) throw ps.error;
      }
      makeWritableRecursive(targetPath);
      fs.rmSync(targetPath, { recursive: true, force: true });
      return true;
    } catch (err) {
      if (attempt === retries) {
        console.warn(`Failed to delete ${targetPath}: ${err.message}`);
        return false;
      }
    }
  }
  return false;
}

if (fs.existsSync(buildDir)) {
  removeDirWithRetries(buildDir);
}
