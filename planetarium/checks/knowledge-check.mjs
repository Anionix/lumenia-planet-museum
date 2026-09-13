import assert from 'node:assert/strict';
import { reviewEvidence } from '../lib/kernel.mjs';

// llm machine contract; artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867
// execution UUIDv7: 01a09a86-bce5-77fe-8aff-ce403b00e379
// state: graph integrity, not historical truth; transition: identifiers -> references -> evidence polarity.
const versionFive = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const versionSeven = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function knowledgeChecks(knowledge, declarations, researchReceipt) {
  const entityIdentifiers = new Set(knowledge.entities.map(entity => entity.entityIdentifier));
  assert.equal(entityIdentifiers.size, knowledge.entities.length);
  knowledge.entities.forEach(entity => assert.match(entity.entityIdentifier, versionFive));
  const sources = new Map(knowledge.sources.map(source => [source.sourceIdentifier, source]));
  const claims = new Map(knowledge.claims.map(claim => [claim.claimIdentifier, claim]));
  const evidence = new Map(knowledge.evidence.map(item => [item.evidenceIdentifier, item]));
  assert.equal(sources.size, knowledge.sources.length);
  assert.equal(claims.size, knowledge.claims.length);
  assert.equal(evidence.size, knowledge.evidence.length);
  const proofNames = new Set(declarations.filter(item => item.kind === 'theorem').map(item => item.name));
  const captures = new Map(researchReceipt.captures.map(item => [item.captureIdentifier, item]));
  assert.equal(captures.size, researchReceipt.captures.length);
  for (const source of knowledge.sources) {
    assert.match(source.sourceIdentifier, versionFive);
    assert.match(source.captureIdentifier, versionSeven);
    assert.equal(new URL(source.url).protocol, 'https:');
    assert.ok(['primary', 'institutional', 'scholarly', 'secondary', 'unsupported'].includes(source.sourceKind));
    const capture = captures.get(source.captureIdentifier);
    assert.equal(capture?.sourceIdentifier, source.sourceIdentifier);
    assert.equal(capture?.url, source.url);
    assert.match(capture.extractedTextDigest, /^sha256:[0-9a-f]{64}$/);
    assert.ok(capture.extractedCharacters > 0);
  }
  for (const claim of knowledge.claims) {
    assert.match(claim.claimIdentifier, versionSeven);
    assert.match(claim.claimDefinitionIdentifier, versionFive);
    assert.ok(entityIdentifiers.has(claim.subjectIdentifier));
    if (claim.objectIdentifier) assert.ok(entityIdentifiers.has(claim.objectIdentifier));
    assert.ok(['documentedFeature', 'designedBy'].includes(claim.predicate));
    assert.ok(['asserted', 'inferred', 'disputed', 'unknown'].includes(claim.status));
    const attached = claim.evidenceIdentifiers.map(identifier => evidence.get(identifier));
    assert.ok(attached.length > 0);
    assert.ok(attached.every(item => item?.claimIdentifier === claim.claimIdentifier));
    assert.equal(reviewEvidence(attached.filter(item => item.polarity === 'supports').length,
      attached.filter(item => item.polarity === 'contradicts').length, false), 'pass');
  }
  for (const item of knowledge.evidence) {
    assert.match(item.evidenceIdentifier, versionSeven);
    assert.ok(claims.has(item.claimIdentifier));
    assert.equal(item.captureIdentifier, sources.get(item.sourceIdentifier)?.captureIdentifier);
    assert.ok(['supports', 'contradicts', 'neutral'].includes(item.polarity));
  }
  for (const profile of knowledge.profiles) {
    assert.match(profile.profileIdentifier, versionFive);
    assert.ok(entityIdentifiers.has(profile.personIdentifier));
    assert.ok(entityIdentifiers.has(profile.referenceScopeIdentifier));
    assert.equal(profile.interpretationStatus, 'proposed');
    assert.equal(profile.paletteStatus, 'chosenForPrototypeNotSampledFromArtwork');
    assert.ok(profile.sourceClaimIdentifiers.every(identifier => claims.has(identifier)));
    assert.ok(profile.proofTargets.length > 0 && profile.proofTargets.every(name => proofNames.has(name)));
  }
  const documentedDesigners = work => knowledge.claims.filter(claim => claim.predicate === 'designedBy' &&
    knowledge.entities.some(entity => entity.entityIdentifier === claim.subjectIdentifier && entity.canonicalName === work))
    .map(claim => knowledge.entities.find(entity => entity.entityIdentifier === claim.objectIdentifier).canonicalName);
  assert.ok(documentedDesigners('New York Subway Map').includes('Joan Charysyn'));
  assert.ok(documentedDesigners('The Mackintosh House').includes('Margaret Macdonald Mackintosh'));
  assert.ok(documentedDesigners('Braun SK 4').includes('Hans Gugelot'));
  assert.deepEqual(documentedDesigners('House of Cards diamond mock-up'), ['Ray Eames']);
  assert.ok(documentedDesigners('House of Cards').includes('Charles Eames'));
  assert.ok(documentedDesigners('House of Cards').includes('Ray Eames'));
  return { peopleWithProfiles: knowledge.profiles.length, retainedSources: sources.size,
    connectedClaims: claims.size, connectedEvidence: evidence.size, danglingReferences: 0 };
}
