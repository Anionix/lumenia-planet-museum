import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { projectRoot } from './source-revision.mjs';
import { claimIdentifier, uuidVersionSeven } from './identifiers.mjs';
import { compileReferenceRecipes, parseReferenceJsonl, renderIdentifier } from '../planetarium/scripts/export-threejs-reference.mjs';
import { validateRenderRecipe } from '../planetarium/lib/threejs-reference-adapter.mjs';
import { orbitPosition, validateHistoricalPeriod, exhibitionLimits } from '../web/artwork/cosmic-state.mjs';

// llm machine contract; claim UUIDv5: 796d5e27-8862-52a6-a331-776d0066b23b
// execution UUIDv7 generated per invocation; transition: existing sourced profiles -> compact exhibition records.
// Publication dates are not inferred as work dates. Unknown dates and missing semantic coordinates remain null.
const chronology = {
  'William Morris': [1883, 1883, 'work_date', '1883年'],
  'Alphonse Mucha': [1896, 1896, 'work_date', '1896年'],
  'Charles Rennie Mackintosh': [null, null, 'unspecified', '晩年のテキスタイル・年未特定'],
  'Piet Mondrian': [1921, 1921, 'work_date', '1921年'],
  'Gerrit Rietveld': [1918, 1923, 'work_date', '1918–1923年'],
  'Ettore Sottsass': [1981, 1981, 'work_date', 'Carlton・1981年'],
  'Herbert Bayer': [1920, 1929, 'reference_decade', '1920年代'],
  'Josef Müller-Brockmann': [1955, 1955, 'work_date', '1955年'],
  'Massimo Vignelli': [1970, 1972, 'work_date', '1970–1972年'],
  'Dieter Rams': [1960, 1960, 'work_date', '606の発売・1960年'],
  'Naoto Fukasawa': [1999, 1999, 'work_date', '1999年'],
  'Rei Kawakubo': [2017, 2017, 'exhibition_date', '展覧会・2017年'],
  'Charles Eames': [1956, 1956, 'work_date', '1956年'],
  'Ray Eames': [1952, 1952, 'work_date', '1952年'],
  'Walter Gropius': [1926, 1926, 'work_date', '開校・1926年'],
};
const extraPatterns = { layeredMaterials: 'broad_bands', colourCollage: 'rectangular_planes', transparentStructure: 'crossing_bars' };

