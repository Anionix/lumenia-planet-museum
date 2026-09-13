import { exactKeys, natural } from './kernel.mjs';

// llm machine contract
// artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867
// execution UUIDv7: 01a09a86-bce5-77fe-8aff-ce403b00e379
// state: integer-grid boundary; transition: explicit spatial axes and time -> checked projection -> CSS placement.
// Four spatial axes and three spatial axes plus time have different request shapes.
export const coordinateUnit = 'integerGridUnit';
const integerCoordinate = value => Number.isSafeInteger(value) && Math.abs(value) <= 1000000;

export function coordinateRequest(request) {
  if (!exactKeys(request, ['operation', 'spaceDimensions', 'components', 'appendedAxis',
    'timeMilliseconds', 'coordinateUnit']) || request.operation !== 'coordinateProjection' ||
    request.coordinateUnit !== coordinateUnit || !natural(request.spaceDimensions, 4) ||
    request.spaceDimensions < 1 || !Array.isArray(request.components) ||
    request.components.length !== request.spaceDimensions ||
    !Array.from(request.components).every(integerCoordinate) || !integerCoordinate(request.appendedAxis) ||
    !natural(request.timeMilliseconds, 120000000)) return { accepted: false };

  const components = request.components.map(value => value === 0 ? 0 : value);
  const embeddedComponents = [...components, request.appendedAxis === 0 ? 0 : request.appendedAxis];
  const quarterTurnComponents = components.length < 2 ? null :
    [components[1] === 0 ? 0 : -components[1], components[0], ...components.slice(2)];
  return {
    accepted: true, spaceDimensions: request.spaceDimensions, coordinateUnit,
    components, embeddedComponents, restoredComponents: embeddedComponents.slice(0, -1),
    projectedComponents: [components[0], components[1] ?? 0], quarterTurnComponents,
    discardedAxisCount: Math.max(0, request.spaceDimensions - 2),
    timeMilliseconds: request.timeMilliseconds,
  };
}

export function makeCoordinateRequest(components, overrides = {}) {
  return { operation: 'coordinateProjection', spaceDimensions: components.length, components,
    appendedAxis: 0, timeMilliseconds: 0, coordinateUnit, ...overrides };
}

// Pixel scale is an explicit rendering choice. The geometric input remains in integer grid units.
export function compileSpatialPlacement(request, pixelsPerGridUnit = 1) {
  const result = coordinateRequest(request);
  if (!result.accepted || !natural(pixelsPerGridUnit, 64) || pixelsPerGridUnit < 1) {
    throw new Error('Invalid spatial placement');
  }
  const [horizontal, vertical] = result.projectedComponents.map(value => value * pixelsPerGridUnit);
  return { result, pixelsPerGridUnit,
    style: { position: 'absolute', transform: `translate(${horizontal}px, ${vertical}px)` } };
}
