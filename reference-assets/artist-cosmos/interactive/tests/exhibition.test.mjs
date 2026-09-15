import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import { createExhibitionState, createFixedStepper, createEventIdentifier } from '../model.mjs';
import { createPhysicsEngine } from '../physics.mjs';
import { connectOptionalPhysics } from '../vendor/reference-physics-contract.mjs';

const manifest = JSON.parse(await readFile(new URL('../exhibition.json',import.meta.url),'utf8'));

test('initial display keeps 12 source coordinates and 3 unknown values with physics disabled',()=>{
  const state=createExhibitionState(manifest);
  assert.equal(state.physics,'disabled');assert.equal(state.playing,false);
  assert.equal(manifest.items.filter(item=>item.semantic_position).length,12);
  assert.equal(manifest.items.filter(item=>!item.semantic_position).length,3);
  const unknown=manifest.items.find(item=>!item.semantic_position);
  assert.throws(()=>state.semanticIndex.positionFor(unknown.record_id),/not available/);
  const identifier=createEventIdentifier();assert.match(identifier,/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('semantic distance is an immutable snapshot independent of mutable display/input arrays',()=>{
  const input=structuredClone(manifest),state=createExhibitionState(input);
  const first=input.items[0],second=input.items[1];
  const before=state.semanticIndex.distanceBetween(first.record_id,second.record_id);
  first.semantic_position.values[0]=999;first.presentation_position[0]=200;
  assert.equal(state.semanticIndex.distanceBetween(first.record_id,second.record_id),before);
  assert.throws(()=>state.semanticIndex.positionFor(first.record_id).push(3),TypeError);
  assert.equal(state.initialPositions[0][0],-14.6);
});

test('fixed steps agree at 60 and 120 frames per second and cap long pauses',()=>{
  let normal=0,fast=0;
  const sixty=createFixedStepper(()=>normal++),oneTwenty=createFixedStepper(()=>fast++);
  for(let i=0;i<60;i++)sixty.advance(1/60);
  for(let i=0;i<120;i++)oneTwenty.advance(1/120);
  assert.equal(normal,60);assert.equal(fast,normal);
  assert.equal(sixty.advance(20),5);
  assert.throws(()=>sixty.advance(NaN),TypeError);
});

async function fixture(count=2) {
  const scene=new THREE.Scene();
  const recipes=manifest.items.slice(0,count).map((item,index)=>{
    const mesh=new THREE.Object3D();mesh.uuid=item.record_id;mesh.position.set(index===0?-4:4,0,0);scene.add(mesh);
    return {...item,physics:{...item.physics,enabled:true}};
  });
  const engine=await createPhysicsEngine(manifest.physics_adapter_identifier);
  const binding=connectOptionalPhysics(scene,recipes,engine.adapter);
  return {scene,recipes,engine,binding};
}

test('real Rapier bodies collide, remain finite, and do not mutate source coordinates',async()=>{
  const {scene,recipes,engine,binding}=await fixture();
  const frozen=createExhibitionState(manifest).semanticIndex;
  const before=frozen.distanceBetween(recipes[0].record_id,recipes[1].record_id);
  engine.release(recipes[0].record_id,[4,0]);engine.release(recipes[1].record_id,[-4,0]);
  for(let index=0;index<90;index++)binding.step(1/60);
  const first=scene.getObjectByProperty('uuid',recipes[0].record_id),second=scene.getObjectByProperty('uuid',recipes[1].record_id);
  assert.ok(second.position.x-first.position.x>6,'colliders must not pass through each other');
  assert.ok(first.position.toArray().every(Number.isFinite));
  assert.equal(frozen.distanceBetween(recipes[0].record_id,recipes[1].record_id),before);
  assert.equal(engine.snapshot().stepCount,90);
  binding.dispose();assert.equal(engine.snapshot().active,false);assert.equal(engine.snapshot().dynamicBodies,0);
  assert.throws(()=>binding.step(1/60),/active binding/);
});

test('gravity causes a fall and the display floor catches the panel',async()=>{
  const {scene,recipes,engine,binding}=await fixture(1);
  engine.setGravity(true);
  for(let index=0;index<300;index++)binding.step(1/60);
  const position=scene.getObjectByProperty('uuid',recipes[0].record_id).position;
  assert.ok(position.y < -1,'panel must have fallen');
  assert.ok(position.y > -8.95,'floor must catch the panel above its lower extent');
  binding.dispose();
});

test('kinematic dragging moves a body then releases it into simulation',async()=>{
  const {scene,recipes,engine,binding}=await fixture(1);
  engine.hold(recipes[0].record_id);engine.move(recipes[0].record_id,[-1,3,0]);binding.step(1/60);
  const object=scene.getObjectByProperty('uuid',recipes[0].record_id);
  assert.ok(Math.abs(object.position.x+1)<.001);assert.ok(Math.abs(object.position.y-3)<.001);
  engine.release(recipes[0].record_id,[2,0]);for(let index=0;index<30;index++)binding.step(1/60);
  assert.ok(object.position.x>-.1);binding.dispose();
});
