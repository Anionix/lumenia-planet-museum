import * as THREE from 'three';
import { validateSemanticPosition, validatePhysicsConfiguration } from './reference-physics-contract.mjs';

// LLM machine contract: render_recipe -> validated numeric specification -> three.js objects -> disposed resources.
// Stable UUIDv5 values come from each recipe; the caller supplies a UUIDv7 execution event for scene provenance.
// Surface values are explicit drawing choices. Style scores are not physical material measurements.
export const supportedPatterns = Object.freeze([
  'botanical_repeat', 'radial_ornament', 'botanical_grid', 'rectangular_planes',
  'crossing_bars', 'diagonal_zigzags', 'circle_and_bar', 'modular_grid',
  'angled_routes', 'parallel_slots', 'rings_and_line', 'curved_layers', 'broad_bands', 'solid',
]);
const identifier = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const eventIdentifier = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const hexColor = /^#[0-9a-fA-F]{6}$/;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const bounded = (value, minimum, maximum) => Number.isFinite(value) && value >= minimum && value <= maximum;
const integer = (value, minimum, maximum) => Number.isInteger(value) && bounded(value, minimum, maximum);
const vector = (value, minimum, maximum) => Array.isArray(value) && value.length === 3 && value.every(number => bounded(number, minimum, maximum));
function requireValue(condition, message) { if (!condition) throw new TypeError(message); }
function exactFields(value, names, label) {
  requireValue(record(value) && Object.keys(value).length === names.length && names.every(name => Object.hasOwn(value, name)), `${label}: unexpected or missing field`);
}

export function validateRenderRecipe(recipe) {
  requireValue(record(recipe) && recipe.record_type === 'render_recipe' && recipe.schema_version === '1.0.0', 'unsupported render_recipe schema');
  requireValue(identifier.test(recipe.record_id), 'recipe identifier must be UUIDv5');
  requireValue(typeof recipe.title === 'string' && recipe.title.length > 0, 'recipe title is required');
  requireValue(record(recipe.provenance) && typeof recipe.provenance.scope === 'string', 'provenance scope is required');
  requireValue(recipe.historical_object === false && recipe.causal_claim === false, 'rendering proposal and causality flags are required');
  validateSemanticPosition(recipe.semantic_position);
  validatePhysicsConfiguration(recipe.physics);
  const { geometry, material, surface_pattern: pattern, transform } = recipe;
  requireValue(record(geometry) && identifier.test(geometry.record_id), 'geometry identifier must be UUIDv5');
  if (geometry.kind === 'sphere') {
    exactFields(geometry, ['record_id', 'kind', 'radius', 'width_segments', 'height_segments'], 'sphere');
    requireValue(bounded(geometry.radius, 0.0001, 1000), 'sphere radius out of range');
    requireValue(integer(geometry.width_segments, 8, 128) && integer(geometry.height_segments, 4, 64), 'sphere segments out of range');
  } else if (geometry.kind === 'box') {
    exactFields(geometry, ['record_id', 'kind', 'dimensions'], 'box');
    requireValue(vector(geometry.dimensions, 0.0001, 1000), 'box dimensions out of range');
  } else throw new TypeError(`unsupported geometry: ${geometry.kind}`);
  exactFields(material, ['record_id', 'base_color', 'roughness', 'metalness', 'opacity', 'value_status'], 'material');
  requireValue(identifier.test(material.record_id) && hexColor.test(material.base_color), 'invalid material identifier or color');
  for (const key of ['roughness', 'metalness', 'opacity']) requireValue(bounded(material[key], 0, 1), `${key} must be in [0,1]`);
  requireValue(typeof material.value_status === 'string' && material.value_status.length > 0, 'material value status is required');
  exactFields(pattern, ['record_id', 'texture_identifier', 'image_identifier', 'kind', 'palette', 'repeats_horizontal', 'repeats_vertical', 'ink_opacity', 'width', 'height'], 'surface pattern');
  for (const key of ['record_id', 'texture_identifier', 'image_identifier']) requireValue(identifier.test(pattern[key]), `invalid pattern ${key}`);
  requireValue(supportedPatterns.includes(pattern.kind), `unsupported pattern: ${pattern.kind}`);
  requireValue(Array.isArray(pattern.palette) && pattern.palette.length >= (pattern.kind === 'solid' ? 1 : 2) && pattern.palette.length <= 8 && pattern.palette.every(color => typeof color === 'string' && hexColor.test(color)), 'invalid pattern palette');
  requireValue(integer(pattern.width, 16, 512) && integer(pattern.height, 8, 512), 'texture size out of range');
  requireValue(integer(pattern.repeats_horizontal, 1, 64) && integer(pattern.repeats_vertical, 1, 64), 'pattern repeat count out of range');
  requireValue(bounded(pattern.ink_opacity, 0, 1), 'ink opacity must be in [0,1]');
  exactFields(transform, ['position', 'rotation_radians', 'scale', 'coordinate_space', 'unit'], 'transform');
  requireValue(transform.coordinate_space === 'presentation_coordinates' && transform.unit === 'scene_unit', 'display transforms must use presentation coordinates in scene units');
  requireValue(vector(transform.position, -1000000, 1000000), 'position out of range');
  requireValue(vector(transform.rotation_radians, -2 * Math.PI, 2 * Math.PI), 'rotation out of range');
  requireValue(vector(transform.scale, 0.000001, 1000), 'scale out of range');
  const resources = [recipe.record_id, geometry.record_id, material.record_id, pattern.record_id, pattern.texture_identifier, pattern.image_identifier];
  requireValue(new Set(resources).size === resources.length, 'resource identifiers must be distinct');
  return recipe;
}