export async function buildCosmicCatalog() {
  const sourceText = await readFile(path.join(projectRoot, 'planetarium/illustration-design-reference.jsonl'), 'utf8');
  const knowledge = JSON.parse(await readFile(path.join(projectRoot, 'planetarium/knowledge.json'), 'utf8'));
  const records = parseReferenceJsonl(sourceText);
  const compiled = compileReferenceRecipes(records);
  assert.equal(knowledge.profiles.length, exhibitionLimits.people);
  const summaries = [], recipes = [];
  const sourceByIdentifier = new Map(knowledge.sources.map(source => [source.sourceIdentifier, source]));
  for (const [index, profile] of knowledge.profiles.entries()) {
    const person = records.filter(record => record.record_type === 'person' && record.canonical_name === profile.canonicalName);
    assert.equal(person.length, 1, 'Normalized person must resolve uniquely');
    const sources = [...new Set(profile.sourceClaimIdentifiers.flatMap(identifier => {
      const claim = knowledge.claims.find(item => item.claimIdentifier === identifier);
      assert.ok(claim);
      return claim.evidenceIdentifiers.map(identifier => {
        const evidence = knowledge.evidence.find(item => item.evidenceIdentifier === identifier);
        assert.ok(evidence); return evidence.sourceIdentifier;
      });
    }))].map(identifier => {
      const source = sourceByIdentifier.get(identifier); assert.ok(source?.url.startsWith('https://'));
      return { identifier, title: source.title, url: source.url };
    });
    const [start, end, kind, label] = chronology[profile.canonicalName];
    const period = validateHistoricalPeriod({ identifier: claimIdentifier('Lumenia.HistoricalPeriod.' + profile.canonicalName),
      start, end, kind, label, unit: 'calendar_year', sourceIdentifiers: sources.map(source => source.identifier),
      valueStatus: 'source_backed_curatorial_selection', originalScope: profile.referencePeriod });
    const orbit = { identifier: claimIdentifier('Lumenia.PresentationOrbit.' + profile.canonicalName),
      radius: 3.8 + index * 0.62, periodSeconds: 45 + index * 9,
      phaseRadians: index * 2.399963229728653, inclinationRadians: (index % 5 - 2) * 0.07,
      unit: 'scene_unit', timeUnit: 'second', valueStatus: 'presentation_setting' };
    let recipe = structuredClone(compiled.recipes.find(item => item.title === profile.canonicalName));
    if (!recipe) {
      assert.ok(extraPatterns[profile.family]);
      recipe = structuredClone(compiled.recipes[0]);
      const key = profile.profileIdentifier;
      recipe.record_id = renderIdentifier('render_recipe', key);
      recipe.record_key = 'render_recipe:' + profile.canonicalName;
      recipe.title = profile.canonicalName;
      recipe.semantic_position = null;
      recipe.provenance = { source_dataset_identifier: compiled.manifest.record_id, person_identifier: person[0].record_id,
        visual_profile_identifier: key, coordinate_identifier: null, source_claim_identifiers: profile.sourceClaimIdentifiers,
        profile_join: 'unique_exact_canonical_name; original identifiers retained', coordinate_status: 'not_supplied',
        palette_status: profile.paletteStatus, scope: 'drawing proposal; semantic coordinate not supplied; orbital location is a presentation choice' };
      recipe.geometry.record_id = renderIdentifier('geometry', key);
      recipe.material.record_id = renderIdentifier('material', key);
      recipe.surface_pattern = { ...recipe.surface_pattern, record_id: renderIdentifier('surface_pattern', key),
        texture_identifier: renderIdentifier('texture', key), image_identifier: renderIdentifier('texture_image', key),
        kind: extraPatterns[profile.family], palette: [...profile.palette],
        repeats_horizontal: profile.parameters.repeatCount, repeats_vertical: 1,
        ink_opacity: profile.parameters.opacityPercent / 100 };
    }
    // Keep cosmic rendering identities separate from the unchanged 12-person coordinate scene.
    recipe.record_id = claimIdentifier('Lumenia.CosmicRecipe.' + profile.canonicalName);
    recipe.geometry.width_segments = exhibitionLimits.sphereWidthSegments;
    recipe.geometry.height_segments = exhibitionLimits.sphereHeightSegments;
    const radius = 0.30 + (index % 4) * 0.055;
    recipe.transform.position = orbitPosition(orbit, 0);
    recipe.transform.scale = [radius, radius, radius];
    recipe.material.roughness = ['modularProduct', 'familiarPullControl'].includes(profile.family) ? 0.36 : 0.76;
    recipe.material.value_status = 'curatorial_material_finish; not measured or inferred from style scores';
    validateRenderRecipe(recipe);
    recipes.push(recipe);
    const summary = { identifier: claimIdentifier('Lumenia.CosmicBody.' + profile.canonicalName),
      recipeIdentifier: recipe.record_id, personIdentifier: person[0].record_id, profileIdentifier: profile.profileIdentifier,
      slug: profile.componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
      name: profile.title.replace(' — Material Sphere', ''), canonicalName: profile.canonicalName,
      work: profile.referenceWork, interpretation: profile.interpretation, period, orbit,
      palette: profile.palette, semanticPosition: recipe.semantic_position, sources, sphereRadius: radius };
    summaries.push(summary);
  }
  const executionIdentifier = uuidVersionSeven();
  const header = '// Generated by scripts/build-cosmic-catalog.mjs. Do not edit.\n' +
    '// llm machine contract; claim UUIDv5: 796d5e27-8862-52a6-a331-776d0066b23b; transition: verified references -> display inputs.\n';
  const files = {
    'web/artwork/cosmic-catalog.generated.mjs': header + `export const cosmicCatalog = ${JSON.stringify(summaries)};\n`,
    'web/artwork/cosmic-recipes.generated.mjs': header + `export const cosmicRecipes = ${JSON.stringify(recipes)};\n`,
    'planetarium/generated/cosmic-exhibition.jsonl': [
      { record_type: 'exhibition_manifest', record_id: claimIdentifier('Lumenia.CosmicExhibitionManifest'),
        source_dataset_identifier: compiled.manifest.record_id, source_digest: createHash('sha256').update(sourceText).digest('hex'),
        physics_enabled: false, historical_solar_system: false, limits: exhibitionLimits },
      ...summaries.map(item => ({ record_type: 'exhibition_body', record_id: item.identifier, ...item })),
      ...recipes,
    ].map(item => JSON.stringify(item)).join('\n') + '\n',
  };
  for (const [file, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(projectRoot, file)), { recursive: true });
    await writeFile(path.join(projectRoot, file), content);
  }
  const report = { executionIdentifier, recordedAt: new Date().toISOString(), people: summaries.length,
    semanticCoordinates: summaries.filter(item => item.semanticPosition).length,
    unspecifiedDates: summaries.filter(item => item.period.kind === 'unspecified').map(item => item.canonicalName),
    datedExhibitions: summaries.filter(item => item.period.kind === 'exhibition_date').map(item => item.canonicalName),
    physicsEnabled: false, sourcesPreserved: true,
    outputs: Object.entries(files).map(([file, content]) => ({ path: file, sha256: createHash('sha256').update(content).digest('hex'), bytes: Buffer.byteLength(content) })) };
  await mkdir(path.join(projectRoot, 'reports'), { recursive: true });
  await writeFile(path.join(projectRoot, 'reports/cosmic-catalog.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}
if (process.argv[1] === new URL(import.meta.url).pathname) console.log(JSON.stringify(await buildCosmicCatalog()));
