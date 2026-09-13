#!/usr/bin/env node

// llm machine contract: proof report -> current machine measurement receipts -> gate report.
// UUIDv5 identifies each full gate name; UUIDv7 identifies each evaluation run.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { claimIdentifier, uuidVersionSeven } from './identifiers.mjs';
import { sourceManifest, projectRoot } from './source-revision.mjs';
import { observation, verificationResult, saveReport } from './report.mjs';
import { evaluateObservation, validateVerificationDocument } from './contract.mjs';

const manifest = await sourceManifest();
const executionIdentifier = uuidVersionSeven();
const context = { sourceRevision: manifest.sourceRevision, executionIdentifier };
const registry = JSON.parse(await readFile(path.join(projectRoot, 'contracts/claims.json'), 'utf8'));
const gateContract = JSON.parse(await readFile(path.join(projectRoot, 'contracts/external-gates.json'), 'utf8'));
const definitions = gateContract.gates;
const evidence = { manifest, executionIdentifier, applicationProfile: gateContract.applicationProfile,
  referenceScope: gateContract.referenceScope, gateNames: {}, proofReport: null, measurementReceipt: null };
const observations = [];

let proof = null;
try { proof = JSON.parse(await readFile(path.join(projectRoot, 'reports/proof-report.json'), 'utf8')); }
catch { /* Missing proof evidence is recorded as blocked below. */ }
evidence.proofReport = proof;
const proofValid = proof && validateVerificationDocument(proof).valid;
const prerequisite = observation('Lumenia.ProofReportPrerequisiteGate',
  proofValid ? proof.status === 'pass' : null, true, 'boolean',
  ['proof report contract and source revision check'],
  'A passing proof report for the current source revision is required.',
  { ...context, sourceRevision: proofValid ? proof.sourceRevision : context.sourceRevision });
prerequisite.status = evaluateObservation(prerequisite, context.sourceRevision);
prerequisite.failureReason = prerequisite.status === 'pass' ? null :
  'A passing proof report for the current source revision is required.';
observations.push(prerequisite);
evidence.gateNames[prerequisite.gateIdentifier] = 'Lumenia.ProofReportPrerequisiteGate';

let measurementErrors = [];
const receiptPath = process.argv[2];
if (receiptPath) {
  try {
    evidence.measurementReceipt = JSON.parse(await readFile(receiptPath, 'utf8'));
    measurementErrors = validateVerificationDocument(evidence.measurementReceipt).errors;
    if (!Array.isArray(evidence.measurementReceipt.observations)) measurementErrors.push('A result receipt is required');
  } catch (error) { measurementErrors = [error.message]; }
}
for (const definition of definitions) {
  const measured = measurementErrors.length === 0 && evidence.measurementReceipt?.observations?.find(
    (item) => item.gateIdentifier === definition.gateIdentifier);
  const matches = measured && measured.unit === definition.unit && measured.limit === definition.limit;
  if (measured && !matches) measurementErrors.push(definition.name + ': configured limit/unit mismatch');
  const item = observation(definition.name, matches ? measured.observedValue : null,
    definition.limit, definition.unit, matches ? measured.checkedBy : ['measurement receipt availability check'],
    matches ? (measured.failureReason ?? 'Observed value exceeds the configured limit.') :
      'Missing machine measurement: ' + definition.measurement +
      (definition.limit === null ? '; an explicit per-artwork limit is also required.' : '.'),
    { ...context, sourceRevision: matches ? measured.sourceRevision : context.sourceRevision });
  item.status = evaluateObservation(item, context.sourceRevision);
  if (item.status === 'staleEvidence') item.failureReason = 'Measurement receipt refers to a different source revision.';
  observations.push(item);
  evidence.gateNames[item.gateIdentifier] = definition.name;
}
if (measurementErrors.length) {
  const item = observation('Lumenia.MeasurementReceiptIntegrityGate', measurementErrors.length, 0,
    'contract errors', ['verification result contract and gate definitions'], measurementErrors.join('; '), context);
  observations.push(item);
  evidence.gateNames[item.gateIdentifier] = 'Lumenia.MeasurementReceiptIntegrityGate';
}
evidence.measurementErrors = measurementErrors;
const result = verificationResult(registry, context.sourceRevision, executionIdentifier, observations);
result.claimIdentifiers.push(...definitions.map((definition) => claimIdentifier(definition.name)));
await saveReport('gate-report', result, evidence);
console.log('Release gate report: ' + result.status);
console.log(path.join(projectRoot, 'reports/gate-report.md'));
process.exitCode = result.status === 'pass' ? 0 : result.status === 'fail' ? 1 : 2;
