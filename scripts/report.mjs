import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { claimIdentifier } from './identifiers.mjs';
import { evaluateObservation, expectedMeasurementProfile, validateVerificationDocument } from './contract.mjs';
import { projectRoot } from './source-revision.mjs';

export function observation(name, value, limit, unit, checkedBy, reason, context) {
  const item = {
    gateIdentifier: claimIdentifier(name), status: 'blocked', observedValue: value,
    limit, unit, checkedBy, failureReason: null, ...context,
  };
  item.status = evaluateObservation(item, context.sourceRevision);
  item.failureReason = item.status === 'pass' ? null : reason;
  return item;
}

export function verificationResult(registry, sourceRevision, executionIdentifier, observations) {
  const proofs = registry.declarations.filter((item) => item.kind === 'theorem');
  const statuses = new Set(observations.map((item) => item.status));
  const status = ['fail', 'blocked', 'staleEvidence', 'pass'].find((state) => statuses.has(state));
  return {
    artifactIdentifier: claimIdentifier('Lumenia.verificationArtifact'),
    claimIdentifiers: proofs.map((item) => item.claimIdentifier),
    proofTargets: proofs.map((item) => item.name),
    sourceRevision, measurementProfile: structuredClone(expectedMeasurementProfile),
    executionIdentifier, createdAt: new Date().toISOString(), status, observations,
  };
}

export async function saveReport(name, result, evidence) {
  const validation = validateVerificationDocument(result);
  if (!validation.valid) throw new Error(validation.errors.join('\n'));
  const directory = path.join(projectRoot, 'reports');
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name + '.json'), JSON.stringify(result, null, 2) + '\n');
  await writeFile(path.join(directory, name + '-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  const labels = evidence.gateNames ?? {};
  const axiomDependencies = Object.values(evidence.axiomDependencies ?? {});
  const escape = (value) => String(value ?? 'null').replaceAll('|', '\\|').replaceAll('\n', ' ');
  const lines = [
    '---', 'type: Verification Report', 'title: Lumenia ' + name,
    'status: ' + result.status, 'sourceRevision: ' + result.sourceRevision,
    'executionIdentifier: ' + result.executionIdentifier,
    'generated:', '  by: ' + (evidence.generatedBy ?? ('scripts/' + (name === 'proof-report' ? 'run-formal-check' : 'run-gates') + '.mjs')),
    '  at: ' + result.createdAt, '---', '',
    '[Intent](../intent.md) → [Specification](../spec.md) → [Proof report](proof-report.md) → [Gate report](gate-report.md)', '',
    '各観測のソース改訂・実行識別子はJSONに記録。空欄・古い証拠・未実行は合格になりません。', '',
    ...(name === 'proof-report' ? [
      '公理依存の必須値：各定理0。標準公理も例外扱いしません。',
      '取得した定理：' + axiomDependencies.length + '。依存なし：' +
        axiomDependencies.filter((dependencies) => dependencies.length === 0).length +
        '。依存あり：' + axiomDependencies.filter((dependencies) => dependencies.length > 0).length + '。', '',
    ] : []),
    '| Gate | Status | Observed | Limit | Unit | Reason |',
    '| --- | --- | ---: | ---: | --- | --- |',
    ...result.observations.map((item) => '| ' + [labels[item.gateIdentifier] ?? item.gateIdentifier,
      item.status, item.observedValue, item.limit, item.unit, item.failureReason].map(escape).join(' | ') + ' |'),
    '', '[Machine result](' + name + '.json) · [Raw tool evidence](' + name + '-evidence.json)', '',
  ];
  await writeFile(path.join(directory, name + '.md'), lines.join('\n'));
}
