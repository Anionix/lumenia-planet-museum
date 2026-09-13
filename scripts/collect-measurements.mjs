import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { sourceManifest, projectRoot } from './source-revision.mjs';
import { uuidVersionSeven } from './identifiers.mjs';
import { observation, verificationResult, saveReport } from './report.mjs';
import { validateVerificationDocument } from './contract.mjs';
import { summarizeBrowserRuns } from './browser-observations.mjs';

// llm machine contract; claim UUIDv5: b70d510f-8a47-5422-b007-5fd5d1d9a80b
// execution UUIDv7 generated per aggregation; transition: retained tool receipts -> strictly revision-bound observations
const inputs = await sourceManifest(), executionIdentifier = uuidVersionSeven();
const context = { sourceRevision: inputs.sourceRevision, executionIdentifier };
const read = async relative => JSON.parse(await readFile(path.join(projectRoot, relative), 'utf8'));
const definitions = (await read('contracts/external-gates.json')).gates;
const registry = await read('contracts/claims.json');
const evidence = { manifest: inputs, executionIdentifier, generatedBy: 'scripts/collect-measurements.mjs', gateNames: {}, browserCapture: null, applicationReport: null };
try { evidence.browserCapture = await read('reports/browser/chrome-evidence.json'); } catch {}
try { evidence.applicationReport = await read('reports/application-report.json'); } catch {}
const capture = evidence.browserCapture;
const summary = summarizeBrowserRuns(capture); evidence.summary = summary;
const eligibleCapture = capture?.toolName === 'mcp__playwright__browser_run_code_unsafe' &&
  capture.sourceRevision === capture.afterSourceRevision && capture.buildSourceRevision === capture.sourceRevision &&
  capture.outputDigestBefore === capture.outputDigestAfter && Boolean(capture.outputDigestBefore);
const maximum = selector => {
  if (!eligibleCapture || !summary.complete) return null;
  const values = summary.stages.map(selector).filter(value => value !== undefined);
  return values.length && values.every(value => typeof value === 'number' && Number.isFinite(value) && value >= 0) ? Math.max(...values) : null;
};
const measured = new Map([
  ['Lumenia.CoreInitialTransferGate', maximum(stage => stage.coreBytes)],
  ['Lumenia.HtmlInitialTransferGate', maximum(stage => stage.bytes.html)],
  ['Lumenia.JavaScriptInitialTransferGate', maximum(stage => stage.bytes.javascript)],
  ['Lumenia.StyleInitialTransferGate', maximum(stage => stage.bytes.style)],
  ['Lumenia.FontInitialTransferGate', maximum(stage => stage.bytes.font)],
  ['Lumenia.MetadataInitialTransferGate', maximum(stage => stage.bytes.metadata)],
  ['Lumenia.LargestContentfulPaintGate', maximum(stage => stage.largestContentfulPaint)],
  ['Lumenia.FirstUsableArtworkGate', maximum(stage => stage.stage === 'empty' ? undefined : stage.firstUsableArtwork)],
  ['Lumenia.ArtworkGpuMemoryGate', null],
  ['Lumenia.CssLineArtworkDrawingGate', eligibleCapture ? capture?.data?.runs?.find(run => run.stage === 'css')?.cssDrawing ?? null : null],
  ['Lumenia.CssSurfaceArtworkDrawingGate', eligibleCapture ? capture?.data?.runs?.find(run => run.stage === 'surface')?.cssDrawing ?? null : null],
  ['Lumenia.CssSolidArtworkDrawingGate', eligibleCapture ? capture?.data?.runs?.find(run => run.stage === 'solid')?.cssDrawing ?? null : null],
]);
const application = evidence.applicationReport;
const applicationValid = application && validateVerificationDocument(application).valid;
const observations = definitions.map(definition => {
  evidence.gateNames[definition.gateIdentifier] = definition.name;
  const fromApplication = applicationValid && application.observations.find(item => item.gateIdentifier === definition.gateIdentifier);
  if (fromApplication) return { ...fromApplication, executionIdentifier,
    status: fromApplication.sourceRevision === context.sourceRevision ? fromApplication.status : 'staleEvidence',
    failureReason: fromApplication.sourceRevision === context.sourceRevision ? fromApplication.failureReason : 'Application receipt refers to an older revision.' };
  const functional = definition.name.match(/^Lumenia\.Chrome(Empty|Css|Surface|Solid)FunctionalityGate$/);
  let value = measured.has(definition.name) ? measured.get(definition.name) : null;
  if (functional && eligibleCapture) value = summary.stages.find(stage => stage.stage === functional[1].toLowerCase())?.functional ?? null;
  const browserRelevant = measured.has(definition.name) || functional;
  const reason = value === null ? 'No usable machine observation. Safari remote automation is disabled; Firefox and Edge are not connected. GPU memory is unavailable.' :
    definition.limit === null ? 'An explicit per-artwork limit is not configured.' : 'Observed value violates the configured gate.';
  return observation(definition.name, value, definition.limit, definition.unit,
    [browserRelevant ? 'Chrome ' + (capture?.data?.version ?? 'unavailable') + '; Performance APIs and actual control interactions; cold local diagnostic profile' : 'enabled browser availability check'],
    reason, { ...context, sourceRevision: browserRelevant && capture?.sourceRevision ? capture.sourceRevision : context.sourceRevision });
});
const result = verificationResult(registry, context.sourceRevision, executionIdentifier, observations);
await saveReport('measurement-report', result, evidence);
console.log(JSON.stringify({ status: result.status, summary }));
