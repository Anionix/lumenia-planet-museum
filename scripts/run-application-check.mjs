import { readFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { ESLint } from 'eslint';
import plumeriaLoader from '@plumeria/turbopack-loader';
import { inspectSources } from './source-inspection.mjs';
import { sourceManifest, projectRoot } from './source-revision.mjs';
import { outputManifest } from './build-web.mjs';
import { uuidVersionSeven } from './identifiers.mjs';
import { observation, verificationResult, saveReport } from './report.mjs';
import { inspectCharacterAsset } from './inspect-character-asset.mjs';
import { isRegisteredInterfaceIcon } from './drawing-asset-policy.mjs';

// llm machine contract; claim UUIDv5: 07b6fb92-8639-50e0-873d-b43d3d5c28df
// execution UUIDv7 generated per run; transition: current sources + built bytes + real asset -> measured code gates
const manifest = await sourceManifest();
const executionIdentifier = uuidVersionSeven();
const context = { sourceRevision: manifest.sourceRevision, executionIdentifier };
const readJson = async relative => JSON.parse(await readFile(path.join(projectRoot, relative), 'utf8'));
const registry = await readJson('contracts/claims.json');
const definitions = (await readJson('contracts/external-gates.json')).gates;
const evidence = { manifest, executionIdentifier, generatedBy: 'scripts/run-application-check.mjs', gateNames: {} };
const observations = [];
const character = await inspectCharacterAsset(path.join(projectRoot, 'web/out'));
evidence.characterInspection = character;
const drawingGateName = character.receipt ? 'CssArtworkAndCharacterIsolationGate' : 'CssOnlyApplicationGate';
function add(name, value, reason, tools, revision = context.sourceRevision) {
  const definition = definitions.find(item => item.name === 'Lumenia.' + name);
  if (!definition) throw new Error('Unknown application gate: ' + name);
  observations.push(observation(definition.name, value, definition.limit, definition.unit, tools, reason, { ...context, sourceRevision: revision }));
  evidence.gateNames[definition.gateIdentifier] = definition.name;
}
const sources = new Map(await Promise.all(manifest.files.filter(file => file.path.startsWith('web/') &&
  (/\.tsx?$/.test(file.path) || /^web\/artwork\/.*\.mjs$/.test(file.path)) && !file.path.endsWith('.d.ts')).map(async file => [file.path, await readFile(path.join(projectRoot, file.path), 'utf8')])));
const inspection = inspectSources(sources); evidence.sourceInspection = inspection;
const lint = await new ESLint({ cwd: projectRoot }).lintFiles([...sources.keys()].filter(file => /\.tsx?$/.test(file)));
evidence.plumeriaDiagnostics = lint.map(({ filePath, messages }) => ({ file: path.relative(projectRoot, filePath), messages }));
const diagnostics = lint.flatMap(file => file.messages);
add('PlumeriaModuleScopeGate', inspection.issues.plumeriaScope.length + diagnostics.filter(item => item.ruleId === '@plumeria/no-inner-call').length,
  'Module-scope style violations were found.', ['TypeScript syntax tree', '@plumeria/eslint-plugin 19.1.4']);
add('PlumeriaClassStyleCompositionGate', inspection.issues.plumeriaComposition.length + diagnostics.filter(item => item.severity === 2 && item.ruleId !== '@plumeria/no-inner-call').length,
  'Invalid composition or official Plumeria errors were found.', ['TypeScript syntax tree', '@plumeria/eslint-plugin 19.1.4 with type information']);
add('NextComponentBoundaryGate', inspection.issues.componentBoundary.length, 'Client/server capability boundary violation.', ['TypeScript static and dynamic import graph', 'closed application capability policy']);
const configuration = (await import('../web/next.config.mjs')).default;
add('NextStaticExportBoundaryGate', inspection.issues.staticExport.length + (configuration.output === 'export' ? 0 : 1),
  'Static export configuration or source violates the deployment contract.', ['Next.js configuration', 'TypeScript syntax tree']);

try {
  const build = await readJson('reports/web-build-evidence.json'); evidence.build = build;
  const outputs = await outputManifest();
  const bytesUnchanged = build.state === 'built' && JSON.stringify(outputs) === JSON.stringify(build.outputs);
  const compile = plumeriaLoader.default ?? plumeriaLoader;
  const compilerOutputs = [];
  for (const [file, source] of sources) if (source.includes('@plumeria/core')) {
    const code = await new Promise((resolve, reject) => compile.call({ resourcePath: path.join(projectRoot, file),
      async: () => (error, result) => error ? reject(error) : resolve(result), addDependency() {}, clearDependencies() {} }, source));
    compilerOutputs.push({ file, code });
  }
  evidence.compilerOutputs = compilerOutputs;
  const clientModules = await readJson('reports/webpack-client-modules.json'); evidence.clientModules = clientModules;
  const runtimeProblems = [];
  const scan = (label, code) => {
    const parsed = ts.createSourceFile(label, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if ((ts.isIdentifier(node) && node.text === 'classStyle') ||
          (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === '@plumeria/core'))
        runtimeProblems.push({ file: label, syntax: node.getText(parsed) });
      ts.forEachChild(node, visit);
    }
    visit(parsed);
  };
  compilerOutputs.forEach(({ file, code }) => scan(file, code));
  for (const module of clientModules.modules) {
    if (module.resource && /node_modules\/@plumeria\/(core|runtime)\//.test(module.resource)) runtimeProblems.push({ module: module.identifier });
    if (module.transformedSource && /\.[jt]sx?$/.test(module.resource ?? '')) scan(module.resource, module.transformedSource);
  }
  const maps = [];
  for (const file of outputs) {
    if (file.path.endsWith('.js')) scan(file.path, await readFile(path.join(projectRoot, 'web/out', file.path), 'utf8'));
    if (file.path.endsWith('.js.map')) {
      const map = await readJson('web/out/' + file.path); maps.push({ file: file.path, sources: map.sources });
      for (const source of map.sources ?? []) if (/node_modules\/@plumeria\/(core|runtime)\//.test(source)) runtimeProblems.push({ file: file.path, source });
    }
  }
  evidence.sourceMaps = maps; evidence.runtimeProblems = runtimeProblems;
  add('PlumeriaRuntimeRemovalGate', bytesUnchanged && maps.length && compilerOutputs.length ? runtimeProblems.length : null,
    'Build evidence is missing, changed, or contains Plumeria runtime syntax.',
    ['official @plumeria/turbopack-loader', 'webpack client module graph', 'emitted JavaScript syntax and source maps'], build.sourceRevision);
  const drawingProblems = [];
  evidence.interfaceAssets = outputs.filter(file => isRegisteredInterfaceIcon(file, manifest.files));
  if (character.receipt && character.status !== 'pass') drawingProblems.push({ reason: character.failureReason });
  for (const module of clientModules.modules)
    if (/node_modules\/(three|.*(?:draco|meshopt|ktx2|basis))\//i.test(module.resource ?? ''))
      drawingProblems.push({ module: module.identifier, reason: 'Non-CSS rendering dependency' });
  for (const file of outputs)
    if ((/^(artworks|decoders)\/|\.(glb|gltf|ktx2|wasm|png|jpe?g|webp|avif|gif|svg)$/.test(file.path)) &&
      !isRegisteredInterfaceIcon(file, manifest.files) &&
      !(character.status === 'pass' && file.path === character.path))
      drawingProblems.push({ file: file.path, reason: 'Unregistered binary or non-CSS rendering asset in this build profile' });
  for (const file of inspection.clientReached) {
    const parsed = sources.get(file);
    if (/<(?:svg|canvas|img)\b|\.getContext\s*\(|WebGLRenderer|WebGLRenderingContext/.test(parsed))
      drawingProblems.push({ file, reason: 'Non-CSS drawing source' });
    if (file !== 'web/components/CssArtwork.tsx' && /requestAnimationFrame\s*\(/.test(parsed))
      drawingProblems.push({ file, reason: 'Unexpected drawing scheduler' });
  }
  evidence.drawingProfile = character.receipt ? 'cssArtworksAndRegisteredCharacterImage' : 'cssOnly';
  evidence.cssOnlyDrawingProblems = drawingProblems;
  add(drawingGateName, bytesUnchanged && clientModules.modules.length ? drawingProblems.length : null,
    'This build contains an unregistered drawing implementation, invalid character evidence, or stale output.',
    ['actual client module graph', 'application source policy', 'exported file inventory'], build.sourceRevision);
} catch (error) {
  evidence.runtimeInspectionError = error.message;
  add('PlumeriaRuntimeRemovalGate', null, error.message, ['production evidence availability']);
  add(drawingGateName, null, error.message, ['production evidence availability']);
}
const after = await sourceManifest();
if (after.sourceRevision !== manifest.sourceRevision) throw new Error('Source changed during application inspection');
const result = verificationResult(registry, context.sourceRevision, executionIdentifier, observations);
await saveReport('application-report', result, evidence);
console.log(JSON.stringify({ status: result.status, gates: observations.length, diagnostics: diagnostics.length, issues: inspection.issues }));
process.exitCode = result.status === 'pass' ? 0 : 2;
