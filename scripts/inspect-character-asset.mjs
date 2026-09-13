import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { characterRegistration, characterRegistrations, characterEvidenceFiles, firstCharacterSlug } from './character-registration.mjs';

// llm machine contract; claimIdentifier: 8b952955-8da1-53ed-8cc0-87934f160bfa
// executionIdentifier: 01a09af7-f340-76cb-86a7-4075de7842d3
// transition: source-bound character receipt + actual bytes -> isolated image admission or rejection.
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const expectedDirections = new Set(['000 up', '022.5 up-right', '045 up-right', '067.5 up-right',
  '090 right', '112.5 down-right', '135 down-right', '157.5 down-right', '180 down',
  '202.5 down-left', '225 down-left', '247.5 down-left', '270 left',
  '292.5 up-left', '315 up-left', '337.5 up-left']);
const nonemptyText = value => typeof value === 'string' && value.trim().length > 0;
export async function inspectCharacterAsset(directory, slug = firstCharacterSlug) {
  const registration = await characterRegistration(slug);
  if (!registration) return { status: 'fail', failureReason: 'Character is not registered', receipt: null };
  const publicDirectory = 'characters/' + registration.slug;
  const root = path.join(directory, publicDirectory);
  let receipt;
  try { receipt = JSON.parse(await readFile(path.join(root, 'receipt.json'), 'utf8')); }
  catch (error) { return { status: error.code === 'ENOENT' ? 'blocked' : 'fail', failureReason: 'Character receipt is absent or invalid', receipt: null }; }
  try {
    if (receipt.status !== 'pass' || receipt.artifactIdentifier !== registration.artifactIdentifier ||
      receipt.personIdentifier !== registration.personIdentifier || receipt.profileIdentifier !== registration.profileIdentifier ||
      receipt.characterSlug !== slug || receipt.representation !== 'fictionalReconstruction' ||
      receipt.spriteVersionNumber !== 2 || receipt.width !== 1536 || receipt.height !== 2288 ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(receipt.executionIdentifier))
      throw new Error('Character receipt violates its registration contract');
    const bytes = await readFile(path.join(root, 'spritesheet.webp'));
    if (digest(bytes) !== receipt.sha256 || bytes.length !== receipt.bytes) throw new Error('Character image differs from inspected bytes');
    const required = [...characterEvidenceFiles.keys()];
    if (!Array.isArray(receipt.evidence) || receipt.evidence.length !== required.length) throw new Error('Missing required character evidence');
    for (const name of required) {
      const entry = receipt.evidence.find(item => item.file === name);
      const bytes = await readFile(path.join(root, 'evidence', name));
      if (!entry || digest(bytes) !== entry.sha256) throw new Error('Character evidence digest changed: ' + name);
      const result = JSON.parse(bytes.toString('utf8'));
      if (name === 'direction-semantics.json') {
        if (!Array.isArray(result.directions) || result.directions.length !== 16 ||
          new Set(result.directions.map(item => item.expected)).size !== 16 ||
          result.directions.some(item => !expectedDirections.has(item.expected) ||
            !['pass', 'warning'].includes(item.verdict) || !nonemptyText(item.observed) || !nonemptyText(item.reason) ||
            !nonemptyText(item.horizontalEvidence) || !nonemptyText(item.verticalEvidence)))
          throw new Error('Direction semantics are missing or failed');
      } else if (name === 'visual-review.json') {
        if (result.visual_qa !== 'pass' || !result.reviewerIdentifier) throw new Error('Independent visual review has not passed');
      } else if (name === 'review.json') {
        if (!Array.isArray(result.errors) || result.errors.length) throw new Error('Standard animation inspection is missing or failed');
      } else if (name === 'look-continuity.json') {
        if (!Array.isArray(result.pairs) || result.pairs.length !== 16) throw new Error('Ordered direction continuity inspection is incomplete');
      } else if (name === 'validation-extended.json') {
        if (result.ok !== true || result.imageSha256 !== receipt.sha256 || result.width !== 1536 || result.height !== 2288 ||
          result.sprite_version_number !== 2 || !Array.isArray(result.errors) || result.errors.length)
          throw new Error('Decoded atlas validation is missing, failed, or belongs to another image');
      } else if (result.ok !== true) throw new Error('Required character inspection failed: ' + name);
    }
    return { status: 'pass', failureReason: null, receipt, path: publicDirectory + '/spritesheet.webp' };
  } catch (error) { return { status: 'fail', failureReason: error.message, receipt }; }
}

export async function inspectCharacterAssets(directory) {
  const registrations = await characterRegistrations();
  const characters = await Promise.all(registrations.map(async registration => ({
    registration, ...await inspectCharacterAsset(directory, registration.slug),
  })));
  const problems = [];
  try {
    for (const entry of await readdir(path.join(directory, 'characters'), { withFileTypes: true }))
      if (!entry.isDirectory() || !registrations.some(character => character.slug === entry.name))
        problems.push('Unregistered character entry: ' + entry.name);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  return { characters, problems };
}
