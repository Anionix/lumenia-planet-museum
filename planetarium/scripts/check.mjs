import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { claimIdentifier, uuidVersionSeven } from '../../scripts/identifiers.mjs';
import { sourceManifest, planetariumRoot, digest } from '../lib/revision.mjs';
import { declarationRegistry } from '../lib/declarations.mjs';
import { boundaryChecks } from '../checks/boundary-check.mjs';
import { dimensionChecks } from '../checks/dimension-check.mjs';
import { wolframChecks } from '../checks/wolfram-check.mjs';
import { knowledgeChecks } from '../checks/knowledge-check.mjs';
import { generateArtifacts } from './generate-artifacts.mjs';

// llm machine contract; artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867
// execution UUIDv7: generated once for each invocation below
// state: verification execution; transition: intent -> specification -> current source -> proof report -> gate report.
// Reports are derived artifacts. Every reported pass has a machine-observed value and explicit criterion.
const root = planetariumRoot;
const executionIdentifier = uuidVersionSeven();
const recordedAt = new Date().toISOString();
const artifactIdentifier = 'e67bec4e-cc81-54b8-8de8-e04f06503867';
const manifest = await sourceManifest();
const { sourceRevision } = manifest;
const declarations = await declarationRegistry(root);
const proofs = declarations.filter(item => item.kind === 'theorem');
const proofCounts = Object.fromEntries(['materialKernel', 'dimensionKernel', 'arithmeticHelper'].map(category =>
  [category, proofs.filter(proof => proof.category === category).length]));
const reportsDirectory = path.join(root, 'reports');
await mkdir(reportsDirectory, { recursive: true });
const gates = [];
const observations = {};
const relativeRead = name => readFile(path.join(root, name), 'utf8');
const readJson = async name => JSON.parse(await relativeRead(name));
const run = (command, arguments_, options = {}) => spawnSync(command, arguments_, {
  cwd: root, encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024, ...options });
function record(name, status, observedValue, limitValue, unit, tool, failureReason = null, details = {}) {
  const gateIdentifier = claimIdentifier('ArtPlanetarium.Gates.' + name);
  const gate = { gateIdentifier, gateName: name, status, observedValue, limitValue, unit, tool,
    sourceRevision, executionIdentifier, failureReason, ...details };
  assert.ok(['pass', 'fail', 'blocked', 'staleEvidence'].includes(status));
  assert.ok(status === 'pass' ? failureReason === null : typeof failureReason === 'string');
  gates.push(gate);
  return gate;
}
function checked(name, tool, callback) {
  try {
    const observation = callback();
    observations[name] = observation;
    record(name, 'pass', 0, 0, 'failedAssertions', tool, null, { observation, comparison: 'equal' });
    return observation;
  } catch (error) {
    record(name, 'fail', 1, 0, 'failedAssertions', tool, String(error.message), { comparison: 'equal' });
    return null;
  }
}
function payload(result) {
  if (result?.structuredContent) return result.structuredContent;
  for (const item of result?.content ?? []) {
    if (item.type === 'text') { try { return JSON.parse(item.text); } catch { /* Try the next structured block. */ } }
  }
  return null;
}
async function loadReceipt(name, filename) {
  let receipt;
  try { receipt = await readJson(filename); } catch (error) {
    if (error.code !== 'ENOENT') {
      record(name, 'fail', 0, 1, 'validReceipts', name, 'Receipt cannot be parsed: ' + error.message);
    } else record(name, 'blocked', 0, 1, 'currentReceipts', name, 'No execution receipt has been saved.');
    return null;
  }
  if (receipt.artifactIdentifier !== artifactIdentifier || receipt.sourceRevisionBefore !== sourceRevision ||
      receipt.sourceRevisionAfter !== sourceRevision) {
    record(name, 'staleEvidence', receipt.sourceRevisionAfter ?? null, sourceRevision, 'sourceRevision', name,
      'The receipt does not match the current artifact before and after execution.');
    return null;
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(receipt.executionIdentifier ?? '')) {
    record(name, 'fail', 0, 1, 'validExecutionIdentifiers', name, 'Receipt execution identifier is not UUIDv7.');
    return null;
  }
  return receipt;
}

const [intent, specification, knowledge, researchReceipt] = await Promise.all([
  relativeRead('intent.md'), relativeRead('spec.md'), readJson('knowledge.json'), readJson('research-receipt.json')]);
checked('ArtifactChainReferences', 'Node.js', () => {
  assert.ok(intent.includes('spec.md') && intent.includes('reports/proof-report.md'));
  assert.ok(specification.includes('knowledge.json') && specification.includes('node planetarium/scripts/check.mjs'));
  assert.equal(knowledge.artifactIdentifier, artifactIdentifier);
  return { intentDigest: digest(intent), specificationDigest: digest(specification), knowledgeDigest: digest(JSON.stringify(knowledge)) };
});

