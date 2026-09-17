import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ObjectLoader, REVISION } from 'three';
import { uuidVersionFive, uuidVersionSeven } from '../../scripts/identifiers.mjs';
import { createThreeScene, disposeThreeObject, validateRenderRecipe } from '../lib/threejs-reference-adapter.mjs';

// LLM machine contract: source UUIDv5 references -> rendering proposals -> round-trip validation -> UUIDv7 export receipt.
// Input records and their coordinate claims remain traceable by their original identifiers and a content digest.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
export const renderIdentifier = (kind, key) => uuidVersionFive(namespace, `illustration-design-rendering-v1:${kind}:${key}`);
const digest = value => createHash('sha256').update(value).digest('hex');
const patternsByFamily = Object.freeze({
  botanicalRepeat: 'botanical_repeat', zodiacHalo: 'radial_ornament', geometricBotanical: 'botanical_grid',
  orthogonalColourPlanes: 'rectangular_planes', perpendicularConstruction: 'crossing_bars',
  laminateAndAccent: 'diagonal_zigzags', geometricLettering: 'circle_and_bar', typographicGrid: 'modular_grid',
  transitDiagram: 'angled_routes', modularProduct: 'parallel_slots', familiarPullControl: 'rings_and_line',
  asymmetricVolume: 'curved_layers', layeredMaterials: 'broad_bands', colourCollage: 'rectangular_planes',
  transparentStructure: 'crossing_bars',
});

export function parseReferenceJsonl(text) {
  const rows = text.split(/\r?\n/).filter(line => line.trim()).map((line, index) => {
    try { return JSON.parse(line); }
    catch { throw new TypeError(`Invalid JSONL at nonempty line ${index + 1}`); }
  });
  const identifiers = rows.map(row => row?.record_id);
  assert.ok(identifiers.every(value => typeof value === 'string' && value.length > 0), 'every source record needs an identifier');
  assert.equal(new Set(identifiers).size, identifiers.length, 'duplicate source record identifiers');
  return rows;
}

export function compileReferenceRecipes(records) {
  const manifests = records.filter(row => row.record_type === 'dataset_manifest');
  assert.equal(manifests.length, 1, 'one source manifest is required');
  const manifest = manifests[0];
  const profiles = records.filter(row => row.record_type === 'visual_profile');
  const coordinates = records.filter(row => row.record_type === 'style_coordinate_example');
  const peopleByIdentifier = new Map(records.filter(row => row.record_type === 'person').map(row => [row.record_id, row]));
  const allIdentifiers = new Set(records.map(row => row.record_id));
  assert.ok(coordinates.length > 0 && coordinates.length <= 1000, '1–1000 coordinate records are required');
  const linked = coordinates.map(coordinate => {
    const person = peopleByIdentifier.get(coordinate.person_identifier);
    assert.ok(person && person.canonical_name === coordinate.person_name, `coordinate/person mismatch: ${coordinate.person_name}`);
    const matching = profiles.filter(profile => profile.canonicalName === person.canonical_name);
    assert.equal(matching.length, 1, `one exact visual-profile name match is required: ${person.canonical_name}`);
    const profile = matching[0];
    assert.ok(patternsByFamily[profile.family], `unsupported source family: ${profile.family}`);
    assert.ok(Array.isArray(profile.sourceClaimIdentifiers) && profile.sourceClaimIdentifiers.every(id => allIdentifiers.has(id)), 'profile claims must resolve in the parent dataset');
    const position = ['x', 'y', 'z'].map(axis => coordinate.coordinates[axis]);
    assert.ok(position.every(value => Number.isFinite(value) && value >= -1 && value <= 1), 'source coordinate outside [-1,1]');
    return { coordinate, profile, person, position };
  });
  let closestDistance = Infinity;
  for (let first = 0; first < linked.length; first += 1) for (let second = first + 1; second < linked.length; second += 1) {
    const distance = Math.hypot(...linked[first].position.map((value, axis) => value - linked[second].position[axis]));
    assert.ok(distance > 0, 'coincident style positions need an explicit layout decision');
    closestDistance = Math.min(closestDistance, distance);
  }
  const radius = Math.min(0.10, closestDistance * 0.4);
  const recipes = linked.map(({ coordinate, profile, person, position }) => {
    const key = profile.record_id;
    const count = profile.parameters.repeatCount;
    assert.ok(Number.isInteger(count) && count >= 1 && count <= 64, 'source repeat count outside [1,64]');
    let vertical = Math.floor(Math.sqrt(count));
    while (count % vertical !== 0) vertical -= 1;
    const recipe = {
      record_type: 'render_recipe', record_id: renderIdentifier('render_recipe', key), schema_version: '1.0.0',
      record_key: `render_recipe:${profile.canonicalName}`, title: profile.canonicalName,
      historical_object: false, causal_claim: false,
      semantic_position: { coordinate_identifier: coordinate.record_id, values: [...position], unit: 'dimensionless' },
      physics: { enabled: false, engine_adapter_identifier: null, specification: null },
      provenance: { source_dataset_identifier: manifest.record_id, person_identifier: person.record_id,
        visual_profile_identifier: profile.record_id, coordinate_identifier: coordinate.record_id,
        source_claim_identifiers: profile.sourceClaimIdentifiers,
        profile_join: 'unique_exact_canonical_name; both source identifiers retained',
        coordinate_status: coordinate.status, palette_status: profile.paletteStatus,
        scope: 'drawing proposal from an existing visual profile; not the historical work or measured material properties' },
      geometry: { record_id: renderIdentifier('geometry', key), kind: 'sphere', radius: 1, width_segments: 48, height_segments: 24 },
      material: { record_id: renderIdentifier('material', key), base_color: '#ffffff', roughness: 0.75,
        metalness: 0, opacity: 1, value_status: 'explicit_shared_preview_defaults; not inferred from style scores' },
      surface_pattern: { record_id: renderIdentifier('surface_pattern', key), texture_identifier: renderIdentifier('texture', key),
        image_identifier: renderIdentifier('texture_image', key), kind: patternsByFamily[profile.family],
        palette: [...profile.palette], repeats_horizontal: count / vertical, repeats_vertical: vertical,
        ink_opacity: profile.parameters.opacityPercent / 100, width: 256, height: 128 },
      transform: { position, rotation_radians: [0, 0, 0], scale: [radius, radius, radius], coordinate_space: 'presentation_coordinates', unit: 'scene_unit' },
    };
    return validateRenderRecipe(recipe);
  });
  const included = new Set(recipes.map(row => row.provenance.visual_profile_identifier));
  return { manifest, recipes, radius, closestDistance: Number.isFinite(closestDistance) ? closestDistance : null,
    skippedProfiles: profiles.filter(row => !included.has(row.record_id)).map(row => ({ profile_identifier: row.record_id,
      name: row.canonicalName, reason: 'no supplied style coordinate; position was not synthesized' })) };
}

