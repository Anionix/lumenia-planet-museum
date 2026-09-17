import assert from 'node:assert/strict';
import {readFile, writeFile, mkdir, mkdtemp, readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {sourceManifest,projectRoot} from './source-revision.mjs';
import {claimIdentifier,uuidVersionSeven} from './identifiers.mjs';

// machine contract: original source bytes -> appended observation commands -> kernel result.
// Copies are temporary. Private helper theorems are checked in their original file scope.
// This audits every explicit project theorem, including helpers; it does not certify the browser.
const projects=[
 {directory:'.',sources:'formal'},
 {directory:'planetarium',sources:'formal'},
 {directory:'reference-assets/artist-cosmos/interactive/verification',sources:'.'},
 {directory:'reference-assets/artist-cosmos/explore/verification',sources:'.'},
];
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const executionIdentifier=uuidVersionSeven();
// machine contract; the kernel audit covers a second project. Its complete source
// identity must participate in the before/after check even when generated reports change.
const before=await sourceManifest(projectRoot,{includePlanetarium:true});
const temporary=await mkdtemp(path.join(tmpdir(),'lumenia-kernel-audit-'));
const inputs=[],declarations=[],runs=[];
async function visit(directory){const files=[];for(const entry of await readdir(directory,{withFileTypes:true})){if(['.lake','node_modules'].includes(entry.name))continue;const file=path.join(directory,entry.name);if(entry.isDirectory())files.push(...await visit(file));else if(entry.name.endsWith('.lean'))files.push(file);}return files.sort();}
function run(cwd,args){const result=spawnSync('lake',args,{cwd,encoding:'utf8',timeout:60000,maxBuffer:8*1024*1024});return {command:['lake',...args],exitCode:result.status,stdout:result.stdout??'',stderr:result.stderr??'',error:result.error?.message??null};}
for(const project of projects){
 const directory=path.join(projectRoot,project.directory),build=run(directory,['build']);runs.push({project:project.directory,...build});assert.equal(build.exitCode,0,build.stderr);
 for(const file of await visit(path.join(directory,project.sources))){
  const source=await readFile(file,'utf8'),relative=path.relative(projectRoot,file);inputs.push({path:relative,sha256:digest(source)});
  const namespaces=[];const targets=[];
  for(const [index,line] of source.split('\n').entries()){
   const start=line.match(/^namespace\s+(\S+)/);if(start)namespaces.push(start[1]);
   const end=line.match(/^end(?:\s|$)/);if(end)namespaces.pop();
   const target=line.match(/^(private\s+)?theorem\s+([A-Za-z_][A-Za-z_0-9]*)/);
   if(target)targets.push({name:[...namespaces,target[2]].join('.'),private:Boolean(target[1]),line:index+1});
  }
  if(!targets.length)continue;
  const copy=path.join(temporary,relative.replaceAll('/','_'));
  await writeFile(copy,source+'\n'+targets.map(item=>'#print axioms '+item.name).join('\n')+'\n');
  const result=run(directory,['env','lean',copy]);runs.push({project:project.directory,source:relative,...result});assert.equal(result.exitCode,0,relative+'\n'+result.stdout+result.stderr);
  const printed=[...result.stdout.matchAll(/'([^']+)' (does not depend on any axioms|depends on axioms: \[([^\]]*)\])/g)].map(match=>({name:match[1],axioms:match[3]?match[3].split(',').map(x=>x.trim()):[]}));
  for(const target of targets){const observation=printed.find(item=>item.name===target.name||item.name.endsWith('.'+target.name));assert.ok(observation,'Missing audit: '+target.name);assert.deepEqual(observation.axioms,[],target.name);declarations.push({...target,path:relative,recordIdentifier:claimIdentifier(target.name),axioms:observation.axioms});}
 }
 for(const name of ['lean-toolchain','lakefile.toml','lake-manifest.json']){const file=path.join(directory,name);try{inputs.push({path:path.relative(projectRoot,file),sha256:digest(await readFile(file))});}catch(error){if(error.code!=='ENOENT')throw error;}}
}
const rootAfter=await sourceManifest();
const after=await sourceManifest(projectRoot,{includePlanetarium:true});
assert.equal(after.sourceRevision,before.sourceRevision,'Audited inputs changed during kernel audit');
const report={recordIdentifier:claimIdentifier('review-audit/lean-kernel'),executionIdentifier,recordedAt:new Date().toISOString(),sourceRevision:after.sourceRevision,rootSourceRevision:rootAfter.sourceRevision,status:'pass',theoremCount:declarations.length,privateHelperCount:declarations.filter(x=>x.private).length,axioms:[],inputs,declarations,runs};
await mkdir(path.join(projectRoot,'reports/review-audit'),{recursive:true});
await writeFile(path.join(projectRoot,'reports/review-audit/lean-kernel.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,theorems:report.theoremCount,privateHelpers:report.privateHelperCount,axioms:[]}));
