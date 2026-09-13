import { coordinateRequest } from './material-sphere-computation/dimension.mjs';
import { exactKeys, makeRequest, sampleRequest, validateMaterialParameters } from './material-sphere-computation/kernel.mjs';

// llm machine contract; claim UUIDv5: baf96ced-5d93-520d-aa86-dd2899b7fa53
// execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
// transition: renderer-neutral numerical input -> checked plan -> explicitly registered output adapter.
// Readiness is NOT a browser, visual-equivalence, performance or shipment verdict.
export const materialSphereRenderingTargets = Object.freeze([
  'plumeriaCss', 'rasterImage', 'scalableVectorGraphics', 'canvasTwoDimensional', 'threeDimensionalScene',
]);
export function prepareMaterialSpherePlan(input) {
  if (!exactKeys(input, ['profileIdentifier', 'parameters', 'coordinates', 'playing', 'reducedMotion']) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(input.profileIdentifier) ||
      !validateMaterialParameters(input.parameters) || typeof input.playing !== 'boolean' ||
      typeof input.reducedMotion !== 'boolean') return { accepted: false };
  const coordinates = coordinateRequest(input.coordinates);
  if (!coordinates.accepted) return { accepted: false };
  const sample = sampleRequest(makeRequest(input.parameters, {
    elapsed: coordinates.timeMilliseconds, playing: input.playing, reducedMotion: input.reducedMotion,
  }));
  if (!sample.accepted) return { accepted: false };
  return { accepted: true, profileIdentifier: input.profileIdentifier, parameters: { ...input.parameters },
    coordinates, motionPhaseMilliseconds: sample.motionPhase,
    playing: input.playing && !input.reducedMotion, nextPlaying: sample.playing,
    projectionPolicy: 'firstTwoSpatialAxes', timeIsSpatialAxis: false };
}

export function plumeriaCssAdapter(plan) {
  const [horizontal, vertical] = plan.coordinates.projectedComponents;
  return { renderer: 'plumeriaCss', profileIdentifier: plan.profileIdentifier,
    // Bind these values through module-level Plumeria function keys, never css.create at runtime.
    placementTransform: `translate(${horizontal * 4}px, ${vertical * 4}px)`,
    duration: `${plan.parameters.durationMilliseconds}ms`, delay: `${-plan.motionPhaseMilliseconds}ms`,
    playing: plan.playing, pixelsPerGridUnit: 4 };
}

export function dispatchMaterialSphere(input, target, additionalAdapters = {}) {
  const plan = prepareMaterialSpherePlan(input);
  if (!plan.accepted || !materialSphereRenderingTargets.includes(target))
    return { state: 'invalid', reason: 'Unknown output or rejected numerical input' };
  const adapter = target === 'plumeriaCss' ? plumeriaCssAdapter :
    Object.hasOwn(additionalAdapters, target) ? additionalAdapters[target] : undefined;
  if (typeof adapter !== 'function') return { state: 'notConnected', renderer: target,
    reason: 'An output adapter and its rendering checks have not been connected' };
  return { state: 'ready', renderer: target, plan, output: adapter(plan) };
}
