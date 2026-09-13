import assert from 'node:assert/strict';
import test from 'node:test';
import { aggregateIntegrationStatus } from '../scripts/publish-material-sphere-evidence.mjs';

test('Integration status never promotes incomplete or stale evidence to pass', () => {
  assert.equal(aggregateIntegrationStatus(['pass', 'pass']), 'pass');
  assert.equal(aggregateIntegrationStatus(['pass', 'blocked']), 'blocked');
  assert.equal(aggregateIntegrationStatus(['pass', 'staleEvidence']), 'staleEvidence');
  assert.equal(aggregateIntegrationStatus(['fail', 'blocked']), 'fail');
  assert.equal(aggregateIntegrationStatus([]), 'blocked');
  assert.equal(aggregateIntegrationStatus(['pass', 'unknown']), 'blocked');
});
