import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { projectRoot, sourceManifest } from './source-revision.mjs';
import { uuidVersionSeven } from './identifiers.mjs';
import { cosmicCatalog } from '../web/artwork/cosmic-catalog.generated.mjs';
import { cosmicRecipes } from '../web/artwork/cosmic-recipes.generated.mjs';
import { gzipSync } from 'node:zlib';
import { languageServerCheckSucceeded } from './language-server-evidence.mjs';

// llm machine contract; claim UUIDv5: 796d5e27-8862-52a6-a331-776d0066b23b
// execution UUIDv7 generated below; transition: pinned inputs + real proof outputs -> exact scoped receipt.
const contract = JSON.parse(await readFile(path.join(projectRoot, 'contracts/cosmic-exhibition.json'), 'utf8'));
const revision = await sourceManifest(), executionIdentifier = uuidVersionSeven();
const commands = [];
function run(command, args) {
  const result = spawnSync(command, args, { cwd: projectRoot, encoding: 'utf8', timeout: 60000, maxBuffer: 8000000 });
  commands.push({ command: [command, ...args], exitCode: result.status, stdout: result.stdout, stderr: result.stderr });
  assert.equal(result.status, 0, result.stderr + result.stdout);
  return result;
}
run(process.execPath, ['--test', 'tests/cosmic-exhibition.test.mjs', 'tests/threejs-reference-adapter.test.mjs']);
run('lake', ['build', 'Lumenia.CosmicExhibition']);
const audit = run('lake', ['env', 'lean', 'formal/Lumenia/CosmicExhibitionAudit.lean']);
for (const declaration of contract.declarations) assert.ok(audit.stdout.includes(`'${declaration.name}' does not depend on any axioms`));
assert.ok(!audit.stdout.includes('depends on axioms:'));
const language = JSON.parse(await readFile(path.join(projectRoot, 'reports/cosmic-lean-language-server.json'), 'utf8'));
assert.equal(language.sourceDigest, createHash('sha256').update(await readFile(path.join(projectRoot, language.sourceFile))).digest('hex'));
for (const record of language.records) assert.ok(languageServerCheckSucceeded({ tool: record.tool, target: record.input.theorem_name ?? 'overlap_is_symmetric', arguments: record.input, response: record.result }), record.tool);
for (const declaration of contract.declarations) assert.ok(language.records.some(record => record.tool === 'lean_verify' && record.input.theorem_name === declaration.name));
assert.equal(cosmicCatalog.length, contract.requiredPeople);
assert.equal(cosmicRecipes.filter(recipe => recipe.semantic_position).length, contract.requiredSemanticCoordinates);
assert.ok(cosmicRecipes.every(recipe => recipe.physics.enabled === false));
const catalogueBytes = gzipSync(await readFile(path.join(projectRoot, 'web/artwork/cosmic-catalog.generated.mjs'))).length;
assert.ok(catalogueBytes <= contract.maximumCatalogCompressedBytes);
const after = await sourceManifest(); assert.equal(after.sourceRevision, revision.sourceRevision);
const receipt = { executionIdentifier, recordedAt: new Date().toISOString(), sourceRevision: revision.sourceRevision,
  status: 'pass', people: cosmicCatalog.length, semanticCoordinates: 12, physicsEnabled: false,
  testedExamples: 15, verifiedTheorems: contract.declarations.length, transitiveAxiomCount: 0,
  catalogCompressedBytes: catalogueBytes, proofScope: contract.proofScope,
  browserRendering: 'not_measured_in_this_receipt', browserPerformance: 'not_measured', commands };
await writeFile(path.join(projectRoot, 'reports/cosmic-verification.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ status: receipt.status, testedExamples: receipt.testedExamples, verifiedTheorems: receipt.verifiedTheorems, catalogCompressedBytes: catalogueBytes }));
