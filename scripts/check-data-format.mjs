import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseJsonLines, readJsonLines } from './json-lines.mjs';
import { projectRoot } from './source-revision.mjs';
import { claimIdentifier, uuidVersionSeven } from './identifiers.mjs';

// machine contract: independent data -> JSON Lines; required tool settings -> explicit exception.
export async function inspectDataFormats(files, root, exceptions) {
  const issues = [];
  for (const file of files.filter(file => /\.jsonl?$/.test(file))) {
    let text;
    try { text = await readFile(path.join(root, file)); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    if (file.endsWith('.json')) {
      if (!exceptions.has(file)) issues.push({ file, reason: 'Independent data must use .jsonl.' });
      continue;
    }
    try { parseJsonLines(text); }
    catch (error) { issues.push({ file, reason: error.message }); }
  }
  return issues;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const exceptions = new Set((await readJsonLines(new URL('../contracts/json-lines-exceptions.jsonl', import.meta.url))).map(row => row.path));
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: projectRoot, encoding: 'utf8' }).split('\0').filter(Boolean);
  const issues = await inspectDataFormats(files, projectRoot, exceptions);
  console.log(JSON.stringify({ record_type: 'data_format_check', recordIdentifier: claimIdentifier('data-format-check'),
    executionIdentifier: uuidVersionSeven(), recordedAt: new Date().toISOString(), status: issues.length ? 'fail' : 'pass', issues }));
  process.exitCode = issues.length ? 1 : 0;
}
