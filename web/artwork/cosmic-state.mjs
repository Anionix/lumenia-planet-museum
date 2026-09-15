// llm machine contract; claim UUIDv5: 796d5e27-8862-52a6-a331-776d0066b23b
// execution UUIDv7: 01a0a466-8ef5-7ceb-9da0-c6195d4d86ab
// transition: independent historical interval + presentation clock -> display only.
// Orbit distances are curatorial scene units; neither gravity nor historical similarity.
export const exhibitionLimits = Object.freeze({
  people: 15, starCount: 800, sphereWidthSegments: 32, sphereHeightSegments: 16,
  textureWidth: 256, textureHeight: 128, maximumPixelRatio: 1.5,
  maximumFramesPerSecond: 30, maximumFrameSeconds: 0.1,
  maximumTriangles: 20000, maximumDrawCalls: 40, physicsEnabled: false,
});

export function orbitPosition(orbit, seconds) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 86400) throw new RangeError('Presentation seconds outside [0,86400]');
  if (!Number.isFinite(orbit.radius) || orbit.radius <= 0 || orbit.radius > 100 ||
      !Number.isFinite(orbit.periodSeconds) || orbit.periodSeconds < 10 ||
      !Number.isFinite(orbit.phaseRadians) || !Number.isFinite(orbit.inclinationRadians))
    throw new RangeError('Invalid presentation orbit');
  const angle = orbit.phaseRadians + 2 * Math.PI * seconds / orbit.periodSeconds;
  return [orbit.radius * Math.cos(angle), orbit.radius * Math.sin(angle) * Math.sin(orbit.inclinationRadians),
    orbit.radius * Math.sin(angle) * Math.cos(orbit.inclinationRadians)];
}

export function validateHistoricalPeriod(period) {
  if (!period || period.unit !== 'calendar_year' || !['work_date', 'reference_decade', 'exhibition_date', 'unspecified'].includes(period.kind))
    throw new TypeError('Historical period requires a kind and unit');
  if (!Array.isArray(period.sourceIdentifiers) || !period.sourceIdentifiers.length) throw new TypeError('Historical period requires provenance');
  if (period.kind === 'unspecified') {
    if (period.start !== null || period.end !== null) throw new TypeError('Unknown period must stay null');
  } else if (!Number.isInteger(period.start) || !Number.isInteger(period.end) || period.start > period.end ||
    period.start < 0 || period.end > 3000) throw new RangeError('Invalid historical interval');
  return period;
}

export function intersectsYears(period, start, end) {
  validateHistoricalPeriod(period);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > 3000 || start > end) throw new RangeError('Invalid selected years');
  return period.kind === 'unspecified' ? null : period.start <= end && start <= period.end;
}

export function advancePresentationClock(seconds, elapsedSeconds, playing, visible, reducedMotion) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 86400 || !Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) throw new RangeError('Invalid presentation time');
  if (!playing || !visible || reducedMotion) return seconds;
  // llm machine contract; UUIDv5: 307bb7f3-f518-59db-bbaf-a56492eae6be.
  // transition: elapsed time -> continuous bounded orbit; no periodic teleport.
  return Math.min(86400, seconds + Math.min(elapsedSeconds, exhibitionLimits.maximumFrameSeconds));
}
