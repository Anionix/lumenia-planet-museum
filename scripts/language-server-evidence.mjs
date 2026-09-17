import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { projectRoot } from './source-revision.mjs';
import { parseIsoTimestamp } from './iso-timestamp.mjs';

// machine contract; record_identifier=35302202-9761-5b5d-ac14-01302e53c2bc
// transition: explicit axiom dependencies -> accept only an empty list.
export const axiomDependenciesAreEmpty = axioms => Array.isArray(axioms) && axioms.length === 0;
const canonical = value => value == null ? 'null' : typeof value !== 'object' ? JSON.stringify(value) :
  Array.isArray(value) ? '[' + value.map(canonical).join(',') + ']' :
  '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
export const evidenceDigest = value => 'sha256:' + createHash('sha256').update(canonical(value)).digest('hex');
const uuidVersionSeven = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const languageServerTools = ['lean_build', 'lean_diagnostic_messages', 'lean_file_outline',
  'lean_hover_info', 'lean_goal', 'lean_verify'];

export function languageServerTargetMatchesInvocation(check) {
  if (check?.tool === 'lean_verify') return typeof check.target === 'string' && check.target.length > 0 &&
    check.target === check.arguments?.theorem_name;
  const declaration = check?.arguments?.declaration_name;
  return declaration === undefined || declaration === check?.target;
}

export function languageServerFileBinding(check, manifest, root, recordedRoot = root) {
  if (check.tool === 'lean_build') return check.arguments?.lean_project_path === recordedRoot ? null : undefined;
  const requested = check.arguments?.file_path;
  if (typeof requested !== 'string' || !requested) return undefined;
  const relative = path.relative(recordedRoot, path.resolve(recordedRoot, requested)).split(path.sep).join('/');
  if (!relative || relative.startsWith('../') || relative === '..' || path.isAbsolute(relative)) return undefined;
  const entry = manifest.files.find(file => file.path === relative);
  if (!entry || !/^[0-9a-f]{64}$/.test(entry.sha256)) return undefined;
  try {
    const actualRoot = realpathSync(root), actualPath = realpathSync(path.resolve(actualRoot, relative));
    if (path.relative(actualRoot, actualPath).split(path.sep).join('/') !== relative ||
        createHash('sha256').update(readFileSync(actualPath)).digest('hex') !== entry.sha256) return undefined;
    return entry;
  } catch { return undefined; }
}

// machine contract; record_identifier=5c51405c-2fe3-5546-8621-278af8174a55
// Hashes check integrity and source identity, not authenticity of arbitrary JSON.
// The formal gate obtains a new receipt from the fixed local MCP process each run.
export function languageServerReceiptMatchesSource(receipt, manifest, root = projectRoot) {
  const checks = receipt?.checks, capture = receipt?.capture;
  if (!Array.isArray(checks) || checks.length === 0 || !Array.isArray(manifest?.files) ||
      capture?.format !== 'lean-lsp-capture/v2' || capture.origin !== 'local-stdio-process' ||
      capture.serverPackage !== 'lean-lsp-mcp==0.27.0' || !uuidVersionSeven.test(receipt.executionIdentifier ?? '') ||
      typeof receipt.sourceRoot !== 'string' || !path.isAbsolute(receipt.sourceRoot) ||
      !['sourceRevision', 'sourceRevisionBefore', 'sourceRevisionAfter'].every(key => receipt[key] === manifest.sourceRevision) ||
      canonical(receipt.files) !== canonical(manifest.files) || capture.checksDigest !== evidenceDigest(checks) ||
      capture.checkCount !== checks.length || (receipt.bindingHistory?.length ?? 0) !== 0) return false;
  const identifiers = new Set();
  return checks.every((check, sequence) => {
    if (!check || typeof check !== 'object') return false;
    const binding = languageServerFileBinding(check, manifest, root, receipt.sourceRoot);
    const receiptStart = parseIsoTimestamp(receipt.startedAt), receiptEnd = parseIsoTimestamp(receipt.recordedAt);
    const start = parseIsoTimestamp(check.startedAt), end = parseIsoTimestamp(check.completedAt);
    if (!languageServerTools.includes(check.tool) || !languageServerTargetMatchesInvocation(check) ||
        binding === undefined || canonical(binding) !== canonical(check.sourceFileBinding) ||
        check.sequence !== sequence || !uuidVersionSeven.test(check.invocationIdentifier ?? '') ||
        identifiers.has(check.invocationIdentifier) || !Number.isFinite(start) || !Number.isFinite(end) ||
        !(receiptStart <= start && start <= end && end <= receiptEnd)) return false;
    identifiers.add(check.invocationIdentifier);
    return true;
  });
}

export function languageServerCheckSucceeded(check) {
  if (!check || typeof check !== 'object') return false;
  if (!languageServerTargetMatchesInvocation(check) || check.response?.isError) return false;
  let data = check.response?.structuredContent;
  if (!data) {
    try { data = JSON.parse(check.response?.content?.find(item => item.type === 'text')?.text); }
    catch { return false; }
  }
  switch (check.tool) {
    case 'lean_build': return data?.success === true && data.errors?.length === 0;
    case 'lean_diagnostic_messages': {
      const diagnostics = data?.result ?? data;
      return diagnostics?.success === true && diagnostics.timed_out !== true && Array.isArray(diagnostics.items) &&
        !diagnostics.items.some(item => ['error', 'warning'].includes(item.severity)) && diagnostics.failed_dependencies?.length === 0;
    }
    case 'lean_goal': return Array.isArray(data?.goals_after) && data.goals_after.length === 0 &&
      typeof data.line_context === 'string' && data.line_context.length > 0;
    case 'lean_hover_info': return typeof data?.info === 'string' && data.info.length > 0 &&
      typeof check.target === 'string' && data.symbol === check.target.split('.').at(-1);
    case 'lean_file_outline': return Array.isArray(data?.declarations) && data.declarations.length > 0;
    case 'lean_verify': return axiomDependenciesAreEmpty(data?.axioms) && Array.isArray(data.warnings) && data.warnings.length === 0;
    default: return false;
  }
}
