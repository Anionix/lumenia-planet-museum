import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { claimIdentifier, uuidVersionSeven } from './identifiers.mjs';
import { wolframChecks } from '../planetarium/checks/wolfram-check.mjs';
import { parseIsoTimestamp } from './iso-timestamp.mjs';

// machine contract: recorded calculation -> later reference; mismatches -> rejected.
// claimIdentifier=c87c7d7c-11a9-50c8-ac18-101d59a67c0a; executionIdentifier=01a0ab94-f361-737f-91a9-1dd9adeca578; transition=reproduced -> corrected.
// Replays archived material inputs; does not certify freshness or authenticity of a new calculation.
const programNames = ['root', 'material', 'images', 'exploration', 'clock', 'review'];
const executionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const same = (actual, expected, field) => assert.deepEqual(actual, expected, field);
const expectedRootComparisons = [
  { function: 'transition', claimIdentifier: '3994c7e6-6387-590c-9922-3fad04fc482d', inputCount: 20, uniqueInputCount: 20 },
  { function: 'deploymentCapabilityAllowed', claimIdentifier: 'ac27dc88-da25-51f7-8af5-c431e22cd72b', inputCount: 12, uniqueInputCount: 12 },
  { function: 'componentPlacementAllowed', claimIdentifier: 'cf86cf5d-e0c7-58e4-aa77-ae4d0e72bf46', inputCount: 12, uniqueInputCount: 12 },
];
const expectedChecks = {
  material: 'exactCoordinateLengthsOneToFour invalidCoordinateLengthsRejected appendDropRestoresAllDimensions firstPlaneRotationOneDimensionIsNull firstPlaneRotationMatrixPowerFourIsIdentityForTwoToFourDimensions projectionTablesAreExactTwoDimensionalViews fourDimensionalProjectionCounterexample timeIsSeparateFromSpatialCoordinates haloAngleTable routeAngleTable orthogonalAngleTable channelMixFiniteTable evidenceDecisionTable'.split(' '),
  images: 'real_score_difference_bounded normalized_two_component_mixture_bounded coordinate_bounds exact_squared_distance_matrix_matches distance_symmetry distance_diagonal_zero squared_distance_range initial_panels_do_not_overlap sixty_steps_equal_one_second maximum_five_steps_equal_one_twelfth_second'.split(' '),
  exploration: 'rotation_preserves_length bounded_elapsed bounded_displacement normalized_diagonal coordinate_clamp ring_passage_positive'.split(' '),
  clock: 'bounded monotone step_bounded boundary_120 end_stops pause_identity'.split(' '),
  review: 'score_difference_bound projection_rank_three projection_retains_eight_unseen_dimensions nonnegative_normalized_recipe_bound normal_step_metres sixty_step_distance_metres bounded_batch turn_range_radians full_state_equality_rejects_every_partial_match artist_only_gate_has_counterexamples complete_valid_states only_fresh_complete_same_revision_receipt_passes busy_writer_is_rejected aborted_actions_are_rejected trace_length_bound clock_day_bound clock_crosses_two_minutes_without_wrapping'.split(' '),
};
const expectedMaterialInputs = [0, 1, 254, 255].flatMap(first =>
  [0, 1, 254, 255].flatMap(second => [0, 1, 50, 99, 100].map(weight => `${first}:${second}:${weight}`))).sort();
function ordered(earlier, later) {
  const earlierTimestamp = parseIsoTimestamp(earlier), laterTimestamp = parseIsoTimestamp(later);
  assert.ok(Number.isFinite(earlierTimestamp) && Number.isFinite(laterTimestamp) &&
    earlierTimestamp <= laterTimestamp, 'Reference predates its calculation');
}
function checkCount(program) {
  const value = program.decoded;
  if (['images', 'clock', 'review'].includes(program.name)) same(value.all_passed, true, 'Aggregate calculation result');
  if (program.name === 'root') {
    assert.ok(value.comparisons.length > 0);
    same(value.comparisonCount, value.comparisons.length, 'Comparison count');
    same(value.comparisons.map(({ function: name, claimIdentifier, inputCount, uniqueInputCount }) =>
      ({ function: name, claimIdentifier, inputCount, uniqueInputCount })), expectedRootComparisons, 'Root comparison inputs');
    same(value.totalInputCount, expectedRootComparisons.reduce((total, row) => total + row.inputCount, 0), 'Root total inputs');
    for (const comparison of value.comparisons) {
      same(comparison.goldenDimensionsMatch, true, 'Comparison dimensions');
      for (const field of ['implementationVersusRequirementsMismatchCount',
        'implementationVersusGoldenMismatchCount', 'goldenVersusRequirementsMismatchCount'])
        same(comparison[field], 0, field);
    }
    return value.comparisonCount;
  }
  const names = program.name === 'exploration' ? Object.entries(value).filter(([, item]) => typeof item === 'boolean').map(([name]) => name) : Object.keys(value.checks);
  same(names.sort(), [...expectedChecks[program.name]].sort(), program.name + ' check names');
  if (program.name === 'material') same(value.channelMix.rows.map(row => row.slice(0, 3).join(':')).sort(), expectedMaterialInputs, 'Material input coverage');
  const checks = program.name === 'exploration' ? names.map(name => value[name]) : Object.values(value.checks);
  assert.ok(checks.length > 0 && checks.every(value => value === true), 'Calculation checks');
  return checks.length;
}
export function verifyAuditRecords({ wolfram, summary, coverage }) {
  same(wolfram.status, 'pass', 'Calculation did not succeed');
  same(summary.status, 'verified_with_explicit_scope', 'Summary did not succeed');
  assert.match(wolfram.executionIdentifier, executionPattern);
  for (const revisions of [
    [wolfram.sourceRevisionBefore, wolfram.sourceRevisionAfter, summary.sourceRevision, summary.reconciliation?.sourceRevision, ...coverage.map(row => row.sourceRevision)],
    [wolfram.rootSourceRevision, summary.rootSourceRevision, summary.reconciliation?.rootSourceRevision],
  ]) for (const revision of revisions) {
    assert.match(revision, /^sha256:[0-9a-f]{64}$/, 'A source revision must be present and well formed');
    same(revision, revisions[0], 'Conflicting source revisions');
  }
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
    if (program.name === 'material') same(wolfram.materialRuntimeComparison, wolframChecks(program.response), 'Material implementation comparison');
    if (program.name === 'review')
      for (const [field, source] of [['statePairs', 'state_pair_count'], ['partialMatchCounterexamples', 'partial_match_counterexample_count']]) {
        assert.ok(Number.isSafeInteger(decoded[source]) && decoded[source] >= 0, 'Invalid calculation metric');
        same(summary.wolfram[field], decoded[source], 'Summary ' + field);
      }
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
    assert.match(row.previousExecutionIdentifier, executionPattern, 'Missing or invalid predecessor');
    same(row.previousExecutionIdentifier, summary.previousExecutionIdentifier, 'Conflicting predecessors');
    assert.notEqual(row.previousExecutionIdentifier, summary.executionIdentifier, 'Self-referencing reconciliation');
    assert.notEqual(row.previousExecutionIdentifier, wolfram.executionIdentifier, 'Calculation is not a predecessor reconciliation');
    ordered(wolfram.recordedAt, row.recordedAt);
  }
  for (const row of coverage) {
    same(row.executionIdentifier, summary.executionIdentifier, 'Coverage belongs to another reconciliation');
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
