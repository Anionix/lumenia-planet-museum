import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { characterAvailabilityFromInspection, characterAvailabilitySource } from '../scripts/build-character-availability.mjs';

test('Unverified raster characters cannot mount; failed or stale evidence stops availability generation', () => {
  const absent = characterAvailabilityFromInspection({ status: 'blocked', receipt: null });
  assert.equal(absent.ready, false);
  assert.equal(absent.evidenceExecutionIdentifier, null);
  for (const status of ['fail', 'staleEvidence', 'unknown', 'pass'])
    assert.throws(() => characterAvailabilityFromInspection({ status, receipt: null }));
});
test('Accepted character availability preserves the image digest and evidence run', () => {
  const receipt = { artifactIdentifier: '8b952955-8da1-53ed-8cc0-87934f160bfa', sha256: 'a'.repeat(64),
    executionIdentifier: '01a09af7-f340-76cb-86a7-4075de7842d3' };
  const availability = characterAvailabilityFromInspection({ status: 'pass', receipt });
  assert.equal(availability.ready, true);
  assert.equal(availability.imageSha256, receipt.sha256);
  assert.equal(availability.evidenceExecutionIdentifier, receipt.executionIdentifier);
  assert.throws(() => characterAvailabilityFromInspection({ status: 'blocked', receipt }));
});
test('The studio reads freshly generated character availability instead of a manual ready flag', async () => {
  assert.equal(await readFile(new URL('../web/artwork/museum-character-availability.ts', import.meta.url), 'utf8'), await characterAvailabilitySource());
  const route = await readFile(new URL('../web/app/atelier/[person]/page.tsx', import.meta.url), 'utf8');
  assert.match(route, /museumCharacterAvailability\.find\(item => item\.slug === person\)/);
  assert.match(route, /character=\{character\}/);
});
