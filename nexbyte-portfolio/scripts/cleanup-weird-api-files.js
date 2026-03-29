const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'api');
const targets = [
  '0})',
  "{if(x.toLowerCase().includes(pat.toLowerCase()))console.log((i+1)+'",
];

let ok = true;
for (const name of targets) {
  const full = path.join(apiDir, name);
  try {
    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
      process.stdout.write(`Deleted: ${full}\n`);
    } else {
      process.stdout.write(`Not found: ${full}\n`);
    }
  } catch (e) {
    ok = false;
    process.stderr.write(`Failed to delete: ${full}\n${e.message}\n`);
  }
}

process.exit(ok ? 0 : 1);

