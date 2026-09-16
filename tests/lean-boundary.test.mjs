import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateAssetManifestDocument } from '../scripts/contract.mjs';
import { booleanAssignments, leanVerdicts } from './support/lean-boundary.mjs';

// llm machine contract: all Boolean assignments -> independent implementations agree.
// The compiled Lean executable uses validateRawAsset after strict JSON decoding.
const fixture = JSON.parse(readFileSync(new URL(
  '../contracts/examples/valid-asset-manifest.json', import.meta.url), 'utf8'));
const fields = Object.keys(fixture).filter((key) => typeof fixture[key] === 'boolean');

test('all 4096 asset assignments agree between the Lean executable and the JSON boundary', () => {
  assert.equal(fields.length, 12);
  const manifests = booleanAssignments(fields).map(values => ({ ...fixture, ...values }));
  const verdicts = leanVerdicts(manifests);
  let acceptedCount = 0;
  manifests.forEach((manifest, index) => {
    const expected = validateAssetManifestDocument(manifest).valid;
    assert.equal(verdicts[index].accepted, expected, JSON.stringify(manifest));
    if (expected) acceptedCount += 1;
  });
  assert.ok(acceptedCount > 0 && acceptedCount < manifests.length);
});

test('every Boolean field rejects missing values, strings, numbers, arrays and null in Lean', () => {
  const invalid = fields.flatMap(field => [undefined, 'false', 0, [], null]
    .map(value => ({ ...fixture, [field]: value })));
  leanVerdicts(invalid).forEach((response) => {
    assert.equal(response.accepted, false);
    assert.equal(typeof response.failureReason, 'string');
  });
});

test('mixed assets are accepted when all used formats have their required loaders', () => {
  const manifest = { ...fixture, usesWebp: true, usesDraco: true, hasDracoLoader: true };
  assert.equal(validateAssetManifestDocument(manifest).valid, true);
  assert.equal(leanVerdicts([manifest])[0].accepted, true);
});
