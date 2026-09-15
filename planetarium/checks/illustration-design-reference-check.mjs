import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { uuidVersionSeven } from '../../scripts/identifiers.mjs';

// LLM machine contract, artifact UUIDv5: e009f252-fe9c-5490-ad07-dfbdcc4e843e.
// Execution UUIDv7 is generated per run and written to the report; state: built -> parsed -> linked -> mathematically checked -> review pending.
// These gates check data structure and stated arithmetic, not historical truth or visual quality.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const datasetPath = resolve(root, 'planetarium/illustration-design-reference.jsonl');
const reportPath = resolve(root, 'planetarium/reports/illustration-design-reference-validation.json');
const uuidV5 = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const uuidV7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const issues = [];
const passed = [];
function gate(name, check) {
  try { check(); passed.push(name); }
  catch (error) { issues.push({ gate: name, message: error.message }); }
}
function requireRef(map, id, label) {
  assert.ok(typeof id === 'string' && map.has(id), `${label} does not resolve: ${String(id)}`);
}
function values(record, snake, camel) {
  const value = record[snake] ?? record[camel];
  return value == null ? [] : Array.isArray(value) ? value : [value];
}

const raw = await readFile(datasetPath, 'utf8');
const rows = raw.split(/\r?\n/).filter(line => line.trim()).map(line => JSON.parse(line));
const byType = new Map();
for (const row of rows) {
  if (!byType.has(row.record_type)) byType.set(row.record_type, []);
  byType.get(row.record_type).push(row);
}
const allById = new Map(rows.map(row => [row.record_id, row]));
const select = type => byType.get(type) ?? [];
const one = type => {
  const matches = select(type);
  assert.equal(matches.length, 1, `expected one ${type}, found ${matches.length}`);
  return matches[0];
};
const manifest = one('dataset_manifest');
const sourceRecords = [...select('source'), ...select('source_snapshot')];
const sourceIds = new Set(sourceRecords.map(row => row.record_id));
const claimIds = new Set(select('claim').map(row => row.claimIdentifier ?? row.claim_identifier ?? row.record_id));
const evidenceIds = new Set(select('evidence').map(row => row.evidenceIdentifier ?? row.evidence_identifier ?? row.record_id));
const captureIds = new Set(select('source_capture').map(row => row.captureIdentifier ?? row.capture_identifier ?? row.record_id));
const personIds = new Set(select('person').map(row => row.record_id));
const movementIds = new Set(select('movement').map(row => row.record_id));
const queryIds = new Set(select('research_query').map(row => row.record_id));
const resultIds = new Set(select('search_result').map(row => row.record_id));
const sessionIds = new Set(select('research_session').map(row => row.record_id));
const claimDefinitions = new Set(select('claim_definition').map(row => row.definition_identifier ?? row.record_id));
const evidenceById = new Map(select('evidence').map(row => [row.evidenceIdentifier ?? row.evidence_identifier ?? row.record_id, row]));
const queryById = new Map(select('research_query').map(row => [row.record_id, row]));
const resultsByQuery = new Map();
for (const row of select('search_result')) {
  if (!resultsByQuery.has(row.research_query_id)) resultsByQuery.set(row.research_query_id, []);
  resultsByQuery.get(row.research_query_id).push(row);
}

gate('jsonl_parse_and_record_ids', () => {
  assert.ok(rows.length > 0);
  assert.equal(allById.size, rows.length, 'duplicate record_id');
  for (const row of rows) {
    assert.ok(typeof row.record_type === 'string' && row.record_type.length > 0, 'missing record_type');
    assert.ok(typeof row.record_key === 'string' && row.record_key.length > 0, 'missing record_key');
    assert.ok(uuidV5.test(row.record_id) || uuidV7.test(row.record_id), `record_id is not UUIDv5/v7: ${row.record_id}`);
  }
});

gate('unique_record_keys_and_manifest_counts', () => {
  const recordKeys = rows.map(row => row.record_key);
  assert.equal(new Set(recordKeys).size, recordKeys.length, 'duplicate record_key');
  const counts = Object.fromEntries([...byType].map(([type, records]) => [type, records.length]).sort(([a], [b]) => a.localeCompare(b)));
  assert.equal(manifest.record_count_expected, rows.length);
  assert.deepEqual(manifest.record_counts_by_type, counts);
});

