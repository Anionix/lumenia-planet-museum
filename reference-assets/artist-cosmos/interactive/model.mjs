import { createSemanticCoordinateIndex, validatePhysicsConfiguration } from './vendor/reference-physics-contract.mjs';

// Machine contract: source coordinates -> frozen index; presentation transforms remain separate.
// UUID version 5 identifies source/display records. UUID version 7 identifies chronological events.
export function createEventIdentifier(now = Date.now()) {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let timestamp = BigInt(now);
  for (let position = 5; position >= 0; position--) { bytes[position] = Number(timestamp & 255n); timestamp >>= 8n; }
  bytes[6] = (bytes[6] & 15) | 112;
  bytes[8] = (bytes[8] & 63) | 128;
  const value = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${value.slice(0,8)}-${value.slice(8,12)}-${value.slice(12,16)}-${value.slice(16,20)}-${value.slice(20)}`;
}

export function createExhibitionState(manifest) {
  if (manifest.items.length !== 15 || manifest.physics_enabled_by_default !== false) throw new TypeError('The exhibition requires 15 images and physics disabled initially.');
  for (const item of manifest.items) validatePhysicsConfiguration(item.physics);
  const semanticIndex = createSemanticCoordinateIndex(manifest.items);
  const initialPositions = manifest.items.map(item => Object.freeze([...item.presentation_position]));
  return { semanticIndex, initialPositions: Object.freeze(initialPositions), selected: 0, mode: 'single', playing: false, draggingImages: false, physics: 'disabled', gravity: false };
}

export function createFixedStepper(step, interval = 1 / 60, maximumSteps = 5) {
  let accumulator = 0;
  return {
    advance(seconds) {
      if (!Number.isFinite(seconds) || seconds < 0) throw new TypeError('Elapsed time must be finite and non-negative.');
      accumulator += Math.min(seconds, interval * maximumSteps);
      let count = 0;
      while (accumulator + 1e-12 >= interval && count < maximumSteps) { step(interval); accumulator -= interval; count++; }
      if (count === maximumSteps) accumulator = Math.max(0, accumulator % interval);
      return count;
    },
    reset() { accumulator = 0; },
  };
}

export function clampPanelPosition(x, y) {
  return [Math.max(-15.4, Math.min(15.4, x)), Math.max(-8.7, Math.min(8.7, y)), 0];
}

export function createTrace(recordIdentifier) {
  const events = [];
  return {
    add(transition, details = {}) {
      events.push(Object.freeze({ event_identifier: createEventIdentifier(), observed_at: new Date().toISOString(), record_identifier: recordIdentifier, transition, ...details }));
      if (events.length > 200) events.shift();
    },
    snapshot() { return structuredClone(events); },
  };
}
