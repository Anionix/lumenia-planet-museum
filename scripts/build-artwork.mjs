#!/usr/bin/env node
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { TorusGeometry } from 'three';
import validator from 'gltf-validator';
import { projectRoot, sourceManifest } from './source-revision.mjs';
import { claimIdentifier, uuidVersionSeven } from './identifiers.mjs';
import { inspectGlb, validateArtworkManifest } from '../web/artwork/asset-contract.ts';

// llm machine contract; claim UUIDv5: 6c16261b-86c7-54d4-9712-99528cd7ca89
// execution UUIDv7 generated per run; states: source -> optimized -> validated; any failed check -> rejected
const executionIdentifier = uuidVersionSeven();
const inputs = await sourceManifest();
const sourceDirectory = path.join(projectRoot, 'artifacts/source');
const outputDirectory = path.join(projectRoot, 'artifacts/asset-fixtures');
// CSS-only release: retain old fixture outputs outside the publicly exported application.
await mkdir(path.join(projectRoot, 'artifacts/previous-assets'), { recursive: true });
try { await rename(path.join(projectRoot, 'web/public/artworks'), path.join(projectRoot, 'artifacts/previous-assets', executionIdentifier)); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
await mkdir(sourceDirectory, { recursive: true });
await mkdir(outputDirectory, { recursive: true });
const sourcePath = path.join(sourceDirectory, 'orbit.glb');
const outputPath = path.join(outputDirectory, 'orbit.glb');
const manifestPath = path.join(outputDirectory, 'orbit.manifest.json');
// Fail closed before touching old output. A failed optimization never leaves a validated manifest.
await writeFile(manifestPath, JSON.stringify({ stage: 'rejected', executionIdentifier }) + '\n');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const geometry = new TorusGeometry(1.62, 0.7, 16, 48);
const positions = geometry.getAttribute('position').array;
const normals = geometry.getAttribute('normal').array;
const indices = geometry.getIndex().array;
const sections = [positions, normals, indices].map(array => Buffer.from(array.buffer, array.byteOffset, array.byteLength));
const offsets = [0, sections[0].length, sections[0].length + sections[1].length];
const binary = Buffer.concat(sections);
const description = {
  asset: { version: '2.0', generator: 'Lumenia deterministic torus generator' },
  scene: 0, scenes: [{ nodes: [0] }],
  nodes: [{ name: 'LumeniaOrbit', mesh: 0, extras: { claimIdentifier: claimIdentifier('Lumenia.OrbitAsset') } }],
  meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }] }],
  materials: [{ pbrMetallicRoughness: { baseColorFactor: [208 / 255, 235 / 255, 134 / 255, 1], metallicFactor: 0, roughnessFactor: 1 } }],
  buffers: [{ byteLength: binary.length }],
  bufferViews: sections.map((section, index) => ({ buffer: 0, byteOffset: offsets[index], byteLength: section.length, target: index === 2 ? 34963 : 34962 })),
  accessors: [
    { bufferView: 0, componentType: 5126, count: positions.length / 3, type: 'VEC3', min: [-2.32, -2.32, -0.7], max: [2.32, 2.32, 0.7] },
    { bufferView: 1, componentType: 5126, count: normals.length / 3, type: 'VEC3' },
    { bufferView: 2, componentType: indices instanceof Uint16Array ? 5123 : 5125, count: indices.length, type: 'SCALAR' },
  ],
};
// Bounds are recorded from actual Float32 values, not rounded decimal design dimensions.
description.accessors[0].min = [0, 1, 2].map(axis => Math.min(...positions.filter((_, index) => index % 3 === axis)));
description.accessors[0].max = [0, 1, 2].map(axis => Math.max(...positions.filter((_, index) => index % 3 === axis)));
const json = Buffer.from(JSON.stringify(description));
const jsonPadded = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 32)]);
const binaryPadded = Buffer.concat([binary, Buffer.alloc((4 - binary.length % 4) % 4)]);
const header = Buffer.alloc(12), jsonHeader = Buffer.alloc(8), binaryHeader = Buffer.alloc(8);
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4);
header.writeUInt32LE(28 + jsonPadded.length + binaryPadded.length, 8);
jsonHeader.writeUInt32LE(jsonPadded.length, 0); jsonHeader.writeUInt32LE(0x4e4f534a, 4);
binaryHeader.writeUInt32LE(binaryPadded.length, 0); binaryHeader.writeUInt32LE(0x004e4942, 4);
const sourceBytes = Buffer.concat([header, jsonHeader, jsonPadded, binaryHeader, binaryPadded]);
await writeFile(sourcePath, sourceBytes);
geometry.dispose();
const argumentsList = [path.join(projectRoot, 'node_modules/gltfpack/cli.js'), '-i', sourcePath, '-o', outputPath, '-cc', '-kn', '-ke'];
const optimized = spawnSync(process.execPath, argumentsList, { cwd: projectRoot, encoding: 'utf8', timeout: 60000 });
const evidence = { executionIdentifier, sourceRevision: inputs.sourceRevision, inputs,
  versions: { node: process.version, gltfpack: '1.2.0', validator: validator.version() },
  transitions: ['source', ...(optimized.status === 0 ? ['optimized'] : [] )],
  createdAt: new Date().toISOString(), source: { path: sourcePath, sha256: digest(sourceBytes), byteLength: sourceBytes.length },
  optimizer: { command: process.execPath, arguments: argumentsList, exitCode: optimized.status, stdout: optimized.stdout, stderr: optimized.stderr }, state: 'rejected' };