const build = run('lake', ['build']);
await writeFile(path.join(reportsDirectory, 'lean-build.txt'), (build.stdout ?? '') + (build.stderr ?? ''));
record('LeanProjectBuild', build.status === 0 ? 'pass' : 'fail', build.status, 0, 'exitCode', 'Lean 4.28.0 / Lake',
  build.status === 0 ? null : build.stderr || String(build.error || 'Build failed'), { comparison: 'equal' });

let auditResult = null;
if (build.status === 0) {
  const audit = run('lake', ['env', 'lean', 'formal/ArtPlanetarium/AxiomAudit.lean']);
  await writeFile(path.join(reportsDirectory, 'lean-axioms.txt'), (audit.stdout ?? '') + (audit.stderr ?? ''));
  auditResult = checked('LeanTransitiveAxioms', 'Lean #print axioms', () => {
    assert.equal(audit.status, 0, audit.stderr || String(audit.error));
    for (const proof of proofs) {
      assert.ok(audit.stdout.includes("'" + proof.name + "' does not depend on any axioms"), 'Missing zero-axiom result: ' + proof.name);
    }
    assert.ok(!/depends on axioms:/.test(audit.stdout));
    return { theorems: proofs.length, transitiveAxiomCount: 0 };
  });
  checked('MaterialJsonBoundaryAgreement', 'Lean executable + Node.js', () => boundaryChecks(root, knowledge.profiles));
  checked('DimensionJsonBoundaryAgreement', 'Lean executable + Node.js', () => dimensionChecks(root));
} else {
  for (const name of ['LeanTransitiveAxioms', 'MaterialJsonBoundaryAgreement', 'DimensionJsonBoundaryAgreement']) {
    record(name, 'blocked', null, 0, 'failedAssertions', 'Lean executable', 'LeanProjectBuild failed.');
  }
}
checked('KnowledgeGraphReferences', 'Node.js assertions + Exa capture metadata', () => knowledgeChecks(knowledge, declarations, researchReceipt));
await generateArtifacts(root, knowledge, declarations, sourceRevision, executionIdentifier);
const typecheck = run(path.resolve(root, '../node_modules/.bin/tsc'), ['--noEmit', '--skipLibCheck',
  '--strict', '--target', 'ES2022', '--module', 'ESNext', '--moduleResolution', 'bundler', 'generated/MaterialSphere.styles.ts']);
record('GeneratedPlumeriaTypes', typecheck.status === 0 ? 'pass' : 'fail', typecheck.status, 0, 'exitCode', 'TypeScript',
  typecheck.status === 0 ? null : (typecheck.stdout + typecheck.stderr) || String(typecheck.error), { comparison: 'equal' });

const leanReceipt = await loadReceipt('LeanLanguageServerInspection', 'reports/lean-language-server-receipt.json');
if (leanReceipt) checked('LeanLanguageServerInspection', 'lean-lsp-mcp', () => {
  const records = leanReceipt.records;
  assert.ok(Array.isArray(records) && records.every(item => item.result?.isError !== true));
  const built = records.find(item => item.tool === 'lean_build');
  assert.equal(payload(built?.result)?.success, true);
  for (const file of new Set(declarations.map(item => item.file))) {
    const diagnosis = records.find(item => item.tool === 'lean_diagnostic_messages' && item.input.file_path.endsWith('/' + file));
    const result = payload(diagnosis?.result)?.result;
    assert.equal(result?.success, true);
    assert.ok(result.timed_out !== true && (result.failed_dependencies ?? []).length === 0);
    assert.deepEqual((result.items ?? []).filter(item => ['warning', 'error'].includes(item.severity)), []);
    const outline = records.find(item => item.tool === 'lean_file_outline' && item.input.file_path.endsWith('/' + file));
    assert.ok(Array.isArray(payload(outline?.result)?.declarations));
  }
  for (const proof of proofs) {
    const verification = records.find(item => item.tool === 'lean_verify' && item.input.theorem_name === proof.name);
    assert.deepEqual(payload(verification?.result)?.axioms, []);
    assert.deepEqual(payload(verification?.result)?.warnings, []);
  }
  const goals = records.filter(item => item.tool === 'lean_goal');
  assert.ok(goals.length >= 2);
  for (const goal of goals) assert.deepEqual(payload(goal.result)?.goals_after, []);
  const hovers = records.filter(item => item.tool === 'lean_hover_info');
  assert.ok(hovers.length >= 2 && hovers.every(item => payload(item.result)?.info?.length > 0));
  return { recordedCalls: records.length, inspectedTheorems: proofs.length, receiptExecutionIdentifier: leanReceipt.executionIdentifier };
});

const wolframReceipt = await loadReceipt('WolframIndependentCalculation', 'reports/wolfram-receipt.json');
const wolframCode = wolframReceipt ? await relativeRead('verification-dimension.wl') : null;
if (wolframReceipt) checked('WolframIndependentCalculation', 'Wolfram Language evaluator', () => {
  assert.ok(wolframReceipt.result && wolframReceipt.result.isError !== true);
  assert.equal(wolframReceipt.input.codeDigest, digest(wolframCode));
  return { ...wolframChecks(wolframReceipt.result), receiptExecutionIdentifier: wolframReceipt.executionIdentifier };
});

