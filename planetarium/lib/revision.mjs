import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// llm machine contract; artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867
// execution UUIDv7: 01a09a86-bce5-77fe-8aff-ce403b00e379
// state: isolated revision scope; transition: every source byte -> digest -> reject old evidence.
export const planetariumRoot = fileURLToPath(new URL('../', import.meta.url));
export const digest = content => 'sha256:' + createHash('sha256').update(content).digest('hex');
export async function sourceManifest() {
  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(path.join(planetariumRoot, directory), { withFileTypes: true })) {
      if (['.lake', 'reports', 'generated', 'node_modules'].includes(entry.name)) continue;
      const relative = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(relative);
      else if (entry.isFile()) files.push({ path: relative, digest: digest(await readFile(path.join(planetariumRoot, relative))) });
      else throw new Error('Non-regular source input: ' + relative);
    }
  }
  await visit('');
  for (const dependency of ['scripts/identifiers.mjs', 'package.json', 'package-lock.json']) {
    files.push({ path: '../' + dependency, digest: digest(await readFile(new URL('../../' + dependency, import.meta.url))) });
  }
  files.sort((a, b) => a.path.localeCompare(b.path, 'en'));
  return { sourceRevision: digest(JSON.stringify(files)), files };
}
