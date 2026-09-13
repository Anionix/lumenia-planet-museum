import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));

export async function sourceManifest(root = projectRoot) {
  const inputs = ['intent.md', 'spec.md', 'CONSTRAINTS.md', 'lean-toolchain',
    'lakefile.toml', 'lake-manifest.json', 'package.json', 'package-lock.json', 'eslint.config.mjs'];
  async function visit(directory) {
    for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
      const relative = directory + '/' + entry.name;
      if (['.next', 'out', 'node_modules'].includes(entry.name) || entry.name.endsWith('.tsbuildinfo') ||
          relative === 'web/next-env.d.ts' || ['web/public/artworks', 'web/public/decoders'].includes(relative)) continue;
      if (entry.isDirectory()) await visit(relative);
      else if (entry.isFile()) inputs.push(relative);
      else throw new Error('Source inputs must be regular files: ' + relative);
    }
  }
  for (const directory of ['formal', 'contracts', 'scripts', 'tests', 'mcp', 'web']) await visit(directory);
  inputs.sort();
  const files = await Promise.all(inputs.map(async (relative) => ({
    path: relative,
    sha256: createHash('sha256').update(await readFile(path.join(root, relative))).digest('hex'),
  })));
  return {
    sourceRevision: 'sha256:' + createHash('sha256').update(JSON.stringify(files)).digest('hex'),
    files,
  };
}
