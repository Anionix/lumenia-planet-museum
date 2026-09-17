import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=createRequire(require.resolve('next/package.json'))('sharp');
import {projectRoot} from './source-revision.mjs';
import {claimIdentifier} from './identifiers.mjs';

// machine contract; record_identifier=e332864f-3c91-5a0a-a748-be735ca33cac.
// transition: unchanged source image -> bounded thumbnail -> content-bound registration.
// Explicit authoring command only. Ordinary web builds copy these registered derivatives.
const source=path.join(projectRoot,'reference-assets/artist-cosmos');
const rows=(await readFile(path.join(source,'references.jsonl'),'utf8')).trim().split('\n').map(JSON.parse);
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
await mkdir(path.join(source,'thumbnails'),{recursive:true});
const images=[];
for(const row of rows){
  const original=await readFile(path.join(source,row.asset_path));assert.equal(digest(original),row.sha256);
  const name=row.asset_path.replace(/\.png$/,'.webp');
  const {data,info}=await sharp(original).resize({width:190,height:126,fit:'inside',withoutEnlargement:true}).webp({quality:72}).toBuffer({resolveWithObject:true});
  assert.ok(info.width<=190&&info.height<=126&&data.length<=16000);
  await writeFile(path.join(source,'thumbnails',name),data);
  images.push({recordIdentifier:claimIdentifier('reference-thumbnail/'+row.asset_path),path:'cosmos/thumbnails/'+name,
    sourcePath:'reference-assets/artist-cosmos/'+row.asset_path,sourceSha256:row.sha256,sha256:digest(data),bytes:data.length,width:info.width,height:info.height});
}
const contract={recordIdentifier:claimIdentifier('reference-thumbnails'),transformation:{width:190,height:126,fit:'inside',format:'webp',quality:72,sharpVersion:sharp.versions.sharp},maximumBytesPerImage:16000,images};
await writeFile(path.join(projectRoot,'contracts/cosmic-reference-thumbnails.json'),JSON.stringify(contract,null,2)+'\n');
console.log(JSON.stringify({images:images.length,totalBytes:images.reduce((sum,item)=>sum+item.bytes,0)}));
