const https = require('https');
const fs = require('fs');
const path = require('path');
const app = require('./app');

const PORT = process.env.PORT || 3001;

// Load SSL certificates
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '..', '192.168.1.13+3-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '..', '192.168.1.13+3.pem'))
};

// Create HTTPS server
const server = https.createServer(sslOptions, app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on https://0.0.0.0:${PORT}`);
  console.log(`   Local:   https://localhost:${PORT}`);
  console.log(`   Network: https://192.168.1.13:${PORT}`);
});

module.exports = server;
