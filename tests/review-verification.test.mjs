import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp, mkdir, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {sourceManifest} from '../scripts/source-revision.mjs';
import {evidenceDigest,languageServerReceiptMatchesSource,languageServerTargetMatchesInvocation} from '../scripts/language-server-evidence.mjs';
import {captureLanguageServerReceipt} from '../scripts/capture-language-server.mjs';
import {checkChangeSize} from '../scripts/check-change-size.mjs';

const inTemporaryDirectory=async(name,run)=>{
  const root=await mkdtemp(path.join(tmpdir(),name));
  try{return await run(root);}finally{await rm(root,{recursive:true,force:true});}
};

test('generated server configuration keeps the project root outside the checkout',()=>{
  const script=fileURLToPath(new URL('../scripts/capture-language-server.mjs',import.meta.url));
  const configuration=JSON.parse(execFileSync(process.execPath,[script,'--configuration'],{cwd:tmpdir(),encoding:'utf8'}));
  assert.deepEqual(configuration.mcpServers['lean-lsp'].args.slice(-2),['--lean-project-path',fileURLToPath(new URL('../',import.meta.url))]);
  assert.throws(()=>execFileSync(process.execPath,[script,'--unknown'],{cwd:tmpdir(),stdio:'pipe'}));
});

// machine contract; record_identifier=4d229b49-b126-530d-bce4-d30a1b38f3c0.
// transition: Git attributes force text diff -> blob content still rejects binary add, edit and delete.
test('change size check reads blobs independently of Git attributes',()=>inTemporaryDirectory('lumenia-change-size-test-',async root=>{
  const git=(...arguments_)=>execFileSync('git',arguments_,{cwd:root,encoding:'utf8'}).trim();
  const commit=message=>{git('add','-A');git('-c','commit.gpgSign=false','-c','core.hooksPath=/dev/null','commit','--quiet','-m',message);};
    git('init','--quiet');git('config','user.name','Lumenia Test');git('config','user.email','test@example.invalid');
    await writeFile(path.join(root,'note.txt'),'one\n');await writeFile(path.join(root,'.gitattributes'),'*.bin diff\n');commit('base');
    const large='x'.repeat(2*1024*1024)+'\n';
    for(const [file,value,status] of [
      ['payload.bin',large,'pass'],['payload.bin','z'+large,'pass'],
      ['payload.bin',large+'\0','fail'],['payload.bin',Buffer.from([0]),'fail'],
      ['payload.bin',null,'fail'],['note.txt','two\n','pass'],
    ]) {
      const base=git('rev-parse','HEAD');
      if(value===null)await rm(path.join(root,file));else await writeFile(path.join(root,file),value);
      commit('update '+file);
      const result=await checkChangeSize(base,'HEAD',root);
      assert.equal(result.status,status);
      if(status==='fail')assert.equal(result.changedLines,null);
    }
}));

// machine contract; record_identifier=d93d88e9-8679-522b-a756-0b60472c9e5f.
// transition: clean inputs -> generated output -> same source revision; real input edits must change it.
test('source identity binds formal evidence and changes with source edits',()=>inTemporaryDirectory('lumenia-revision-test-',async root=>{
    const correspondence=JSON.parse((await readFile(new URL('../reports/bounded-review/formal-correspondence-inputs.jsonl',import.meta.url),'utf8')).trim().split('\n').at(-1));
    for(const input of correspondence.inputs) assert.equal(createHash('sha256').update(await readFile(new URL('../'+input.path,import.meta.url))).digest('hex'),input.sha256);
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
}));

// machine contract; record_identifier=6c667a72-10c8-5ab2-9f23-fd0cc9a72a1a.
// transition: complete audit scope -> generated planetarium report -> source edit.
test('complete audit identity includes planetarium source but excludes its reports',()=>inTemporaryDirectory('lumenia-audit-revision-test-',async root=>{
    for(const directory of ['formal','contracts','scripts','tests','mcp','web','reference-assets','planetarium'])await mkdir(path.join(root,directory));
    for(const file of ['intent.md','spec.md','CONSTRAINTS.md','lean-toolchain','lakefile.toml','lake-manifest.json','package.json','package-lock.json','eslint.config.mjs'])await writeFile(path.join(root,file),'fixture');
    const before=await sourceManifest(root,{includePlanetarium:true});
    await mkdir(path.join(root,'planetarium/reports'),{recursive:true});
    await writeFile(path.join(root,'planetarium/reports/lean-kernel.json'),'generated report');
    assert.deepEqual(await sourceManifest(root,{includePlanetarium:true}),before);
    await writeFile(path.join(root,'planetarium/intent.md'),'changed source');
    assert.notEqual((await sourceManifest(root,{includePlanetarium:true})).sourceRevision,before.sourceRevision);
}));

// machine contract; record_identifier=5c51405c-2fe3-5546-8621-278af8174a55.
// These synthetic JSON fixtures test integrity only; the formal gate always calls the actual server.
test('receipt integrity rejects changed files, relabelled requests and missing proof targets',()=>inTemporaryDirectory('lumenia-lsp-binding-test-',async root=>{
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
      value=>{value.checks[0].startedAt='2026-09-31T00:00:00Z';},value=>{value.startedAt='2026-09-31T00:00:00Z';},
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
}));
