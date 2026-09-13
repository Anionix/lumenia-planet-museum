// llm machine contract; claimIdentifier: 8b952955-8da1-53ed-8cc0-87934f160bfa
// executionIdentifier: 01a09af7-f340-76cb-86a7-4075de7842d3
// transition: validated atlas -> selected animation or gaze cell -> Plumeria background position.
// This is a display contract, not a proof of historical likeness or artistic quality.
export const characterAtlas = Object.freeze({ width: 1536, height: 2288, cellWidth: 192, cellHeight: 208, version: 2 });
export const characterAnimations = Object.freeze({
  idle: { row: 0, durations: [280, 110, 110, 140, 140, 320] },
  'running-right': { row: 1, durations: [120, 120, 120, 120, 120, 120, 120, 220] },
  'running-left': { row: 2, durations: [120, 120, 120, 120, 120, 120, 120, 220] },
  waving: { row: 3, durations: [140, 140, 140, 280] },
  jumping: { row: 4, durations: [140, 140, 140, 140, 280] },
  failed: { row: 5, durations: [140, 140, 140, 140, 140, 140, 140, 240] },
  waiting: { row: 6, durations: [150, 150, 150, 150, 150, 260] },
  running: { row: 7, durations: [120, 120, 120, 120, 120, 220] },
  review: { row: 8, durations: [150, 150, 150, 150, 150, 280] },
});

export function characterDirectionCell(direction) {
  if (!Number.isInteger(direction) || direction < 0 || direction > 15) return null;
  return { column: direction % 8, row: 9 + Math.floor(direction / 8) };
}

// Screen coordinates: positive horizontal is right; positive vertical is down.
// Neutral stays a separate state: direction zero means UP, never front-facing.
export function characterLookDirection(horizontal, vertical) {
  if (![horizontal, vertical].every(Number.isFinite) || Math.hypot(horizontal, vertical) < 24) return null;
  return Math.round(((Math.atan2(horizontal, -vertical) + 2 * Math.PI) % (2 * Math.PI)) / (Math.PI / 8)) % 16;
}

export function characterAnimationForStudioStep(step) {
  return ['waving', 'review', 'running', 'idle'][step] ?? 'idle';
}

export function characterFrameSchedule(state) {
  const animation = Object.hasOwn(characterAnimations, state) ? characterAnimations[state] : null;
  if (!animation) return null;
  const durationMilliseconds = animation.durations.reduce((total, value) => total + value, 0);
  let elapsed = 0;
  return { durationMilliseconds, row: animation.row, frames: animation.durations.map((duration, column) => {
    const frame = { column, startMilliseconds: elapsed, percentage: elapsed * 100 / durationMilliseconds };
    elapsed += duration;
    return frame;
  }) };
}