await mkdir(path.join(projectRoot, 'reports'), { recursive: true });
if (optimized.status !== 0) {
  await writeFile(path.join(projectRoot, 'reports/asset-pipeline-evidence.json'), JSON.stringify(evidence, null, 2));
  throw new Error('gltfpack failed: ' + optimized.stderr);
}
const outputBytes = await readFile(outputPath);
const validation = await validator.validateBytes(new Uint8Array(outputBytes), { uri: 'orbit.glb', maxIssues: 1000 });
const assetJson = JSON.parse(outputBytes.subarray(20, 20 + outputBytes.readUInt32LE(12)).toString('utf8'));
const extensions = new Set(assetJson.extensionsUsed ?? []);
const nodesPreserved = assetJson.nodes?.some(node => node.name === 'LumeniaOrbit' && node.extras?.claimIdentifier === claimIdentifier('Lumenia.OrbitAsset'));
evidence.output = { path: outputPath, sha256: digest(outputBytes), byteLength: outputBytes.length, extensions: [...extensions], nodesPreserved };
evidence.validator = validation;
const inspected = inspectGlb(outputBytes.buffer.slice(outputBytes.byteOffset, outputBytes.byteOffset + outputBytes.byteLength));
const manifest = validateArtworkManifest({ artifactIdentifier: claimIdentifier('Lumenia.OrbitAsset'), stage: 'validated', resource: '/artworks/orbit.glb',
  sha256: digest(outputBytes), flags: { ...inspected.flags, requiresNamedNodes: true, requiresExtras: true },
  options: { hasMeshoptDecoder: true, hasKtx2Loader: false, hasDracoLoader: false, keepsNamedNodes: true, keepsExtras: true } });
const lean = manifest ? spawnSync(path.join(projectRoot, '.lake/build/bin/lumenia_boundary'), [],
  { input: JSON.stringify({ ...manifest.flags, ...manifest.options }) + '\n', encoding: 'utf8', timeout: 10000 }) : null;
evidence.leanBoundary = lean && { exitCode: lean.status, stdout: lean.stdout, stderr: lean.stderr };
const leanAccepted = lean?.status === 0 && JSON.parse(lean.stdout.trim()).accepted === true;
evidence.state = validation.issues.numErrors === 0 && nodesPreserved && manifest && leanAccepted ? 'validated' : 'rejected';
evidence.transitions.push(evidence.state);
await writeFile(path.join(projectRoot, 'reports/asset-pipeline-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
if (evidence.state !== 'validated') throw new Error('Validator, preservation, runtime schema or Lean boundary rejected the asset.');
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ state: evidence.state, sourceBytes: sourceBytes.length, optimizedBytes: outputBytes.length,
  validatorErrors: validation.issues.numErrors, nodesPreserved, executionIdentifier }));
