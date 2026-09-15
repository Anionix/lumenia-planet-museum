import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { projectRoot, sourceManifest } from './source-revision.mjs';
import { uuidVersionSeven } from './identifiers.mjs';
import { connectPlanetarium } from './connect-planetarium.mjs';
import { buildCharacterStyles } from './build-character-styles.mjs';
import { buildCharacterAvailability } from './build-character-availability.mjs';
import { buildCosmicCatalog } from './build-cosmic-catalog.mjs';

// llm machine contract; claim UUIDv5: 07b6fb92-8639-50e0-873d-b43d3d5c28df
// execution UUIDv7 generated below; transition: source digest -> build -> output digest; drift -> rejected
export async function outputManifest() {
  const files = [];
  async function visit(directory) {
    for (const item of await readdir(path.join(projectRoot, 'web/out', directory), { withFileTypes: true })) {
      const relative = path.join(directory, item.name);
      if (relative === 'evidence') continue; // Report attachments are downstream, never executable build inputs.
      if (item.isDirectory()) await visit(relative);
      else if (item.isFile()) {
        const bytes = await readFile(path.join(projectRoot, 'web/out', relative));
        files.push({ path: relative, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
      } else throw new Error('Unexpected output symlink');
    }
  }
  await visit(''); files.sort((a, b) => a.path.localeCompare(b.path));
  return files;
}

export async function buildWeb() {
  await connectPlanetarium();
  await buildCharacterStyles();
  await buildCharacterAvailability();
  await buildCosmicCatalog();
  const manifest = await sourceManifest(), executionIdentifier = uuidVersionSeven();
  const evidence = { executionIdentifier, sourceRevision: manifest.sourceRevision, manifest, createdAt: new Date().toISOString(), state: 'rejected' };
  await mkdir(path.join(projectRoot, 'reports'), { recursive: true });
  await writeFile(path.join(projectRoot, 'reports/web-build-evidence.json'), JSON.stringify(evidence, null, 2));
  // Plumeria recommends a cold Next build so cached modules cannot omit regenerated CSS atoms.
  // Preserve the previous generated cache for diagnosis; no source files are removed.
  const previousBuild = path.join(projectRoot, 'artifacts/previous-builds', executionIdentifier);
  await mkdir(path.dirname(previousBuild), { recursive: true });
  try { await rename(path.join(projectRoot, 'web/.next'), previousBuild); evidence.previousBuild = previousBuild; }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build', 'web', '--webpack'],
    { cwd: projectRoot, encoding: 'utf8', timeout: 180000, maxBuffer: 8 * 1024 * 1024,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
  evidence.command = 'next build web --webpack'; evidence.exitCode = result.status;
  evidence.stdout = result.stdout; evidence.stderr = result.stderr;
  process.stdout.write(result.stdout ?? ''); process.stderr.write(result.stderr ?? '');
  const after = await sourceManifest();
  if (result.status === 0 && after.sourceRevision === manifest.sourceRevision) {
    evidence.outputs = await outputManifest(); evidence.state = 'built';
  }
  await writeFile(path.join(projectRoot, 'reports/web-build-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  if (evidence.state !== 'built') throw new Error('Build failed or source changed during build');
}
if (process.argv[1] === new URL(import.meta.url).pathname) await buildWeb();
