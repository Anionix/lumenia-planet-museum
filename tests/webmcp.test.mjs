import test from 'node:test';
import assert from 'node:assert/strict';
import {registerPageTools,explorationTools,imageExhibitionTools,createPresentationCheckpoint,assertPresentedState,imageConfigurationTarget} from '../reference-assets/artist-cosmos/interactive/webmcp.mjs';
import {createWorldSession,movement,moveCamera,limits} from '../reference-assets/artist-cosmos/explore/navigation.mjs';
import {readFile} from 'node:fs/promises';

function registry(){
  const tools=new Map();
  return {tools,registerTool(tool,{signal}){assert.ok(!tools.has(tool.name));tools.set(tool.name,tool);signal.addEventListener('abort',()=>tools.delete(tool.name),{once:true});}};
}
function controller(overrides={}){return {catalog:()=>[],snapshot:()=>({physics:'disabled'}),navigate:async input=>input,physics:async input=>input,configure:async input=>input,reset:async()=>({playing:false}),...overrides};}
const inputWorld='cc6b59e2-1bfe-5a91-9baa-1afbcdeb0457';

test('completion rejects changes to every promised field, including camera coordinates',()=>{
  const expected={artistIdentifier:inputWorld,view:'all',playing:false,physics:'enabled',gravity:false,cameraPosition:[23,12,34],cameraOrientation:{yaw:0,pitch:0}};
  assert.doesNotThrow(()=>assertPresentedState(expected,structuredClone(expected)));
  for(const [field,value] of Object.entries({artistIdentifier:'another',view:'single',playing:true,physics:'disabled',gravity:true,cameraPosition:[23.4,12,34],cameraOrientation:{yaw:.1,pitch:0}})){
    assert.throws(()=>assertPresentedState(expected,{...structuredClone(expected),[field]:value}),new RegExp(field));
  }
});

test('image targets include implied physics transitions and preserve unspecified settings',()=>{
  const current={artistIdentifier:inputWorld,view:'single',playing:false,physics:'disabled',gravity:false};
  assert.deepEqual(imageConfigurationTarget(current,{physics_enabled:true}),{...current,view:'all',playing:true,physics:'enabled'});
  assert.deepEqual(imageConfigurationTarget(current,{physics_enabled:true,playing:false,gravity_enabled:true}),{...current,view:'all',physics:'enabled',gravity:true});
  const active={...current,view:'all',playing:true,physics:'enabled',gravity:true};
  assert.deepEqual(imageConfigurationTarget(active,{view:'single'}),{...active,view:'single',physics:'disabled',gravity:false});
  assert.deepEqual(imageConfigurationTarget(active,{physics_enabled:true}),active);
  const expected=imageConfigurationTarget(current,{view:'all',playing:false});
  current.playing=true;
  assert.equal(expected.playing,false,'Target must be captured before an asynchronous load');
});

test('WebMCP is optional and partial registration rolls back without breaking the page',async()=>{
  const states=[];const unsupported=registerPageTools(undefined,[],{onStatus:status=>states.push(status)});
  assert.equal(await unsupported.ready,false);assert.deepEqual(states,['unsupported']);
  const context=registry();const register=context.registerTool;
  context.registerTool=(tool,options)=>{if(tool.name==='navigate_exploration')throw new Error('registration refused');return register(tool,options);};
  const failed=registerPageTools(context,explorationTools(controller()));
  assert.equal(await failed.ready,false);assert.equal(context.tools.size,0);
});

test('registered tools reject malformed and oversized input before an application action',async()=>{
  let actions=0;const context=registry();const registration=registerPageTools(context,explorationTools(controller({navigate:async input=>{actions++;return input;}})));
  assert.equal(await registration.ready,true);
  const tool=context.tools.get('navigate_exploration');
  for(const input of [null,[],{}, {code:'anything'}, {world_identifier:'morris'}, {movement:[0,0,NaN]}, {movement:[0,0,Infinity]},
    {movement:[0,0,-2]}, {movement:[0,0,-1,0]}, {movement:[0,0,-1],steps:61}, {movement:[0,0,-1],steps:0}, {steps:1}, {look_turns:1.5}, {viewpoint:'unknown'}]){
    assert.equal((await tool.execute(input)).status,'invalid_input',JSON.stringify(input));
  }
  assert.equal(actions,0);
  const result=await tool.execute({world_identifier:inputWorld,viewpoint:'passage',movement:[0,0,-1],steps:24});
  assert.equal(result.status,'complete');assert.equal(actions,1);assert.match(result.executionIdentifier,/^[0-9a-f-]{14}7[0-9a-f-]+$/);
  registration.dispose();assert.equal(context.tools.size,0);assert.equal((await tool.execute({viewpoint:'entrance'})).status,'unavailable');
});

