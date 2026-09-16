import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {sourceManifest} from '../scripts/source-revision.mjs';
import {createLanguageServerMcpTransport,captureLanguageServerCheck,captureLanguageServerReceipt,languageServerReceiptMatchesSource,languageServerTargetMatchesInvocation} from '../scripts/language-server-evidence.mjs';

// machine contract; record_identifier=d93d88e9-8679-522b-a756-0b60472c9e5f.
// transition: clean inputs -> generated output -> same source revision; real input edits must change it.
test('source identity is unchanged by generated cosmos output but changes with source edits',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'lumenia-revision-test-'));
  try{
    for(const directory of ['formal','contracts','scripts','tests','mcp','web','reference-assets'])await mkdir(path.join(root,directory));
    for(const file of ['intent.md','spec.md','CONSTRAINTS.md','lean-toolchain','lakefile.toml','lake-manifest.json','package.json','package-lock.json','eslint.config.mjs'])await writeFile(path.join(root,file),'fixture');
    const before=await sourceManifest(root);
    await mkdir(path.join(root,'web/public/cosmos/interactive'),{recursive:true});
    await writeFile(path.join(root,'web/public/cosmos/interactive/main.mjs'),'generated output');
    assert.deepEqual(await sourceManifest(root),before);
    await writeFile(path.join(root,'reference-assets/reference.json'),'new source');
    assert.notEqual((await sourceManifest(root)).sourceRevision,before.sourceRevision);
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
// transition: earlier receipt -> attempted rebinding -> rejection; complete fresh capture -> acceptance.
test('freshness validation rejects relabelled, incomplete and changed input receipts',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'lumenia-lsp-binding-test-'));
  try{
    await mkdir(path.join(root,'formal'),{recursive:true});
    const proofSource='theorem Proof : True := by trivial\n';
    await writeFile(path.join(root,'formal/Proof.lean'),proofSource);
    const proofDigest=createHash('sha256').update(proofSource).digest('hex');
    const manifestBefore={sourceRevision:'sha256:current',files:[{path:'formal/Proof.lean',sha256:proofDigest}]};
    const manifestAfter={sourceRevision:'sha256:current',files:[{path:'formal/Proof.lean',sha256:proofDigest}]};
    const executionIdentifier='01a0aa00-0000-7000-8000-000000000001';
    const transport=createLanguageServerMcpTransport(async request=>({challenge:request.challenge,
      response:{structuredContent:{axioms:[],warnings:[]},isError:false}}));
    const check=await captureLanguageServerCheck({executionIdentifier,sourceRevision:manifestBefore.sourceRevision,sequence:0,
      tool:'lean_verify',target:'Lumenia.Proof',arguments:{file_path:path.join(root,'formal/Proof.lean'),theorem_name:'Lumenia.Proof',scan_source:true},transport});
    const fresh=captureLanguageServerReceipt({manifestBefore,manifestAfter,executionIdentifier,checks:[check],
      sourceRoot:root,startedAt:'2026-09-16T00:00:00.000Z',recordedAt:'2026-09-16T00:00:01.000Z'});
    assert.deepEqual(fresh.checks[0].sourceFileBinding,{path:'formal/Proof.lean',sha256:proofDigest});
    assert.equal(languageServerReceiptMatchesSource(fresh,manifestAfter,root),true);
    for(const overrides of [
      {sourceRevisionBefore:'sha256:old'}, {sourceRevisionAfter:'sha256:old'},
      {checkStartedAtSourceRevision:'sha256:old'}, {sourceRevisionBefore:undefined},
      {files:[]}, {files:[{path:'formal/Proof.lean',sha256:'old'}]},
      {bindingHistory:[{verifiedInputsUnchanged:true}]}, {capture:{...fresh.capture,sourceRevision:'sha256:old'}},
      {executionIdentifier:'01a0aa00-0000-7000-8000-000000000002'},
    ])assert.equal(languageServerReceiptMatchesSource({...fresh,...overrides},manifestAfter,root),false);
    const altered=structuredClone(fresh); altered.checks[0].response.structuredContent.axioms=['propext'];
    assert.equal(languageServerReceiptMatchesSource(altered,manifestAfter,root),false);
    const missingTransport=structuredClone(fresh); delete missingTransport.checks[0].captureProof.transportIdentifier;
    assert.equal(languageServerReceiptMatchesSource(missingTransport,manifestAfter,root),false);
    const alteredChallenge=structuredClone(fresh); alteredChallenge.checks[0].captureProof.challenge=executionIdentifier;
    assert.equal(languageServerReceiptMatchesSource(alteredChallenge,manifestAfter,root),false);
    const missingBinding=structuredClone(fresh); delete missingBinding.checks[0].sourceFileBinding;
    assert.equal(languageServerReceiptMatchesSource(missingBinding,manifestAfter,root),false);
    const alteredTarget=structuredClone(fresh); alteredTarget.checks[0].target='Lumenia.Other';
    assert.equal(languageServerReceiptMatchesSource(alteredTarget,manifestAfter,root),false);
    assert.equal(languageServerTargetMatchesInvocation({tool:'lean_verify',target:'Lumenia.Proof',arguments:{theorem_name:'Lumenia.Other'}}),false);
    const sameManifest=structuredClone(manifestBefore);
    assert.throws(() => captureLanguageServerReceipt({manifestBefore:sameManifest,manifestAfter:sameManifest,executionIdentifier,checks:[check],sourceRoot:root}));
    const changedManifest={sourceRevision:'sha256:changed',files:manifestAfter.files};
    assert.throws(() => captureLanguageServerReceipt({manifestBefore,manifestAfter:changedManifest,executionIdentifier,checks:[check],sourceRoot:root}));
    await assert.rejects(() => captureLanguageServerCheck({executionIdentifier,sourceRevision:manifestBefore.sourceRevision,sequence:0,
      tool:'lean_verify',target:'Lumenia.Proof',transport:createLanguageServerMcpTransport(async()=>({
        response:{structuredContent:{axioms:[],warnings:[]},isError:false},challenge:'cached'}))}));
    const reordered=structuredClone(fresh); reordered.checks[0].captureProof.sequence=1;
    assert.equal(languageServerReceiptMatchesSource(reordered,manifestAfter,root),false);
    const changedCheck=await captureLanguageServerCheck({executionIdentifier,sourceRevision:manifestBefore.sourceRevision,sequence:0,
      tool:'lean_verify',target:'Lumenia.Proof',arguments:{file_path:path.join(root,'formal/Proof.lean'),theorem_name:'Lumenia.Proof'},transport});
    await writeFile(path.join(root,'formal/Proof.lean'),'tampered source\n');
    assert.throws(() => captureLanguageServerReceipt({manifestBefore,manifestAfter,executionIdentifier,checks:[changedCheck],sourceRoot:root}));
  }finally{await rm(root,{recursive:true,force:true});}
});
