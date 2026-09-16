import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { claimIdentifier, uuidVersionSeven } from './identifiers.mjs';

// machine contract: recorded calculation -> later reference; mismatches -> rejected.
// Validates historical record consistency, not freshness or authenticity of a new calculation.
const programNames = ['root', 'material', 'images', 'exploration', 'clock', 'review'];
const executionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const same = (actual, expected, field) => assert.deepEqual(actual, expected, field);
function ordered(earlier, later) {
  assert.ok(typeof earlier === 'string' && typeof later === 'string' &&
    Number.isFinite(Date.parse(earlier)) && Number.isFinite(Date.parse(later)) &&
    Date.parse(earlier) <= Date.parse(later), 'Reference predates its calculation');
}
function checkCount(program) {
  const value = program.decoded;
  if (program.name === 'root') {
    assert.ok(value.comparisons.length > 0);
    same(value.comparisonCount, value.comparisons.length, 'Comparison count');
    for (const comparison of value.comparisons) {
      same(comparison.goldenDimensionsMatch, true, 'Comparison dimensions');
      for (const field of ['implementationVersusRequirementsMismatchCount',
        'implementationVersusGoldenMismatchCount', 'goldenVersusRequirementsMismatchCount'])
        same(comparison[field], 0, field);
    }
    return value.comparisonCount;
  }
  const checks = program.name === 'exploration' ? Object.values(value).filter(v => typeof v === 'boolean') : Object.values(value.checks);
  assert.ok(checks.length > 0 && checks.every(value => value === true), 'Calculation checks');
  return checks.length;
}
export function verifyAuditRecords({ wolfram, summary, coverage }) {
  assert.match(wolfram.executionIdentifier, executionPattern);
  same(wolfram.sourceRevisionBefore, wolfram.sourceRevisionAfter, 'Calculation source changed');
  ordered(wolfram.startedAt, wolfram.recordedAt);
  assert.ok(!Object.hasOwn(wolfram, 'revalidation'), 'Obsolete revalidation block');
  same(wolfram.programs.map(p => p.name).sort(), [...programNames].sort(), 'Calculation coverage');
  same(wolfram.programCount, programNames.length, 'Program count');
  const counts = new Map();
  for (const program of wolfram.programs) {
    same(program.response.isError, false, 'Tool error');
    const blocks = program.response.content.filter(block => block.type === 'text');
    same(blocks.length, 1, 'Expected one JSON result');
    const decoded = JSON.parse(JSON.parse(blocks[0].text.replace(/^Out\[\d+\]=\s*/, '')));
    same(program.decoded, decoded, 'Stored response differs from decoded result');
    counts.set(program.name, checkCount(program));
    if (program.name === 'root') {
      same(decoded.runIdentifier, wolfram.executionIdentifier, 'Root execution');
      ordered(wolfram.startedAt, decoded.startedAtUtc);
      ordered(decoded.startedAtUtc, decoded.completedAtUtc);
      ordered(decoded.completedAtUtc, wolfram.recordedAt);
    }
  }
  same(wolfram.checkCount, [...counts.values()].reduce((a, b) => a + b, 0), 'Total check count');
  same(summary.wolfram.executionIdentifier, wolfram.executionIdentifier, 'Summary execution reference');
  same(summary.wolfram.recordedAt, wolfram.recordedAt, 'Summary calculation time');
  same(summary.wolfram.programs, wolfram.programCount, 'Summary programs');
  same(summary.wolfram.checks, wolfram.checkCount, 'Summary checks');
  same(coverage.map(row => row.wolframProgram).sort(), [...programNames].sort(), 'Reference coverage');
  for (const row of [summary, ...coverage]) {
    assert.match(row.executionIdentifier, executionPattern);
    ordered(wolfram.recordedAt, row.recordedAt);
    same(row.sourceRevision, wolfram.sourceRevisionAfter, 'Reference source');
  }
  for (const row of coverage) {
    same(row.wolframExecutionIdentifier, wolfram.executionIdentifier, 'Coverage execution reference');
    same(row.wolframCheckCount, counts.get(row.wolframProgram), 'Coverage check count');
  }
  return { record_type: 'audit_record_consistency', recordIdentifier: claimIdentifier('audit-record-consistency'),
    executionIdentifier: uuidVersionSeven(), recordedAt: new Date().toISOString(), status: 'pass',
    calculationExecutionIdentifier: wolfram.executionIdentifier, checkCount: wolfram.checkCount,
    scope: 'Historical references only; current-source verification is separate.' };
}
export async function readAuditRecords(directory = new URL('../reports/review-audit/', import.meta.url)) {
  const read = name => readFile(new URL(name, directory), 'utf8');
  const [wolfram, summary, coverage] = await Promise.all(['wolfram.json', 'summary.json', 'coverage.jsonl'].map(read));
  return { wolfram: JSON.parse(wolfram), summary: JSON.parse(summary), coverage: coverage.trim().split('\n').map(JSON.parse) };
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  console.log(JSON.stringify(verifyAuditRecords(await readAuditRecords())));
