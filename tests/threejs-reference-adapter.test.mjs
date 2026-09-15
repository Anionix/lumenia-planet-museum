import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ObjectLoader, ColorManagement, SRGBColorSpace } from 'three';
import { uuidVersionSeven } from '../scripts/identifiers.mjs';
import { compileReferenceRecipes, makeSceneRecord, parseReferenceJsonl, renderIdentifier } from '../planetarium/scripts/export-threejs-reference.mjs';
import { createThreeScene, createThreeObject, createPatternPixels, disposeThreeObject, validateRenderRecipe } from '../planetarium/lib/threejs-reference-adapter.mjs';
import { createSemanticCoordinateIndex, connectOptionalPhysics, validatePhysicsConfiguration } from '../planetarium/lib/reference-physics-contract.mjs';

// LLM machine contract: UUIDv5 source joins -> serialization boundary -> immutable similarity coordinates -> optional physics lifecycle.
const input = await readFile(new URL('../planetarium/illustration-design-reference.jsonl', import.meta.url), 'utf8');
const compiled = compileReferenceRecipes(parseReferenceJsonl(input));
const sceneRecord = makeSceneRecord(compiled.manifest, compiled.recipes, uuidVersionSeven(), 'test_source_digest');
const uuidV5 = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const sample = () => structuredClone(compiled.recipes[0]);
const quantity = (value, unit) => ({ value, unit, value_origin: 'presentation_setting', source_identifier: null });
function physicsConfiguration() {
  return { enabled: true, engine_adapter_identifier: renderIdentifier('test_physics_adapter', 'display_motion'), specification: {
    body_type: 'dynamic', collider: { kind: 'sphere', radius: quantity(0.25, 'metre') },
    mass: quantity(1, 'kilogram'), friction: quantity(0.4, 'dimensionless'), restitution: quantity(0.3, 'dimensionless'),
    metres_per_scene_unit: quantity(1, 'metre_per_scene_unit'),
  } };
}

test('the actual dataset yields twelve explicitly positioned recipes and preserves source links', () => {
  assert.equal(compiled.recipes.length, 12);
  assert.deepEqual(compiled.skippedProfiles.map(row => row.name), ['Charles Eames', 'Ray Eames', 'Walter Gropius']);
  for (const recipe of compiled.recipes) {
    assert.deepEqual(recipe.semantic_position.values, recipe.transform.position);
    assert.notEqual(recipe.semantic_position.values, recipe.transform.position, 'semantic and display arrays must not alias');
    assert.equal(recipe.physics.enabled, false);
    assert.equal(recipe.physics.specification, null);
    assert.equal(recipe.material.roughness, 0.75);
    assert.equal(recipe.material.metalness, 0);
    assert.equal(recipe.historical_object, false);
  }
  assert.ok(compiled.radius * 2 < compiled.closestDistance, 'source-position spheres must not intersect');
  const again = compileReferenceRecipes(parseReferenceJsonl(input));
  assert.deepEqual(again.recipes, compiled.recipes, 'recipe and resource identities must be stable');
});

test('three.js serialization reloads all positions, textures, stable resource identities and provenance', () => {
  const scene = createThreeScene(compiled.recipes, sceneRecord);
  let restored;
  try {
    const serialized = JSON.parse(JSON.stringify(scene.toJSON()));
    for (const group of ['geometries', 'materials', 'textures', 'images']) {
      serialized[group].forEach(resource => assert.match(resource.uuid, uuidV5));
    }
    restored = new ObjectLoader().parse(serialized);
    assert.equal(restored.userData.physicsState, 'disabled');
    assert.equal(restored.children.filter(object => object.isMesh).length, 12);
    for (const recipe of compiled.recipes) {
      const object = restored.getObjectByProperty('uuid', recipe.record_id);
      assert.deepEqual(object.position.toArray(), recipe.transform.position);
      object.scale.toArray().forEach((value, axis) => assert.ok(Math.abs(value - recipe.transform.scale[axis]) < 1e-12));
      assert.deepEqual(object.userData.semanticPosition.values, recipe.semantic_position.values);
      assert.deepEqual(object.userData.provenance, recipe.provenance);
      assert.equal(object.material.map.colorSpace, SRGBColorSpace);
      assert.deepEqual(object.material.map.image.data, createPatternPixels(recipe));
      assert.equal(object.material.roughness, recipe.material.roughness);
    }
    restored.traverse(object => assert.match(object.uuid, uuidV5));
  } finally { disposeThreeObject(scene); if (restored) disposeThreeObject(restored); }
});

