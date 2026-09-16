import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { cosmicCatalog } from '../web/artwork/cosmic-catalog.generated.mjs';
import { cosmicRecipes } from '../web/artwork/cosmic-recipes.generated.mjs';
import { orbitPosition, intersectsYears, advancePresentationClock, exhibitionLimits } from '../web/artwork/cosmic-state.mjs';
import { validateRenderRecipe, createThreeObject, disposeThreeObject } from '../planetarium/lib/threejs-reference-adapter.mjs';
import { createSemanticCoordinateIndex, connectOptionalPhysics } from '../planetarium/lib/reference-physics-contract.mjs';
import { Scene } from 'three';

// llm machine contract; claim UUIDv5: 796d5e27-8862-52a6-a331-776d0066b23b
// execution UUIDv7 supplied by verification receipt; transition: generated data -> adversarial boundary and invariant checks.
test('15 unique sourced bodies keep 12 supplied semantic coordinates and all physics disabled', () => {
  assert.equal(cosmicCatalog.length, 15);
  assert.equal(new Set(cosmicCatalog.map(person => person.identifier)).size, 15);
  assert.equal(cosmicRecipes.filter(recipe => recipe.semantic_position).length, 12);
  for (const [index, body] of cosmicCatalog.entries()) {
    const recipe = validateRenderRecipe(cosmicRecipes[index]);
    assert.equal(body.recipeIdentifier, recipe.record_id);
    assert.ok(body.sources.length >= 1);
    assert.ok(body.period.sourceIdentifiers.every(identifier => body.sources.some(source => source.identifier === identifier)));
    assert.equal(recipe.physics.enabled, false);
  }
  assert.deepEqual(cosmicCatalog.filter(body => !body.semanticPosition).map(body => body.canonicalName),
    ['Charles Eames', 'Ray Eames', 'Walter Gropius']);
});

test('presentation movement never changes semantic distance, including missing coordinates', () => {
  const scene = new Scene();
  const semantics = createSemanticCoordinateIndex(cosmicRecipes);
  const first = cosmicRecipes[0].record_id, second = cosmicRecipes[1].record_id;
  const before = semantics.distanceBetween(first, second);
  const snapshots = cosmicRecipes.map(recipe => JSON.stringify(recipe.semantic_position));
  for (const [index, recipe] of cosmicRecipes.entries()) {
    const object = createThreeObject(recipe); scene.add(object);
    for (const seconds of [0, 1, 7.5, 31, 120, 1000]) {
      const position = orbitPosition(cosmicCatalog[index].orbit, seconds);
      assert.ok(Math.abs(Math.hypot(...position) - cosmicCatalog[index].orbit.radius) < 1e-10);
      object.position.fromArray(position);
    }
    object.userData.semanticPosition = null;
    assert.equal(JSON.stringify(recipe.semantic_position), snapshots[index]);
  }
  assert.equal(semantics.distanceBetween(first, second), before);
  assert.throws(() => semantics.positionFor(cosmicRecipes[12].record_id), /not available/);
  let called = false;
  connectOptionalPhysics(scene, cosmicRecipes, { connect() { called = true; } });
  assert.equal(called, false);
  disposeThreeObject(scene);
});

test('chronology keeps interval boundaries, unspecified date and exhibition date distinct', () => {
  const rietveld = cosmicCatalog.find(person => person.canonicalName === 'Gerrit Rietveld').period;
  assert.equal(intersectsYears(rietveld, 1923, 1923), true);
  assert.equal(intersectsYears(rietveld, 1924, 1950), false);
  const unknown = cosmicCatalog.find(person => person.canonicalName === 'Charles Rennie Mackintosh').period;
  assert.equal(intersectsYears(unknown, 1800, 2020), null);
  assert.throws(() => intersectsYears({ ...unknown, start: 1900 }, 1800, 2020));
  assert.throws(() => intersectsYears(rietveld, 2020, 1880));
  assert.equal(cosmicCatalog.find(person => person.canonicalName === 'Rei Kawakubo').period.kind, 'exhibition_date');
  for (const person of cosmicCatalog) for (let year = 1880; year <= 2020; year += 1) {
    if (intersectsYears(person.period, year, year)) assert.equal(intersectsYears(person.period, year - 1, year + 1), true);
  }
});

test('pause, reduced motion and visibility freeze the presentation clock; resumed frames stay bounded', () => {
  assert.equal(advancePresentationClock(3, 8, false, true, false), 3);
  assert.equal(advancePresentationClock(3, 8, true, false, false), 3);
  assert.equal(advancePresentationClock(3, 8, true, true, true), 3);
  assert.equal(advancePresentationClock(3, 8, true, true, false), 3.1);
  assert.equal(advancePresentationClock(119.98, 8, true, true, false), 120.08);
  assert.equal(advancePresentationClock(86399.98, 8, true, true, false), 86400);
  assert.throws(() => orbitPosition(cosmicCatalog[0].orbit, NaN));
  assert.throws(() => advancePresentationClock(3, Infinity, true, true, false));
  assert.equal(exhibitionLimits.physicsEnabled, false);
});

test('an orbit crosses 120 seconds continuously rather than teleporting', () => {
  const orbit = cosmicCatalog.find(person => person.canonicalName === 'Walter Gropius').orbit;
  const before = orbitPosition(orbit, 119.99);
  const after = orbitPosition(orbit, advancePresentationClock(119.99, 1 / 30, true, true, false));
  assert.ok(Math.hypot(...after.map((value, index) => value - before[index])) < 0.02);
});

test('browser exports share the checked physics and rendering implementations', async () => {
  for (const filename of ['reference-physics-contract.mjs', 'threejs-reference-adapter.mjs']) {
    assert.deepEqual(await import('../web/artwork/' + filename),
      await import('../planetarium/lib/' + filename));
  }
});
