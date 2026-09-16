#!/usr/bin/env node

// llm machine contract
// execution identifier: UUIDv7 generated per run; claim identifiers: UUIDv5(full gate name).
// state: proof verification
// transition: intent.md -> spec.md -> compiled proofs -> revision-bound proof report

import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { claimIdentifier, claimNamespace, uuidVersionSeven } from './identifiers.mjs';
import { sourceManifest, projectRoot } from './source-revision.mjs';
import { observation, verificationResult, saveReport } from './report.mjs';
import { evaluateObservation } from './contract.mjs';
import { axiomDependenciesAreEmpty, languageServerCheckSucceeded, languageServerReceiptMatchesSource } from './language-server-evidence.mjs';
import { captureLanguageServerReceipt } from './capture-language-server.mjs';

const manifest = await sourceManifest();
const executionIdentifier = uuidVersionSeven();
const context = { sourceRevision: manifest.sourceRevision, executionIdentifier };
const registry = JSON.parse(await readFile(path.join(projectRoot, 'contracts/claims.json'), 'utf8'));
const proofTargets = registry.declarations.filter((item) => item.kind === 'theorem');
const observations = [];
const evidence = { manifest, executionIdentifier, gateNames: {}, toolRuns: {}, axiomDependencies: {} };

function add(name, value, limit, unit, checkedBy, reason) {
  evidence.gateNames[claimIdentifier(name)] = name;
  observations.push(observation(name, value, limit, unit, checkedBy, reason, context));
}

function run(name, command, argumentsList) {
  const completed = spawnSync(command, argumentsList, {
    cwd: projectRoot, encoding: 'utf8', timeout: 60000, maxBuffer: 8 * 1024 * 1024,
  });
  const result = {
    command, arguments: argumentsList, exitCode: completed.status,
    stdout: completed.stdout ?? '', stderr: completed.stderr ?? '',
    error: completed.error?.message ?? null,
  };
  evidence.toolRuns[name] = result;
  add(name, result.exitCode, 0, 'exit code', [command + ' ' + argumentsList.join(' ')],
    result.error ?? (result.stderr + result.stdout).slice(-4000));
  return result;
}

const build = run('Lumenia.LeanProjectBuildGate', 'lake', ['build']);
const warnings = (build.stdout + build.stderr).match(/warning:/g) ?? [];
add('Lumenia.LeanWarningGate', build.exitCode === 0 ? warnings.length : null, 0,
  'warnings', ['lake build diagnostics'], 'Lean build did not succeed or emitted warnings.');

