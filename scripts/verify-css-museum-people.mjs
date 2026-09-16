import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { transformSource, resolvePropertyPolicy } from '@plumeria/utils';
import { compileCSS } from '@plumeria/compiler';
import { transformSync } from '@swc/core';
import { cssMuseumPeople } from '../web/artwork/css-museum-people.mjs';
import { characterAnimations, characterFrameSchedule } from '../web/artwork/museum-character.mjs';
import { uuidVersionSeven, claimIdentifier } from './identifiers.mjs';
// llm machine contract; UUIDv5 derived from Lumenia.CssMuseumPeople; fresh UUIDv7 per run.
// transition: authored CSS -> independently sampled poses -> actual alpha bounds and motion observations.
const root=path.resolve(new URL('../',import.meta.url).pathname), directory=path.join(root,'web/components');
const output=path.resolve(process.argv[2]??'artifacts/css-museum-people');fs.mkdirSync(output,{recursive:true});
const require=createRequire(import.meta.url), Module=require('node:module'), React=require('react'), server=require('react-dom/server'), sharp=require('sharp');
const playwright=require(process.env.MUSEUM_PLAYWRIGHT_MODULE??'playwright');
const css=compileCSS({include:['CssArtistCharacter.tsx','CssArtistCharacter.styles.ts','CssMuseumCharacter.tsx','CssMuseumCharacter.styles.ts'],cwd:directory,styleProp:'classStyle'});
for(const extension of ['.ts','.tsx']) Module._extensions[extension]=(module,file)=>module._compile(transformSync(fs.readFileSync(file,'utf8'),{filename:file,jsc:{parser:{syntax:'typescript',tsx:file.endsWith('.tsx')},target:'es2022',transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}}).code,file);
async function component(name){
 const file=path.join(directory,name+'.tsx');const source=fs.readFileSync(file,'utf8');
 const transformed=await transformSource({source,moduleId:file,filePath:file,root:directory,styleProp:'classStyle',propertyPolicy:resolvePropertyPolicy({}),isDev:false,collectOndemandSheets:true,addDependency:()=>{}});
 const compiled=transformSync(transformed.code,{filename:file,jsc:{parser:{syntax:'typescript',tsx:true},target:'es2022',transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}}).code;
 const module=new Module(file,null);module.filename=file;module.paths=[path.join(root,'node_modules'),...Module._nodeModulePaths(directory)];module._compile(compiled,file);return module.exports.default;
}
const Morris=await component('CssMuseumCharacter'), Artist=await component('CssArtistCharacter');
const render=(person,props)=>server.renderToStaticMarkup(React.createElement(person.slug==='william-morris'?Morris:Artist,{personSlug:person.slug,...props}));
const browser=await playwright.chromium.launch({headless:true});const results=[], errors=[];
try {
 const page=await browser.newPage({viewport:{width:192,height:208},deviceScaleFactor:1});
 for(const person of cssMuseumPeople){
  const poses=[],samples=[];
  for(const state of Object.keys(characterAnimations)){
   const schedule=characterFrameSchedule(state);for(const phase of [0,.25,.5,.75])samples.push({state,sampledTimeMilliseconds:schedule.durationMilliseconds*phase});
  }
  for(let lookDirection=0;lookDirection<16;lookDirection++)samples.push({state:'idle',lookDirection,sampledTimeMilliseconds:0});
  for(const props of samples){
   await page.setContent('<style>html,body{margin:0;background:transparent;overflow:hidden}'+css+'</style>'+render(person,{...props,paused:true}));
   const states=await page.evaluate(()=>document.getAnimations().map(animation=>animation.playState));
   const png=await page.screenshot({omitBackground:true});const image=await sharp(png).ensureAlpha().raw().toBuffer();let left=192,top=208,right=0,bottom=0,pixels=0;
   for(let y=0;y<208;y++)for(let x=0;x<192;x++)if(image[(y*192+x)*4+3]>8){pixels++;left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
   const valid=states.every(state=>state==='paused')&&pixels>1200&&left>=4&&top>=4&&right<=188&&bottom<=204;
   if(!valid)errors.push({slug:person.slug,...props,bounds:{left,top,right,bottom},pixels,states});
   poses.push({...props,bounds:{left,top,right,bottom},pixels,sha256:crypto.createHash('sha256').update(png).digest('hex')});
   if(props.state==='idle'&&props.sampledTimeMilliseconds===0&&props.lookDirection===undefined)fs.writeFileSync(path.join(output,person.slug+'.png'),png);
  }
  results.push({slug:person.slug,appearanceIdentifier:person.appearanceIdentifier,poseCount:poses.length,poses});
 }
 // Measure live CSS clocks, explicit stop, and the device motion preference on the same rendered artwork.
 await page.setContent('<style>'+css+'</style>'+cssMuseumPeople.map(person=>render(person,{state:'waving'})).join(''));
 const clock=()=>page.evaluate(()=>document.getAnimations().map(a=>({time:a.currentTime,state:a.playState})));
 const before=await clock();await page.waitForTimeout(140);const after=await clock();const advancing=after.length>0&&after.every((a,i)=>a.state==='running'&&a.time>before[i].time);
 await page.evaluate(()=>document.querySelectorAll('[data-css-museum-character]').forEach(e=>e.style.setProperty('--character-play','paused')));await page.waitForTimeout(30);const stopped=await clock();await page.waitForTimeout(100);const held=await clock();const paused=held.every((a,i)=>a.state==='paused'&&a.time===stopped[i].time);
 await page.emulateMedia({reducedMotion:'reduce'});const reducedMotion=(await clock()).length===0;
 if(!advancing||!paused||!reducedMotion)errors.push({motion:{advancing,paused,reducedMotion}});
 const markup=cssMuseumPeople.map(person=>`<figure>${render(person,{state:'idle',paused:true,sampledTimeMilliseconds:0})}<figcaption>${person.name}</figcaption></figure>`).join('');
 fs.writeFileSync(path.join(output,'characters.html'),'<!doctype html><meta charset="utf-8"><style>'+css+'body{margin:0;padding:24px;background:#e6dfce;color:#343c32;font-family:system-ui}main{display:grid;grid-template-columns:repeat(5,192px);gap:18px}figure{margin:0}figcaption{text-align:center;font-size:14px}</style><main>'+markup+'</main>');
 fs.writeFileSync(path.join(output,'compiled-character.css'),css);fs.writeFileSync(path.join(output,'animated-characters.html'),'<!doctype html><meta charset="utf-8"><style>'+css+'body{display:flex;flex-wrap:wrap;background:#e6dfce}</style>'+cssMuseumPeople.map(person=>render(person,{state:'waving',paused:true,sampledTimeMilliseconds:0})).join(''));
 const report={claimIdentifier:claimIdentifier('Lumenia.CssMuseumPeople'),executionIdentifier:uuidVersionSeven(),recordedAt:new Date().toISOString(),method:'Standalone CSS artwork Chromium rendering; not a Site browser test',browser:browser.version(),ok:errors.length===0,people:results,errors,motion:{animationCount:after.length,advancing,paused,reducedMotion},sources:Object.fromEntries(['web/artwork/css-museum-people.mjs','web/components/CssArtistCharacter.tsx','web/components/CssArtistCharacter.styles.ts','web/components/CssMuseumCharacter.tsx','web/components/CssMuseumCharacter.styles.ts','web/components/character-motion.ts'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')]))};
 fs.writeFileSync(path.join(root,'reports/css-museum-people-verification.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({ok:report.ok,people:results.length,poses:results.reduce((n,p)=>n+p.poseCount,0),errors,motion:report.motion}));if(errors.length)process.exitCode=1;
} finally {await browser.close();}
