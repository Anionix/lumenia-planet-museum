import { spawn } from 'node:child_process';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { sourceManifest, projectRoot } from './source-revision.mjs';
import { uuidVersionSeven } from './identifiers.mjs';
import { evidenceDigest, languageServerCheckSucceeded, languageServerFileBinding,
  languageServerReceiptMatchesSource } from './language-server-evidence.mjs';

// machine contract; record_identifier=5c51405c-2fe3-5546-8621-278af8174a55
// transition: source snapshot -> fixed MCP executable -> response -> unchanged source.
// No callbacks, completed responses, or caller-supplied manifests are accepted.
export async function captureLanguageServerReceipt(...overrides) {
  if (overrides.length) throw new TypeError('Capture takes no supplied results, callbacks, or manifests');
  const before = await sourceManifest(), executionIdentifier = uuidVersionSeven();
  const registry = JSON.parse(await readFile(path.join(projectRoot, 'contracts/claims.json'), 'utf8'));
  const proofs = registry.declarations.filter(item => item.kind === 'theorem');
  const first = proofs[0], file_path = path.join(projectRoot, first.sourcePath);
  const lines = (await readFile(file_path, 'utf8')).split('\n');
  const name = first.name.split('.').at(-1);
  const line = lines.findIndex(text => text.startsWith('theorem ' + name + ' ')) + 1;
  // The Lean outline supplies the closing position; do not guess proof-end lines.
  const requests = [
    { tool: 'lean_build', target: 'project', arguments: { lean_project_path: projectRoot } },
    { tool: 'lean_diagnostic_messages', target: first.name, arguments: { file_path } },
    { tool: 'lean_file_outline', target: first.name, arguments: { file_path } },
    { tool: 'lean_hover_info', target: first.name, arguments: { file_path, line, column: 9 } },
    { tool: 'lean_goal', target: first.name, arguments: { file_path }, resolveEndOf: first.name },
    ...proofs.map(item => ({ tool: 'lean_verify', target: item.name,
      arguments: { file_path: path.join(projectRoot, item.sourcePath), theorem_name: item.name, scan_source: true } })),
  ].map((request, sequence) => ({ ...request, sequence, invocationIdentifier: uuidVersionSeven() }));
  const checks = [], startedAt = new Date().toISOString();
  const child = spawn('uvx', ['--from', 'lean-lsp-mcp==0.27.0', '--with', 'mcp==1.27.2',
    'python', path.join(projectRoot, 'scripts/lean-language-server-client.py')],
  { cwd: projectRoot, stdio: ['pipe', 'pipe', 'inherit'], timeout: 300000 });
  const completed = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error('Lean process failed: ' + (signal ?? code))));
  });
  completed.catch(() => {}); // Stream parsing and process completion are both awaited below.
  child.stdin.end(JSON.stringify({ sourceRoot: projectRoot, executionIdentifier, requests }));
  try {
    for await (const text of createInterface({ input: child.stdout })) {
      const check = JSON.parse(text), expected = requests[checks.length];
      if (!expected || check.sequence !== expected.sequence || check.invocationIdentifier !== expected.invocationIdentifier ||
          check.tool !== expected.tool || check.target !== expected.target ||
          (expected.resolveEndOf ? !(Number.isInteger(check.arguments?.line) && check.arguments.line >= line &&
            check.arguments.file_path === file_path) : evidenceDigest(check.arguments) !== evidenceDigest(expected.arguments))) {
        throw new Error('MCP response does not match the submitted request');
      }
      const sourceFileBinding = languageServerFileBinding(check, before, projectRoot);
      if (sourceFileBinding === undefined) throw new Error('MCP requested an untracked or changed file');
      checks.push({ ...check, sourceFileBinding });
    }
    await completed;
  } finally { if (child.exitCode === null) child.kill(); }
  const after = await sourceManifest();
  if (before.sourceRevision !== after.sourceRevision || checks.length !== requests.length) {
    throw new Error('Source changed or MCP capture was incomplete');
  }
  const receipt = { ...after, executionIdentifier, sourceRoot: projectRoot,
    sourceRevisionBefore: before.sourceRevision, sourceRevisionAfter: after.sourceRevision,
    startedAt, recordedAt: new Date().toISOString(), checks,
    capture: { format: 'lean-lsp-capture/v2', origin: 'local-stdio-process',
      serverPackage: 'lean-lsp-mcp==0.27.0', protocolClientPackage: 'mcp==1.27.2',
      checkCount: checks.length, checksDigest: evidenceDigest(checks) } };
  if (!languageServerReceiptMatchesSource(receipt, after)) throw new Error('MCP receipt failed integrity checks');
  receipt.status = checks.every(languageServerCheckSucceeded) ? 'pass' : 'fail';
  const destination = path.join(projectRoot, 'reports/lean-lsp-evidence.json');
  const temporary = destination + '.' + executionIdentifier;
  await writeFile(temporary, JSON.stringify(receipt, null, 2) + '\n');
  await rename(temporary, destination);
  return receipt;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const receipt = await captureLanguageServerReceipt();
  console.log(JSON.stringify({ status: receipt.status, checks: receipt.checks.length, executionIdentifier: receipt.executionIdentifier }));
  process.exitCode = receipt.status === 'pass' ? 0 : 1;
}
