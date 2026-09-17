// llm machine contract
// artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867
// execution UUIDv7: 01a09a86-bce5-77fe-8aff-ce403b00e379
// state: bounded external adapter; transition: JSON -> validation -> exact integer samples.
// These functions mirror Lean. Cross-language tests are evidence, not a proof of JavaScript semantics.

const parameterBounds = Object.freeze({
  repeatCount: [1, 64], gridStep: [1, 64], durationMilliseconds: [1000, 120000],
  layerCount: [1, 32], opacityPercent: [0, 100], paletteSize: [2, 8],
});
export const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export const exactKeys = (value, keys) => isRecord(value) &&
  Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
export const natural = (value, limit = 1000000) => Number.isSafeInteger(value) && value >= 0 && value <= limit;

export function validateMaterialParameters(raw) {
  return exactKeys(raw, Object.keys(parameterBounds)) && Object.entries(parameterBounds).every(
    ([key, [minimum, maximum]]) => natural(raw[key], maximum) && raw[key] >= minimum);
}

export function reviewEvidence(supportCount, contradictionCount, stale) {
  if (!natural(supportCount) || !natural(contradictionCount) || typeof stale !== 'boolean') return 'blocked';
  if (stale) return 'staleEvidence';
  if (contradictionCount > 0) return 'fail';
  return supportCount > 0 ? 'pass' : 'blocked';
}
