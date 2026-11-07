const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const BACKEND_PORT = process.env.BACKEND_PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  // Proxy /api requests to Backend API server at port 5000
  if (pathname.startsWith('/api')) {
    const options = {
      hostname: '127.0.0.1',
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Backend API unreachable',
        details: 'Ensure backend server is running on port ' + BACKEND_PORT
      }));
    });

    req.pipe(proxyReq, { end: true });
    return;
  }

  // Serve static files
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, pathname);

  // Security check: ensure path is inside PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Access denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing
      const indexFile = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexFile, (err2, content) => {
        if (err2) {
          res.writeHead(404);
          return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err2, data) => {
      if (err2) {
        res.writeHead(500);
        return res.end('Server error reading file');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`RumorFlow Frontend UI Server listening on:`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  Proxying API requests to: http://localhost:${BACKEND_PORT}`);
  console.log(`=======================================================`);
});

