import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { claimIdentifier, uuidVersionSeven } from './identifiers.mjs';

// claimIdentifier=6d9c09a8-c6d8-51f7-987c-45ee2fc17c85; executionIdentifier=01a0ab94-f361-737f-91a9-1dd9adeca578; transition=committed -> size_checked.
export async function checkChangeSize(base, head = 'HEAD', directory = process.cwd()) {
  const git = (...arguments_) => execFileSync('git', arguments_, { cwd: directory, encoding: 'utf8' }).trim();
  if (!base) throw new Error('A base revision is required.');
  const [baseRevision, headRevision] = [base, head].map(reference => git('rev-parse', '--verify', '--end-of-options', `${reference}^{commit}`));
  const counts = git('diff', '--numstat', '--no-renames', '-z', `${baseRevision}...${headRevision}`).split('\0').filter(Boolean).map(row => row.split('\t').slice(0, 2).map(Number));
  let binary = counts.flat().some(value => !Number.isSafeInteger(value) || value < 0);
  for (const row of git('diff', '--raw', '--no-renames', '--abbrev=40', '-z', `${baseRevision}...${headRevision}`).split('\0').filter((row, index) => row && index % 2 === 0)) {
    const [oldMode, newMode, oldObject, newObject] = row.slice(1).split(' ');
    for (const [mode, object] of [[oldMode, oldObject], [newMode, newObject]]) if (mode !== '000000') {
      if (mode === '160000') { binary = true; continue; }
      const blob = spawn('git', ['cat-file', 'blob', object], { cwd: directory, stdio: ['ignore', 'pipe', 'inherit'] });
      blob.stdout.on('data', chunk => { binary ||= chunk.includes(0); });
      if ((await once(blob, 'close'))[0] !== 0) throw new Error('Git blob read failed.');
    }
  }
  const changedLines = binary ? null : counts.flat().reduce((sum, value) => sum + value, 0);
  return { record_type: 'change_size_check', recordIdentifier: claimIdentifier('bounded-change-verification'),
    executionIdentifier: uuidVersionSeven(), recordedAt: new Date().toISOString(), baseRevision, headRevision, changedLines, changedPaths: counts.length,
    status: !binary && changedLines <= 50 && counts.length <= 5 ? 'pass' : 'fail' };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await checkChangeSize(...process.argv.slice(2));
  console.log(JSON.stringify(result));
  process.exitCode = result.status === 'pass' ? 0 : 1;
}
