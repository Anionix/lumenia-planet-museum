import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { brotliCompressSync, constants } from 'node:zlib';
import path from 'node:path';
import { projectRoot } from './source-revision.mjs';

// llm machine contract; claim UUIDv5: b70d510f-8a47-5422-b007-5fd5d1d9a80b
// execution UUIDv7 is assigned by each browser measurement collector.
// state: local production preview; transition: exported bytes -> Brotli HTTP response -> measured browser
const root = await realpath(path.join(projectRoot, 'web/out'));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.jsonl': 'application/x-ndjson; charset=utf-8', '.md': 'text/plain; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.ktx2': 'image/ktx2',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const cache = new Map();
const port = Number(process.env.LUMENIA_PREVIEW_PORT ?? 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid preview port');
const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
    const url = new URL(request.url, 'http://127.0.0.1');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = await realpath(path.join(root, pathname));
    if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    let content = cache.get(file);
    const modified = (await stat(file)).mtimeMs;
    if (!content || content.modified !== modified) {
      const bytes = await readFile(file);
      // Already compressed pictures must not block every request with another compression pass.
      const textAsset = /\.(html|[cm]?js|css|jsonl?|txt|md|map|svg)$/.test(file);
      content = { bytes, modified, brotli: textAsset ? brotliCompressSync(bytes, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }) : null };
      cache.set(file, content);
    }
    const compressed = content.brotli !== null && /\bbr\b/.test(request.headers['accept-encoding'] ?? '');
    const bytes = compressed ? content.brotli : content.bytes;
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream',
      'Content-Length': bytes.length, 'Cache-Control': 'no-store', 'Vary': 'Accept-Encoding',
      'X-Content-Type-Options': 'nosniff', ...(compressed ? { 'Content-Encoding': 'br' } : {}) });
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch { response.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Lumenia production preview: http://127.0.0.1:${port}`));
