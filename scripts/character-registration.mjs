import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { claimIdentifier } from './identifiers.mjs';

// llm machine contract; claimIdentifier: ed4d2a7d-4345-5bdb-bddc-c88a6c943d9f
// executionIdentifier: 01a09b67-591d-7892-b864-f72b0dad2420
// transition: existing source-linked person -> distinct character registration -> inspected asset.
export const firstCharacterSlug = 'william-morris';
export const firstCharacterArtifactIdentifier = '8b952955-8da1-53ed-8cc0-87934f160bfa';
export const characterEvidenceFiles = new Map([
  ['validation-extended.json', 'final/validation-extended.json'],
  ['chroma-despill-extended.json', 'qa/chroma-despill-extended.json'],
  ['direction-blind-validation.json', 'qa/direction-blind-validation.json'],
  ['direction-semantics.json', 'qa/direction-semantics.json'],
  ['visual-review.json', 'qa/visual-review.json'],
  ['review.json', 'qa/review.json'],
  ['look-continuity.json', 'qa/look-continuity.json'],
]);

export async function characterRegistrations() {
  const knowledge = JSON.parse(await readFile(new URL('../planetarium/knowledge.json', import.meta.url), 'utf8'));
  return knowledge.profiles.map(profile => {
    const slug = profile.componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    assert.match(slug, /^[a-z]+(?:-[a-z]+)*$/);
    const sourceIdentifiers = new Set(profile.sourceClaimIdentifiers.flatMap(identifier => {
      const claim = knowledge.claims.find(item => item.claimIdentifier === identifier);
      assert.ok(claim, 'Missing person source claim');
      return claim.evidenceIdentifiers.map(identifier => {
        const evidence = knowledge.evidence.find(item => item.evidenceIdentifier === identifier);
        assert.ok(evidence, 'Missing person source evidence');
        return evidence.sourceIdentifier;
      });
    }));
    const sources = knowledge.sources.filter(source => sourceIdentifiers.has(source.sourceIdentifier)).map(source => source.url);
    assert.ok(sources.length >= 2 && sources.every(url => url.startsWith('https://')), 'Multiple primary sources are required');
    return { slug, personIdentifier: profile.personIdentifier, profileIdentifier: profile.profileIdentifier,
      artifactIdentifier: slug === firstCharacterSlug ? firstCharacterArtifactIdentifier : claimIdentifier('Lumenia.MuseumCharacter.' + profile.canonicalName),
      canonicalName: profile.canonicalName, displayName: profile.title.replace(' — Material Sphere', ''), sources };
  });
}

export async function characterRegistration(slug) {
  return (await characterRegistrations()).find(character => character.slug === slug) ?? null;
}
