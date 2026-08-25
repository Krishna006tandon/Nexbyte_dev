const fs = require('fs');
const content = fs.readFileSync('g:/project/Nexbyte_dev/nexbyte-portfolio/api/server.js', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes("app.post('/api/bills'"));
if (start !== -1) {
    console.log("Found POST /api/bills at line:", start);
    console.log(lines.slice(start, start + 30).join('\n'));
} else {
    console.log("POST /api/bills not found");
}
