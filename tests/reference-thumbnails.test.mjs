import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=createRequire(require.resolve('next/package.json'))('sharp');
import {thumbnailPath} from '../reference-assets/artist-cosmos/interactive/thumbnail.mjs';
import {isRegisteredReferenceThumbnail} from '../scripts/drawing-asset-policy.mjs';

// machine contract; record_identifier=e332864f-3c91-5a0a-a748-be735ca33cac.
// Actual encoded bytes, dimensions and original hashes are checked together.
test('all fifteen small previews have bounded size and unchanged source images',async()=>{
  const root=new URL('../',import.meta.url),read=async path=>readFile(new URL(path,root));
  const registration=JSON.parse(await read('contracts/cosmic-reference-thumbnails.json'));
  assert.equal(registration.images.length,15);const files=[];let total=0;
  for(const image of registration.images){
    const bytes=await read('reference-assets/artist-cosmos/'+image.path.slice('cosmos/'.length));
    const original=await read(image.sourcePath),digest=value=>createHash('sha256').update(value).digest('hex');
    assert.equal(digest(original),image.sourceSha256);assert.equal(digest(bytes),image.sha256);assert.equal(bytes.length,image.bytes);
    const dimensions=await sharp(bytes).metadata();assert.ok(dimensions.width<=190&&dimensions.height<=126);
    assert.equal(thumbnailPath('../'+image.sourcePath.split('/').at(-1)),'../'+image.path.slice('cosmos/'.length));
    files.push({path:image.sourcePath,sha256:digest(original)},{path:'reference-assets/artist-cosmos/'+image.path.slice('cosmos/'.length),sha256:digest(bytes)});
    total+=bytes.length;
  }
  assert.ok(total<=15*registration.maximumBytesPerImage);
  for(const image of registration.images){
    assert.equal(isRegisteredReferenceThumbnail(image,files,registration),true);
    assert.equal(isRegisteredReferenceThumbnail({...image,sha256:'changed'},files,registration),false);
    assert.equal(isRegisteredReferenceThumbnail(image,files.filter(file=>file.path!==image.sourcePath),registration),false);
  }
});
