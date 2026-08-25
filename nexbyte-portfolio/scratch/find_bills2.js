const fs = require('fs');
const content = fs.readFileSync('g:/project/Nexbyte_dev/nexbyte-portfolio/api/server.js', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes("app.post('/api/bills'"));
if (start !== -1) {
    fs.writeFileSync('g:/project/Nexbyte_dev/nexbyte-portfolio/scratch/bills_loc.txt', 'Line: ' + start + '\n' + lines.slice(start, start + 30).join('\n'));
} else {
    fs.writeFileSync('g:/project/Nexbyte_dev/nexbyte-portfolio/scratch/bills_loc.txt', 'Not found');
}