const fraction = value => value - Math.floor(value);
function paletteIndex(kind, horizontal, vertical, tileColumn, tileRow) {
  const x = horizontal - 0.5, y = vertical - 0.5;
  const radial = Math.hypot(x, y);
  switch (kind) {
    case 'solid': return 0;
    case 'botanical_repeat': {
      const stem = Math.abs(x - 0.10 * Math.sin(vertical * Math.PI * 2)) < 0.025;
      const leaf = ((x + y * 0.45) / 0.16) ** 2 + ((y - 0.12) / 0.30) ** 2 < 1;
      return radial < 0.075 ? 3 : stem || leaf ? 1 + (tileColumn + tileRow) % 2 : 0;
    }
    case 'radial_ornament': {
      const ring = Math.abs(radial - 0.31) < 0.026;
      const angle = Math.atan2(y, x);
      const dotAngle = Math.round(angle / (Math.PI / 6)) * Math.PI / 6;
      const dot = Math.hypot(x - 0.40 * Math.cos(dotAngle), y - 0.40 * Math.sin(dotAngle)) < 0.045;
      return ring || dot ? 1 : radial < 0.19 ? 2 : 0;
    }
    case 'botanical_grid': return Math.abs(x) < 0.03 || Math.abs(y) < 0.018 ? 1 : Math.hypot(x - 0.22, y - 0.17) < 0.10 ? 2 : 0;
    case 'rectangular_planes': return horizontal < 0.08 || vertical < 0.06 ? 1 : 2 + (tileColumn + tileRow * 2) % 4;
    case 'crossing_bars': return Math.abs(y) < 0.09 ? 1 : Math.abs(x) < 0.065 ? 2 : 0;
    case 'diagonal_zigzags': return Math.abs(vertical - Math.abs(horizontal * 2 - 1)) < 0.13 ? 1 : radial < 0.12 ? 2 + tileColumn % 3 : 0;
    case 'circle_and_bar': return Math.abs(radial - 0.28) < 0.075 ? 1 : Math.abs(x - 0.25) < 0.06 && y > -0.1 ? 2 : 0;
    case 'modular_grid': return vertical < 0.13 ? 1 : vertical > 0.35 && vertical < 0.52 && horizontal < 0.72 ? 2 : 0;
    case 'angled_routes': return Math.abs(vertical - horizontal) < 0.065 ? 2 : Math.abs(y) < 0.045 ? 1 : radial < 0.09 ? 3 : 0;
    case 'parallel_slots': return Math.abs(y) < 0.035 && Math.abs(x) < 0.34 ? 1 : Math.hypot(x - 0.36, y - 0.30) < 0.055 ? 2 : 0;
    case 'rings_and_line': return Math.abs(radial - 0.26) < 0.035 ? 1 : Math.abs(x) < 0.023 && y < -0.25 ? 2 : 0;
    case 'curved_layers': return fraction(vertical + 0.22 * Math.sin(horizontal * Math.PI * 2)) < 0.42 ? 1 : x > 0.15 && y > -0.25 ? 2 : 0;
    case 'broad_bands': return Math.floor(vertical * 3);
    default: throw new TypeError(`unsupported pattern: ${kind}`);
  }
}

export function createPatternPixels(recipe) {
  validateRenderRecipe(recipe);
  requireValue(THREE.ColorManagement.enabled, 'three.js color management must be enabled for srgb input colors');
  const pattern = recipe.surface_pattern;
  // Interpolate light values in linear space, then encode the color texture back to srgb.
  const colors = pattern.palette.map(color => new THREE.Color(pattern.palette[0])
    .lerp(new THREE.Color(color), pattern.ink_opacity).convertLinearToSRGB().toArray().map(value => Math.round(value * 255)));
  const data = new Uint8Array(pattern.width * pattern.height * 4);
  for (let row = 0; row < pattern.height; row += 1) for (let column = 0; column < pattern.width; column += 1) {
    const horizontal = (column + 0.5) / pattern.width * pattern.repeats_horizontal;
    const vertical = (row + 0.5) / pattern.height * pattern.repeats_vertical;
    const index = paletteIndex(pattern.kind, fraction(horizontal), fraction(vertical), Math.floor(horizontal), Math.floor(vertical)) % colors.length;
    const offset = (row * pattern.width + column) * 4;
    for (let channel = 0; channel < 3; channel += 1) data[offset + channel] = colors[index][channel];
    data[offset + 3] = 255;
  }
  return data;
}

