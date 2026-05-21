const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(repoRoot, 'frontend', 'build');
const destinationDir = path.join(repoRoot, 'backend', 'public');

fs.mkdirSync(destinationDir, { recursive: true });
fs.cpSync(sourceDir, destinationDir, { recursive: true, force: true });

console.log(`Copied frontend build from ${sourceDir} to ${destinationDir}`);