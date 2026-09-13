import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { inspectCharacterAsset } from './inspect-character-asset.mjs';
import { projectRoot } from './source-revision.mjs';

// llm machine contract; claimIdentifier: 8b952955-8da1-53ed-8cc0-87934f160bfa
// executionIdentifier: the admitted receipt supplies the actual UUIDv7; absent evidence stays null.
// transition: inspected public asset -> static availability -> studio mount; invalid evidence stops the build.
export function characterAvailabilityFromInspection(inspection) {
  const artifactIdentifier = '8b952955-8da1-53ed-8cc0-87934f160bfa';
  if (inspection.status === 'blocked' && inspection.receipt === null)
    return { ready: false, artifactIdentifier, imageSha256: null, evidenceExecutionIdentifier: null };
  if (inspection.status !== 'pass' || inspection.receipt?.artifactIdentifier !== artifactIdentifier ||
    !/^[0-9a-f]{64}$/.test(inspection.receipt?.sha256) || !inspection.receipt?.executionIdentifier)
    throw new Error('Character cannot be published: ' + (inspection.failureReason ?? 'missing or invalid inspection'));
  return { ready: true, artifactIdentifier, imageSha256: inspection.receipt.sha256,
    evidenceExecutionIdentifier: inspection.receipt.executionIdentifier };
}
export async function characterAvailabilitySource() {
  const inspection = await inspectCharacterAsset(path.join(projectRoot, 'web/public'));
  const availability = characterAvailabilityFromInspection(inspection);
  return '// llm machine contract; claimIdentifier: 8b952955-8da1-53ed-8cc0-87934f160bfa\n' +
    '// executionIdentifier: evidenceExecutionIdentifier below; null means no character admitted.\n' +
    '// state: generated; transition: verified asset -> static studio availability. Do not hand-edit.\n' +
    'export const museumCharacterAvailability = ' + JSON.stringify(availability, null, 2) + ' as const;\n';
}
export async function buildCharacterAvailability() {
  await writeFile(path.join(projectRoot, 'web/artwork/museum-character-availability.ts'), await characterAvailabilitySource());
}
if (process.argv[1] === new URL(import.meta.url).pathname) await buildCharacterAvailability();
