import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { sourceManifest, projectRoot } from './source-revision.mjs';
import { outputManifest } from './build-web.mjs';
import { uuidVersionSeven } from './identifiers.mjs';

// llm machine contract; claim UUIDv5: b70d510f-8a47-5422-b007-5fd5d1d9a80b
// execution UUIDv7 generated here; transition: capture before -> actual MCP browser call -> capture after -> current or stale evidence
const directory = path.join(projectRoot, 'reports/browser'); await mkdir(directory, { recursive: true });
const mode = process.argv[2];
if (mode === 'before' || mode === 'after') {
  const manifest = await sourceManifest();
  const build = JSON.parse(await readFile(path.join(projectRoot, 'reports/web-build-evidence.json'), 'utf8'));
  const outputs = await outputManifest();
  const capture = { sourceRevision: manifest.sourceRevision, manifest, executionIdentifier: uuidVersionSeven(),
    createdAt: new Date().toISOString(), buildSourceRevision: build.sourceRevision,
    outputDigest: createHash('sha256').update(JSON.stringify(outputs)).digest('hex'),
    matchesBuild: build.state === 'built' && JSON.stringify(build.outputs) === JSON.stringify(outputs) };
  await writeFile(path.join(directory, mode + '.json'), JSON.stringify(capture, null, 2) + '\n');
  console.log(JSON.stringify({ mode, sourceRevision: capture.sourceRevision, matchesBuild: capture.matchesBuild }));
} else if (mode === 'record') {
  const before = JSON.parse(await readFile(path.join(directory, 'before.json'), 'utf8'));
  const after = JSON.parse(await readFile(path.join(directory, 'after.json'), 'utf8'));
  const toolResponse = JSON.parse(await readFile(path.join(directory, 'tool-response.json'), 'utf8'));
  const text = toolResponse.content.filter(item => item.type === 'text').map(item => item.text).join('\n');
  const match = text.match(/### Result\n([\s\S]*?)\n### Ran Playwright code/);
  if (!match || toolResponse.isError) throw new Error('No actual browser tool result');
  if (!before.matchesBuild || !after.matchesBuild) throw new Error('Browser inputs do not match the recorded production output');
  const capture = { toolName: 'mcp__playwright__browser_run_code_unsafe', executionIdentifier: before.executionIdentifier,
    sourceRevision: before.sourceRevision, afterSourceRevision: after.sourceRevision, buildSourceRevision: before.buildSourceRevision,
    outputDigestBefore: before.outputDigest, outputDigestAfter: after.outputDigest, before, after, data: JSON.parse(match[1]),
    rawToolResponsePath: 'reports/browser/tool-response.json' };
  await writeFile(path.join(directory, 'chrome-evidence.json'), JSON.stringify(capture, null, 2) + '\n');
  console.log(JSON.stringify({ sourceRevision: before.sourceRevision, stable: before.sourceRevision === after.sourceRevision && before.outputDigest === after.outputDigest }));
} else throw new Error('Expected before, after or record');
