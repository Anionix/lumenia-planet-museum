import test from 'node:test';
import assert from 'node:assert/strict';
import { parseJsonLines, serializeJsonLines } from '../scripts/json-lines.mjs';
import { inspectDataFormats } from '../scripts/check-data-format.mjs';
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
test('format gate distinguishes required settings from custom data and malformed records', async context => {
  const root = await mkdtemp(path.join(tmpdir(), 'lumenia-json-lines-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  const content = { 'package.json': '{}', 'custom.json': '{}', 'valid.jsonl': '{"score":1}\n', 'broken.jsonl': '{\n}\n' };
  await Promise.all(Object.entries(content).map(([name, value]) => writeFile(path.join(root, name), value)));
  const issues = await inspectDataFormats(Object.keys(content), root, new Set(['package.json']));
  assert.deepEqual(issues.map(issue => issue.file), ['custom.json', 'broken.jsonl']);
});
