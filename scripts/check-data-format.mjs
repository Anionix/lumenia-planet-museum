import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseJsonLines, readJsonLines } from './json-lines.mjs';
import { projectRoot } from './source-revision.mjs';
import { claimIdentifier, uuidVersionSeven } from './identifiers.mjs';

const exceptionRecordType = 'required_standard_json';
const uuidV5Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validExceptionPath(value) {
  return nonEmptyString(value) && value === value.trim() && value.endsWith('.json') &&
    !path.posix.isAbsolute(value) && !path.win32.isAbsolute(value) && !value.includes('\\') &&
    !/[\u0000-\u001f\u007f]/.test(value) &&
    value.split('/').every(part => part && part !== '.' && part !== '..') &&
    path.posix.normalize(value) === value;
}

// machine contract: only reasoned standard-JSON rows authorize repository-relative paths.
export function exceptionPaths(rows) {
  if (!Array.isArray(rows)) throw new TypeError('JSON Lines exceptions must be an array of records.');
  const paths = new Set();
  const identifiers = new Set();
  rows.forEach((row, index) => {
    if (row === null || typeof row !== 'object' || Array.isArray(row))
      throw new TypeError(`JSON Lines exception ${index + 1} must be an object.`);
    if (row.record_type !== exceptionRecordType)
      throw new Error(`JSON Lines exception ${index + 1} has an unsupported record_type.`);
    if (!validExceptionPath(row.path))
      throw new Error(`JSON Lines exception ${index + 1} has an invalid path.`);
    for (const field of ['reason', 'scope']) {
      if (!nonEmptyString(row[field])) throw new Error(`JSON Lines exception ${index + 1} requires a non-empty ${field}.`);
    }
    if (!uuidV5Pattern.test(row.recordIdentifier ?? ''))
      throw new Error(`JSON Lines exception ${index + 1} has an invalid recordIdentifier.`);
    if (identifiers.has(row.recordIdentifier))
      throw new Error(`JSON Lines exception ${index + 1} duplicates a recordIdentifier.`);
    identifiers.add(row.recordIdentifier);
    if (paths.has(row.path)) throw new Error(`JSON Lines exception ${index + 1} duplicates a path.`);
    paths.add(row.path);
  });
  return paths;
}

// machine contract: independent data -> JSON Lines; required tool settings -> explicit exception.
export async function inspectDataFormats(files, root, exceptions) {
  const exceptionSet = exceptionPaths(exceptions);
  const issues = [];
  for (const file of files.filter(file => /\.jsonl?$/.test(file))) {
    let text;
    try { text = await readFile(path.join(root, file)); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    if (file.endsWith('.json')) {
      if (!exceptionSet.has(file)) issues.push({ file, reason: 'Independent data must use .jsonl.' });
      continue;
    }
    try { parseJsonLines(text); }
    catch (error) { issues.push({ file, reason: error.message }); }
  }
  return issues;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const exceptions = await readJsonLines(new URL('../contracts/json-lines-exceptions.jsonl', import.meta.url));
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: projectRoot, encoding: 'utf8' }).split('\0').filter(Boolean);
  const issues = await inspectDataFormats(files, projectRoot, exceptions);
  console.log(JSON.stringify({ record_type: 'data_format_check', recordIdentifier: claimIdentifier('data-format-check'),
    executionIdentifier: uuidVersionSeven(), recordedAt: new Date().toISOString(), status: issues.length ? 'fail' : 'pass', issues }));
  process.exitCode = issues.length ? 1 : 0;
}
