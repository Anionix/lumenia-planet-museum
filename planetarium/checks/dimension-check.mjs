import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { coordinateRequest, makeCoordinateRequest, compileSpatialPlacement } from '../lib/dimension.mjs';

// llm machine contract; artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867
// execution UUIDv7: 01a09a86-bce5-77fe-8aff-ce403b00e379
// state: executable cross-language evidence; transition: signed coordinate cases -> real Lean process -> exact comparison.
export function dimensionChecks(root) {
  const requests = [];
  let grid = [[]];
  for (let dimension = 1; dimension <= 4; dimension += 1) {
    grid = grid.flatMap(prefix => [-2, 0, 3].map(value => [...prefix, value]));
    for (const components of grid) {
      for (const appendedAxis of [-1000000, 0, 1000000]) {
        for (const timeMilliseconds of [0, 120000000]) {
          requests.push(makeCoordinateRequest(components, { appendedAxis, timeMilliseconds }));
        }
      }
    }
  }
  const valid = makeCoordinateRequest([1, 2, 3]);
  const invalid = [
    { ...valid, spaceDimensions: 0 }, { ...valid, spaceDimensions: 5 },
    { ...valid, components: [1, 2] }, { ...valid, components: [1, 2, 3, 4] },
    { ...valid, components: [1, 0.5, 3] }, { ...valid, components: [1, '2', 3] },
    { ...valid, components: [1, null, 3] }, { ...valid, components: [1, 1000001, 3] },
    { ...valid, timeMilliseconds: -1 }, { ...valid, timeMilliseconds: '1000' },
    { ...valid, timeMilliseconds: 120000001 }, { ...valid, appendedAxis: -1000001 },
    { ...valid, coordinateUnit: 'pixels' }, { ...valid, unknown: true },
    { ...valid, operation: 'unknown' }, { ...valid, spaceDimensions: 2.5 },
  ];
  requests.push(...invalid);
  const execution = spawnSync(root + '/.lake/build/bin/planetarium_boundary', {
    input: requests.map(request => JSON.stringify(request)).join('\n') + '\n',
    encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 60000,
  });
  assert.equal(execution.status, 0, execution.stderr || String(execution.error));
  const responses = execution.stdout.trim().split('\n').map(line => JSON.parse(line));
  assert.equal(responses.length, requests.length);
  for (const [index, request] of requests.entries()) {
    assert.deepEqual(responses[index], coordinateRequest(request), 'Coordinate boundary case ' + index);
  }
  for (const request of invalid) assert.equal(coordinateRequest(request).accepted, false);
  assert.equal(coordinateRequest({ ...valid, components: Array(3) }).accepted, false);
  assert.equal(coordinateRequest({ ...valid, components: [NaN, 2, 3] }).accepted, false);

  const first = makeCoordinateRequest([1, 2, 3, 4], { timeMilliseconds: 500 });
  const second = makeCoordinateRequest([1, 2, 3, 5], { timeMilliseconds: 900 });
  assert.notDeepEqual(coordinateRequest(first).components, coordinateRequest(second).components);
  assert.deepEqual(coordinateRequest(first).projectedComponents, [1, 2]);
  assert.deepEqual(compileSpatialPlacement(first, 8).style, compileSpatialPlacement(second, 8).style);
  assert.deepEqual(compileSpatialPlacement(first, 8).style,
    { position: 'absolute', transform: 'translate(8px, 16px)' });
  assert.equal(coordinateRequest(makeCoordinateRequest([4])).quarterTurnComponents, null);
  assert.throws(() => compileSpatialPlacement(first, 0));
  return { comparedRequests: requests.length, dimensions: [1, 2, 3, 4],
    mismatches: 0, rejectedMalformed: invalid.length + 2, projectionCounterexamples: 1 };
}
