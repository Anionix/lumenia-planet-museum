import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { inspectGlb, validateArtworkManifest } from '../web/artwork/asset-contract.ts';
import { sourceManifest, projectRoot } from './source-revision.mjs';
import { uuidVersionSeven } from './identifiers.mjs';
import { observation, verificationResult, saveReport } from './report.mjs';

// llm machine contract; UUIDv5: 6c16261b-86c7-54d4-9712-99528cd7ca89; UUIDv7 generated per run
// transition: retained asset reference -> actual optimizer, validator and loader evidence
// This fixture is not shipped or loaded by the CSS-only application.
const manifest = await sourceManifest(), executionIdentifier = uuidVersionSeven();
const context = { sourceRevision: manifest.sourceRevision, executionIdentifier };
const readJson = async relative => JSON.parse(await readFile(path.join(projectRoot, relative), 'utf8'));
const registry = await readJson('contracts/claims.json');
const definitions = (await readJson('contracts/external-gates.json')).referenceGates;
const evidence = { manifest, executionIdentifier, gateNames: {}, scope: 'standalone asset reference, not current CSS application' };
const observations = [];
function add(name, value, reason, tools, revision = context.sourceRevision) {
  const definition = definitions.find(item => item.name === 'Lumenia.' + name);
  if (!definition) throw new Error('Unknown reference gate: ' + name);
  observations.push(observation(definition.name, value, definition.limit, definition.unit, tools, reason, { ...context, sourceRevision: revision }));
  evidence.gateNames[definition.gateIdentifier] = definition.name;
}
try {
  const pipeline = await readJson('reports/asset-pipeline-evidence.json'); evidence.assetPipeline = pipeline;
  const bytes = await readFile(path.join(projectRoot, 'artifacts/asset-fixtures/orbit.glb'));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const artifact = validateArtworkManifest(await readJson('artifacts/asset-fixtures/orbit.manifest.json'));
  const matches = artifact && artifact.sha256 === sha256 && pipeline.output.sha256 === sha256 && pipeline.state === 'validated';
  add('GltfpackOptimizationGate', matches ? pipeline.optimizer.exitCode : null, 'Asset pipeline evidence is absent or mismatched.',
    ['gltfpack 1.2.0 -cc -kn -ke', 'input/output SHA-256'], pipeline.sourceRevision);
  add('GltfValidatorConformanceGate', matches ? pipeline.validator.issues.numErrors : null, 'Asset validation is absent or failed.',
    ['Khronos glTF Validator ' + pipeline.versions.validator], pipeline.sourceRevision);
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const inspected = inspectGlb(arrayBuffer);
  const matchingFlags = artifact && Object.entries(inspected.flags).every(([name, value]) => artifact.flags[name] === value);
  const loader = new GLTFLoader(); await MeshoptDecoder.ready;
  if (inspected.flags.usesExtensionMeshopt || inspected.flags.usesKhronosMeshopt) loader.setMeshoptDecoder(MeshoptDecoder);
  // The checked-in gallery artifact is Meshopt-only. Other optional decoders require their own real fixtures.
  if (inspected.flags.usesKtx2 || inspected.flags.usesDraco) throw new Error('Additional decoder fixture validation is required');
  const loaded = await loader.parseAsync(arrayBuffer, '');
  const retained = loaded.scene.getObjectByName('LumeniaOrbit');
  evidence.loaderProbe = { threeVersion: '0.186.0', extensions: inspected.extensions, matchingFlags,
    namedNodePresent: Boolean(retained), extrasPreserved: Boolean(retained?.userData.claimIdentifier), sceneChildren: loaded.scene.children.length };
  add('ThreeLoaderCompatibilityGate', matches && matchingFlags && retained?.userData.claimIdentifier ? 0 : 1,
    'Actual GLTFLoader parsing or extension/preservation matching failed.', ['Three.js GLTFLoader', 'actual optimized asset bytes', 'conditional decoder regression tests']);
  loaded.scene.traverse(object => { object.geometry?.dispose(); for (const material of [].concat(object.material ?? [])) material.dispose(); });
} catch (error) {
  evidence.assetInspectionError = error.message;
  for (const name of ['GltfpackOptimizationGate', 'GltfValidatorConformanceGate', 'ThreeLoaderCompatibilityGate'])
    if (!observations.some(item => evidence.gateNames[item.gateIdentifier] === 'Lumenia.' + name)) add(name, null, error.message, ['asset evidence availability']);
}
if ((await sourceManifest()).sourceRevision !== manifest.sourceRevision) throw new Error('Source changed during reference inspection');
const result = verificationResult(registry, context.sourceRevision, executionIdentifier, observations);
await saveReport('asset-reference-report', result, evidence);
console.log(JSON.stringify({ status: result.status, scope: evidence.scope, gates: observations.length }));
process.exitCode = result.status === 'pass' ? 0 : 2;
