import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { inspectCharacterAssets } from './inspect-character-asset.mjs';
import { firstCharacterArtifactIdentifier, firstCharacterSlug } from './character-registration.mjs';
import { projectRoot } from './source-revision.mjs';
import { cssMuseumPeople } from '../web/artwork/css-museum-people.mjs';

// llm machine contract; claimIdentifier: 8b952955-8da1-53ed-8cc0-87934f160bfa
// executionIdentifier: the admitted receipt supplies the actual UUIDv7; absent evidence stays null.
// transition: inspected public asset -> static availability -> studio mount; invalid evidence stops the build.
export function characterAvailabilityFromInspection(inspection, registration = {
  slug: firstCharacterSlug, artifactIdentifier: firstCharacterArtifactIdentifier,
}) {
  const { artifactIdentifier, slug } = registration;
  if (inspection.status === 'blocked' && inspection.receipt === null)
    return { slug, ready: false, artifactIdentifier, imagePath: null, imageSha256: null, evidenceExecutionIdentifier: null };
  if (inspection.status !== 'pass' || inspection.receipt?.artifactIdentifier !== artifactIdentifier ||
    !/^[0-9a-f]{64}$/.test(inspection.receipt?.sha256) || !inspection.receipt?.executionIdentifier)
    throw new Error('Character cannot be published: ' + (inspection.failureReason ?? 'missing or invalid inspection'));
  return { slug, ready: true, artifactIdentifier, imagePath: '/characters/' + slug + '/spritesheet.webp', imageSha256: inspection.receipt.sha256,
    evidenceExecutionIdentifier: inspection.receipt.executionIdentifier };
}
export async function characterAvailabilitySource() {
  const inspection = await inspectCharacterAssets(path.join(projectRoot, 'web/public'));
  if (inspection.problems.length) throw new Error(inspection.problems.join('\n'));
  const availability = inspection.characters.map(character => ({ ...characterAvailabilityFromInspection(character, character.registration), nativeReady: cssMuseumPeople.some(person => person.slug === character.registration.slug) }));
  return '// llm machine contract; claimIdentifier: ed4d2a7d-4345-5bdb-bddc-c88a6c943d9f\n' +
    '// executionIdentifier: evidenceExecutionIdentifier below; null means no character admitted.\n' +
    '// state: generated; transition: verified asset -> static studio availability. Do not hand-edit.\n' +
    'export type MuseumCharacterAvailability = { slug: string; nativeReady: boolean; ready: boolean; artifactIdentifier: string; imagePath: string | null; imageSha256: string | null; evidenceExecutionIdentifier: string | null };\n' +
    'export const museumCharacterAvailability: readonly MuseumCharacterAvailability[] = ' + JSON.stringify(availability, null, 2) + ';\n' +
    'export const availableStudioSlugs = museumCharacterAvailability.filter(character => character.ready || character.nativeReady).map(character => character.slug);\n';
}
export async function buildCharacterAvailability() {
  await writeFile(path.join(projectRoot, 'web/artwork/museum-character-availability.ts'), await characterAvailabilitySource());
}
if (process.argv[1] === new URL(import.meta.url).pathname) await buildCharacterAvailability();
