import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {sourceManifest} from '../scripts/source-revision.mjs';
import {evidenceDigest,languageServerReceiptMatchesSource,languageServerTargetMatchesInvocation} from '../scripts/language-server-evidence.mjs';
import {captureLanguageServerReceipt} from '../scripts/capture-language-server.mjs';

test('generated server configuration keeps the project root outside the checkout',()=>{
  const script=fileURLToPath(new URL('../scripts/capture-language-server.mjs',import.meta.url));
  const configuration=JSON.parse(execFileSync(process.execPath,[script,'--configuration'],{cwd:tmpdir(),encoding:'utf8'}));
  assert.deepEqual(configuration.mcpServers['lean-lsp'].args.slice(-2),['--lean-project-path',fileURLToPath(new URL('../',import.meta.url))]);
  assert.throws(()=>execFileSync(process.execPath,[script,'--unknown'],{cwd:tmpdir(),stdio:'pipe'}));
});

// machine contract; record_identifier=d93d88e9-8679-522b-a756-0b60472c9e5f.
// transition: clean inputs -> generated output -> same source revision; real input edits must change it.
test('source identity is unchanged by generated cosmos output but changes with source edits',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'lumenia-revision-test-'));
  try{
    for(const directory of ['formal','contracts','scripts','tests','mcp','web','reference-assets'])await mkdir(path.join(root,directory));
    for(const file of ['intent.md','spec.md','CONSTRAINTS.md','lean-toolchain','lakefile.toml','lake-manifest.json','package.json','package-lock.json','eslint.config.mjs'])await writeFile(path.join(root,file),'fixture');
    await mkdir(path.join(root,'planetarium/lib'),{recursive:true});
    for(const file of ['reference-physics-contract.mjs','threejs-reference-adapter.mjs'])
      await writeFile(path.join(root,'planetarium/lib',file),'fixture');
    const before=await sourceManifest(root);
    await mkdir(path.join(root,'web/public/cosmos/interactive'),{recursive:true});
    await writeFile(path.join(root,'web/public/cosmos/interactive/main.mjs'),'generated output');
    assert.deepEqual(await sourceManifest(root),before);
    await writeFile(path.join(root,'reference-assets/reference.json'),'new source');
    assert.notEqual((await sourceManifest(root)).sourceRevision,before.sourceRevision);
    for(const file of ['reference-physics-contract.mjs','threejs-reference-adapter.mjs']){
      const beforeSharedEdit=await sourceManifest(root);
      await writeFile(path.join(root,'planetarium/lib',file),'changed shared implementation');
      assert.notEqual((await sourceManifest(root)).sourceRevision,beforeSharedEdit.sourceRevision);
    }
  }finally{await rm(root,{recursive:true,force:true});}
});

// machine contract; record_identifier=6c667a72-10c8-5ab2-9f23-fd0cc9a72a1a.
// transition: complete audit scope -> generated planetarium report -> source edit.
test('complete audit identity includes planetarium source but excludes its reports',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'lumenia-audit-revision-test-'));
  try{
    for(const directory of ['formal','contracts','scripts','tests','mcp','web','reference-assets','planetarium'])await mkdir(path.join(root,directory));
    for(const file of ['intent.md','spec.md','CONSTRAINTS.md','lean-toolchain','lakefile.toml','lake-manifest.json','package.json','package-lock.json','eslint.config.mjs'])await writeFile(path.join(root,file),'fixture');
    const before=await sourceManifest(root,{includePlanetarium:true});
    await mkdir(path.join(root,'planetarium/reports'),{recursive:true});
    await writeFile(path.join(root,'planetarium/reports/lean-kernel.json'),'generated report');
    assert.deepEqual(await sourceManifest(root,{includePlanetarium:true}),before);
    await writeFile(path.join(root,'planetarium/intent.md'),'changed source');
    assert.notEqual((await sourceManifest(root,{includePlanetarium:true})).sourceRevision,before.sourceRevision);
  }finally{await rm(root,{recursive:true,force:true});}
});

