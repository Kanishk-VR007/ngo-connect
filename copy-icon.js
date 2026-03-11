const fs = require('fs');
const src = 'C:/Users/rames/.gemini/antigravity/brain/8fe5c0d5-df0c-4578-a280-fb3d64b5ba4d/ngo_connect_icon_1773244955347.png';
const pub = 'd:/NGO CONNECT APP/ngo-connect/client/public/';
fs.copyFileSync(src, pub + 'logo192.png');
fs.copyFileSync(src, pub + 'logo512.png');
fs.copyFileSync(src, pub + 'favicon.png');
console.log('Icon files copied successfully!');
