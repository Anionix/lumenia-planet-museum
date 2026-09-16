import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { projectRoot } from '../../scripts/source-revision.mjs';
import { parseJsonLines } from '../../scripts/json-lines.mjs';

// claimIdentifier=2c72f404-0452-558f-87d1-2f33d1348df4; executionIdentifier=01a0aca0-e51e-7807-b6f5-ea1fb551788b; transition=inputs -> checked Lean responses.
export const booleanAssignments = fields => Array.from({ length: 2 ** fields.length }, (_, assignment) =>
  Object.fromEntries(fields.map((name, index) => [name, Boolean(assignment & 1 << index)])));
export function leanVerdicts(inputs) {
  const run = spawnSync(`${projectRoot}/.lake/build/bin/lumenia_boundary`, [], {
    cwd: projectRoot, input: inputs.map(value => JSON.stringify(value)).join('\n') + '\n', timeout: 30000, maxBuffer: 8 * 1024 * 1024,
  });
  assert.equal(run.status, 0, 'Build the Lean executable before testing: ' + (run.error ?? run.stderr));
  const responses = parseJsonLines(run.stdout);
  assert.equal(responses.length, inputs.length);
  return responses;
}
