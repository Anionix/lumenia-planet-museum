import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { inspectCharacterAsset } from '../scripts/inspect-character-asset.mjs';

// llm machine contract; claimIdentifier: 8b952955-8da1-53ed-8cc0-87934f160bfa
// executionIdentifier: each real admission run supplies its own UUIDv7.
// transition: synthetic receipt mutations -> admission rejection; never production visual evidence.
const directions = ['000 up', '022.5 up-right', '045 up-right', '067.5 up-right',
  '090 right', '112.5 down-right', '135 down-right', '157.5 down-right', '180 down',
  '202.5 down-left', '225 down-left', '247.5 down-left', '270 left',
  '292.5 up-left', '315 up-left', '337.5 up-left'];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
async function fixture(t, mutate = () => {}) {
  const directory = await mkdtemp(path.join(tmpdir(), 'lumenia-character-admission-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const root = path.join(directory, 'characters/william-morris');
  await mkdir(path.join(root, 'evidence'), { recursive: true });
  // Deliberately not image content: this test covers receipt admission, not image decoding or visual QA.
  const bytes = Buffer.from('synthetic receipt boundary fixture; not an artwork');
  const reports = {
    'validation-extended.json': { ok: true },
    'chroma-despill-extended.json': { ok: true },
    'direction-blind-validation.json': { ok: true },
    'direction-semantics.json': { directions: directions.map(expected => ({ expected,
      verdict: 'pass', observed: 'synthetic observation', reason: 'test fixture only' })) },
    'visual-review.json': { visual_qa: 'pass', reviewerIdentifier: 'synthetic-test-reviewer' },
  };
  const receipt = { status: 'pass', artifactIdentifier: '8b952955-8da1-53ed-8cc0-87934f160bfa',
    executionIdentifier: '01a09af7-f340-76cb-86a7-4075de7842d3', spriteVersionNumber: 2,
    width: 1536, height: 2288, bytes: bytes.length, sha256: digest(bytes) };
  mutate({ receipt, reports });
  receipt.evidence = [];
  for (const [file, report] of Object.entries(reports)) {
    const content = JSON.stringify(report);
    await writeFile(path.join(root, 'evidence', file), content);
    receipt.evidence.push({ file, sha256: digest(content) });
  }
  await writeFile(path.join(root, 'spritesheet.webp'), bytes);
  await writeFile(path.join(root, 'receipt.json'), JSON.stringify(receipt));
  return { directory, root };
}
test('Character receipt boundary accepts a complete synthetic record without claiming visual verification', async t => {
  const { directory } = await fixture(t);
  assert.equal((await inspectCharacterAsset(directory)).status, 'pass');
});
test('Character admission rejects sixteen unique but unrecognized direction labels', async t => {
  const { directory } = await fixture(t, ({ reports }) => {
    reports['direction-semantics.json'].directions[0].expected = 'unknown direction';
  });
  assert.equal((await inspectCharacterAsset(directory)).status, 'fail');
});
for (const [name, mutate] of [
  ['duplicate direction', ({ reports }) => { reports['direction-semantics.json'].directions[1].expected = directions[0]; }],
  ['missing direction', ({ reports }) => { reports['direction-semantics.json'].directions.pop(); }],
  ['failed direction', ({ reports }) => { reports['direction-semantics.json'].directions[0].verdict = 'fail'; }],
  ['empty semantic observation', ({ reports }) => { reports['direction-semantics.json'].directions[0].observed = ' '; }],
  ['non-text semantic reason', ({ reports }) => { reports['direction-semantics.json'].directions[0].reason = {}; }],
  ['failed independent review', ({ reports }) => { reports['visual-review.json'].visual_qa = 'fail'; }],
  ['failed blind review', ({ reports }) => { reports['direction-blind-validation.json'].ok = false; }],
  ['intermediate atlas', ({ receipt }) => { receipt.spriteVersionNumber = 1; }],
  ['invalid execution identifier', ({ receipt }) => { receipt.executionIdentifier = 'not-a-run'; }],
]) test('Character admission rejects ' + name, async t => {
  const { directory } = await fixture(t, mutate);
  assert.equal((await inspectCharacterAsset(directory)).status, 'fail');
});
test('Character admission rejects image bytes changed after inspection', async t => {
  const { directory, root } = await fixture(t);
  await writeFile(path.join(root, 'spritesheet.webp'), 'changed synthetic bytes');
  assert.equal((await inspectCharacterAsset(directory)).status, 'fail');
});
test('Character admission rejects evidence changed after inspection', async t => {
  const { directory, root } = await fixture(t);
  const report = path.join(root, 'evidence/visual-review.json');
  await writeFile(report, (await readFile(report, 'utf8')) + '\n');
  assert.equal((await inspectCharacterAsset(directory)).status, 'fail');
});
test('Missing character receipt is blocked, not accepted', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'lumenia-character-absent-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  assert.equal((await inspectCharacterAsset(directory)).status, 'blocked');
});