test('invalid numeric, resource, unit and unsupported-shape inputs fail before object allocation', () => {
  const changes = [
    recipe => { recipe.material.roughness = -0.1; }, recipe => { recipe.material.metalness = 1.01; },
    recipe => { recipe.material.opacity = NaN; }, recipe => { recipe.material.base_color = 'not a color'; },
    recipe => { recipe.geometry.kind = 'unimplemented'; }, recipe => { recipe.geometry.radius = 0; },
    recipe => { recipe.geometry.width_segments = 1000000; }, recipe => { recipe.transform.position[1] = Infinity; },
    recipe => { recipe.transform.scale[0] = 0; }, recipe => { recipe.surface_pattern.width = 1000000; },
    recipe => { recipe.surface_pattern.kind = 'unsupported'; }, recipe => { recipe.surface_pattern.ink_opacity = -1; },
    recipe => { recipe.surface_pattern.texture_identifier = recipe.material.record_id; },
    recipe => { recipe.semantic_position.values[0] = 1.1; }, recipe => { recipe.semantic_position.unit = 'metre'; },
    recipe => { recipe.physics.enabled = true; },
  ];
  for (const change of changes) { const recipe = sample(); change(recipe); assert.throws(() => createThreeObject(recipe), TypeError); }
  assert.throws(() => parseReferenceJsonl('{broken'), /Invalid JSONL/);
  assert.throws(() => parseReferenceJsonl('{"record_id":"same"}\n{"record_id":"same"}'), /duplicate/);
});

test('a generic box uses the same portable material contract without artist-dependent rendering logic', () => {
  const recipe = sample();
  recipe.title = '任意の素材見本'; recipe.semantic_position = null;
  recipe.geometry = { record_id: recipe.geometry.record_id, kind: 'box', dimensions: [2, 1, 3] };
  recipe.transform.position = [7, 8, 9]; recipe.material.roughness = 0.2; recipe.material.metalness = 1; recipe.material.opacity = 0.5;
  const object = createThreeObject(recipe);
  try {
    assert.equal(object.geometry.type, 'BoxGeometry');
    assert.deepEqual(object.position.toArray(), [7, 8, 9]);
    assert.equal(object.material.transparent, true); assert.equal(object.material.depthWrite, false);
    assert.equal(object.material.roughness, 0.2); assert.equal(object.material.metalness, 1);
  } finally { disposeThreeObject(object); }
});

test('every selected pattern produces bounded opaque pixels and color-space assumptions are explicit', () => {
  for (const recipe of compiled.recipes) {
    const pixels = createPatternPixels(recipe);
    const colors = new Set();
    for (let index = 0; index < pixels.length; index += 4) { colors.add(pixels.slice(index, index + 3).join(',')); assert.equal(pixels[index + 3], 255); }
    assert.ok(colors.size > 1, `${recipe.title} pattern must have visible color variation`);
    assert.deepEqual(createPatternPixels(recipe), pixels);
  }
  try { ColorManagement.enabled = false; assert.throws(() => createPatternPixels(sample()), /color management/); }
  finally { ColorManagement.enabled = true; }
});

test('scene disposal releases geometry, material and texture resources', () => {
  const object = createThreeObject(sample());
  const disposed = [];
  object.geometry.addEventListener('dispose', () => disposed.push('geometry'));
  object.material.addEventListener('dispose', () => disposed.push('material'));
  object.material.map.addEventListener('dispose', () => disposed.push('texture'));
  disposeThreeObject(object);
  assert.deepEqual(disposed.sort(), ['geometry', 'material', 'texture']);
});

test('moving display objects and metadata never changes an existing semantic coordinate index', () => {
  const recipes = structuredClone(compiled.recipes);
  const unplaced = sample(); unplaced.semantic_position = null;
  assert.throws(() => createSemanticCoordinateIndex([unplaced, unplaced]), /unique UUIDv5/);
  const index = createSemanticCoordinateIndex(recipes);
  const first = recipes[0].record_id, second = recipes[1].record_id;
  const distance = index.distanceBetween(first, second);
  assert.ok(Math.abs(distance - Math.sqrt(0.26)) < 1e-12, 'Morris–Mucha distance from the supplied coordinates');
  const scene = createThreeScene(recipes, sceneRecord);
  try {
    scene.children.filter(object => object.isMesh).forEach(object => object.position.set(100, 100, 100));
    scene.getObjectByProperty('uuid', first).userData.semanticPosition.values[0] = 500;
    recipes[0].semantic_position.values[0] = -0.99;
    assert.equal(index.distanceBetween(first, second), distance);
    assert.throws(() => { index.positionFor(first)[0] = 2; }, TypeError);
  } finally { disposeThreeObject(scene); }
});

test('disabled physics never connects or steps an engine', () => {
  let calls = 0;
  const binding = connectOptionalPhysics(null, compiled.recipes, { connect() { calls += 1; } });
  assert.equal(binding.enabled, false); binding.step(1 / 60); binding.dispose();
  assert.equal(calls, 0);
});

test('optional physics validates units, origins, source references and coefficients', () => {
  assert.doesNotThrow(() => validatePhysicsConfiguration(physicsConfiguration()));
  for (const change of [
    settings => { settings.specification.mass.unit = 'gram'; },
    settings => { settings.specification.mass.value_origin = 'measured'; },
    settings => { settings.specification.friction.value = -1; },
    settings => { settings.specification.restitution.value = 1.1; },
    settings => { settings.specification.metres_per_scene_unit.value = 0; },
    settings => { settings.specification.collider.radius.unit = 'scene_unit'; },
    settings => { settings.engine_adapter_identifier = null; },
  ]) { const settings = physicsConfiguration(); change(settings); assert.throws(() => validatePhysicsConfiguration(settings), TypeError); }
});

test('an explicit engine adapter can move display transforms while similarity remains fixed', () => {
  const recipes = structuredClone(compiled.recipes);
  recipes[0].physics = physicsConfiguration();
  validateRenderRecipe(recipes[0]);
  const index = createSemanticCoordinateIndex(recipes);
  const before = index.distanceBetween(recipes[0].record_id, recipes[1].record_id);
  const scene = createThreeScene(recipes, sceneRecord);
  let disconnects = 0;
  try {
    assert.throws(() => connectOptionalPhysics(scene, recipes), /matching explicit engine adapter/);
    const binding = connectOptionalPhysics(scene, recipes, { identifier: recipes[0].physics.engine_adapter_identifier, connect(bodies) {
      assert.equal(bodies.length, 1); assert.equal('semantic_position' in bodies[0], false);
      return { step(seconds) { assert.equal(seconds, 1 / 60); bodies[0].writeDisplayTransform({ position: [4, 5, 6], rotation_quaternion: [0, 0, 0, 1] }); },
        dispose() { disconnects += 1; } };
    } });
    binding.step(1 / 60);
    assert.deepEqual(scene.getObjectByProperty('uuid', recipes[0].record_id).position.toArray(), [4, 5, 6]);
    assert.equal(index.distanceBetween(recipes[0].record_id, recipes[1].record_id), before);
    binding.dispose(); binding.dispose(); assert.equal(disconnects, 1);
    assert.throws(() => binding.step(1 / 60), /active binding/);
  } finally { disposeThreeObject(scene); }
});
