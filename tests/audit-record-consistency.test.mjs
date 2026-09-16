import test from 'node:test';
import assert from 'node:assert/strict';
import { readAuditRecords, verifyAuditRecords } from '../scripts/audit-record-consistency.mjs';

const records = await readAuditRecords();
const encodeResult = program => program.response.content[0].text = 'Out[1]= ' + JSON.stringify(JSON.stringify(program.decoded));
for (const name of ['material', 'images', 'exploration', 'clock', 'review']) test('accepts reordered ' + name + ' check names', () => {
  const changed = structuredClone(records), program = changed.wolfram.programs.find(program => program.name === name);
  const reverse = value => Object.fromEntries(Object.entries(value).reverse());
  if (name === 'exploration') program.decoded = reverse(program.decoded);
  else program.decoded.checks = reverse(program.decoded.checks);
  encodeResult(program);
  assert.equal(verifyAuditRecords(changed).status, 'pass');
});
test('all sixteen summary obligation combinations match the Boolean proof model', () => {
  for (let combination = 0; combination < 16; combination++) {
    const changed = structuredClone(records);
    if (!(combination & 8)) changed.summary.status = 'fail';
    if (!(combination & 4)) changed.coverage[0].previousExecutionIdentifier = changed.wolfram.executionIdentifier;
    if (!(combination & 2)) changed.summary.wolfram.statePairs++;
    if (!(combination & 1)) changed.wolfram.materialRuntimeComparison.mismatches++;
    if (combination === 15) assert.equal(verifyAuditRecords(changed).status, 'pass');
    else assert.throws(() => verifyAuditRecords(changed));
  }
});
test('six historical calculation records agree with their JSON Lines references', () => {
  const result = verifyAuditRecords(records);
  assert.equal(result.status, 'pass');
  assert.equal(result.checkCount, 55);
});
test('rejects an impossible date even when Date.parse would normalize it', () => {
  const changed = structuredClone(records);
  changed.summary.recordedAt = '2026-09-31T15:43:32.946Z';
  assert.throws(() => verifyAuditRecords(changed));
});
for (const [label, mutate] of Object.entries({
  'root function': value => value.wolfram.programs[0].decoded.comparisons[0].function = 'other',
  'root claim': value => value.wolfram.programs[0].decoded.comparisons[0].claimIdentifier = value.wolfram.programs[0].decoded.comparisons[1].claimIdentifier,
  'root input count': value => value.wolfram.programs[0].decoded.comparisons[0].inputCount++,
  'root total count': value => value.wolfram.programs[0].decoded.totalInputCount++,
  'missing named check': value => delete value.wolfram.programs[1].decoded.checks.exactCoordinateLengthsOneToFour,
  'replaced named check': value => { delete value.wolfram.programs[1].decoded.checks.exactCoordinateLengthsOneToFour; value.wolfram.programs[1].decoded.checks.unrelatedCheck = true; },
  'missing exploration check': value => delete value.wolfram.programs[3].decoded.coordinate_clamp,
  'missing images check': value => delete value.wolfram.programs[2].decoded.checks.coordinate_bounds,
  'missing clock check': value => delete value.wolfram.programs[4].decoded.checks.pause_identity,
  'missing review check': value => delete value.wolfram.programs[5].decoded.checks.clock_day_bound,
  'duplicate material input': value => { const program = value.wolfram.programs[1]; program.decoded.channelMix.rows[79] = program.decoded.channelMix.rows[0]; },
})) test('rejects ' + label, () => {
  const changed = structuredClone(records);
  mutate(changed);
  changed.wolfram.programs.forEach(encodeResult);
  const message = label === 'root total count' ? /Root total inputs/ : label.startsWith('root') ? /Root comparison inputs/ :
    label === 'duplicate material input' ? /Material input coverage/ : /check names/;
  assert.throws(() => verifyAuditRecords(changed), message);
});
const replaceRootResult = (records, mutate, name = 'root') => {
  const root = records.wolfram.programs.find(program => program.name === name);
  mutate(root.decoded);
  encodeResult(root);
};
for (const [name, field] of [['material', 'calculationChecksPass'], ['images', 'all_passed'], ['clock', 'all_passed'], ['review', 'all_passed']])
  for (const outcome of [false, undefined]) test(`rejects ${name} aggregate ${outcome}`, () => {
    const changed = structuredClone(records), program = changed.wolfram.programs.find(program => program.name === name);
    if (outcome === undefined) delete program.decoded[field]; else program.decoded[field] = outcome;
    encodeResult(program);
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
  'failed summary': value => value.summary.status = 'fail',
  'pending summary': value => value.summary.status = 'pending',
  'unknown summary': value => value.summary.status = 'unexpected',
  'missing summary status': value => delete value.summary.status,
  'different predecessor': value => value.coverage[0].previousExecutionIdentifier = value.wolfram.executionIdentifier,
  'self predecessor': value => { for (const row of [value.summary, ...value.coverage]) row.previousExecutionIdentifier = value.summary.executionIdentifier; },
  'missing predecessors': value => { for (const row of [value.summary, ...value.coverage]) delete row.previousExecutionIdentifier; },
  'matching invalid predecessors': value => { for (const row of [value.summary, ...value.coverage]) row.previousExecutionIdentifier = 'invalid'; },
  'calculation as predecessor': value => { for (const row of [value.summary, ...value.coverage]) row.previousExecutionIdentifier = value.wolfram.executionIdentifier; },
  'missing material comparison': value => delete value.wolfram.materialRuntimeComparison,
  'material mismatch': value => value.wolfram.materialRuntimeComparison.mismatches = 1,
  'wrong material row count': value => value.wolfram.materialRuntimeComparison.comparedRows--,
  'wrong material check count': value => value.wolfram.materialRuntimeComparison.checks--,
  'text material row count': value => value.wolfram.materialRuntimeComparison.comparedRows = '156',
  'missing material rows': value => replaceRootResult(value, result => result.channelMix.rows.pop(), 'material'),
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
for (const [summaryField, resultField] of [['statePairs', 'state_pair_count'], ['partialMatchCounterexamples', 'partial_match_counterexample_count']])
  for (const invalid of [undefined, '256', -1, 0.5, 999]) test(`rejects invalid summary metric ${summaryField}: ${invalid}`, () => {
    const changed = structuredClone(records);
    changed.summary.wolfram[summaryField] = invalid;
    assert.throws(() => verifyAuditRecords(changed));
    if (invalid !== 999) {
      replaceRootResult(changed, result => { if (invalid === undefined) delete result[resultField]; else result[resultField] = invalid; }, 'review');
      assert.throws(() => verifyAuditRecords(changed), /Invalid calculation metric/);
    }
  });
