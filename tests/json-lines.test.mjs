import test from 'node:test';
import assert from 'node:assert/strict';
import { parseJsonLines, serializeJsonLines, readJsonLines, writeJsonLines } from '../scripts/json-lines.mjs';
import { exceptionPaths, inspectDataFormats } from '../scripts/check-data-format.mjs';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('JSON Lines preserves Japanese text, embedded newlines, arrays and null values', () => {
  const values = [{ name: '資料\n出典', values: [0, 0.55, -1], missing: null }, false, ['素材']];
  const text = serializeJsonLines(values);
  assert.equal(text.split('\n').length, values.length + 1);
  assert.deepEqual(parseJsonLines(text), values);
  assert.deepEqual(parseJsonLines(text.replaceAll('\n', '\r\n')), values);
  assert.deepEqual(parseJsonLines(text.slice(0, -1)), values);
});
test('JSON Lines rejects blank records, pretty printed objects and incomplete records', () => {
  for (const text of ['\n', '{}\n\n', '{\n"score":1\n}\n', '{}\n{', '\uFEFF{}\n'])
    assert.throws(() => parseJsonLines(text));
  assert.throws(() => serializeJsonLines([undefined]));
  assert.deepEqual(parseJsonLines(''), []);
});
test('JSON Lines rejects values that stringify would drop or coerce', async context => {
  const sparse = [];
  sparse[1] = 'kept';
  const invalid = [
    { missing: undefined }, { nested: [undefined] }, { nonFinite: NaN },
    { nonFinite: Infinity }, { boxed: new Number(NaN) }, { bigint: 1n }, { callable() {} }, { symbol: Symbol('missing') }, sparse,
  ];
  for (const record of invalid) assert.throws(() => serializeJsonLines([record]));
  const sparseRecords = [];
  sparseRecords[1] = { value: 'kept' };
  assert.throws(() => serializeJsonLines(sparseRecords));
  const cycle = {};
  cycle.self = cycle;
  assert.throws(() => serializeJsonLines([cycle]));

  class CustomRecord {
    constructor() { this.label = 'class'; }
  }
  const values = [new Date('2026-01-02T03:04:05.000Z'), { toJSON: () => ({ label: 'toJSON' }) }, new CustomRecord()];
  for (const value of [...values, new Map(), new Set(), -0]) assert.throws(() => serializeJsonLines([value]));
  const root = await mkdtemp(path.join(tmpdir(), 'lumenia-lossless-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  const file = path.join(root, 'records.jsonl');
  await writeJsonLines(file, [{ original: true }]);
  assert.throws(() => writeJsonLines(file, [{ missing: undefined }]));
  assert.deepEqual(await readJsonLines(file), [{ original: true }]);
});
test('format gate distinguishes required settings from custom data and malformed records', async context => {
  const root = await mkdtemp(path.join(tmpdir(), 'lumenia-json-lines-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  const content = { 'package.json': '{}', 'custom.json': '{}', 'valid.jsonl': '{"score":1}\n', 'broken.jsonl': '{\n}\n' };
  await Promise.all(Object.entries(content).map(([name, value]) => writeFile(path.join(root, name), value)));
  const issues = await inspectDataFormats(Object.keys(content), root, [{
    record_type: 'required_standard_json', path: 'package.json',
    recordIdentifier: '85f542e6-eea3-5815-b61c-7df1d6846af7',
    reason: 'npm package manifest', scope: 'external tool configuration only.',
  }]);
  assert.deepEqual(issues.map(issue => issue.file), ['custom.json', 'broken.jsonl']);
  const schemas = ['contracts/asset-manifest.schema.json', 'contracts/verification-contract.schema.json', 'mcp/lumenia-verification-contract.schema.json'];
  const registered = await readJsonLines(new URL('../contracts/json-lines-exceptions.jsonl', import.meta.url));
  assert.deepEqual(await inspectDataFormats(schemas, path.resolve(import.meta.dirname, '..'), registered), []);
});

test('format exceptions require a reasoned standard-JSON row and unique paths', async context => {
  const root = await mkdtemp(path.join(tmpdir(), 'lumenia-exception-contract-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, 'config.json'), '{}');
  const valid = {
    record_type: 'required_standard_json', recordIdentifier: '85f542e6-eea3-5815-b61c-7df1d6846af7',
    path: 'config.json', reason: 'test configuration', scope: 'test-only standard JSON.',
  };
  assert.deepEqual(await inspectDataFormats(['config.json'], root, [valid]), []);
  for (const row of [
    { ...valid, record_type: 'wrong_type' }, { ...valid, reason: '' }, { ...valid, scope: '   ' },
    { ...valid, recordIdentifier: undefined }, { ...valid, reason: undefined }, { ...valid, scope: 1 },
    { ...valid, recordIdentifier: [valid.recordIdentifier] }, { ...valid, recordIdentifier: [[valid.recordIdentifier]] },
    { ...valid, path: '../config.json' }, { ...valid, path: '/tmp/config.json' },
  ]) await assert.rejects(inspectDataFormats(['config.json'], root, [row]));
  assert.throws(() => exceptionPaths([valid, { ...valid, recordIdentifier: 'f53a1ddb-d675-5099-8bb5-15a8156d0d1a' }]));
  assert.throws(() => exceptionPaths([valid, { ...valid, path: 'other.json' }]));
  assert.deepEqual(exceptionPaths([{ ...valid, recordIdentifier: valid.recordIdentifier.toUpperCase() }]), new Set(['config.json']));
  assert.throws(() => exceptionPaths([valid, { ...valid, path: 'other.json', recordIdentifier: valid.recordIdentifier.toUpperCase() }]));
});

test('file readers and the format gate reject malformed bytes without changing valid text', async context => {
  const root = await mkdtemp(path.join(tmpdir(), 'lumenia-utf8-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  const file = path.join(root, 'records.jsonl');
  for (const bytes of [[255], [128], [192, 175], [237, 160, 128], [244, 144, 128, 128], [227, 129]]) {
    await writeFile(file, Buffer.from([34, ...bytes, 34, 10]));
    await assert.rejects(readJsonLines(file));
    assert.deepEqual((await inspectDataFormats(['records.jsonl'], root, [])).map(row => row.file), ['records.jsonl']);
  }
  await writeFile(file, '\uFEFF{}\n');
  await assert.rejects(readJsonLines(file), /byte order mark/);
  const values = [{ text: '資料 � 😃\n出典' }];
  await writeFile(file, serializeJsonLines(values));
  assert.deepEqual(await readJsonLines(file), values);
  assert.deepEqual(await inspectDataFormats(['records.jsonl', 'removed.jsonl'], root, []), []);
  for (const input of [undefined, null, 1, {}]) assert.throws(() => parseJsonLines(input));
});
