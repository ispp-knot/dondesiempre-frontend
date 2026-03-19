const fs = require('fs');
const path = require('path');

fs.cpSync('public', '.next/standalone/public', { recursive: true });
fs.cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });