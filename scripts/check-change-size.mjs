import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { claimIdentifier, uuidVersionSeven } from './identifiers.mjs';

// claimIdentifier=6d9c09a8-c6d8-51f7-987c-45ee2fc17c85; executionIdentifier=01a0ab94-f361-737f-91a9-1dd9adeca578; transition=committed -> size_checked.
export function checkChangeSize(base, head = 'HEAD', directory = process.cwd()) {
  const git = (...arguments_) => execFileSync('git', arguments_, { cwd: directory, encoding: 'utf8' }).trim();
  if (!base) throw new Error('A base revision is required.');
  const revision = reference => git('rev-parse', '--verify', '--end-of-options', `${reference}^{commit}`);
  const baseRevision = revision(base), headRevision = revision(head);
  const range = `${baseRevision}...${headRevision}`;
  const changes = git('diff', '--numstat', '--no-renames', '-z', range).split('\0').filter(Boolean);
  const objectRows = git('diff', '--raw', '--no-renames', '--abbrev=40', '-z', range).split('\0').filter(Boolean);
  const contentObjects = objectRows.flatMap((row, index) => {
    if (index % 2) return [];
    const [oldMode, newMode, oldObject, newObject, status] = row.slice(1).split(' ');
    return status === 'A' ? [[newMode, newObject]] : status === 'D' ? [[oldMode, oldObject]] : [[oldMode, oldObject], [newMode, newObject]];
  });
  const counts = changes.map(row => row.split('\t').slice(0, 2).map(Number));
  const binary = counts.some(pair => pair.some(value => !Number.isSafeInteger(value) || value < 0)) ||
    contentObjects.some(([mode, object]) => mode === '160000' || execFileSync('git', ['cat-file', 'blob', object], { cwd: directory }).includes(0));
  const changedLines = binary ? null : counts.flat().reduce((sum, value) => sum + value, 0);
  return { record_type: 'change_size_check', recordIdentifier: claimIdentifier('bounded-change-verification'),
    executionIdentifier: uuidVersionSeven(), recordedAt: new Date().toISOString(), baseRevision, headRevision, changedLines, changedPaths: changes.length,
    status: !binary && changedLines <= 50 && changes.length <= 5 ? 'pass' : 'fail' };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = checkChangeSize(...process.argv.slice(2));
  console.log(JSON.stringify(result));
  process.exitCode = result.status === 'pass' ? 0 : 1;
}
