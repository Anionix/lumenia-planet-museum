import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { materialSphereRenderingTargets, dispatchMaterialSphere } from '../web/artwork/material-sphere-renderer.mjs';
import { makeCoordinateRequest } from '../planetarium/lib/dimension.mjs';
import { compileMaterialSphere } from '../planetarium/lib/material-sphere.mjs';
import { formatMaterialSphereSchemas } from '../scripts/connect-planetarium.mjs';
import { sourceManifest } from '../planetarium/lib/revision.mjs';
import { validateMaterialSphereControls } from '../web/artwork/material-sphere-controls.mjs';

// llm machine contract; claim UUIDv5: 52f3ecec-8283-5bc9-a8d7-b931936ce48b
// execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
// transition: bridge and output contract -> regression tests; fake adapters test routing only, never rendering.
const knowledge = JSON.parse(await readFile(new URL('../planetarium/knowledge.json', import.meta.url), 'utf8'));
const report = JSON.parse(await readFile(new URL('../planetarium/reports/gate-report.json', import.meta.url), 'utf8'));
const profile = knowledge.profiles[0];
const request = (components = [3, 2], extras = {}) => ({ profileIdentifier: profile.profileIdentifier,
  parameters: profile.parameters, coordinates: makeCoordinateRequest(components), playing: false, reducedMotion: false, ...extras });

test('Material Sphere application uses current source-bound mathematical evidence', async () => {
  assert.equal((await sourceManifest()).sourceRevision, report.sourceRevision);
});
test('Temporary numerical copies match originals until cleanup', async () => {
  for (const file of ['kernel.mjs', 'dimension.mjs']) assert.equal(
    await readFile(new URL('../web/artwork/material-sphere-computation/' + file, import.meta.url), 'utf8'),
    await readFile(new URL('../planetarium/lib/' + file, import.meta.url), 'utf8'));
});
test('All fifteen generated Plumeria schemas equal the current checked recipes', async () => {
  assert.equal(knowledge.profiles.length, 15);
  assert.ok(knowledge.profiles.map(compileMaterialSphere).every(recipe => recipe.layers.length > 0));
  assert.equal(await readFile(new URL('../web/components/MaterialSphere.generated.styles.ts', import.meta.url), 'utf8'), await formatMaterialSphereSchemas(knowledge.profiles, report));
});
test('CSS output uses checked one-to-four dimensional projection without treating time as an axis', () => {
  for (const components of [[3], [3, 2], [3, 2, 7], [3, 2, 7, 9]]) {
    const result = dispatchMaterialSphere(request(components), 'plumeriaCss');
    assert.equal(result.state, 'ready');
    assert.deepEqual(result.plan.coordinates.components, components);
    assert.equal(result.plan.timeIsSpatialAxis, false);
    assert.equal(result.output.placementTransform, components.length === 1 ? 'translate(12px, 0px)' : 'translate(12px, 8px)');
  }
});
test('The four unconnected output branches never silently fall back to CSS', () => {
  for (const target of materialSphereRenderingTargets.slice(1)) {
    const result = dispatchMaterialSphere(request(), target);
    assert.equal(result.state, 'notConnected');
    assert.equal(result.output, undefined);
  }
  assert.equal(dispatchMaterialSphere(request(), 'unknown').state, 'invalid');
});
test('A separately registered output receives the same neutral numerical plan', () => {
  const input = request([3, 2, 7, 9]);
  const expected = dispatchMaterialSphere(input, 'plumeriaCss').plan;
  for (const target of materialSphereRenderingTargets.slice(1)) {
    const result = dispatchMaterialSphere(input, target, { [target]: plan => ({ observedCoordinates: plan.coordinates.components }) });
    assert.equal(result.state, 'ready');
    assert.deepEqual(result.plan, expected);
    assert.deepEqual(result.output.observedCoordinates, [3, 2, 7, 9]);
  }
});
test('Malformed numerical input is rejected before an adapter can execute', () => {
  const invalid = [null, {}, request([3.5, 2]), request([1, 2, 3, 4, 5]), request([0], { playing: 'true' }),
    request([0], { profileIdentifier: 'not-a-uuid' }), request([0], { parameters: { ...profile.parameters, durationMilliseconds: 0 } })];
  for (const input of invalid) assert.equal(dispatchMaterialSphere(input, 'rasterImage', { rasterImage: () => assert.fail('Invalid input reached adapter') }).state, 'invalid');
});
test('CSS playback and reduced motion use the checked bounded phase', () => {
  const input = request([0], { playing: true, coordinates: makeCoordinateRequest([0], { timeMilliseconds: 38000 }) });
  assert.equal(dispatchMaterialSphere(input, 'plumeriaCss').output.delay, '-2000ms');
  const reduced = dispatchMaterialSphere({ ...input, reducedMotion: true }, 'plumeriaCss');
  assert.equal(reduced.output.playing, false);
  assert.equal(reduced.output.delay, '0ms');
});
test('Page tools have the same integer bounds and step as the visible sliders', () => {
  const valid = { components: [10, -10, 0, 4], playing: true, startTimeMilliseconds: 2000 };
  assert.equal(validateMaterialSphereControls(valid, 36000), true);
  for (const invalid of [null, { ...valid, extra: 1 }, { ...valid, components: [11] }, { ...valid, components: [1.5] },
    { ...valid, components: [] }, { ...valid, startTimeMilliseconds: 1500 }, { ...valid, startTimeMilliseconds: 37000 }])
    assert.equal(validateMaterialSphereControls(invalid, 36000), false);
});
