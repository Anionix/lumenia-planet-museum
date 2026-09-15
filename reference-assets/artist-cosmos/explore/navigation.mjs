// llm machine contract; UUIDv5: be15d308-d6c7-5b93-aca4-32206c14ac81.
// transition: frozen source position -> independent bounded camera movement.
// Scene metres and seconds are presentation settings, not astronomical measurements.
export const limits = Object.freeze({ maximumSeconds: 0.05, maximumSpeed: 16, normalSpeed: 8,
  boundary: 400, observerRadius: 0.4, contactGap: 0.05, framesPerSecond: 30, maximumPixelRatio: 1.5 });

function finiteVector(value) {
  if (!Array.isArray(value) || value.length !== 3 || !value.every(Number.isFinite)) throw new TypeError('Expected three finite coordinates');
}
export function movement(input, yaw, pitch, seconds, speed = limits.normalSpeed) {
  finiteVector(input);
  if (![yaw, pitch, seconds, speed].every(Number.isFinite) || seconds < 0 || speed < 0 || speed > limits.maximumSpeed)
    throw new RangeError('Invalid flight input');
  const length = Math.hypot(...input);
  if (!length || !seconds) return [0, 0, 0];
  const distance = speed * Math.min(seconds, limits.maximumSeconds) / Math.max(1, length);
  const [x, y, z] = input;
  const tiltedY = Math.cos(pitch) * y - Math.sin(pitch) * z;
  const tiltedZ = Math.sin(pitch) * y + Math.cos(pitch) * z;
  return [(Math.cos(yaw) * x + Math.sin(yaw) * tiltedZ) * distance,
    tiltedY * distance, (-Math.sin(yaw) * x + Math.cos(yaw) * tiltedZ) * distance].map(value => value === 0 ? 0 : value);
}
export function moveCamera(position, delta) {
  finiteVector(position); finiteVector(delta);
  return position.map((value, axis) => Math.max(-limits.boundary, Math.min(limits.boundary, value + delta[axis])));
}
export function ringClearance(radius, tube) {
  return radius - tube - limits.observerRadius - limits.contactGap;
}
export function createWorldSession(world) {
  const semanticPosition = world.semanticPosition === null ? null : structuredClone(world.semanticPosition);
  if (semanticPosition) { Object.freeze(semanticPosition.values); Object.freeze(semanticPosition); }
  return { recordIdentifier: world.recordIdentifier, semanticPosition, position: [...world.spawn.position], physics: 'disabled' };
}
