// Local production-like server: compression and the deployment cache policy.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
const root = path.resolve(process.argv[2] || 'dist');
const port = Number(process.argv[3] || 4173);
http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try {
    let body = await readFile(file);
    const ext = path.extname(file);
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.woff2': 'font/woff2', '.webp': 'image/webp' };
    const headers = { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' ? 'public, max-age=0, must-revalidate' : 'public, max-age=31536000, immutable', Vary: 'Accept-Encoding' };
    if (/gzip/.test(req.headers['accept-encoding'] || '') && /\.(html|css|js)$/.test(file)) {
      body = gzipSync(body); headers['Content-Encoding'] = 'gzip';
    }
    res.writeHead(200, { ...headers, 'Content-Length': body.length }); res.end(body);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Serving ${root} at http://127.0.0.1:${port}`));