export function createThreeObject(recipe) {
  const pixels = createPatternPixels(recipe);
  const shape = recipe.geometry;
  const geometry = shape.kind === 'sphere'
    ? new THREE.SphereGeometry(shape.radius, shape.width_segments, shape.height_segments)
    : new THREE.BoxGeometry(...shape.dimensions);
  geometry.uuid = shape.record_id;
  const pattern = recipe.surface_pattern;
  const texture = new THREE.DataTexture(pixels, pattern.width, pattern.height, THREE.RGBAFormat);
  texture.uuid = pattern.texture_identifier;
  texture.source.uuid = pattern.image_identifier;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  const surface = recipe.material;
  const material = new THREE.MeshStandardMaterial({ color: surface.base_color, roughness: surface.roughness,
    metalness: surface.metalness, opacity: surface.opacity, transparent: surface.opacity < 1,
    depthWrite: surface.opacity === 1, map: texture });
  material.uuid = surface.record_id;
  const object = new THREE.Mesh(geometry, material);
  object.uuid = recipe.record_id;
  object.name = recipe.title;
  object.position.fromArray(recipe.transform.position);
  object.rotation.fromArray(recipe.transform.rotation_radians);
  object.scale.fromArray(recipe.transform.scale);
  object.updateMatrix();
  object.userData = JSON.parse(JSON.stringify({ recordIdentifier: recipe.record_id, provenance: recipe.provenance,
    historicalObject: false, causalClaim: false, materialValueStatus: surface.value_status,
    semanticPosition: recipe.semantic_position, physics: recipe.physics,
    sourcePosition: recipe.transform.position, sourceScale: recipe.transform.scale, coordinateSpace: recipe.transform.coordinate_space }));
  return object;
}

export function createThreeScene(recipes, sceneRecord) {
  requireValue(Array.isArray(recipes) && recipes.length > 0 && recipes.length <= 1000, 'scene requires 1–1000 recipes');
  recipes.forEach(validateRenderRecipe);
  requireValue(record(sceneRecord) && identifier.test(sceneRecord.record_id) && eventIdentifier.test(sceneRecord.execution_identifier), 'scene requires UUIDv5 identity and UUIDv7 execution');
  requireValue(Array.isArray(sceneRecord.light_identifiers) && sceneRecord.light_identifiers.length === 2 && sceneRecord.light_identifiers.every(value => identifier.test(value)), 'scene light identifiers are required');
  requireValue(identifier.test(sceneRecord.light_target_identifier), 'scene light target identifier is required');
  const resources = [sceneRecord.record_id, sceneRecord.light_target_identifier, ...sceneRecord.light_identifiers, ...recipes.flatMap(recipe => [recipe.record_id, recipe.geometry.record_id,
    recipe.material.record_id, recipe.surface_pattern.record_id, recipe.surface_pattern.texture_identifier, recipe.surface_pattern.image_identifier])];
  requireValue(new Set(resources).size === resources.length, 'scene resource identifiers collide');
  const scene = new THREE.Scene();
  scene.uuid = sceneRecord.record_id;
  scene.name = 'Illustration and design reference';
  scene.background = new THREE.Color('#f2f0e9');
  scene.userData = { executionIdentifier: sceneRecord.execution_identifier, coordinateSystem: 'right_handed_y_up',
    coordinateUnit: 'scene_unit', semanticCoordinateUnit: 'dimensionless', physicsState: recipes.some(recipe => recipe.physics.enabled) ? 'requires_adapter_connection' : 'disabled',
    sourceDatasetIdentifier: sceneRecord.source_dataset_identifier,
    sourceDigest: sceneRecord.source_digest, stateTransition: ['recipes_validated', 'scene_created', 'visual_review_pending'] };
  const sky = new THREE.HemisphereLight('#ffffff', '#6d6b75', 2.2);
  sky.uuid = sceneRecord.light_identifiers[0];
  const light = new THREE.DirectionalLight('#ffffff', 2.8);
  light.uuid = sceneRecord.light_identifiers[1];
  light.target.uuid = sceneRecord.light_target_identifier;
  light.position.set(3, 5, 4);
  scene.add(sky, light, light.target);
  for (const recipe of recipes) scene.add(createThreeObject(recipe));
  scene.updateMatrixWorld(true);
  return scene;
}

export function disposeThreeObject(root) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  root.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : object.material ? [object.material] : []) {
      materials.add(material);
      if (material.map) textures.add(material.map);
    }
  });
  textures.forEach(texture => texture.dispose());
  materials.forEach(material => material.dispose());
  geometries.forEach(geometry => geometry.dispose());
}