const tests = run('Lumenia.BoundaryRegressionGate', process.execPath, ['--test', '--test-reporter=tap']);
evidence.regressionSummary = {
  tests: Number(tests.stdout.match(/# tests (\d+)/)?.[1] ?? 0),
  failed: Number(tests.stdout.match(/# fail (\d+)/)?.[1] ?? 0),
};
run('Lumenia.ContractExamplesGate', process.execPath, [
  'scripts/verify-contract.mjs', 'contracts/examples/verification-request.json',
  'contracts/examples/verification-result.json', 'contracts/examples/valid-asset-manifest.json',
]);

const registryErrors = [];
if (registry.namespace !== claimNamespace) registryErrors.push('Claim namespace mismatch');
for (const declaration of registry.declarations) {
  const source = await readFile(path.join(projectRoot, declaration.sourcePath), 'utf8');
  const name = declaration.name.slice('Lumenia.'.length);
  if (declaration.claimIdentifier !== claimIdentifier(declaration.name) ||
      !source.includes(declaration.kind + ' ' + name) ||
      !source.includes(declaration.claimIdentifier)) registryErrors.push(declaration.name);
}
const proofSource = await readFile(path.join(projectRoot, 'formal/Lumenia/Proofs.lean'), 'utf8');
const declaredProofs = [...proofSource.matchAll(/^theorem ([a-zA-Z0-9_]+)/gm)].map((match) => 'Lumenia.' + match[1]);
if (declaredProofs.length !== proofTargets.length ||
    declaredProofs.some((name) => !proofTargets.some((item) => item.name === name))) {
  registryErrors.push('Proof registry does not exactly cover the public theorems');
}
add('Lumenia.ClaimIdentityGate', registryErrors.length, 0, 'mismatches',
  ['UUIDv5 namespace recomputation and Lean declaration inventory'], registryErrors.join('; '));
evidence.registryErrors = registryErrors;

const unsafeSources = [];
for (const file of manifest.files.filter((item) => item.path.endsWith('.lean'))) {
  const source = await readFile(path.join(projectRoot, file.path), 'utf8');
  const code = source.replace(/\/-[\s\S]*?-\//g, '').replace(/--[^\n]*/g, '');
  const patterns = code.match(/\b(?:sorry|admit|axiom|unsafe|partial|native_decide|implemented_by)\b|debug\.skipKernelTC|Lean\.ofReduceBool/g);
  if (patterns) unsafeSources.push({ path: file.path, patterns });
}
add('Lumenia.FormalSourcePatternGate', unsafeSources.length, 0, 'files',
  ['local Lean source scan; all project Lean files'], JSON.stringify(unsafeSources));
evidence.unsafeSources = unsafeSources;

const audit = run('Lumenia.LeanAxiomAuditExecutionGate', 'lake', ['env', 'lean', 'formal/Lumenia/AxiomAudit.lean']);
// llm machine contract; claim UUIDv5: 35302202-9761-5b5d-ac14-01302e53c2bc
// execution UUIDv7: 01a099bb-225c-7772-8fb8-869e4d9f9eec
// state: zero-axiom policy; transition: compiled dependency closure -> fail on any dependency
evidence.axiomPolicy = { requiredAxiomCountPerTheorem: 0, standardAxiomsAllowed: false };
const auditErrors = [];
for (const match of audit.stdout.matchAll(/'([^']+)' (depends on axioms: \[([^\]]*)\]|does not depend on any axioms)/g)) {
  const axioms = match[3] ? match[3].split(',').map((item) => item.trim()) : [];
  evidence.axiomDependencies[match[1]] = axioms;
  if (!axiomDependenciesAreEmpty(axioms)) auditErrors.push(match[1]);
}
for (const item of proofTargets) if (!(item.name in evidence.axiomDependencies)) auditErrors.push(item.name);
add('Lumenia.TheoremAxiomDependencyGate', audit.exitCode === 0 ? auditErrors.length : null, 0,
  'unverified theorems', ['Lean #print axioms for every registered public theorem'],
  'Zero axioms required; nonempty dependencies or missing output: ' + auditErrors.join(', '));

try {
  const receipt = await captureLanguageServerReceipt();
  evidence.languageServerReceipt = receipt;
  const requiredTools = ['lean_build', 'lean_diagnostic_messages', 'lean_goal',
    'lean_hover_info', 'lean_verify', 'lean_file_outline'];
  const missingTools = requiredTools.filter((tool) => !receipt.checks.some((check) => check.tool === tool));
  const incompleteProofs = proofTargets.filter((target) =>
    !receipt.checks.some((check) => check.tool === 'lean_verify' && check.target === target.name));
  const failures = receipt.checks.filter((check) => !languageServerCheckSucceeded(check));
  const receiptMatches = languageServerReceiptMatchesSource(receipt, manifest);
  const item = observation('Lumenia.LeanLanguageServerGate',
    missingTools.length + incompleteProofs.length + failures.length + (receiptMatches ? 0 : 1), 0, 'failed or missing checks',
    ['lean-lsp-mcp: ' + requiredTools.join(', ')],
    'Missing tools/theorems, failed calls, or stale language-server evidence.',
    { sourceRevision: receipt.sourceRevision, executionIdentifier });
  item.status = evaluateObservation(item, manifest.sourceRevision);
  item.failureReason = item.status === 'pass' ? null :
    'Language-server evidence is incomplete, failed, or belongs to a different source revision.';
  evidence.gateNames[item.gateIdentifier] = 'Lumenia.LeanLanguageServerGate';
  observations.push(item);
} catch (error) {
  add('Lumenia.LeanLanguageServerGate', null, 0, 'failed or missing checks',
    ['language-server receipt availability check'], 'Run the six Lean MCP checks for this revision: ' + error.message);
}

const after = await sourceManifest();
if (after.sourceRevision !== manifest.sourceRevision) {
  for (const item of observations) {
    item.status = 'staleEvidence';
    item.failureReason = 'Source inputs changed while verification was running.';
  }
}
const result = verificationResult(registry, after.sourceRevision, executionIdentifier, observations);
await saveReport('proof-report', result, evidence);
console.log('Proof report: ' + result.status + '; ' + proofTargets.length + ' registered theorems');
console.log(path.join(projectRoot, 'reports/proof-report.md'));
process.exitCode = result.status === 'pass' ? 0 : result.status === 'fail' ? 1 : 2;
