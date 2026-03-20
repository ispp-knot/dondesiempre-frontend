// @ts-ignore
const fs = require('fs');

fs.cpSync('public', '.next/standalone/public', { recursive: true });
fs.cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
