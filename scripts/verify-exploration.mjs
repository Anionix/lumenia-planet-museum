import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot} from './source-revision.mjs';
import {uuidVersionSeven,claimIdentifier} from './identifiers.mjs';
import {limits,ringClearance} from '../reference-assets/artist-cosmos/explore/navigation.mjs';

// llm machine contract; UUIDv5: be15d308-d6c7-5b93-aca4-32206c14ac81.
// transition: exact sources -> axiom audit and actual physics -> bound receipt.
const directory='reference-assets/artist-cosmos/explore/';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=relative=>readFile(path.join(projectRoot,relative));
const json=async relative=>JSON.parse(await read(relative));
const catalog=await json(directory+'worlds.json');
const reference=await json('reference-assets/artist-cosmos/interactive/exhibition.json');
assert.equal(catalog.physicsEnabledByDefault,false);
const inputs=[];
for(const entry of catalog.worlds){
  const file=directory+entry.file.replace('./','');const bytes=await read(file);assert.equal(digest(bytes),entry.sha256);
  const world=JSON.parse(bytes), original=reference.items.find(item=>item.artist_name===world.artistName);
  assert.ok(original);assert.equal(world.recordIdentifier,claimIdentifier('exploration/'+entry.slug));
  assert.deepEqual(world.semanticPosition,original.semantic_position);assert.deepEqual(world.sources,original.sources);
  assert.equal(world.sourceImageSha256,original.image_sha256);assert.equal(world.machineContract.physicsEnabledByDefault,false);
  assert.deepEqual(world.machineContract.movementLimits,limits);assert.ok(ringClearance(world.passage.radius,world.passage.tube)>0);
  assert.ok(world.shapes.length<=300);assert.equal(new Set(world.shapes.map(shape=>shape.recordIdentifier)).size,world.shapes.length);
  inputs.push({path:file,sha256:digest(bytes)});
}
if(catalog.worlds.length===15){
  const known=await Promise.all(catalog.worlds.map(async entry=>(await json(directory+entry.file.replace('./',''))).semanticPosition!==null));
  assert.equal(known.filter(Boolean).length,12);
}
const proofFile=directory+'verification/Exploration.lean';const proof=(await read(proofFile)).toString();
const declarations=[...proof.matchAll(/^theorem (\w+)/gm)].map(match=>'LumeniaExploration.'+match[1]);
assert.equal(declarations.length,10);assert.ok(!/\b(sorry|axiom|native_decide|unsafe)\b/.test(proof));
const lean=spawnSync('lake',['env','lean','Exploration.lean'],{cwd:path.join(projectRoot,directory,'verification'),encoding:'utf8',timeout:60000});
assert.equal(lean.status,0,lean.stdout+lean.stderr);assert.ok(!/warning:|error:/.test(lean.stdout+lean.stderr));
for(const name of declarations)assert.ok(lean.stdout.includes(`'${name}' does not depend on any axioms`));
const language=await json('reports/exploration-lean-language-server.json');
for(const file of language.inputs)assert.equal(digest(await read(file.path)),file.sha256,'Language-server proof input changed');
assert.deepEqual(language.checks.map(check=>'LumeniaExploration.'+check.name).sort(),declarations.toSorted());
for(const check of language.checks){assert.deepEqual(check.result.axioms,[]);assert.deepEqual(check.result.warnings,[]);}
const wolfram=await json('reports/exploration-wolfram.json');
assert.equal(digest(wolfram.evaluatedCode),wolfram.evaluatedCodeSha256);
for(const file of wolfram.inputs)assert.equal(digest(await read(file.path)),file.sha256,'Wolfram input changed');
for(const name of ['rotation_preserves_length','bounded_elapsed','bounded_displacement','normalized_diagonal','coordinate_clamp','ring_passage_positive'])assert.equal(wolfram.result[name],true);
assert.equal(wolfram.result.ring_clearance_metres,2.05);assert.ok(Math.abs(wolfram.result.render_interval_seconds-1/limits.framesPerSecond)<1e-15);
const tests=spawnSync(process.execPath,['--test','tests/exploration.test.mjs'],{cwd:projectRoot,encoding:'utf8',timeout:60000});assert.equal(tests.status,0,tests.stdout+tests.stderr);
for(const file of ['main.mjs','navigation.mjs','geometry.mjs','collision.mjs','index.html','style.css','verification/Exploration.lean'])inputs.push({path:directory+file,sha256:digest(await read(directory+file))});
const report={recordIdentifier:'be15d308-d6c7-5b93-aca4-32206c14ac81',executionIdentifier:uuidVersionSeven(),recordedAt:new Date().toISOString(),status:'pass',worldCount:catalog.worlds.length,
  theoremCount:declarations.length,axiomDependencies:[],wolframConditions:6,inputs,leanOutput:lean.stdout,actualRuntimeTests:tests.stdout,
  scope:'Constructive integer model, real-valued Wolfram calculations, exact reference data, and actual Rapier checks. Browser evidence and publication are separate receipts.'};
await writeFile(path.join(projectRoot,'reports/exploration-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,worlds:report.worldCount,theorems:report.theoremCount,axioms:[],wolframConditions:6}));
