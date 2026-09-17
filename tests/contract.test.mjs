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
  const url = new URL('../contracts/examples/' + name, import.meta.url);
  return JSON.parse(await readFile(url, 'utf8'));
}

test('the committed verification request is valid', async () => {
  const request = await readExample('verification-request.json');
  assert.deepEqual(validateVerificationDocument(request), { valid: true, errors: [] });
});

test('the committed verification result is valid and has a pass aggregate', async () => {
  const result = await readExample('verification-result.json');
  assert.deepEqual(validateVerificationDocument(result), { valid: true, errors: [] });
});
test('createdAt rejects impossible dates instead of accepting normalization', async () => {
  const result = await readExample('verification-result.json');
  result.createdAt = '2026-09-31T15:43:32.946Z';
  assert.equal(validateVerificationDocument(result).valid, false);
});

test('the committed asset manifest is valid', async () => {
  const manifest = await readExample('valid-asset-manifest.json');
  assert.deepEqual(validateAssetManifestDocument(manifest), { valid: true, errors: [] });
});

test('the fixed category budgets add up to the core budget', () => {
  const profile = expectedMeasurementProfile;
  const categoryTotal =
    profile.htmlBudgetKibibytes +
    profile.javascriptBudgetKibibytes +
    profile.styleBudgetKibibytes +
    profile.fontBudgetKibibytes +
    profile.metadataBudgetKibibytes;
  assert.equal(categoryTotal, profile.coreTransferBudgetKibibytes);
});

test('dual Meshopt encodings are rejected', async () => {
  const manifest = await readExample('valid-asset-manifest.json');
  manifest.usesKhronosMeshopt = true;
  const result = validateAssetManifestDocument(manifest);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /mutually exclusive/);
});

test('a Meshopt asset without its decoder is rejected', async () => {
  const manifest = await readExample('valid-asset-manifest.json');
  manifest.hasMeshoptDecoder = false;
  const result = validateAssetManifestDocument(manifest);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /Meshopt decoder is required/);
});

test('a KTX2 asset without its loader is rejected', async () => {
  const manifest = await readExample('valid-asset-manifest.json');
  manifest.hasKtx2Loader = false;
  const result = validateAssetManifestDocument(manifest);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /KTX2 loader is required/);
});

test('preservation options are required when the asset needs them', async () => {
  const manifest = await readExample('valid-asset-manifest.json');
  manifest.keepsExtras = false;
  const result = validateAssetManifestDocument(manifest);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /extras preservation is required/);
});

test('a result cannot claim pass when an observation failed', async () => {
  const result = await readExample('verification-result.json');
  result.observations[0].status = 'fail';
  result.observations[0].failureReason = 'intentional regression fixture';
  const validation = validateVerificationDocument(result);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join('\n'), /expected fail from observations/);
});

test('unknown properties fail closed', async () => {
  const request = await readExample('verification-request.json');
  request.unexpectedProperty = true;
  const validation = validateVerificationDocument(request);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join('\n'), /unknown property/);
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

test('null observations, duplicate gates and an incomplete browser matrix fail closed', async () => {
  for (const mutate of [
    (result) => { result.observations = [null]; },
    (result) => { result.observations.push(result.observations[0]); },
    (result) => { result.measurementProfile.targetBrowsers = ['chrome']; },
  ]) {
    const result = await readExample('verification-result.json');
    mutate(result);
    assert.equal(validateVerificationDocument(result).valid, false);
  }
});
