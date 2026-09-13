import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { characterStyleSource } from '../scripts/build-character-styles.mjs';
import { characterAtlas, characterAnimations, characterDirectionCell, characterLookDirection,
  characterAnimationForStudioStep, characterFrameSchedule } from '../web/artwork/museum-character.mjs';

// llm machine contract; claimIdentifier: 8b952955-8da1-53ed-8cc0-87934f160bfa
// executionIdentifier: 01a09af7-f340-76cb-86a7-4075de7842d3
// transition: display contract -> exhaustive cell and frame boundary checks; visual QA remains separate.
test('Museum character follows the complete version two atlas geometry', () => {
  assert.equal(characterAtlas.width, 8 * characterAtlas.cellWidth);
  assert.equal(characterAtlas.height, 11 * characterAtlas.cellHeight);
  assert.equal(characterAtlas.version, 2);
  assert.equal(Object.keys(characterAnimations).length, 9);
  for (const [state, animation] of Object.entries(characterAnimations)) {
    const schedule = characterFrameSchedule(state);
    assert.equal(schedule.frames[0].startMilliseconds, 0);
    assert.equal(schedule.frames.length, animation.durations.length);
    assert.ok(schedule.frames.every(frame => frame.column < 8 && frame.percentage < 100));
    assert.equal(schedule.frames.at(-1).startMilliseconds + animation.durations.at(-1), schedule.durationMilliseconds);
  }
  assert.equal(characterFrameSchedule('toString'), null);
});
test('All sixteen gaze cells are unique, in bounds, and advance clockwise', () => {
  const cells = Array.from({ length: 16 }, (_, direction) => characterDirectionCell(direction));
  assert.equal(new Set(cells.map(cell => JSON.stringify(cell))).size, 16);
  assert.deepEqual(cells[0], { row: 9, column: 0 });
  assert.deepEqual(cells[15], { row: 10, column: 7 });
  for (const direction of [-1, 16, 0.1, NaN, null, '0']) assert.equal(characterDirectionCell(direction), null);
  for (let direction = 0; direction < 16; direction++) {
    const angle = direction * Math.PI / 8;
    assert.equal(characterLookDirection(100 * Math.sin(angle), -100 * Math.cos(angle)), direction);
  }
});
test('Neutral, invalid pointers and cardinal screen coordinates cannot be confused', () => {
  for (const pair of [[0, 0], [10, 10], [NaN, 10], [Infinity, 0], ['50', 10]])
    assert.equal(characterLookDirection(...pair), null);
  assert.equal(characterLookDirection(0, -100), 0);
  assert.equal(characterLookDirection(100, 0), 4);
  assert.equal(characterLookDirection(0, 100), 8);
  assert.equal(characterLookDirection(-100, 0), 12);
});
test('Studio interaction selects greetings, attention, making and rest explicitly', () => {
  assert.deepEqual([0, 1, 2, 3].map(characterAnimationForStudioStep), ['waving', 'review', 'running', 'idle']);
  assert.equal(characterAnimationForStudioStep(99), 'idle');
});
test('Generated Plumeria keyframes match every declared frame duration', async () => {
  assert.equal(await readFile(new URL('../web/components/MuseumCharacter.generated.styles.ts', import.meta.url), 'utf8'), await characterStyleSource());
});
