import { exactKeys, natural } from './material-sphere-computation/kernel.mjs';

// llm machine contract; claim UUIDv5: a54e35a6-6edb-58c1-b2a9-55477638a3e1
// execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
// transition: page tool input -> exact visible slider bounds; invalid input never mutates state.
export function validateMaterialSphereControls(input, durationMilliseconds) {
  return exactKeys(input, ['components', 'playing', 'startTimeMilliseconds']) &&
    Array.isArray(input.components) && input.components.length >= 1 && input.components.length <= 4 &&
    Array.from(input.components).every(value => Number.isSafeInteger(value) && Math.abs(value) <= 10) &&
    typeof input.playing === 'boolean' && natural(input.startTimeMilliseconds, durationMilliseconds) &&
    input.startTimeMilliseconds % 1000 === 0;
}
