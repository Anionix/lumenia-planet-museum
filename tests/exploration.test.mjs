import test from 'node:test';
import assert from 'node:assert/strict';
import { limits, movement, moveCamera, ringClearance, createWorldSession } from '../reference-assets/artist-cosmos/explore/navigation.mjs';
import {readFile} from 'node:fs/promises';
import {createWorldGeometry,collisionSurfaces} from '../reference-assets/artist-cosmos/explore/geometry.mjs';
import {createCollisionWorld} from '../reference-assets/artist-cosmos/explore/collision.mjs';
import typescript from 'typescript';
import {runInNewContext} from 'node:vm';

// recordIdentifier=81ca0bef-abaf-543e-a655-632cc55172c9; executionIdentifier=01a0abbe-d765-7a3b-9b79-d72bc7e25cb2; relatedIssueRecordIdentifier=960d3219-91ec-5fb8-9ead-c82bd64b8922; transition=frame timestamp -> bounded flight input.
test('actual frame handler bounds earlier, equal, later and resumed timestamps for every movement trigger', async () => {
  const source=typescript.createSourceFile('main.mjs',await readFile(new URL('../reference-assets/artist-cosmos/explore/main.mjs',import.meta.url),'utf8'),typescript.ScriptTarget.Latest,true);
  const tick=source.statements.find(statement=>typescript.isFunctionDeclaration(statement)&&statement.name?.text==='tick');
  assert.ok(tick,'The production frame handler must be present');
  for(const [now,expected] of [[99,0],[100,0],[101,.001],[100000,.05]]) for(const trigger of ['keyboard','button','landing']) {
    const samples=[];
    const context={frame:1,disposed:false,document:{hidden:false},session:{},lastTick:100,limits,
      keys:new Set(trigger==='keyboard'?['KeyW']:[]),commands:{KeyW:'forward'},axes:{forward:[0,0,-1]},
      heldMove:trigger==='button'?'forward':null,holdStarted:-200,heldMoved:false,
      landingInput:{checked:trigger==='landing'},collision:trigger==='landing'?{}:null,dirty:false,
      requestAnimationFrame:()=>1,applyMovement(input,seconds){samples.push(seconds);movement([...input],0,0,seconds,limits.maximumSpeed);}};
    runInNewContext(tick.getText(source)+';tick('+now+');',context);
    assert.deepEqual(samples,[expected],trigger+' at '+now);
    assert.equal(context.lastTick,now);assert.equal(context.frame,1);
  }
});

test('flight has a direction-independent speed and bounds stalled frames', () => {
  const forward = movement([0, 0, -1], 0, 0, 0.05, 16);
  const diagonal = movement([1, 1, -1], 0, 0, 0.05, 16);
  assert.ok(Math.abs(Math.hypot(...forward) - 0.8) < 1e-12);
  assert.ok(Math.abs(Math.hypot(...diagonal) - 0.8) < 1e-12);
  assert.deepEqual(movement([0, 0, -1], 0, 0, 200, 16), forward);
  assert.deepEqual(movement([0, 0, 0], 0, 0, 1, 16), [0, 0, 0]);
  for (const invalid of [NaN, Infinity, -1]) assert.throws(() => movement([0, 0, 1], 0, 0, invalid, 16));
  assert.throws(() => movement([0, 0, 1], 0, 0, 1, 100));
});

test('actual Rapier passes the open ring, stops at the planet and lands on the platform', async () => {
  const recipe=JSON.parse(await readFile(new URL('../reference-assets/artist-cosmos/explore/worlds/ettore-sottsass.json',import.meta.url)));
  const geometry=createWorldGeometry(recipe);
  const physics=await createCollisionWorld(collisionSurfaces(geometry.solids),[-17,5,16]);
  try {
    let position=[-17,5,16];
    for(let frame=0;frame<40;frame++)position=physics.move(position,[0,0,-0.4]);
    assert.ok(Math.abs(position[2])<1e-4,'Open passage was blocked');
    assert.equal(physics.contacts,0);
    position=[0,0,20];
    for(let frame=0;frame<80;frame++)position=physics.move(position,[0,0,-0.4]);
    assert.ok(position[2]>8.39 && position[2]<8.6,'Observer should stop on the front of the planet');
    assert.ok(physics.contacts>0);
    position=[-17,4,10];
    for(let frame=0;frame<80;frame++)position=physics.move(position,[0,-0.1,0]);
    assert.ok(position[1]>0.69 && position[1]<0.9,'Observer should land above the platform');
  } finally {physics.dispose();geometry.dispose();}
  assert.throws(()=>physics.move([0,0,0],[0,0,0]),/disposed/);
});

