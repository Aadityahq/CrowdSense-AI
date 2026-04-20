const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

process.env.FIRESTORE_AUTO_SYNC = 'false';
process.env.PORT = '0';

const { createApp } = require('./server');

function request(server, path) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const options = {
      hostname: '127.0.0.1',
      port: address.port,
      path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });

    req.on('error', reject);
    req.end();
  });
}

test('server responds on root and route endpoints', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const rootResponse = await request(server, '/');
    assert.equal(rootResponse.statusCode, 200);
    assert.match(rootResponse.body, /CrowdSense AI Backend Running/);

    const routeResponse = await request(server, '/api/routes');
    assert.equal(routeResponse.statusCode, 200);
    assert.match(routeResponse.body, /"route"/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