gate('event_uuid_versions_and_session_links', () => {
  for (const type of ['claim', 'evidence', 'source_capture', 'research_session', 'verification_result']) {
    for (const row of select(type)) assert.match(row.record_id, uuidV7, `${type} must use UUIDv7`);
  }
  for (const type of ['research_query', 'search_result']) {
    for (const row of select(type)) assert.match(row.record_id, uuidV5, `${type} must use stable UUIDv5`);
  }
  for (const row of select('research_query')) requireRef(sessionIds, row.research_session_id, 'research_query.research_session_id');
  for (const row of select('search_result')) requireRef(queryIds, row.research_query_id, 'search_result.research_query_id');
});

gate('source_claim_evidence_and_capture_links', () => {
  const sourceById = new Map(select('source').map(row => [row.sourceIdentifier ?? row.record_id, row]));
  for (const row of select('source_capture')) {
    const sourceId = row.sourceIdentifier ?? row.source_identifier;
    requireRef(sourceIds, sourceId, 'capture source');
  }
  for (const row of select('source')) {
    const captureId = row.captureIdentifier ?? row.capture_identifier;
    if (captureId) requireRef(captureIds, captureId, 'source.captureIdentifier');
  }
  for (const row of select('claim')) {
    const id = row.claimIdentifier ?? row.claim_identifier ?? row.record_id;
    assert.ok(claimIds.has(id));
    const definitionId = row.claimDefinitionIdentifier ?? row.claim_definition_identifier;
    if (definitionId) requireRef(claimDefinitions, definitionId, 'claim definition');
    const linkedEvidence = values(row, 'evidence_identifiers', 'evidenceIdentifiers');
    for (const evidenceId of linkedEvidence) requireRef(evidenceIds, evidenceId, 'claim evidence');
  }
  for (const row of select('evidence')) {
    requireRef(claimIds, row.claimIdentifier ?? row.claim_identifier, 'evidence.claimIdentifier');
    requireRef(sourceIds, row.sourceIdentifier ?? row.source_identifier, 'evidence.sourceIdentifier');
    const captureId = row.captureIdentifier ?? row.capture_identifier;
    if (captureId) requireRef(captureIds, captureId, 'evidence.captureIdentifier');
    else assert.ok(row.evidence_scope ?? row.evidenceScope, `uncaptured evidence must state its scope: ${row.record_id}`);
  }
  for (const row of select('evidence_claim')) requireRef(sourceIds, row.source_id, 'evidence_claim.source_id');
  for (const row of select('search_result')) {
    const sourceId = row.source_identifier ?? row.sourceIdentifier;
    if (sourceId) requireRef(new Set([...sourceById.keys(), ...sourceIds]), sourceId, 'search_result.source_identifier');
  }
  for (const type of ['person', 'work', 'movement', 'design_technique', 'design_principle', 'relationship']) {
    for (const row of select(type)) {
      for (const id of values(row, 'source_record_ids', 'sourceRecordIds')) requireRef(sourceIds, id, `${type}.source_record_ids`);
    }
  }
});

