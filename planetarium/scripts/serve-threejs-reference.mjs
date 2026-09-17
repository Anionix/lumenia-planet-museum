import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// LLM machine contract: generated artifacts -> local read-only preview. Export UUIDv7 remains in scene.userData.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const routes = new Map([
  ['/', ['planetarium/examples/threejs-reference.html', 'text/html; charset=utf-8']],
  ['/scene.json', ['planetarium/generated/threejs-reference-scene.json', 'application/json']],
  ['/adapter.mjs', ['planetarium/lib/threejs-reference-adapter.mjs', 'text/javascript']],
  ['/reference-physics-contract.mjs', ['planetarium/lib/reference-physics-contract.mjs', 'text/javascript']],
  ['/three.module.js', ['node_modules/three/build/three.module.js', 'text/javascript']],
  ['/three.core.js', ['node_modules/three/build/three.core.js', 'text/javascript']],
  ['/OrbitControls.js', ['node_modules/three/examples/jsm/controls/OrbitControls.js', 'text/javascript']],
]);
const port = Number(process.env.THREE_REFERENCE_PREVIEW_PORT ?? 4187);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new TypeError('Preview port must be an integer in [1024,65535]');
createServer(async (request, response) => {
  const route = routes.get(new URL(request.url, 'http://127.0.0.1').pathname);
  if (request.method !== 'GET' || !route) { response.writeHead(404).end(); return; }
  try {
    const content = await readFile(resolve(root, route[0]));
    response.writeHead(200, { 'Content-Type': route[1], 'Cache-Control': 'no-store' }).end(content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('表示用ファイルがありません。先に描画データを書き出してください。');
  }
}).listen(port, '127.0.0.1', () => console.log(`Three.js reference preview: http://127.0.0.1:${port}`));