// machine contract; record_identifier=5c51405c-2fe3-5546-8621-278af8174a55.
// These synthetic JSON fixtures test integrity only; the formal gate always calls the actual server.
test('receipt integrity rejects changed files, relabelled requests and missing proof targets',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'lumenia-lsp-binding-test-'));
  try{
    await mkdir(path.join(root,'formal'),{recursive:true});
    const proofSource='theorem Proof : True := by trivial\n';
    await writeFile(path.join(root,'formal/Proof.lean'),proofSource);
    const files=[{path:'formal/Proof.lean',sha256:createHash('sha256').update(proofSource).digest('hex')}];
    const manifest={sourceRevision:'sha256:fixture',files}, oldRoot='/unavailable/creator/checkout';
    const checks=[{tool:'lean_verify',target:'Lumenia.Proof',sequence:0,
      invocationIdentifier:'01a0aa00-0000-7000-8000-000000000002',
      arguments:{file_path:oldRoot+'/formal/Proof.lean',theorem_name:'Lumenia.Proof'},
      response:{structuredContent:{axioms:[],warnings:[]}},sourceFileBinding:files[0],
      startedAt:'2026-09-16T00:00:00Z',completedAt:'2026-09-16T00:00:01Z'}];
    const receipt={...manifest,executionIdentifier:'01a0aa00-0000-7000-8000-000000000001',sourceRoot:oldRoot,
      sourceRevisionBefore:manifest.sourceRevision,sourceRevisionAfter:manifest.sourceRevision,checks,
      startedAt:checks[0].startedAt,recordedAt:checks[0].completedAt,
      capture:{format:'lean-lsp-capture/v2',origin:'local-stdio-process',serverPackage:'lean-lsp-mcp==0.27.0',
        checkCount:1,checksDigest:evidenceDigest(checks)}};
    assert.equal(languageServerReceiptMatchesSource(receipt,manifest,root),true);
    for(const mutation of [
      value=>{value.sourceRevisionBefore='old';},value=>{value.sourceRevisionAfter='old';},
      value=>{value.sourceRevision='old';},value=>{value.files=[];},
      value=>{value.capture.origin='callback';},value=>{value.checks[0].response.structuredContent.axioms=['propext'];},
      value=>{value.checks[0].arguments={};},value=>{value.checks[0].arguments.theorem_name='Lumenia.Other';},
      value=>{value.checks[0].arguments.file_path='/outside/Proof.lean';},
      value=>{value.checks[0].sourceFileBinding.path='../outside.lean';},
      value=>{value.checks[0].sequence=1;},value=>{value.checks[0].completedAt='2026-09-17T00:00:00Z';},
    ]){
      const changed=structuredClone(receipt); mutation(changed);
      assert.equal(languageServerReceiptMatchesSource(changed,manifest,root),false);
    }
    for(const args of [{}, {theorem_name:''}, {theorem_name:'Lumenia.Other'}])
      assert.equal(languageServerTargetMatchesInvocation({tool:'lean_verify',target:'Lumenia.Proof',arguments:args}),false);
    for(const mutation of [
      value=>{value.checks[0].arguments.theorem_name=undefined;},
      value=>{value.checks[0].arguments.theorem_name='Lumenia.Other';},
      value=>{value.checks[0].arguments.file_path='/outside/Proof.lean';},
      value=>{value.checks[0]=null;},
    ]){
      const changed=structuredClone(receipt); mutation(changed);
      changed.capture.checksDigest=evidenceDigest(changed.checks);
      assert.equal(languageServerReceiptMatchesSource(changed,manifest,root),false);
    }
    // Even a syntactically valid fixture cannot be supplied to the live capture API.
    await assert.rejects(captureLanguageServerReceipt(receipt),/no supplied/);
    await assert.rejects(captureLanguageServerReceipt(async()=>checks[0].response),/no supplied/);
    await writeFile(path.join(root,'formal/Proof.lean'),'changed\n');
    assert.equal(languageServerReceiptMatchesSource(receipt,manifest,root),false);
  }finally{await rm(root,{recursive:true,force:true});}
});
