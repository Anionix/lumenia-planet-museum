import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { makeRequest, sampleRequest, validateMaterialParameters } from '../lib/kernel.mjs';
import { compileMaterialSphere } from '../lib/material-sphere.mjs';

// llm machine contract; artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867
// execution UUIDv7: 01a09a86-bce5-77fe-8aff-ce403b00e379
// state: finite cross-language evidence; transition: real boundary -> output comparison -> explicit mismatch.
export function boundaryChecks(root, profiles) {
  const requests = [];
  for (const profile of profiles) {
    requests.push(...compileMaterialSphere(profile).requests);
    for (let index = 0; index < 64; index += 1) {
      for (const reducedMotion of [false, true]) {
        requests.push(makeRequest(profile.parameters, { index, seed: index,
          elapsed: profile.parameters.durationMilliseconds * index + 999, reducedMotion }));
      }
    }
  }
  const parameters = profiles[0].parameters;
  for (const firstChannel of [0, 1, 254, 255]) {
    for (const secondChannel of [0, 1, 254, 255]) {
      for (const opacityPercent of [0, 1, 50, 99, 100]) {
        requests.push(makeRequest({ ...parameters, opacityPercent }, { firstChannel, secondChannel }));
      }
    }
  }
  for (let supportCount = 0; supportCount < 4; supportCount += 1) {
    for (let contradictionCount = 0; contradictionCount < 4; contradictionCount += 1) {
      for (const stale of [false, true]) requests.push(makeRequest(parameters, { supportCount, contradictionCount, stale }));
    }
  }
  for (const [key, minimum, maximum] of [['repeatCount', 1, 64], ['gridStep', 1, 64],
    ['durationMilliseconds', 1000, 120000], ['layerCount', 1, 32], ['opacityPercent', 0, 100], ['paletteSize', 2, 8]]) {
    for (const value of [Math.max(0, minimum - 1), minimum, maximum, maximum + 1]) {
      requests.push(makeRequest({ ...parameters, [key]: value }));
    }
  }
  const execution = spawnSync(root + '/.lake/build/bin/planetarium_boundary', {
    input: requests.map(request => JSON.stringify(request)).join('\n') + '\n',
    encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 60000,
  });
  assert.equal(execution.status, 0, execution.stderr || String(execution.error));
  const responses = execution.stdout.trim().split('\n').map(line => JSON.parse(line));
  assert.equal(responses.length, requests.length);
  requests.forEach((request, index) => assert.deepEqual(responses[index], sampleRequest(request), 'Boundary case ' + index));

  let rejectedMalformed = 0;
  for (const value of [-1, 0.5, NaN, Infinity, '12', null, undefined, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(validateMaterialParameters({ ...parameters, gridStep: value }), false);
    rejectedMalformed += 1;
  }
  assert.equal(validateMaterialParameters({ ...parameters, unknown: 1 }), false);
  assert.equal(sampleRequest({ ...makeRequest(parameters), unknown: true }).accepted, false);
  assert.equal(sampleRequest(makeRequest(parameters, { reducedMotion: 'false' })).accepted, false);
  assert.equal(sampleRequest(makeRequest(parameters, { firstChannel: 256 })).accepted, false);
  rejectedMalformed += 4;
  assert.throws(() => compileMaterialSphere({ ...profiles[1], parameters: { ...profiles[1].parameters, repeatCount: 11 } }));
  assert.throws(() => compileMaterialSphere({ ...profiles[0], palette: ['red; background:url(https://example.invalid)', '#ffffff', '#000000', '#aaaaaa'] }));
  return { comparedRequests: requests.length, mismatches: 0, rejectedMalformed,
    rejectedArtistSpecificInputs: 2, requestBytes: Buffer.byteLength(execution.stdout) };
}
