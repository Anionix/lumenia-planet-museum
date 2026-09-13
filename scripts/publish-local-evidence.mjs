import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { sourceManifest, projectRoot } from './source-revision.mjs';
import { uuidVersionSeven } from './identifiers.mjs';

// llm machine contract; claim UUIDv5: 07b6fb92-8639-50e0-873d-b43d3d5c28df
// execution UUIDv7 generated per attachment; transition: report source revision -> current | staleEvidence wrapper
// This copies local report attachments only. It does not publish anything to an external host.
const current = await sourceManifest(), executionIdentifier = uuidVersionSeven();
const directory = path.join(projectRoot, 'web/out/evidence'); await mkdir(directory, { recursive: true });
for (const name of ['proof-report', 'gate-report', 'wolfram-report', 'asset-reference-report']) {
  let report = null;
  try { report = JSON.parse(await readFile(path.join(projectRoot, 'reports', name + '.json'), 'utf8')); } catch {}
  const wrapper = { executionIdentifier, sourceRevision: current.sourceRevision, createdAt: new Date().toISOString(),
    status: !report ? 'blocked' : report.sourceRevision !== current.sourceRevision ? 'staleEvidence' : report.status,
    scope: 'Local preview evidence, not a release authorization', report };
  await writeFile(path.join(directory, name + '.json'), JSON.stringify(wrapper, null, 2) + '\n');
}
