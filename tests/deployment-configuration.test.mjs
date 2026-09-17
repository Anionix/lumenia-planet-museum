import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { sourceManifest } from '../scripts/source-revision.mjs';

// machine contract; record_identifier=ccb17f39-143b-57bf-91d0-2725ed55f3ed
// transition: changed deployment configuration -> changed verification source identity.
test('deployment output changes invalidate source evidence', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'lumenia-deployment-'));
  try {
    for (const directory of ['formal', 'contracts', 'scripts', 'tests', 'mcp', 'web', 'reference-assets'])
      await mkdir(path.join(root, directory));
    for (const file of ['intent.md', 'spec.md', 'CONSTRAINTS.md', 'lean-toolchain', 'lakefile.toml',
      'lake-manifest.json', 'package.json', 'package-lock.json', 'eslint.config.mjs'])
      await writeFile(path.join(root, file), 'fixture');
    await mkdir(path.join(root, 'planetarium/lib'), { recursive: true });
    await writeFile(path.join(root, 'planetarium/lib/reference-physics-contract.mjs'), 'fixture');
    const absent = await sourceManifest(root);
    await writeFile(path.join(root, 'vercel.json'), '{"outputDirectory":"public"}');
    const previous = await sourceManifest(root);
    await writeFile(path.join(root, 'vercel.json'), '{"outputDirectory":"web/out"}');
    const current = await sourceManifest(root);
    assert.notEqual(absent.sourceRevision, previous.sourceRevision);
    assert.notEqual(previous.sourceRevision, current.sourceRevision);
    assert.ok(current.files.some(file => file.path === 'vercel.json'));
  } finally { await rm(root, { recursive: true, force: true }); }
});
