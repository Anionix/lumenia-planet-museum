/*
llm machine contract
claim identifier: 6dd3d6fb-52a1-5ea7-9f7b-2bf11cf2d67a
execution identifier: 01999d4a-7c70-7a00-8a27-3f0126ab4d40
state: contract regression tests
transition: boundary input -> deterministic verdict
*/

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  expectedMeasurementProfile,
  evaluateObservation,
  validateAssetManifestDocument,
  validateVerificationDocument,
} from '../scripts/contract.mjs';

async function readExample(name) {
  return JSON.parse(await readFile(new URL('../contracts/examples/' + name, import.meta.url), 'utf8'));
}

for (const [name, file, validate] of [
  ['the committed verification request is valid', 'verification-request.json', validateVerificationDocument],
  ['the committed verification result is valid and has a pass aggregate', 'verification-result.json', validateVerificationDocument],
  ['the committed asset manifest is valid', 'valid-asset-manifest.json', validateAssetManifestDocument],
]) test(name, async () => {
  assert.deepEqual(validate(await readExample(file)), { valid: true, errors: [] });
});
for (const [name, file, mutate, message] of [
  ['null observations fail closed', 'verification-result.json', result => { result.observations = [null]; }],
  ['duplicate gates fail closed', 'verification-result.json', result => { result.observations.push(result.observations[0]); }],
  ['an incomplete browser matrix fails closed', 'verification-result.json', result => { result.measurementProfile.targetBrowsers = ['chrome']; }],
  ['createdAt rejects impossible dates instead of accepting normalization', 'verification-result.json', result => result.createdAt = '2026-09-31T15:43:32.946Z'],
  ['a result cannot claim pass when an observation failed', 'verification-result.json', result => { result.observations[0].status = 'fail'; result.observations[0].failureReason = 'intentional regression fixture'; }, /expected fail from observations/],
  ['unknown properties fail closed', 'verification-request.json', request => request.unexpectedProperty = true, /unknown property/],
]) test(name, async () => {
  const value = await readExample(file);
  mutate(value);
  const { valid, errors } = validateVerificationDocument(value);
  assert.equal(valid, false);
  if (message) assert.match(errors.join('\n'), message);
});

test('the fixed category budgets add up to the core budget', () => {
  const profile = expectedMeasurementProfile;
  assert.equal(profile.htmlBudgetKibibytes +
    profile.javascriptBudgetKibibytes +
    profile.styleBudgetKibibytes +
    profile.fontBudgetKibibytes +
    profile.metadataBudgetKibibytes, profile.coreTransferBudgetKibibytes);
});

for (const [name, field, value, message] of [
  ['dual Meshopt encodings are rejected', 'usesKhronosMeshopt', true, /mutually exclusive/],
  ['a Meshopt asset without its decoder is rejected', 'hasMeshoptDecoder', false, /Meshopt decoder is required/],
  ['a KTX2 asset without its loader is rejected', 'hasKtx2Loader', false, /KTX2 loader is required/],
  ['preservation options are required when the asset needs them', 'keepsExtras', false, /extras preservation is required/],
]) test(name, async () => {
  const manifest = await readExample('valid-asset-manifest.json');
  manifest[field] = value;
  const result = validateAssetManifestDocument(manifest);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), message);
});

test('a pass with a missing, textual, non-finite or over-limit observation is rejected', async () => {
  for (const observed of [null, 'passed', Number.NaN, Number.POSITIVE_INFINITY, 204801]) {
    const result = await readExample('verification-result.json');
    result.observations[1].observedValue = observed;
    assert.equal(validateVerificationDocument(result).valid, false);
  }
});

test('old evidence cannot be promoted to pass', async () => {
  const result = await readExample('verification-result.json');
  result.observations[0].sourceRevision = 'sha256:' + '1'.repeat(64);
  assert.equal(validateVerificationDocument(result).valid, false);
  assert.equal(evaluateObservation(result.observations[0], result.sourceRevision), 'staleEvidence');
});

test('missing evidence is blocked even if an explanation says it passed', async () => {
  const result = await readExample('verification-result.json');
  result.observations[0].observedValue = null;
  result.observations[0].failureReason = 'passed according to an explanation';
  assert.equal(evaluateObservation(result.observations[0], result.sourceRevision), 'blocked');
  assert.equal(validateVerificationDocument(result).valid, false);
});
