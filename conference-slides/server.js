const fs = require('fs');
const http = require('http');
const path = require('path');

const HOST = '127.0.0.1';
const START_PORT = Number(process.env.PORT) || 3000;
const MAX_PORT = START_PORT + 10;

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${HOST}`).pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(__dirname, relativePath);

  if (!filePath.startsWith(`${__dirname}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Not found');
      return;
    }

    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
    });
    response.end(data);
  });
});

let port = START_PORT;

server.on('error', error => {
  if (error.code === 'EADDRINUSE' && port < MAX_PORT) {
    port += 1;
    server.listen(port, HOST);
    return;
  }
  console.error(`Unable to start the presentation server: ${error.message}`);
  process.exitCode = 1;
});

server.on('listening', () => {
  const address = server.address();
  console.log(`\nTrustCon 2026 presentation: http://${HOST}:${address.port}\n`);
  console.log('  → or Space   advance');
  console.log('  ←            go back');
  console.log('  P            pause/resume\n');
});

server.listen(port, HOST);
