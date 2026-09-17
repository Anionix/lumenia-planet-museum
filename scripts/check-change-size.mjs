import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { claimIdentifier, uuidVersionSeven } from './identifiers.mjs';

// claimIdentifier=6d9c09a8-c6d8-51f7-987c-45ee2fc17c85; executionIdentifier=01a0ab94-f361-737f-91a9-1dd9adeca578; transition=committed -> size_checked.
export function checkChangeSize(base, head = 'HEAD', directory = process.cwd()) {
  const git = (...arguments_) => execFileSync('git', arguments_, { cwd: directory, encoding: 'utf8' }).trim();
  if (!base) throw new Error('A base revision is required.');
  const [baseRevision, headRevision] = [base, head].map(reference => git('rev-parse', '--verify', '--end-of-options', `${reference}^{commit}`));
  const counts = git('diff', '--numstat', '--no-renames', '-z', `${baseRevision}...${headRevision}`).split('\0').filter(Boolean).map(row => row.split('\t').slice(0, 2).map(Number));
  const binary = counts.flat().some(value => !Number.isSafeInteger(value) || value < 0) ||
    git('diff', '--raw', '--no-renames', '--abbrev=40', '-z', `${baseRevision}...${headRevision}`).split('\0')
      .filter((row, index) => row && index % 2 === 0).some(row => {
        const [oldMode, newMode, oldObject, newObject] = row.slice(1).split(' ');
        return [[oldMode, oldObject], [newMode, newObject]].some(([mode, object]) => mode !== '000000' &&
          (mode === '160000' || execFileSync('git', ['cat-file', 'blob', object], { cwd: directory }).includes(0)));
      });
  const changedLines = binary ? null : counts.flat().reduce((sum, value) => sum + value, 0);
  return { record_type: 'change_size_check', recordIdentifier: claimIdentifier('bounded-change-verification'),
    executionIdentifier: uuidVersionSeven(), recordedAt: new Date().toISOString(), baseRevision, headRevision, changedLines, changedPaths: counts.length,
    status: !binary && changedLines <= 50 && counts.length <= 5 ? 'pass' : 'fail' };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = checkChangeSize(...process.argv.slice(2));
  console.log(JSON.stringify(result));
  process.exitCode = result.status === 'pass' ? 0 : 1;
}
