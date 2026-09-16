import test from 'node:test';
import assert from 'node:assert/strict';
import { parseJsonLines, serializeJsonLines, readJsonLines } from '../scripts/json-lines.mjs';
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

test('file readers and the format gate reject malformed bytes without changing valid text', async context => {
  const root = await mkdtemp(path.join(tmpdir(), 'lumenia-utf8-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  const file = path.join(root, 'records.jsonl');
  for (const bytes of [[255], [128], [192, 175], [237, 160, 128], [244, 144, 128, 128], [227, 129]]) {
    await writeFile(file, Buffer.from([34, ...bytes, 34, 10]));
    await assert.rejects(readJsonLines(file));
    assert.deepEqual((await inspectDataFormats(['records.jsonl'], root, new Set())).map(row => row.file), ['records.jsonl']);
  }
  await writeFile(file, '\uFEFF{}\n');
  await assert.rejects(readJsonLines(file), /byte order mark/);
  const values = [{ text: '資料 � 😃\n出典' }];
  await writeFile(file, serializeJsonLines(values));
  assert.deepEqual(await readJsonLines(file), values);
  assert.deepEqual(await inspectDataFormats(['records.jsonl', 'removed.jsonl'], root, new Set()), []);
  for (const input of [undefined, null, 1, {}]) assert.throws(() => parseJsonLines(input));
});