test('mutating tools are serialized while read tools remain available',async()=>{
  let finish;const finished=new Promise(resolve=>{finish=resolve;});const events=[];const context=registry();
  const registration=registerPageTools(context,explorationTools(controller({navigate:()=>finished})),{onExecution:event=>events.push(event)});await registration.ready;
  const first=context.tools.get('navigate_exploration').execute({viewpoint:'passage'});
  assert.equal((await context.tools.get('set_exploration_physics').execute({enabled:true})).status,'busy');
  assert.equal((await context.tools.get('read_exploration_state').execute({})).status,'complete');
  assert.equal(events.length,0);finish({presented:true});assert.equal((await first).status,'complete');assert.equal(events.length,1);
  assert.equal(context.tools.get('read_exploration_state').annotations.readOnlyHint,true);
  assert.equal(context.tools.get('navigate_exploration').annotations.readOnlyHint,false);
  registration.dispose();
});

test('physics and image configuration require explicit compatible settings',async()=>{
  let actions=0;const context=registry();const count=()=>{actions++;return {};};
  const registration=registerPageTools(context,[...explorationTools(controller({physics:count})),...imageExhibitionTools(controller({configure:count}))]);await registration.ready;
  for(const input of [{landing:true},{enabled:'true'},{enabled:false,landing:true}])assert.equal((await context.tools.get('set_exploration_physics').execute(input)).status,'invalid_input');
  assert.equal((await context.tools.get('configure_image_exhibition').execute({view:'single',physics_enabled:true})).status,'invalid_input');
  assert.equal(actions,0);
  assert.equal((await context.tools.get('configure_image_exhibition').execute({artist_identifier:'4d06480c-9e64-5d9a-bc4a-4d88d9c53888',view:'all',playing:false})).status,'complete');
  assert.equal(actions,1);registration.dispose();
});

test('a command completes only after its presentation checkpoint and failure is reported',async()=>{
  const context=registry(),checkpoint=createPresentationCheckpoint(1000);let completed=false;
  const registration=registerPageTools(context,explorationTools(controller({navigate:async()=>{await checkpoint.next();return {presented:true};}})));await registration.ready;
  const result=context.tools.get('navigate_exploration').execute({viewpoint:'passage'}).then(value=>{completed=true;return value;});
  await Promise.resolve();assert.equal(completed,false);checkpoint.presented();assert.equal((await result).status,'complete');
  const cancelled=context.tools.get('navigate_exploration').execute({viewpoint:'passage'});checkpoint.cancel();assert.equal((await cancelled).status,'error');registration.dispose();
});

test('batched flight reuses the bounded movement model and preserves the original coordinate',async()=>{
  const recipe=JSON.parse(await readFile(new URL('../reference-assets/artist-cosmos/explore/worlds/ettore-sottsass.json',import.meta.url)));
  const session=createWorldSession(recipe),original=structuredClone(session.semanticPosition),before=[...session.position];
  const context=registry();const registration=registerPageTools(context,explorationTools(controller({navigate:async input=>{
    for(let step=0;step<input.steps;step++)session.position=moveCamera(session.position,movement(input.movement,0,0,limits.maximumSeconds,limits.normalSpeed));
    return {position:session.position,coordinate:session.semanticPosition};
  }})));await registration.ready;
  const result=await context.tools.get('navigate_exploration').execute({movement:[1,1,-1],steps:60});
  assert.equal(result.status,'complete');assert.ok(Math.hypot(...session.position.map((value,index)=>value-before[index]))<=24+1e-10);
  assert.deepEqual(session.semanticPosition,original);assert.equal(session.physics,'disabled');registration.dispose();
});