record('MaterialSphereBrowserRendering', 'blocked', 0, 4, 'measuredBrowsers', 'Chrome / Safari / Firefox / Edge',
  'The new Material Sphere schemas have not been connected to the exhibition application or measured in browsers.');
record('PlumeriaBuildRuntimeRemoval', 'blocked', null, 0, 'remainingRuntimeCalls', 'Plumeria production build',
  'Generated schemas are type-checked; a production Plumeria build for these schemas has not been measured.');
const after = await sourceManifest();
record('SourceRevisionUnchangedDuringVerification', after.sourceRevision === sourceRevision ? 'pass' : 'staleEvidence',
  after.sourceRevision, sourceRevision, 'sourceRevision', 'SHA-256 source manifest',
  after.sourceRevision === sourceRevision ? null : 'A source input changed during this execution.', { comparison: 'equal' });
if (after.sourceRevision !== sourceRevision) {
  for (const gate of gates.filter(item => item.status === 'pass')) {
    gate.status = 'staleEvidence'; gate.failureReason = 'A source input changed during this execution.';
  }
}
const reportMetadata = { artifactIdentifier, sourceRevision, executionIdentifier, recordedAt,
  machineContract: { state: 'observed', transition: 'source-bound evidence -> proof report -> gate report' } };
const proofReport = { ...reportMetadata, request: { artifactIdentifier,
  claimIdentifiers: proofs.map(item => item.declarationIdentifier), proofTargets: proofs.map(item => item.name),
  sourceRevision, measurementProfile: 'exactIntegerKernelWithFiniteCrossLanguageChecks' },
  proofs, proofCounts, axiomAudit: auditResult, gates: gates.filter(item => ['LeanProjectBuild', 'LeanTransitiveAxioms',
    'LeanLanguageServerInspection', 'WolframIndependentCalculation', 'SourceRevisionUnchangedDuringVerification'].includes(item.gateName)) };
await writeFile(path.join(reportsDirectory, 'proof-report.json'), JSON.stringify(proofReport, null, 2) + '\n');
const proofReportBytes = await readFile(path.join(reportsDirectory, 'proof-report.json'));
const summary = Object.fromEntries(['pass', 'fail', 'blocked', 'staleEvidence'].map(status => [status, gates.filter(item => item.status === status).length]));
const gateReport = { ...reportMetadata, predecessor: { file: 'proof-report.json', digest: digest(proofReportBytes) }, summary, gates, observations };
await writeFile(path.join(reportsDirectory, 'gate-report.json'), JSON.stringify(gateReport, null, 2) + '\n');
await writeFile(path.join(reportsDirectory, 'source-manifest.json'), JSON.stringify({ ...reportMetadata, ...manifest }, null, 2) + '\n');
const frontmatter = type => `---\ntype: ${type}\nartifact_identifier: ${artifactIdentifier}\nexecution_identifier: ${executionIdentifier}\nsource_revision: ${sourceRevision}\n---\n\n`;
await writeFile(path.join(reportsDirectory, 'proof-report.md'), frontmatter('Proof Report') +
  `# Material Sphereの証明検査\n\n公開定理${proofs.length}件（表面規則${proofCounts.materialKernel}件、次元規則${proofCounts.dimensionKernel}件、算術補助${proofCounts.arithmeticHelper}件）。公理依存の検査結果：${auditResult ? '0件' : '未確定'}。\n\n` +
  '整数格子・入力検証・状態・証拠判定についての証明です。人物の美しさや史実、ブラウザー性能は対象外です。\n\n' +
  '[全結果と型・識別子](proof-report.json) · [公理監査出力](lean-axioms.txt) · [検査報告](gate-report.md)\n\n' +
  proofs.map(proof => `- ${proof.name} — ${proof.declarationIdentifier}`).join('\n') + '\n');
await writeFile(path.join(reportsDirectory, 'gate-report.md'), frontmatter('Gate Report') +
  '# Material Sphereの検査結果\n\n' + Object.entries(summary).map(([status, count]) => `${status}: ${count}`).join(' / ') + '\n\n' +
  '| 検査 | 状態 | 観測値 | 基準 | 単位 |\n| --- | --- | --- | --- | --- |\n' +
  gates.map(gate => `| ${gate.gateName} | ${gate.status} | ${JSON.stringify(gate.observedValue)} | ${JSON.stringify(gate.limitValue)} | ${gate.unit} |`).join('\n') +
  '\n\n' + gates.filter(gate => gate.failureReason).map(gate => `- ${gate.gateName}: ${gate.failureReason}`).join('\n') +
  '\n\n[機械可読な結果](gate-report.json) · [先行する証明報告](proof-report.md) · [人物カード](../generated/index.md)\n');
console.log(JSON.stringify({ ...summary, sourceRevision, executionIdentifier, proofs: proofs.length,
  report: path.join(reportsDirectory, 'gate-report.md') }, null, 2));
process.exitCode = summary.fail > 0 || summary.staleEvidence > 0 ? 1 : 0;
