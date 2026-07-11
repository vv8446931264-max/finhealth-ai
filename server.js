const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const DIST = path.join(__dirname, 'dist');
const PROJECT = process.env.GCP_PROJECT || 'finhealth-vertex-ai';
const LOCATION = 'asia-south1';
const MODEL = 'gemini-2.5-flash';

const mime = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
};

function getAccessToken() {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'metadata.google.internal',
      port: 80,
      path: '/computeMetadata/v1/instance/service-accounts/default/token',
      headers: { 'Metadata-Flavor': 'Google' },
    };
    const req = http.get(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data).access_token); }
        catch (e) { reject(new Error('token parse: ' + data.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('metadata timeout')); });
  });
}

function callVertexAI(contents) {
  return getAccessToken().then(token => new Promise((resolve, reject) => {
    const postData = JSON.stringify({ contents });
    const opts = {
      hostname: `${LOCATION}-aiplatform.googleapis.com`,
      path: `/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  }));
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // Health / diagnostic
  if (req.method === 'GET' && url === '/api/health') {
    getAccessToken()
      .then(t => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true, tokenLen: t.length, model: MODEL })); })
      .catch(e => { res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: false, error: e.message })); });
    return;
  }

  // Vertex AI Gemini proxy
  if (req.method === 'POST' && url === '/api/generate') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let contents;
      try { contents = JSON.parse(body).contents; } catch { res.writeHead(400); res.end('bad json'); return; }
      callVertexAI(contents)
        .then(({ status, body: rb }) => {
          if (status !== 200) console.error('Vertex AI', status, rb.slice(0, 300));
          res.writeHead(status, { 'Content-Type': 'application/json' });
          res.end(rb);
        })
        .catch(e => {
          console.error('callVertexAI error:', e.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });
    });
    return;
  }

  // Static files + SPA fallback
  let filePath = path.join(DIST, url === '/' ? 'index.html' : url);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath = path.join(DIST, 'index.html');
  const ct = mime[path.extname(filePath)] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`FinHealth AI running on port ${PORT}`));