gate('people_movements_works_and_method_links', () => {
  const techniqueIds = new Set(select('design_technique').map(row => row.record_id));
  const axisIds = new Set(select('taxonomy_axis').map(row => row.record_id));
  const termIds = new Set(select('taxonomy_term').map(row => row.record_id));
  for (const row of select('movement')) for (const id of row.associated_person_ids ?? []) requireRef(personIds, id, 'movement.associated_person_ids');
  for (const row of select('work')) {
    for (const id of row.creator_person_ids ?? []) requireRef(personIds, id, 'work.creator_person_ids');
    for (const id of row.movement_ids ?? []) requireRef(movementIds, id, 'work.movement_ids');
    for (const id of row.supporting_claim_ids ?? []) requireRef(claimIds, id, 'work.supporting_claim_ids');
  }
  for (const row of select('person')) {
    for (const id of row.supporting_claim_ids ?? []) requireRef(claimIds, id, 'person.supporting_claim_ids');
    for (const id of row.movement_association_ids ?? []) requireRef(movementIds, id, 'person.movement_association_ids');
  }
  for (const row of select('design_technique')) {
    assert.ok((row.research_query_identifiers ?? []).length > 0, `technique has no method search: ${row.canonical_name}`);
    for (const id of row.research_query_identifiers ?? []) requireRef(queryIds, id, 'technique query');
    for (const id of row.candidate_search_result_identifiers ?? []) requireRef(resultIds, id, 'technique candidate result');
    assert.equal(row.candidate_search_result_identifiers?.length, 5, `expected five discovery candidates: ${row.canonical_name}`);
    const expected = new Set(row.candidate_search_result_identifiers);
    const linkedResults = (row.research_query_identifiers ?? []).flatMap(id => resultsByQuery.get(id) ?? []);
    assert.equal(linkedResults.length, expected.size, `candidate count does not match query rows: ${row.canonical_name}`);
    assert.ok(linkedResults.every(result => expected.has(result.record_id)), `candidate/query mismatch: ${row.canonical_name}`);
  }
  for (const row of select('design_principle')) for (const id of row.technique_ids ?? []) requireRef(techniqueIds, id, 'principle technique_ids');
  for (const row of select('taxonomy_axis')) {
    const linked = row.term_record_ids ?? [];
    assert.equal(row.term_count, linked.length, `axis term_count mismatch: ${row.axis_name}`);
    for (const id of linked) requireRef(termIds, id, 'taxonomy_axis.term_record_ids');
  }
  assert.equal(axisIds.size, 20, 'expected twenty canonical taxonomy axes');
  for (const row of select('taxonomy_term')) requireRef(axisIds, row.axis_identifier, 'taxonomy_term.axis_identifier');
});

gate('search_receipt_counts', () => {
  const sessionId = manifest.event_identifier;
  const currentSession = select('research_session').find(row => row.record_id === sessionId);
  assert.ok(currentSession, 'manifest event does not resolve to current research session');
  assert.match(sessionId, uuidV7);
  const queries = select('research_query').filter(row => row.research_session_id === sessionId);
  const results = select('search_result').filter(row => queries.some(query => query.record_id === row.research_query_id));
  assert.equal(queries.length, manifest.research_summary.search_calls);
  assert.equal(results.length, manifest.research_summary.returned_result_rows);
  assert.equal(queries.reduce((sum, query) => sum + query.requested_result_count, 0), manifest.research_summary.requested_result_slots);
  for (const query of queries) assert.equal((resultsByQuery.get(query.record_id) ?? []).length, query.returned_page_count);
  assert.equal(manifest.research_summary.page_text_fetch_successes, currentSession.unique_page_text_fetch_success_count);
  assert.equal(manifest.research_summary.page_text_fetch_failures, currentSession.fetch_failure_count);
});

gate('style_coordinates_and_distances', () => {
  const people = new Map(select('person').map(row => [row.record_id, row]));
  const formulaIds = new Set(select('formula').map(row => row.record_id));
  const verificationIds = new Set(select('verification_result').map(row => row.record_id));
  const coordinates = new Map();
  for (const row of select('style_coordinate_example')) {
    requireRef(people, row.person_identifier, 'coordinate person');
    requireRef(formulaIds, row.formula_identifier, 'coordinate formula');
    requireRef(verificationIds, row.verification_result_identifier, 'coordinate verification');
    for (const axis of ['x', 'y', 'z']) {
      const value = row.coordinates?.[axis];
      assert.ok(Number.isFinite(value) && value >= -1 && value <= 1, `coordinate out of range: ${row.person_name}.${axis}`);
    }
    coordinates.set(row.person_identifier, Object.values(row.coordinates));
  }
  assert.equal(coordinates.size, 12);
  for (const row of select('style_distance_example')) {
    assert.equal(row.person_identifiers?.length, 2);
    const [a, b] = row.person_identifiers.map(id => {
      requireRef(coordinates, id, 'distance coordinate');
      return coordinates.get(id);
    });
    const calculated = Math.sqrt(a.reduce((sum, value, index) => sum + (value - b[index]) ** 2, 0));
    assert.ok(Math.abs(calculated - row.distance_value) <= 1e-12, `distance mismatch for ${row.person_names?.join(' / ')}`);
    assert.equal(row.causal_claim, false, 'distance must not encode influence');
  }
  for (const row of select('style_query_example')) {
    for (const score of Object.values(row.axis_values ?? {})) assert.ok(Number.isFinite(score) && score >= 0 && score <= 1);
  }
});