test('free flight is bounded and never rewrites a source coordinate', () => {
  const input = {recordIdentifier:'example', semanticPosition:{values:[0.55,-0.65,-0.95]}, spawn:{position:[0,0,0]}};
  const session = createWorldSession(input);
  session.position = moveCamera([399.9, -399.9, 0], [0.8, -0.8, 0]);
  assert.deepEqual(session.position, [400, -400, 0]);
  assert.deepEqual(session.semanticPosition.values, input.semanticPosition.values);
  assert.throws(() => { session.semanticPosition.values[0] = 0; });
  assert.equal(createWorldSession({...input,semanticPosition:null}).semanticPosition, null);
  assert.equal(session.physics, 'disabled');
});

test('the Sottsass passage leaves space for the observer and contact gap', () => {
  assert.ok(Math.abs(ringClearance(3, 0.5) - 2.05) < 1e-12);
  assert.equal(limits.observerRadius, 0.4);
  assert.ok(ringClearance(0.8, 0.5) < 0);
});

test('each of the fifteen worlds builds and preserves an open passage and a landing surface',async()=>{
  const catalog=JSON.parse(await readFile(new URL('../reference-assets/artist-cosmos/explore/worlds.json',import.meta.url)));
  assert.equal(catalog.worlds.length,15);
  const shapeSignatures=new Set();let knownCoordinates=0;
  for(const entry of catalog.worlds){
    const recipe=JSON.parse(await readFile(new URL('../reference-assets/artist-cosmos/explore/'+entry.file.replace('./',''),import.meta.url)));
    if(recipe.semanticPosition!==null)knownCoordinates++;
    shapeSignatures.add(JSON.stringify(recipe.shapes.map(shape=>[shape.kind,shape.parameters,shape.position])));
    const geometry=createWorldGeometry(recipe);
    const physics=await createCollisionWorld(collisionSurfaces(geometry.solids),recipe.landmarks[0].position);
    try{
      for(const mesh of geometry.solids){
        assert.ok([...mesh.geometry.attributes.position.array].every(Number.isFinite),entry.slug+' has non-finite vertices');
        if(mesh.geometry.type==='LatheGeometry'){
          const vertices=mesh.geometry.attributes.position.array,indices=mesh.geometry.index.array;let volume=0;
          for(let triangle=0;triangle<indices.length;triangle+=3){
            const first=indices[triangle]*3,second=indices[triangle+1]*3,third=indices[triangle+2]*3;
            volume+=(vertices[first]*(vertices[second+1]*vertices[third+2]-vertices[second+2]*vertices[third+1])
              +vertices[first+1]*(vertices[second+2]*vertices[third]-vertices[second]*vertices[third+2])
              +vertices[first+2]*(vertices[second]*vertices[third+1]-vertices[second+1]*vertices[third]))/6;
          }
          assert.ok(volume>0,'Closed plywood shells must face outward');
        }
      }
      let position=[...recipe.landmarks[0].position];
      for(let frame=0;frame<40;frame++)position=physics.move(position,[0,0,-.4]);
      assert.ok(position[2]<recipe.passage.position[2]-7.8,entry.slug+' passage was blocked');
      const landing=recipe.landmarks.at(-1).position;position=[...landing];
      for(let frame=0;frame<90;frame++)position=physics.move(position,[0,-.1,0]);
      assert.ok(position[1]>.69&&position[1]<.9,entry.slug+' landing was blocked');
      if(entry.slug==='walter-gropius'){
        position=[...recipe.landmarks[1].position];
        for(let frame=0;frame<40;frame++)position=physics.move(position,[0,0,-.4]);
        assert.ok(position[2]<0,'The entrance viewpoint must fit through the open doorway');
      }
    }finally{physics.dispose();geometry.dispose();}
    assert.equal(geometry.group.children.length,0);
  }
  assert.equal(knownCoordinates,12);assert.equal(shapeSignatures.size,15,'Worlds must have distinct structures');
});