export function makeSceneRecord(manifest, recipes, executionIdentifier, sourceDigest) {
  return { record_type: 'render_scene', record_id: renderIdentifier('render_scene', manifest.record_id),
    record_key: 'render_scene:style_coordinate_scene', execution_identifier: executionIdentifier,
    source_dataset_identifier: manifest.record_id, source_digest: sourceDigest,
    recipe_identifiers: recipes.map(row => row.record_id), coordinate_system: 'right_handed_y_up', coordinate_unit: 'scene_unit',
    semantic_coordinate_unit: 'dimensionless', initial_placement_rule: 'copy semantic coordinates into display coordinates at one scene unit per coordinate unit',
    light_identifiers: ['hemisphere', 'directional'].map(kind => renderIdentifier('scene_light', kind)),
    light_target_identifier: renderIdentifier('scene_light_target', 'origin') };
}

export async function exportThreeReference() {
  const sourceText = await readFile(resolve(projectRoot, 'planetarium/illustration-design-reference.jsonl'), 'utf8');
  const sourceDigest = digest(sourceText);
  const compiled = compileReferenceRecipes(parseReferenceJsonl(sourceText));
  const executionIdentifier = uuidVersionSeven();
  const sceneRecord = makeSceneRecord(compiled.manifest, compiled.recipes, executionIdentifier, sourceDigest);
  const scene = createThreeScene(compiled.recipes, sceneRecord);
  let restored;
  let serialized;
  try {
    serialized = JSON.stringify(scene.toJSON());
    restored = new ObjectLoader().parse(JSON.parse(serialized));
    const meshes = restored.children.filter(child => child.isMesh);
    assert.equal(meshes.length, compiled.recipes.length);
    for (const recipe of compiled.recipes) {
      const object = restored.getObjectByProperty('uuid', recipe.record_id);
      assert.ok(object?.isMesh, 'round-trip mesh missing');
      assert.deepEqual(object.position.toArray(), recipe.transform.position);
      assert.ok(object.material.map.isDataTexture && object.material.map.colorSpace === 'srgb');
      assert.equal(object.material.map.image.data.length, recipe.surface_pattern.width * recipe.surface_pattern.height * 4);
    }
  } finally {
    disposeThreeObject(scene);
    if (restored) disposeThreeObject(restored);
  }
  const sources = [
    ['MeshStandardMaterial', 'https://threejs.org/docs/pages/MeshStandardMaterial.html', 'Explicit roughness, metalness and color texture interpretation.'],
    ['ObjectLoader', 'https://threejs.org/docs/pages/ObjectLoader.html', 'Load serialized objects and scenes with the standard loader.'],
    ['Rapier rigid body types', 'https://rapier.rs/docs/user_guides/javascript/rigid_body_type/', 'Reference for a future optional physics adapter; no physics engine is connected in this export.'],
    ['Rapier colliders', 'https://rapier.rs/docs/user_guides/javascript/colliders/', 'Reference for explicit collision shape, mass, friction and restitution settings.'],
  ].map(([title, url, scope]) => ({ record_type: 'source', record_id: renderIdentifier('source', url),
    record_key: `source:${title}`, title, url, source_kind: 'official_software_documentation', scope,
    observed_at: new Date().toISOString(), observation_execution_identifier: executionIdentifier }));
  const adapter = { record_type: 'render_adapter_profile', record_id: renderIdentifier('render_adapter_profile', 'threejs'),
    record_key: 'render_adapter_profile:threejs', target_display_name: 'three.js', tested_revision: REVISION,
    core_input_record_type: 'render_recipe', implementation: 'planetarium/lib/threejs-reference-adapter.mjs',
    supported_geometry: ['sphere', 'box'], material_mapping: { base_color: 'MeshStandardMaterial.color',
      roughness: 'MeshStandardMaterial.roughness', metalness: 'MeshStandardMaterial.metalness', opacity: 'MeshStandardMaterial.opacity' },
    pattern_mapping: 'bounded deterministic color pixels; color texture is tagged srgb',
    physics_extension: { default_enabled: false, implementation: 'planetarium/lib/reference-physics-contract.mjs',
      real_engine_connected: false, units: ['metre', 'kilogram', 'dimensionless', 'metre_per_scene_unit'],
      required_value_origins: ['measured with source identifier', 'presentation_setting'],
      lifecycle: 'explicit adapter connection -> step(seconds) -> dispose()', semantic_coordinates_available_to_engine: false },
    limitations: ['Pattern families become flat surface drawings. Volumetric folds, real wood, glass and measured reflectance need additional explicit recipes.',
      'Natural-language prompt_recipe text does not create a mesh automatically.', 'Source style coordinates remain provisional when raw style scores are missing.'],
    source_record_identifiers: sources.map(source => source.record_id) };
  const companionManifest = { record_type: 'render_dataset_manifest', record_id: renderIdentifier('render_dataset_manifest', compiled.manifest.record_id),
    record_key: 'render_dataset_manifest:illustration_design_rendering', schema_version: '1.0.0', execution_identifier: executionIdentifier,
    source_dataset: { path: 'planetarium/illustration-design-reference.jsonl', record_identifier: compiled.manifest.record_id, sha256: sourceDigest },
    identifier_policy: 'UUIDv5 for content and resources; UUIDv7 for chronological observations',
    record_count: 0, render_recipe_count: compiled.recipes.length, coordinate_axes: { x: 'geometric - organic', y: 'systematic - expressive', z: 'minimal - decorative' },
    rendering_choices: { surface_material: 'shared nonmetallic matte preview', source_opacity_mapping: 'pattern ink opacity; sphere opacity is explicitly 1',
      source_repeat_count_mapping: 'number of repeated texture tiles', equal_sphere_radius: compiled.radius,
      sphere_radius_rule: 'minimum of 0.10 and 0.4 times nearest distinct source-center distance', independent_of_evidence_strength: true },
    skipped_profiles: compiled.skippedProfiles, source_foreign_reference_scope: 'provenance identifiers resolve in the source dataset; source_record_identifiers resolve in this companion file' };
  const transition = { record_type: 'render_export_event', record_id: executionIdentifier, record_key: `render_export_event:${executionIdentifier}`,
    recorded_at: new Date().toISOString(), states: ['source_read', 'render_recipes_validated', 'scene_created', 'serialization_round_trip_passed'],
    visual_review_status: 'pending_browser_review' };
  const outputRecords = [companionManifest, adapter, ...sources, sceneRecord, ...compiled.recipes, transition];
  companionManifest.record_count = outputRecords.length;
  const recipeText = outputRecords.map(row => JSON.stringify(row)).join('\n') + '\n';
  const report = { report_type: 'threejs_reference_export', execution_identifier: executionIdentifier, recorded_at: new Date().toISOString(),
    three_revision: REVISION, source_sha256: sourceDigest, recipe_count: compiled.recipes.length,
    source_coordinates_preserved: true, semantic_and_display_coordinates_separate: true, physics_enabled_by_default: false,
    real_physics_engine_connected: false, serialization_round_trip: 'passed', texture_pixels_embedded: true,
    generated_recipe_sha256: digest(recipeText), generated_scene_sha256: digest(serialized + '\n'),
    skipped_profiles: compiled.skippedProfiles, visual_review_status: 'pending_browser_review' };
  await mkdir(resolve(projectRoot, 'planetarium/generated'), { recursive: true });
  await writeFile(resolve(projectRoot, 'planetarium/generated/render-recipes.jsonl'), recipeText);
  await writeFile(resolve(projectRoot, 'planetarium/generated/threejs-reference-scene.json'), serialized + '\n');
  await writeFile(resolve(projectRoot, 'planetarium/reports/threejs-reference-export.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: 'passed', recipes: compiled.recipes.length, skipped_profiles: compiled.skippedProfiles.map(row => row.name),
    three_revision: REVISION, execution_identifier: executionIdentifier }));
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await exportThreeReference();
