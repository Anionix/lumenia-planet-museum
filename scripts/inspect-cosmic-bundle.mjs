import { readFile, readdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { sourceManifest, projectRoot } from './source-revision.mjs';
import { uuidVersionSeven } from './identifiers.mjs';

// llm machine contract; claim UUIDv5: 190fdb1a-2e41-565d-9aed-9fe5ca2179a6
// transition: current production bytes -> compressed inventory -> pass or fail; browser timings remain unmeasured.
const root = path.join(projectRoot, 'web/out');
const manifest = await sourceManifest();
const build = JSON.parse(await readFile(path.join(projectRoot, 'reports/web-build-evidence.json'), 'utf8'));
const contract = JSON.parse(await readFile(path.join(projectRoot, 'contracts/cosmic-exhibition.json'), 'utf8'));
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const initial = [...new Set([...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1].replace(/^\//, '')))];
const lazyScene = [];
async function visit(directory) {
  for (const file of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.join(directory, file.name);
    if (file.isDirectory()) await visit(relative);
    else if (file.name.endsWith('.js.map')) {
      const map = JSON.parse(await readFile(path.join(root, relative), 'utf8'));
      if (map.sources.some(source => /node_modules\/three\/|artwork\/cosmic-scene\.mjs/.test(source))) lazyScene.push(relative.slice(0, -4));
    }
  }
}
await visit('_next');
async function inventory(files) {
  return Promise.all(files.map(async file => {
    const bytes = await readFile(path.join(root, file));
    return { file, bytes: bytes.length, compressedBytes: gzipSync(bytes, { level: 9 }).length };
  }));
}
const initialFiles = await inventory(initial), sceneFiles = await inventory(lazyScene);
const total = files => files.reduce((sum, file) => sum + file.compressedBytes, 0);
const checks = {
  currentBuild: build.state === 'built' && build.sourceRevision === manifest.sourceRevision,
  initialScriptsPresent: initialFiles.length > 0,
  sceneFilesPresent: sceneFiles.length > 0,
  sceneAbsentFromInitialScripts: lazyScene.every(file => !initial.includes(file)),
  initialScriptsWithinBudget: total(initialFiles) <= contract.initialScriptCompressedBytes,
  lazySceneWithinBudget: total(sceneFiles) <= contract.lazySceneCompressedBytes,
};
const report = { identifier: contract.identifier, executionIdentifier: uuidVersionSeven(), recordedAt: new Date().toISOString(),
  sourceRevision: manifest.sourceRevision, status: Object.values(checks).every(Boolean) ? 'pass' : 'fail', checks,
  initialScriptCompressedBytes: total(initialFiles), lazySceneCompressedBytes: total(sceneFiles), initialFiles, sceneFiles,
  scope: 'Gzip level 9 over built files. Actual network transfer, rendering and interaction performance are not measured.' };
await writeFile(path.join(projectRoot, 'reports/cosmic-bundle.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, checks, initialScriptCompressedBytes: report.initialScriptCompressedBytes, lazySceneCompressedBytes: report.lazySceneCompressedBytes }));
if (report.status !== 'pass') process.exitCode = 1;
