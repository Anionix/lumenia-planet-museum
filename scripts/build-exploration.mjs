import assert from 'node:assert/strict';
import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {projectRoot} from './source-revision.mjs';
import {claimIdentifier} from './identifiers.mjs';
import {worldRecipes} from './exploration-recipes.mjs';
import {limits,ringClearance} from '../reference-assets/artist-cosmos/explore/navigation.mjs';

export async function buildExploration(destination=path.join(projectRoot,'web/public/cosmos/explore')) {
  const source=path.join(projectRoot,'reference-assets/artist-cosmos/explore');
  const reference=JSON.parse(await readFile(path.join(source,'../interactive/exhibition.json'),'utf8'));
  const catalog=[];
  await mkdir(path.join(source,'worlds'),{recursive:true});
  await mkdir(path.join(destination,'worlds'),{recursive:true});
  for (const [slug, recipe] of Object.entries(worldRecipes)) {
    const artist=reference.items.find(item=>item.image_url===`../${slug}.png`);
    assert.ok(artist, 'Reference artist missing');
    const shapes=recipe.shapes().map((shape,index)=>({recordIdentifier:claimIdentifier(`exploration/${slug}/shape/${index}`),...shape}));
    assert.ok(shapes.length>5 && shapes.length<=300);
    assert.ok(ringClearance(recipe.passage.radius,recipe.passage.tube)>0);
    const world={record_type:'exploration_world',recordIdentifier:claimIdentifier(`exploration/${slug}`),
      recordedAt:reference.created_at,artistName:artist.artist_name,artistNameJapanese:artist.artist_name_ja,
      title:artist.title,description:recipe.description,sourceProfileIdentifier:artist.source_profile_identifier,
      sourceImageIdentifier:artist.artist_reference_identifier,sourceImageSha256:artist.image_sha256,
      image:`../${slug}.png`,sources:artist.sources,semanticPosition:artist.semantic_position,
      reconstruction:'Newly authored geometry inspired by cited materials and a ChatGPT-generated reference picture. Hidden surfaces are designed, not recovered.',
      machineContract:{physicsEnabledByDefault:false,metresPerSceneUnit:1,valuesOrigin:'presentation_setting',movementLimits:limits},
      spawn:recipe.spawn,passage:recipe.passage,landmarks:recipe.landmarks,background:recipe.background,accent:recipe.accent,shapes};
    const bytes=JSON.stringify(world,null,2)+'\n';
    await writeFile(path.join(source,'worlds',slug+'.json'),bytes);
    await writeFile(path.join(destination,'worlds',slug+'.json'),bytes);
    catalog.push({recordIdentifier:world.recordIdentifier,slug,artistName:world.artistName,artistNameJapanese:world.artistNameJapanese,
      title:world.title,image:world.image,file:`./worlds/${slug}.json`,sha256:createHash('sha256').update(bytes).digest('hex')});
  }
  const catalogBytes=JSON.stringify({record_type:'exploration_catalog',recordIdentifier:claimIdentifier('exploration/catalog'),physicsEnabledByDefault:false,worlds:catalog},null,2)+'\n';
  await writeFile(path.join(source,'worlds.json'),catalogBytes);
  await writeFile(path.join(destination,'worlds.json'),catalogBytes);
  for (const file of ['index.html','style.css','main.mjs','navigation.mjs','geometry.mjs','collision.mjs']) await copyFile(path.join(source,file),path.join(destination,file));
  return {worldCount:catalog.length,physicsEnabledByDefault:false};
}
if(process.argv[1]===new URL(import.meta.url).pathname) console.log(JSON.stringify(await buildExploration()));
