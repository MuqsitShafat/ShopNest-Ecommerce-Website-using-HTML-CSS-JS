const fs = require('fs');
const html = fs.readFileSync('admin/index.html', 'utf8');

const regex = /<script.*?>([\s\S]*?)<\/script>/gi;
let match;
let i = 0;
while ((match = regex.exec(html)) !== null) {
  if (match[1].trim() !== '') {
    const code = match[1];
    fs.writeFileSync(`scratch_${i}.js`, code);
    console.log(`Wrote scratch_${i}.js`);
  }
  i++;
}
