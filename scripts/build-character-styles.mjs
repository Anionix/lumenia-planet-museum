import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ESLint } from 'eslint';
import { characterFrameSchedule, characterAnimations } from '../web/artwork/museum-character.mjs';
import { projectRoot } from './source-revision.mjs';

// llm machine contract; claimIdentifier: 8b952955-8da1-53ed-8cc0-87934f160bfa
// executionIdentifier: 01a09af7-f340-76cb-86a7-4075de7842d3
// transition: exact frame durations -> literal module-scope Plumeria keyframes; no image generation here.
function unformattedCharacterStyles() {
  let source = "import * as css from '@plumeria/core';\n\n";
  source += '// llm machine contract; claimIdentifier: 8b952955-8da1-53ed-8cc0-87934f160bfa\n';
  source += '// executionIdentifier: 01a09af7-f340-76cb-86a7-4075de7842d3\n';
  source += '// state: generated; transition: animation durations -> build-time keyframes. Do not hand-edit.\n';
  const declarations = [];
  for (const state of Object.keys(characterAnimations)) {
    const schedule = characterFrameSchedule(state);
    const identifier = state.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const position = column => `${-column * 192}px ${-schedule.row * 208}px`;
    const frames = Object.fromEntries(schedule.frames.map(frame => [Number(frame.percentage.toFixed(8)) + '%', { backgroundPosition: position(frame.column) }]));
    frames['100%'] = { backgroundPosition: position(0) };
    source += `const ${identifier}Frames = css.keyframes(${JSON.stringify(frames)});\n`;
    declarations.push(`${identifier}: { animationName: ${identifier}Frames, animationDuration: '${schedule.durationMilliseconds}ms', backgroundPosition: '${position(0)}' }`);
  }
  source += `export const characterAnimationStyles = css.create({${declarations.join(',')}});\n`;
  return source;
}
export async function characterStyleSource() {
  const source = unformattedCharacterStyles();
  const [formatted] = await new ESLint({ cwd: projectRoot, fix: true }).lintText(source,
    { filePath: path.join(projectRoot, 'web/components/MuseumCharacter.generated.styles.ts') });
  assert.equal(formatted.errorCount + formatted.warningCount, 0, 'Character Plumeria diagnostics: ' + JSON.stringify(formatted.messages));
  return formatted.output ?? source;
}
export async function buildCharacterStyles() {
  // Create the actual generated file before asking the typed parser to inspect it.
  await writeFile(path.join(projectRoot, 'web/components/MuseumCharacter.generated.styles.ts'), unformattedCharacterStyles());
  await writeFile(path.join(projectRoot, 'web/components/MuseumCharacter.generated.styles.ts'), await characterStyleSource());
}
if (process.argv[1] === new URL(import.meta.url).pathname) await buildCharacterStyles();
