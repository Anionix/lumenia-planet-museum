import assert from 'node:assert/strict';
import { coordinateRequest, makeCoordinateRequest } from '../lib/dimension.mjs';
import { sampleRequest, makeRequest, reviewEvidence } from '../lib/kernel.mjs';

// llm machine contract; artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867
// execution UUIDv7: 01a09ab9-d6e6-735e-ad63-6db20639d0a6
// state: independent result reconciliation; transition: raw Wolfram rows -> actual local functions -> mismatch gate.
export function extractWolframObservation(response) {
  const pending = [response];
  while (pending.length) {
    const value = pending.shift();
    if (value && typeof value === 'object') {
      if (value.artifactIdentifier === 'e67bec4e-cc81-54b8-8de8-e04f06503867' && value.checks && value.rotationTable) return value;
      pending.push(...Object.values(value));
    } else if (typeof value === 'string') {
      for (const candidate of [value, value.replace(/^Out\[\d+\]\s*=\s*/, '').trim(),
        value.slice(value.indexOf('{'), value.lastIndexOf('}') + 1)]) {
        try { const parsed = JSON.parse(candidate); if (parsed !== value) pending.push(parsed); } catch { /* Not JSON. */ }
      }
    }
  }
  throw new Error('No complete Material Sphere calculation found in raw Wolfram response.');
}

export function wolframChecks(rawResponse) {
  assert.ok(rawResponse && rawResponse.isError !== true);
  const observation = extractWolframObservation(rawResponse);
  // The calculator deliberately leaves receipt binding to this caller. check.mjs verifies the
  // execution UUIDv7 and before/after source revisions before admitting these observations.
  assert.equal(observation.status, 'blocked');
  assert.equal(observation.statusReason, 'parent-receipt-must-bind-execution-uuid-and-source-revision');
  assert.equal(observation.calculationChecksPass, true);
  assert.equal(Object.keys(observation.checks).length, 13);
  assert.ok(Object.values(observation.checks).every(value => value === true));
  let comparedRows = 0;
  const expectedCounts = { coordinateTable: 4, invalidCoordinateTable: 4, appendDropTable: 4,
    rotationTable: 4, projectionTable: 4, halo: 12, route: 8, orthogonal: 4, channelMix: 80, evidence: 32 };
  const rows = name => {
    const table = observation[name];
    assert.ok(Array.isArray(table.rowFields) && Array.isArray(table.rows));
    assert.equal(table.rows.length, expectedCounts[name]);
    return table.rows.map(row => {
      assert.equal(row.length, table.rowFields.length);
      assert.equal(row.at(-1), true);
      comparedRows += 1;
      return Object.fromEntries(table.rowFields.map((key, index) => [key, row[index]]));
    });
  };
  for (const row of rows('coordinateTable')) {
    const result = coordinateRequest(makeCoordinateRequest(row.encodedCoordinates, { spaceDimensions: row.spaceDimensions }));
    assert.equal(result.accepted, true);
    assert.equal(result.components.length, row.expectedLength);
  }
  // Wolfram's approximate Real 3.0 and JSON's integral number 3 are different representations.
  // The invalid table is evidence about Wolfram's exact-integer input, not byte-level JSON acceptance.
  assert.equal(rows('invalidCoordinateTable').length, 4);
  for (const row of rows('appendDropTable')) {
    const result = coordinateRequest(makeCoordinateRequest(row.original, { appendedAxis: row.appended.at(-1) }));
    assert.deepEqual(result.embeddedComponents, row.appended);
    assert.deepEqual(result.restoredComponents, row.restored);
  }
  for (const row of rows('rotationTable')) {
    const components = [1, 2, 3, 4].slice(0, row.spaceDimensions);
    const result = coordinateRequest(makeCoordinateRequest(components));
    if (row.spaceDimensions === 1) {
      assert.equal(row.rotationMatrix, null); assert.equal(row.powerFour, null);
      assert.equal(result.quarterTurnComponents, null);
    } else {
      assert.deepEqual(row.rotationMatrix.map(entries => entries.reduce((sum, value, index) => sum + value * components[index], 0)),
        result.quarterTurnComponents);
      assert.deepEqual(row.powerFour, Array.from({ length: row.spaceDimensions }, (_, horizontal) =>
        Array.from({ length: row.spaceDimensions }, (_, vertical) => horizontal === vertical ? 1 : 0)));
    }
  }
  for (const row of rows('projectionTable')) {
    assert.deepEqual(coordinateRequest(makeCoordinateRequest(row.coordinates)).projectedComponents, row.projectedCoordinates);
  }
  const counterexample = observation.projectionCounterexample;
  assert.notDeepEqual(counterexample.pointA, counterexample.pointB);
  assert.deepEqual(coordinateRequest(makeCoordinateRequest(counterexample.pointA)).projectedComponents, counterexample.projectionA);
  assert.deepEqual(coordinateRequest(makeCoordinateRequest(counterexample.pointB)).projectedComponents, counterexample.projectionA);
  const timed = observation.timeSeparation;
  for (const example of [timed.threeDimensionalPlusTime, timed.fourDimensionalSpace]) {
    const result = coordinateRequest(makeCoordinateRequest(example.coordinates, {
      timeMilliseconds: example.timeMilliseconds, spaceDimensions: example.spaceDimensions }));
    assert.equal(result.accepted, true);
    assert.equal(result.timeMilliseconds, example.timeMilliseconds);
    assert.equal(result.components.length, example.spaceDimensions);
  }
  const parameters = { repeatCount: 12, gridStep: 8, durationMilliseconds: 1000,
    layerCount: 2, opacityPercent: 50, paletteSize: 4 };
  for (const [table, field] of [['halo', 'haloAngle'], ['route', 'routeAngle'], ['orthogonal', 'orthogonalAngle']]) {
    for (const row of rows(table)) assert.equal(sampleRequest(makeRequest(parameters, { index: row.index }))[field], row.angleDegrees);
  }
  const channels = rows('channelMix');
  const expectedChannelInputs = [0, 1, 254, 255].flatMap(first =>
    [0, 1, 254, 255].flatMap(second => [0, 1, 50, 99, 100].map(weight => `${first}:${second}:${weight}`)));
  const actualChannelInputs = channels.map(row => `${row.firstChannel}:${row.secondChannel}:${row.weightPercent}`);
  assert.deepEqual(actualChannelInputs.sort(), expectedChannelInputs.sort(), 'Material input coverage');
  for (const row of channels) {
    assert.equal(sampleRequest(makeRequest({ ...parameters, opacityPercent: row.weightPercent }, {
      firstChannel: row.firstChannel, secondChannel: row.secondChannel })).channelMixNumerator, row.numerator);
    assert.ok(row.numerator >= 0 && row.numerator <= row.upperLimit && row.upperLimit === 25500);
  }
  const evidence = rows('evidence');
  assert.equal(evidence.length, 32);
  for (const row of evidence) assert.equal(reviewEvidence(row.supportCount, row.contradictionCount, row.stale), row.observedDecision);
  return { checks: Object.keys(observation.checks).length, comparedRows, mismatches: 0 };
}
