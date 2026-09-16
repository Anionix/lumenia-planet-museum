import { createHash } from 'node:crypto';
import { uuidVersionSeven } from './identifiers.mjs';

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

const uuidV7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const digestV1 = /^sha256:[0-9a-f]{64}$/i;
const transportBrand = Symbol('trusted-lean-lsp-transport');
const transportProofs = new WeakSet();

function captureProofMatchesCheck(check, index, executionIdentifier, sourceRevision) {
  const proof = check?.captureProof;
  if (!proof || proof.format !== 'lean-lsp-invocation/v1' ||
      proof.executionIdentifier !== executionIdentifier || proof.sourceRevision !== sourceRevision ||
      proof.sequence !== index || !uuidV7.test(proof.invocationIdentifier ?? '') ||
      proof.transportIdentifier !== 'mcp__lean_lsp' || !uuidV7.test(proof.challenge ?? '') ||
      !digestV1.test(proof.requestDigest ?? '') || proof.requestDigest !== digest({
        executionIdentifier, sourceRevision, sequence: index,
        invocationIdentifier: proof.invocationIdentifier, challenge: proof.challenge,
        tool: check.tool, target: check.target, arguments: check.arguments ?? null
      }) || !digestV1.test(proof.argumentsDigest ?? '') ||
      proof.argumentsDigest !== digest(check.arguments ?? null) || !digestV1.test(proof.responseDigest ?? '') ||
      proof.responseDigest !== digest(check.response)) return false;
  return true;
}

// The MCP client is the only transport boundary. Its response must echo the
// per-request challenge; a cached response from an earlier request cannot pass.
export function createLanguageServerMcpTransport(call) {
  if (typeof call !== 'function') throw new TypeError('An MCP transport function is required');
  return Object.freeze({
    [transportBrand]: true,
    transportIdentifier: 'mcp__lean_lsp',
    async request(request) {
      const result = await call(request);
      if (!result || typeof result !== 'object' || !('response' in result) || result.challenge !== request.challenge) {
        throw new TypeError('The MCP transport must return the current request challenge');
      }
      const proof = Object.freeze({transportIdentifier: 'mcp__lean_lsp', invocationIdentifier: request.invocationIdentifier,
        challenge: request.challenge, requestDigest: digest(request), responseDigest: digest(result.response)});
      transportProofs.add(proof);
      return {response: result.response, transportProof: proof};
    },
  });
}

// Capture owns the invocation boundary. Raw callbacks and completed responses are
// rejected; only the branded MCP transport can create a current proof.
export async function captureLanguageServerCheck({ executionIdentifier, sourceRevision, sequence,
  tool, target, arguments: args, transport }) {
  if (!executionIdentifier || !sourceRevision || !Number.isInteger(sequence) || sequence < 0 ||
      !transport || transport[transportBrand] !== true || typeof transport.request !== 'function') {
    throw new TypeError('A run identity, sequence and trusted MCP transport are required');
  }
  const invocationIdentifier = uuidVersionSeven(), challenge = uuidVersionSeven(), startedAt = new Date().toISOString();
  const request = {executionIdentifier, sourceRevision, sequence, invocationIdentifier, challenge,
    tool, target, arguments: args ?? null};
  const result = await transport.request(request), response = result.response, proof = result.transportProof;
  const completedAt = new Date().toISOString();
  if (!transportProofs.has(proof) || proof.transportIdentifier !== transport.transportIdentifier ||
      proof.invocationIdentifier !== invocationIdentifier || proof.challenge !== challenge ||
      proof.requestDigest !== digest(request) || proof.responseDigest !== digest(response)) {
    throw new TypeError('The MCP transport proof is missing or does not bind this invocation');
  }
  const captureProof = { format: 'lean-lsp-invocation/v1', executionIdentifier, sourceRevision,
    sequence, invocationIdentifier,
    startedAt, completedAt, argumentsDigest: digest(args ?? null), responseDigest: digest(response),
    transportIdentifier: transport.transportIdentifier, challenge, requestDigest: proof.requestDigest };
  return { tool, target, ...(args === undefined ? {} : { arguments: args }), response,
    executionIdentifier, sourceRevision, captureProof };
}

// machine contract; record_identifier=5c51405c-2fe3-5546-8621-278af8174a55.
// transition: one atomic capture -> per-response binding -> exact source comparison.
// A copied response cannot be relabelled without failing its content binding.
export function captureLanguageServerReceipt({ manifest, executionIdentifier, checks, startedAt, recordedAt }) {
  if (!manifest?.sourceRevision || !Array.isArray(manifest.files) || !Array.isArray(checks)) {
    throw new TypeError('A source manifest and captured checks are required');
  }
  const capturedChecks = checks.map((check, index) => {
    if (!captureProofMatchesCheck(check, index, executionIdentifier, manifest.sourceRevision)) {
      throw new TypeError('Every check must come from the current invocation capture');
    }
    return { ...check,
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
      checksDigest: digest(capturedChecks.map((check, index) => ({ index, bindingDigest: check.bindingDigest }))),
      invocationsDigest: digest(capturedChecks.map((check) => check.captureProof)) },
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
  const digestMatches = capture.checksDigest === digest(checks.map((check, index) => ({ index, bindingDigest: check.bindingDigest }))) &&
    capture.invocationsDigest === digest(checks.map((check) => check.captureProof));
  const invocationIdentifiers = new Set();
  return digestMatches && checks.every((check, index) => {
    return captureProofMatchesCheck(check, index, receipt.executionIdentifier, manifest.sourceRevision) &&
      !invocationIdentifiers.has(check.captureProof.invocationIdentifier) &&
      invocationIdentifiers.add(check.captureProof.invocationIdentifier) &&
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
