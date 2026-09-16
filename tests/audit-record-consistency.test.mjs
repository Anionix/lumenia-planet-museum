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
for (const [name, field] of [['material', 'calculationChecksPass'], ['images', 'all_passed'], ['clock', 'all_passed'], ['review', 'all_passed']])
  for (const outcome of [false, undefined]) test(`rejects ${name} aggregate ${outcome}`, () => {
    const changed = structuredClone(records), program = changed.wolfram.programs.find(program => program.name === name);
    program.decoded[field] = outcome;
    program.response.content[0].text = 'Out[1]= ' + JSON.stringify(JSON.stringify(program.decoded));
    assert.throws(() => verifyAuditRecords(changed));
  });
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
  'failed overall calculation': value => value.wolfram.status = 'fail',
  'missing calculation status': value => delete value.wolfram.status,
  'wrong nested source': value => value.summary.reconciliation.sourceRevision = value.wolfram.rootSourceRevision,
  'wrong summary root source': value => value.summary.rootSourceRevision = value.summary.sourceRevision,
  'wrong nested root source': value => value.summary.reconciliation.rootSourceRevision = value.summary.sourceRevision,
  'missing reconciliation': value => delete value.summary.reconciliation,
  'missing root sources': value => { delete value.wolfram.rootSourceRevision; delete value.summary.rootSourceRevision; delete value.summary.reconciliation.rootSourceRevision; },
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
