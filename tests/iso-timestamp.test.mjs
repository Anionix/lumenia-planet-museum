import assert from 'node:assert/strict';
import test from 'node:test';
import { isIsoTimestamp, parseIsoTimestamp } from '../scripts/iso-timestamp.mjs';

test('accepts emitted UTC precision and equivalent offsets', () => {
  const utc = parseIsoTimestamp('2026-09-16T15:43:32.946Z');
  for (const value of ['2026-09-16T15:43:32.946000+00:00', '2026-09-17T00:43:32.946+09:00',
    '2026-09-16T15:43:32.946000000Z', '2026-09-17T00:43:32.946000000+09:00'])
    assert.equal(parseIsoTimestamp(value), utc);
  assert.equal(parseIsoTimestamp('2026-09-16T15:43:32Z'), utc - 946);
  assert.equal(parseIsoTimestamp('2026-09-16T15:43:32.9Z'), utc - 46);
  for (const fraction of ['123456789', '123456789' + '0'.repeat(450)])
    assert.equal(parseIsoTimestamp(`1970-01-01T00:00:00.${fraction}Z`), 123.456789);
});

test('accepts leap days and month ends without normalization', () => {
  for (const value of ['0000-02-29T23:59:59Z', '0096-02-29T23:59:59Z', '2000-02-29T23:59:59Z', '2024-02-29T23:59:59.999Z',
    '2026-01-31T23:59:59Z', '2026-04-30T23:59:59Z', '2026-09-30T23:59:59Z'])
    assert.equal(isIsoTimestamp(value), true);
});

test('rejects impossible calendar values and unsupported formats', () => {
  for (const value of ['2026-09-31T15:43:32.946Z', '2023-02-29T15:43:32.946Z',
    '2026-00-01T00:00:00Z', '2026-13-01T00:00:00Z', '2026-01-00T00:00:00Z', '2026-01-01T00:00:00.Z',
    '2026-01-01T00:00:00Z\n', '2026-01-01T00:00:00+24:00', '2026-01-01T00:00:00+00:60',
    '1900-02-29T15:43:32.946Z', '2026-04-31T15:43:32.946Z', '2026-09-30T24:00:00Z',
    '2026-09-30T23:60:00Z', '2026-09-30T23:59:60Z', '2026-09-30T15:43:32', null, undefined]) {
    assert.equal(isIsoTimestamp(value), false, String(value));
    assert.equal(Number.isNaN(parseIsoTimestamp(value)), true, String(value));
  }
});
