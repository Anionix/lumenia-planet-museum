import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, copyFile, writeFile, access, rename } from 'node:fs/promises';
import path from 'node:path';
import { uuidVersionSeven } from './identifiers.mjs';
import { projectRoot } from './source-revision.mjs';
import { inspectCharacterAsset } from './inspect-character-asset.mjs';
import { characterRegistration, characterEvidenceFiles, firstCharacterSlug } from './character-registration.mjs';

// llm machine contract; claimIdentifier: 8b952955-8da1-53ed-8cc0-87934f160bfa
// executionIdentifier: generated separately for each staging run.
// transition: completed independent visual and deterministic inspection -> byte-identical museum asset.
// This packages already generated imagery. It never generates, repairs, or resizes images.
const run = process.argv[2];
assert.ok(run && path.isAbsolute(run), 'Provide the absolute completed hatch-pet run directory');
const registration = await characterRegistration(process.argv[3] ?? firstCharacterSlug);
assert.ok(registration, 'Choose a source-linked registered character');
const read = async name => JSON.parse(await readFile(path.join(run, name), 'utf8'));
const summary = await read('qa/run-summary.json');
assert.equal(summary.ok, true, 'Hatch-pet packaging is incomplete');
assert.equal(summary.spriteVersionNumber, 2);
const files = characterEvidenceFiles;
for (const [name, relative] of files) {
  const result = await read(relative);
  if (name === 'visual-review.json') assert.equal(result.visual_qa, 'pass');
  else if (name === 'review.json') assert.deepEqual(result.errors, [], relative);
  else if (name === 'look-continuity.json') assert.equal(result.pairs?.length, 16, relative);
  else if (name !== 'direction-semantics.json') assert.equal(result.ok, true, relative);
}
const finalDestination = path.join(projectRoot, 'web/public/characters', registration.slug);
try { await access(finalDestination); throw new Error('Character destination exists; inspect it before replacing'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
await mkdir(path.join(projectRoot, 'artifacts'), { recursive: true });
const stagingDirectory = await mkdtemp(path.join(projectRoot, 'artifacts/character-stage-'));
const destination = path.join(stagingDirectory, 'characters', registration.slug);
await mkdir(path.join(destination, 'evidence'), { recursive: true });
const evidence = [];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
for (const [name, relative] of files) {
  // Keep source identifiers, but omit private absolute workstation paths from hosted reports.
  const content = (await readFile(path.join(run, relative), 'utf8'))
    .replaceAll(run, 'hatch-run').replace(/\/Users\/[^"\n]+?\/william-morris(?=\/|"|\s)/g, 'hatch-run');
  await writeFile(path.join(destination, 'evidence', name), content);
  evidence.push({ file: name, sha256: digest(content) });
}
const sprite = path.join(run, 'final/spritesheet-extended.webp');
const bytes = await readFile(sprite);
await copyFile(sprite, path.join(destination, 'spritesheet.webp'));
const receipt = { artifactIdentifier: registration.artifactIdentifier, personIdentifier: registration.personIdentifier,
  profileIdentifier: registration.profileIdentifier, characterSlug: registration.slug, executionIdentifier: uuidVersionSeven(),
  recordedAt: new Date().toISOString(), status: 'pass', name: registration.canonicalName, representation: 'fictionalReconstruction',
  spriteVersionNumber: 2, width: 1536, height: 2288, bytes: bytes.length, sha256: digest(bytes), evidence,
  sources: registration.sources,
  limitation: 'Visual interpretation, not a historical recording. Material Sphere raster conversion is not implemented by this character asset.' };
await writeFile(path.join(destination, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
const inspection = await inspectCharacterAsset(stagingDirectory, registration.slug);
assert.equal(inspection.status, 'pass', inspection.failureReason);
await mkdir(path.dirname(finalDestination), { recursive: true });
await rename(destination, finalDestination);
console.log(JSON.stringify(inspection));
