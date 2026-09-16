import { createHash } from 'node:crypto';

// llm machine contract
// claim identifier (UUIDv5): 35302202-9761-5b5d-ac14-01302e53c2bc
// execution identifier (UUIDv7): 01a099bb-225c-7772-8fb8-869e4d9f9eec
// state: zero-axiom policy; transition: explicit dependency list -> accept only an empty list
export function axiomDependenciesAreEmpty(axioms) {
  return Array.isArray(axioms) && axioms.length === 0;
}

function canonical(value) {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
}

function digest(value) {
  return 'sha256:' + createHash('sha256').update(canonical(value)).digest('hex');
}

function checkPayload(check) {
  return { tool: check?.tool ?? null, target: check?.target ?? null,
    arguments: check?.arguments ?? null, response: check?.response ?? null };
}

export function languageServerCheckBindingDigest(check, executionIdentifier, sourceRevision) {
  return digest({ executionIdentifier, sourceRevision, check: checkPayload(check) });
}

// machine contract; record_identifier=5c51405c-2fe3-5546-8621-278af8174a55.
// transition: one atomic capture -> per-response binding -> exact source comparison.
// A copied response cannot be relabelled without failing its content binding.
export function captureLanguageServerReceipt({ manifest, executionIdentifier, checks, startedAt, recordedAt }) {
  if (!manifest?.sourceRevision || !Array.isArray(manifest.files) || !Array.isArray(checks)) {
    throw new TypeError('A source manifest and captured checks are required');
  }
  const capturedChecks = checks.map((check) => {
    return { ...check, executionIdentifier,
      bindingDigest: languageServerCheckBindingDigest(check, executionIdentifier, manifest.sourceRevision) };
  });
  return {
    sourceRevision: manifest.sourceRevision,
    sourceRevisionBefore: manifest.sourceRevision,
    sourceRevisionAfter: manifest.sourceRevision,
    checkStartedAtSourceRevision: manifest.sourceRevision,
    files: structuredClone(manifest.files), executionIdentifier, startedAt, recordedAt,
    checks: capturedChecks,
    capture: { format: 'lean-lsp-capture/v1', atomic: true, executionIdentifier,
      sourceRevision: manifest.sourceRevision, checkCount: capturedChecks.length,
      checksDigest: digest(capturedChecks.map((check, index) => ({ index, bindingDigest: check.bindingDigest }))) },
  };
}

export function languageServerReceiptMatchesSource(receipt, manifest) {
  const checks = receipt?.checks, capture = receipt?.capture;
  if (!receipt || !manifest || !Array.isArray(checks) || !capture || capture.atomic !== true ||
      capture.format !== 'lean-lsp-capture/v1' || capture.executionIdentifier !== receipt.executionIdentifier ||
      capture.sourceRevision !== manifest.sourceRevision || capture.checkCount !== checks.length ||
      receipt.sourceRevision !== manifest.sourceRevision || receipt.sourceRevisionBefore !== manifest.sourceRevision ||
      receipt.sourceRevisionAfter !== manifest.sourceRevision || receipt.checkStartedAtSourceRevision !== manifest.sourceRevision ||
      (receipt.bindingHistory !== undefined && (!Array.isArray(receipt.bindingHistory) || receipt.bindingHistory.length !== 0)) ||
      canonical(receipt.files) !== canonical(manifest.files)) return false;
  const digestMatches = capture.checksDigest === digest(checks.map((check, index) => ({ index, bindingDigest: check.bindingDigest })));
  return digestMatches && checks.every((check) => {
    return check.executionIdentifier === receipt.executionIdentifier &&
      check.bindingDigest === languageServerCheckBindingDigest(check, receipt.executionIdentifier, manifest.sourceRevision);
  });
}

export function languageServerCheckSucceeded(check) {
  if (check.response?.isError) return false;
  let data = check.response?.structuredContent;
  if (!data) {
    try { data = JSON.parse(check.response?.content?.find((item) => item.type === 'text')?.text); }
    catch { return false; }
  }
  switch (check.tool) {
    case 'lean_build': return data?.success === true && data.errors?.length === 0;
    case 'lean_diagnostic_messages': {
      const diagnostics = data?.result ?? data;
      return diagnostics?.success === true && diagnostics.timed_out !== true &&
        Array.isArray(diagnostics.items) &&
        !diagnostics.items.some((item) => ['error', 'warning'].includes(item.severity)) &&
        diagnostics.failed_dependencies?.length === 0;
    }
    case 'lean_goal': return Array.isArray(data?.goals_after) && data.goals_after.length === 0 &&
      typeof data.line_context === 'string' && data.line_context.length > 0;
    case 'lean_hover_info': return typeof data?.info === 'string' && data.info.length > 0 &&
      typeof data.symbol === 'string' && data.symbol.includes(check.target.split('.').at(-1));
    case 'lean_file_outline': return Array.isArray(data?.declarations) && data.declarations.length > 0;
    case 'lean_verify': return axiomDependenciesAreEmpty(data?.axioms) &&
      Array.isArray(data.warnings) && data.warnings.length === 0;
    default: return false;
  }
}
