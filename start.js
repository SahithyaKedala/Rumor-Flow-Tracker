const { spawn } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('Starting RumorFlow Core: Backend API (:5000) & Frontend UI (:3000)...');
console.log('================================================================');

// Start Backend Server
const backend = spawn('node', ['backend/server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// Start Frontend Server
const frontend = spawn('node', ['frontend/server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

function shutdown() {
  console.log('\nShutting down RumorFlow services...');
  backend.kill();
  frontend.kill();
  process.exit();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

