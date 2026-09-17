import assert from 'node:assert/strict';
import test from 'node:test';
import { isIsoTimestamp, parseIsoTimestamp } from '../scripts/iso-timestamp.mjs';

test('accepts emitted UTC precision and equivalent offsets', () => {
  const utc = parseIsoTimestamp('2026-09-16T15:43:32.946Z');
  for (const value of ['2026-09-16T15:43:32.946000+00:00', '2026-09-17T00:43:32.946+09:00'])
    assert.equal(parseIsoTimestamp(value), utc);
  assert.equal(parseIsoTimestamp('2026-09-16T15:43:32Z'), utc - 946);
  assert.equal(parseIsoTimestamp('2026-09-16T15:43:32.9Z'), utc - 46);
});

test('accepts leap days and month ends without normalization', () => {
  for (const value of ['2000-02-29T23:59:59Z', '2024-02-29T23:59:59.999Z',
    '2026-01-31T23:59:59Z', '2026-04-30T23:59:59Z', '2026-09-30T23:59:59Z'])
    assert.equal(isIsoTimestamp(value), true);
});

test('rejects impossible calendar values and unsupported formats', () => {
  for (const value of ['2026-09-31T15:43:32.946Z', '2023-02-29T15:43:32.946Z',
    '1900-02-29T15:43:32.946Z', '2026-04-31T15:43:32.946Z', '2026-09-30T24:00:00Z',
    '2026-09-30T23:60:00Z', '2026-09-30T23:59:60Z', '2026-09-30T15:43:32', null, undefined]) {
    assert.equal(isIsoTimestamp(value), false, String(value));
    assert.equal(Number.isNaN(parseIsoTimestamp(value)), true, String(value));
  }
});
