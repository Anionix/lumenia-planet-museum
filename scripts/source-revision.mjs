import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));

// machine contract; record_identifier=d93d88e9-8679-522b-a756-0b60472c9e5f.
// transition: source inputs -> generated public assets; generated copies must not change source identity.

export async function sourceManifest(root = projectRoot, { includePlanetarium = false } = {}) {
  const inputs = ['intent.md', 'spec.md', 'CONSTRAINTS.md', 'lean-toolchain',
    'lakefile.toml', 'lake-manifest.json', 'package.json', 'package-lock.json', 'eslint.config.mjs'];
  if ((await readdir(root)).includes('vercel.json')) inputs.push('vercel.json');
  async function visit(directory) {
    for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
      const relative = directory + '/' + entry.name;
      if (['.next', '.lake', 'out', 'node_modules'].includes(entry.name) || entry.name.endsWith('.tsbuildinfo') ||
          relative === 'web/next-env.d.ts' || ['web/public/artworks', 'web/public/decoders', 'web/public/cosmos',
            'planetarium/generated', 'planetarium/reports'].some((directory) => relative === directory || relative.startsWith(directory + '/'))) continue;
      if (entry.isDirectory()) await visit(relative);
      else if (entry.isFile()) inputs.push(relative);
      else throw new Error('Source inputs must be regular files: ' + relative);
    }
  }
  const directories = ['formal', 'contracts', 'scripts', 'tests', 'mcp', 'web', 'reference-assets'];
  if (includePlanetarium) directories.push('planetarium');
  for (const directory of directories) await visit(directory);
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
