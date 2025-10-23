const { exec } = require('child_process');
exec('cd nexbyte-portfolio && npm install qrcode.react', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});