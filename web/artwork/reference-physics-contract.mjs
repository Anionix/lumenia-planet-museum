// LLM machine contract: immutable semantic coordinate snapshot -> optional display-only physics binding.
// UUIDv5 identifies recipes and future adapters; UUIDv7 scene/export events track each use. Physics starts disabled.
const identifier = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const bounded = (value, minimum, maximum) => Number.isFinite(value) && value >= minimum && value <= maximum;
const vector = (value, minimum, maximum) => Array.isArray(value) && value.length === 3 && value.every(number => bounded(number, minimum, maximum));
function requireValue(condition, message) { if (!condition) throw new TypeError(message); }
function exactFields(value, names, label) {
  requireValue(record(value) && Object.keys(value).length === names.length && names.every(name => Object.hasOwn(value, name)), `${label}: unexpected or missing field`);
}

export function validateSemanticPosition(position) {
  if (position === null) return;
  exactFields(position, ['coordinate_identifier', 'values', 'unit'], 'semantic position');
  requireValue(identifier.test(position.coordinate_identifier), 'semantic coordinate identifier must be UUIDv5');
  requireValue(vector(position.values, -1, 1) && position.unit === 'dimensionless', 'semantic coordinates must be dimensionless values in [-1,1]');
}

function quantity(value, unit, minimum, maximum, label, isVector = false) {
  exactFields(value, ['value', 'unit', 'value_origin', 'source_identifier'], label);
  requireValue(value.unit === unit, `${label} must use ${unit}`);
  requireValue(isVector ? vector(value.value, minimum, maximum) : bounded(value.value, minimum, maximum), `${label} out of range`);
  requireValue(['measured', 'presentation_setting'].includes(value.value_origin), `${label} must state measured or presentation_setting`);
  requireValue(value.value_origin === 'measured' ? identifier.test(value.source_identifier) : value.source_identifier === null, `${label} measured values need a source UUIDv5; presentation settings use null`);
}

export function validatePhysicsConfiguration(physics) {
  exactFields(physics, ['enabled', 'engine_adapter_identifier', 'specification'], 'physics');
  requireValue(typeof physics.enabled === 'boolean', 'physics.enabled must be boolean');
  requireValue(physics.engine_adapter_identifier === null || identifier.test(physics.engine_adapter_identifier), 'physics adapter identifier must be null or UUIDv5');
  if (physics.specification === null) {
    requireValue(!physics.enabled, 'enabled physics requires an explicit specification');
    return;
  }
  const specification = physics.specification;
  exactFields(specification, ['body_type', 'collider', 'mass', 'friction', 'restitution', 'metres_per_scene_unit'], 'physics specification');
  requireValue(['dynamic', 'fixed', 'kinematic_position_based', 'kinematic_velocity_based'].includes(specification.body_type), 'unsupported rigid body type');
  const collider = specification.collider;
  requireValue(record(collider), 'collider is required');
  if (collider.kind === 'sphere') {
    exactFields(collider, ['kind', 'radius'], 'sphere collider');
    quantity(collider.radius, 'metre', 0.000001, 1000000, 'collider radius');
  } else if (collider.kind === 'box') {
    exactFields(collider, ['kind', 'half_extents'], 'box collider');
    quantity(collider.half_extents, 'metre', 0.000001, 1000000, 'collider half extents', true);
  } else throw new TypeError('unsupported collider shape');
  quantity(specification.mass, 'kilogram', 0.000001, 1000000000, 'mass');
  quantity(specification.friction, 'dimensionless', 0, 10, 'friction');
  quantity(specification.restitution, 'dimensionless', 0, 1, 'restitution');
  quantity(specification.metres_per_scene_unit, 'metre_per_scene_unit', 0.000001, 1000000, 'scene length mapping');
  if (physics.enabled) requireValue(identifier.test(physics.engine_adapter_identifier), 'enabled physics requires an adapter identifier');
}

export function createSemanticCoordinateIndex(recipes) {
  const snapshot = new Map(), seenIdentifiers = new Set();
  for (const recipe of recipes) {
    validateSemanticPosition(recipe.semantic_position);
    requireValue(identifier.test(recipe.record_id) && !seenIdentifiers.has(recipe.record_id), 'semantic index needs unique UUIDv5 recipe identifiers');
    seenIdentifiers.add(recipe.record_id);
    if (recipe.semantic_position) snapshot.set(recipe.record_id, Object.freeze([...recipe.semantic_position.values]));
  }
  function positionFor(identifier) {
    const position = snapshot.get(identifier);
    requireValue(Boolean(position), `semantic coordinate not available: ${identifier}`);
    return position;
  }
  return Object.freeze({ positionFor, distanceBetween(first, second) {
    const a = positionFor(first), b = positionFor(second);
    return Math.hypot(...a.map((value, index) => value - b[index]));
  } });
}

export function connectOptionalPhysics(scene, recipes, adapter = null) {
  requireValue(Array.isArray(recipes), 'physics recipes must be an array');
  recipes.forEach(recipe => validatePhysicsConfiguration(recipe.physics));
  const active = recipes.filter(recipe => recipe.physics.enabled);
  if (active.length === 0) return Object.freeze({ enabled: false, step() {}, dispose() {} });
  requireValue(active.every(recipe => identifier.test(recipe.record_id)) && new Set(active.map(recipe => recipe.record_id)).size === active.length, 'physics bodies need unique UUIDv5 recipe identifiers');
  requireValue(adapter && typeof adapter.connect === 'function' && active.every(recipe => recipe.physics.engine_adapter_identifier === adapter.identifier), 'enabled physics needs the matching explicit engine adapter');
  const bodies = active.map(recipe => {
    const object = scene.getObjectByProperty('uuid', recipe.record_id);
    requireValue(Boolean(object), `physics display object missing: ${recipe.record_id}`);
    return Object.freeze({ recordIdentifier: recipe.record_id, specification: JSON.parse(JSON.stringify(recipe.physics.specification)),
      readDisplayTransform: () => ({ position: object.position.toArray(), rotation_quaternion: object.quaternion.toArray() }),
      writeDisplayTransform: transform => {
        requireValue(record(transform) && vector(transform.position, -1000000, 1000000), 'physics display position must be finite scene units');
        const rotation = transform.rotation_quaternion;
        requireValue(Array.isArray(rotation) && rotation.length === 4 && rotation.every(Number.isFinite) && Math.abs(Math.hypot(...rotation) - 1) < 0.00001, 'physics rotation must be a normalized quaternion');
        object.position.fromArray(transform.position); object.quaternion.fromArray(rotation); object.updateMatrix();
      } });
  });
  const binding = adapter.connect(bodies);
  requireValue(binding && typeof binding.step === 'function' && typeof binding.dispose === 'function', 'physics adapter must return step(seconds) and dispose()');
  scene.userData.physicsState = 'connected';
  let disposed = false;
  return Object.freeze({ enabled: true, step(seconds) {
    requireValue(!disposed && bounded(seconds, 0, 0.25), 'physics step must be 0–0.25 seconds on an active binding');
    binding.step(seconds);
  }, dispose() {
    if (!disposed) { disposed = true; binding.dispose(); scene.userData.physicsState = 'disposed'; }
  } });
}
