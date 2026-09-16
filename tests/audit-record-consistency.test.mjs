import test from 'node:test';
import assert from 'node:assert/strict';
import { readAuditRecords, verifyAuditRecords } from '../scripts/audit-record-consistency.mjs';

const records = await readAuditRecords();
test('six historical calculation records agree with their JSON Lines references', () => {
  const result = verifyAuditRecords(records);
  assert.equal(result.status, 'pass');
  assert.equal(result.checkCount, 55);
});
const replaceRootResult = (records, mutate) => {
  const root = records.wolfram.programs.find(program => program.name === 'root');
  mutate(root.decoded);
  root.response.content[0].text = 'Out[1]= ' + JSON.stringify(JSON.stringify(root.decoded));
};
for (const [name, mutate] of Object.entries({
  'older summary': value => value.summary.recordedAt = '2020-01-01T00:00:00Z',
  'older coverage': value => value.coverage[0].recordedAt = '2020-01-01T00:00:00Z',
  'invalid time': value => value.summary.recordedAt = 'invalid',
  'wrong referenced run': value => value.coverage[0].wolframExecutionIdentifier = value.summary.executionIdentifier,
  'mixed reconciliation runs': value => value.coverage[0].executionIdentifier = value.wolfram.executionIdentifier,
  'wrong source': value => value.coverage[0].sourceRevision = 'sha256:wrong',
  'missing source bindings': value => { delete value.wolfram.sourceRevisionBefore; delete value.wolfram.sourceRevisionAfter; delete value.summary.sourceRevision; value.coverage.forEach(row => delete row.sourceRevision); },
  'matching invalid source bindings': value => { value.wolfram.sourceRevisionBefore = value.wolfram.sourceRevisionAfter = value.summary.sourceRevision = 'invalid'; value.coverage.forEach(row => row.sourceRevision = 'invalid'); },
  'altered decoded value': value => value.wolfram.programs[0].decoded.totalInputCount++,
  'tool failure': value => value.wolfram.programs[0].response.isError = true,
  'missing coverage': value => value.coverage.pop(),
  'duplicate program': value => value.wolfram.programs[0] = value.wolfram.programs[1],
  'stale hashes': value => value.wolfram.revalidation = { allSemanticChecksPassed: true },
  'wrong check count': value => value.coverage[0].wolframCheckCount++,
  'earlier inner run': value => replaceRootResult(value, root => root.completedAtUtc = '2020-01-01T00:00:00Z'),
  'different inner run': value => replaceRootResult(value, root => root.runIdentifier = value.summary.executionIdentifier),
  'failed comparison': value => replaceRootResult(value, root => root.comparisons[0].implementationVersusGoldenMismatchCount = 1),
})) test('rejects ' + name, () => {
  const changed = structuredClone(records);
  mutate(changed);
  assert.throws(() => verifyAuditRecords(changed));
});
