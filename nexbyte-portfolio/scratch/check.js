const fs = require('fs');
const content = fs.readFileSync('g:/project/Nexbyte_dev/nexbyte-portfolio/src/pages/Admin.js', 'utf8');
if(content.includes('html2pdf')) {
  console.log('Admin.js has html2pdf');
} else {
  console.log('Admin.js does not have html2pdf');
}