gate('portable_recipe_and_chatgpt_adapter', () => {
  const recipe = one('prompt_recipe');
  const components = new Map(select('prompt_component').map(row => [row.record_id, row]));
  const adapters = new Map(select('generation_adapter_profile').map(row => [row.record_id, row]));
  assert.equal(recipe.generation_model, 'provider_neutral_core');
  assert.deepEqual(recipe.provider_specific_parameters, []);
  const total = recipe.components.reduce((sum, component) => sum + component.weight, 0);
  assert.ok(Math.abs(total - 1) <= 1e-12, `recipe weights sum to ${total}`);
  for (const component of recipe.components) {
    assert.ok(Number.isFinite(component.weight) && component.weight >= 0);
    const target = components.get(component.component_identifier);
    assert.ok(target, `recipe component not found: ${component.component_identifier}`);
    assert.equal(target.weight, component.weight, `component weight mismatch: ${target.canonical_name}`);
  }
  assert.deepEqual(recipe.weight_contract.all_feature_inputs_in, [0, 1]);
  assert.deepEqual(recipe.weight_contract.weighted_output_in, [0, 1]);
  assert.equal(recipe.output_style_vector_status, 'not_computable_until_component_feature_vectors_are_supplied');
  assert.equal(recipe.adapter_profile_identifiers.length, 1);
  const adapter = adapters.get(recipe.adapter_profile_identifiers[0]);
  assert.ok(adapter, 'recipe adapter profile does not resolve');
  assert.equal(adapter.adapter_key, 'chatgpt_image_generation');
  assert.deepEqual(adapter.provider_specific_parameters, []);
  assert.match(adapter.portability_status, /provider_neutral/);
  const strategy = one('dataset_manifest').generation_target_strategy;
  assert.equal(strategy.provider_specific_parameters_in_core, false);
  assert.equal(strategy.shared_recipe_core.startsWith('provider_neutral'), true);
});

gate('wolfram_scope_and_math_receipts', () => {
  const receipt = one('verification_result');
  assert.match(receipt.record_id, uuidV7);
  assert.equal(receipt.results.coordinate_difference_bound, true);
  assert.equal(receipt.results.weighted_recipe_bound, true);
  assert.equal(receipt.results.all_provided_coordinates_in_minus1_to1, true);
  assert.equal(receipt.results.provided_coordinate_count, 12);
  assert.deepEqual(receipt.results.source_aesthetic_score_range, { minimum: -1, maximum: 4 });
  assert.match(receipt.scope_limit, /raw eleven-dimensional artist score vectors were not available/);
  for (const row of select('formula')) {
    if (row.formula_name === 'user_supplied_aesthetic_score_heuristic') {
      assert.deepEqual(row.wolfram_range_result, { minimum: -1, maximum: 4 });
      assert.equal(row.normalized_output_range, null);
    }
    if (row.verification_result_identifier) requireRef(new Set([receipt.record_id]), row.verification_result_identifier, 'formula verification');
  }
});

const executionId = uuidVersionSeven();
const counts = Object.fromEntries([...byType].map(([type, records]) => [type, records.length]).sort(([a], [b]) => a.localeCompare(b)));
const report = {
  report_type: 'illustration_design_reference_validation',
  report_schema_version: '1.0.0',
  execution_identifier: executionId,
  executed_at: new Date().toISOString(),
  dataset_record_identifier: manifest.record_id,
  dataset_event_identifier: manifest.event_identifier,
  dataset_sha256: createHash('sha256').update(raw).digest('hex'),
  dataset_record_count: rows.length,
  record_counts_by_type: counts,
  result: issues.length === 0 ? 'passed' : 'failed',
  passed_gates: passed,
  failed_gates: issues,
  review_scope: {
    machine_checks_cover: ['JSONL shape', 'UUID versions', 'unique identifiers', 'referential links', 'search receipt counts', 'coordinate bounds', 'distance arithmetic', 'convex recipe weights', 'provider-neutral recipe contract'],
    human_review_pending: ['historical interpretations', 'source relevance and completeness', 'score calibration', 'generated image quality', 'accessibility in actual output'],
    numerical_limit: 'Artist raw eleven-axis input vectors were unavailable; supplied coordinates were range-checked and distances were recomputed from them.'
  }
};
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ report: reportPath, result: report.result, passedGates: passed.length, failedGates: issues }, null, 2));
if (issues.length) process.exitCode = 1;
