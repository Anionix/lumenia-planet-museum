import * as THREE from '../interactive/vendor/three.module.js';
import {limits,movement,moveCamera,createWorldSession} from './navigation.mjs';
import {createWorldGeometry,collisionSurfaces,createStars,createNebula} from './geometry.mjs';
import {createTrace} from '../interactive/model.mjs';

// llm machine contract; UUIDv5: be15d308-d6c7-5b93-aca4-32206c14ac81.
// transition: catalogue -> requested world -> active camera -> optional collision -> disposed.
// Stale requests cannot reactivate an exited world. Events have timestamped UUIDv7.
const canvas=document.querySelector('canvas'), loading=document.querySelector('.loading'), fallback=document.querySelector('.fallback');
const collisionInput=document.querySelector('[name=collision]'), landingInput=document.querySelector('[name=landing]');
const trace=createTrace('be15d308-d6c7-5b93-aca4-32206c14ac81');
let renderer,scene,camera,stars,nebula,geometry,session,world,catalog,collision;
let requestNumber=0,collisionRequest=0,frame=0,lastRender=-Infinity,lastTick=0,dirty=false,disposed=false,frames=0;
let yaw=0,pitch=0,drag=null,heldMove=null,holdStarted=0,heldMoved=false,activeWorldCount=0,contactCount=0;
const keys=new Set(), status=document.querySelector('.navigation-status'), worldList=document.querySelector('.worlds');
const axes={forward:[0,0,-1],backward:[0,0,1],left:[-1,0,0],right:[1,0,0],up:[0,1,0],down:[0,-1,0]};
const commands={KeyW:'forward',KeyS:'backward',KeyA:'left',KeyD:'right',KeyQ:'down',KeyE:'up'};
function clearInput(){keys.clear();heldMove=null;drag=null;}
function requestFrame(){if(disposed||document.hidden||!renderer||!session)return;dirty=true;if(!frame){lastTick=performance.now();frame=requestAnimationFrame(tick);}}
function positionChanged(next){session.position=next;camera.position.fromArray(next);requestFrame();}
function applyMovement(input,seconds){
  if(!session)return;
  const delta=movement(input,yaw,pitch,seconds,keys.has('ShiftLeft')||keys.has('ShiftRight')?limits.maximumSpeed:limits.normalSpeed);
  // Landing is a deliberate slow descent along world Y, capped by the same step budget.
  if(landingInput.checked&&collision){delta[1]-=2*Math.min(seconds,limits.maximumSeconds);const length=Math.hypot(...delta),maximum=limits.maximumSpeed*Math.min(seconds,limits.maximumSeconds);if(length>maximum)for(let axis=0;axis<3;axis++)delta[axis]*=maximum/length;}
  const desired=moveCamera(session.position,delta);
  const boundedDelta=desired.map((value,axis)=>value-session.position[axis]);
  positionChanged(collision?moveCamera(collision.move(session.position,boundedDelta),[0,0,0]):desired);
  if(collision)contactCount=collision.contacts;
}
function rotate(){camera.rotation.set(pitch,yaw,0,'YXZ');requestFrame();}
function observe(){
  Object.assign(canvas.dataset,{world:world.recordIdentifier,artist:world.artistName,activeWorlds:String(activeWorldCount),physics:session.physics,
    cameraPosition:session.position.map(value=>value.toFixed(3)).join(','),semanticPosition:JSON.stringify(session.semanticPosition),
    renderedFrames:String(frames),contactCount:String(contactCount),worldReady:'true',eventCount:String(trace.snapshot().length)});
  status.textContent=`${session.physics==='enabled'?'衝突あり':'自由に飛行'} · 現在地 ${session.position.map(value=>value.toFixed(1)).join(' / ')} m`;
}
function tick(now){
  frame=0;if(disposed||document.hidden||!session)return;
  const seconds=Math.min((now-lastTick)/1000,limits.maximumSeconds);lastTick=now;
  const input=[0,0,0];for(const key of keys){const direction=axes[commands[key]];if(direction)for(let axis=0;axis<3;axis++)input[axis]+=direction[axis];}
  if(heldMove&&now-holdStarted>160){for(let axis=0;axis<3;axis++)input[axis]+=axes[heldMove][axis];heldMoved=true;}
  const moving=input.some(Boolean)||(landingInput.checked&&collision);
  if(moving)applyMovement(input,seconds);
  if(dirty&&now-lastRender>=1000/limits.framesPerSecond){renderer.render(scene,camera);frames++;lastRender=now;dirty=false;observe();}
  if((dirty||moving||heldMove)&&!frame)frame=requestAnimationFrame(tick);
}
function waypoint(point){if(!session)return;clearInput();landingInput.checked=false;positionChanged([...point.position]);camera.lookAt(...point.target);const orientation=new THREE.Euler().setFromQuaternion(camera.quaternion,'YXZ');yaw=orientation.y;pitch=orientation.x;trace.add('camera -> selected viewpoint',{position:point.position});requestFrame();}
function releaseWorld(){
  clearInput();collisionRequest++;collision?.dispose();collision=null;
  collisionInput.checked=false;collisionInput.disabled=true;landingInput.checked=false;document.querySelector('.landing').hidden=true;
  if(geometry){scene.remove(geometry.group);geometry.dispose();geometry=null;}session=null;activeWorldCount=0;
  if(frame)cancelAnimationFrame(frame);frame=0;canvas.dataset.worldReady='false';canvas.dataset.activeWorlds='0';
}
async function enterWorld(entry){
  const token=++requestNumber;releaseWorld();loading.hidden=false;fallback.hidden=true;
  trace.add('world requested',{worldIdentifier:entry.recordIdentifier});
  try{
    const response=await fetch(entry.file);if(!response.ok)throw new Error('World file unavailable');
    const bytes=await response.arrayBuffer();const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),value=>value.toString(16).padStart(2,'0')).join('');
    if(digest!==entry.sha256)throw new Error('World file does not match its catalogue');
    const next=JSON.parse(new TextDecoder().decode(bytes));if(disposed||token!==requestNumber)return;
    world=next;session=createWorldSession(world);geometry=createWorldGeometry(world);scene.add(geometry.group);activeWorldCount=1;contactCount=0;collisionInput.disabled=false;collisionInput.checked=false;
    scene.background=new THREE.Color(world.background);document.documentElement.style.setProperty('--accent',world.accent);
    document.querySelector('h1').textContent=world.title;document.querySelector('.artist').textContent=world.artistName;
    document.querySelector('.description').textContent=world.description;document.querySelector('.reference-image').href=world.image;
    const sources=document.querySelector('.sources');sources.replaceChildren();for(const source of world.sources){const link=document.createElement('a');link.href=source.url;link.target='_blank';link.rel='noopener';link.textContent=source.publisher; sources.append(link);}
    const landmarks=document.querySelector('.landmarks');landmarks.replaceChildren();for(const point of world.landmarks){const button=document.createElement('button');button.type='button';button.textContent=point.name;button.addEventListener('click',()=>waypoint(point));landmarks.append(button);}
    for(const button of worldList.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.world===entry.slug));
    worldList.hidden=true;document.querySelector('[data-action=worlds]').setAttribute('aria-expanded','false');
    history.replaceState(null,'',`?world=${encodeURIComponent(entry.slug)}`);loading.hidden=true;waypoint(world.spawn);
    trace.add('world active',{worldIdentifier:world.recordIdentifier});canvas.focus({preventScroll:true});requestFrame();
  }catch(error){if(disposed||token!==requestNumber)return;loading.hidden=true;fallback.hidden=false;
    fallback.querySelector('p').textContent=error.message==='World file does not match its catalogue'?'展示データが更新されました。もう一度開いてください。':'この宇宙を読み込めませんでした。もう一度開くか、画像の一覧へ戻れます。';
    status.textContent='画像の一覧から引き続き見られます';console.error(error);}
}
async function toggleCollision(){
  const token=++collisionRequest;collision?.dispose();collision=null;landingInput.checked=false;document.querySelector('.landing').hidden=true;
  if(!session)return;session.physics='disabled';
  if(!collisionInput.checked){trace.add('collision disabled');requestFrame();return;}
  collisionInput.disabled=true;session.physics='loading';requestFrame();
  try{const {createCollisionWorld}=await import('./collision.mjs');const loaded=await createCollisionWorld(collisionSurfaces(geometry.solids),session.position);
    if(disposed||token!==collisionRequest||!session){loaded.dispose();return;}collision=loaded;session.physics='enabled';document.querySelector('.landing').hidden=false;trace.add('collision enabled');
  }catch(error){if(token!==collisionRequest)return;collisionInput.checked=false;session.physics='disabled';status.textContent='衝突を開始できません。自由飛行を続けられます。';console.error(error);}
  finally{if(token===collisionRequest){collisionInput.disabled=false;requestFrame();}}
}
function resize(){if(!renderer)return;const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();requestFrame();}
function teardown(){if(disposed)return;disposed=true;requestNumber++;releaseWorld();stars?.dispose();nebula?.dispose();renderer?.dispose();renderer?.forceContextLoss();trace.add('exploration disposed');canvas.dataset.disposed='true';}

for(const button of document.querySelectorAll('[data-move]')){
  button.addEventListener('pointerdown',event=>{if(!session)return;button.setPointerCapture(event.pointerId);heldMove=button.dataset.move;holdStarted=performance.now();heldMoved=false;requestFrame();});
  button.addEventListener('pointerup',()=>{heldMove=null;});button.addEventListener('pointercancel',()=>{heldMove=null;heldMoved=true;});
  button.addEventListener('click',()=>{if(!heldMoved)applyMovement(axes[button.dataset.move],limits.maximumSeconds);heldMoved=false;});
}
for(const button of document.querySelectorAll('[data-look]'))button.addEventListener('click',()=>{if(!camera)return;yaw+=(button.dataset.look==='left'?1:-1)*Math.PI/12;rotate();});
canvas.addEventListener('keydown',event=>{if(commands[event.code]||event.code.startsWith('Shift')){event.preventDefault();keys.add(event.code);requestFrame();}});
window.addEventListener('keyup',event=>{keys.delete(event.code);});canvas.addEventListener('blur',clearInput);window.addEventListener('blur',clearInput);
canvas.addEventListener('pointerdown',event=>{if(!session)return;canvas.focus();canvas.setPointerCapture(event.pointerId);drag={x:event.clientX,y:event.clientY};});
canvas.addEventListener('pointermove',event=>{if(!drag)return;yaw-=(event.clientX-drag.x)*0.004;pitch=Math.max(-1.5,Math.min(1.5,pitch-(event.clientY-drag.y)*0.004));drag={x:event.clientX,y:event.clientY};rotate();});
canvas.addEventListener('pointerup',()=>{drag=null;});canvas.addEventListener('pointercancel',()=>{drag=null;});
document.querySelector('[data-action=reset]').addEventListener('click',()=>{if(world)waypoint(world.spawn);});
document.querySelector('[data-action=worlds]').addEventListener('click',event=>{worldList.hidden=!worldList.hidden;event.currentTarget.setAttribute('aria-expanded',String(!worldList.hidden));clearInput();});
document.querySelector('[data-action=retry]').addEventListener('click',()=>location.reload());
collisionInput.addEventListener('change',toggleCollision);landingInput.addEventListener('change',requestFrame);
document.addEventListener('visibilitychange',()=>{clearInput();if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else requestFrame();});
window.addEventListener('resize',resize);window.addEventListener('pagehide',teardown);
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(disposed)return;teardown();fallback.hidden=false;});

try{
  const context=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'low-power'});if(!context)throw new Error('WebGL 2 unavailable');
  renderer=new THREE.WebGLRenderer({canvas,context});renderer.setPixelRatio(Math.min(devicePixelRatio,limits.maximumPixelRatio));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  canvas.dataset.contextVersion=context.getParameter(context.VERSION);
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(55,1,0.08,1200);camera.rotation.order='YXZ';
  scene.add(new THREE.HemisphereLight('#e9e2fc','#2e2c48',2.1));
  const key=new THREE.DirectionalLight('#ffe1bb',4);key.position.set(-20,25,30);scene.add(key);
  const rim=new THREE.DirectionalLight('#8aaeff',2.2);rim.position.set(20,5,-30);scene.add(rim);
  nebula=createNebula();scene.add(nebula.mesh);stars=createStars(19);scene.add(stars.points);resize();
  const response=await fetch('./worlds.json');if(!response.ok)throw new Error('Catalogue unavailable');catalog=await response.json();
  for(const entry of catalog.worlds){const button=document.createElement('button');button.type='button';button.dataset.world=entry.slug;button.setAttribute('aria-label',entry.artistNameJapanese+'の宇宙に入る');
    const image=document.createElement('img');image.src=entry.image;image.alt='';image.loading='lazy';image.decoding='async';const label=document.createElement('span');label.textContent=entry.artistNameJapanese;button.append(image,label);button.addEventListener('click',()=>enterWorld(entry));worldList.append(button);}
  const requested=new URLSearchParams(location.search).get('world');await enterWorld(catalog.worlds.find(entry=>entry.slug===requested)??catalog.worlds.find(entry=>entry.slug==='ettore-sottsass')??catalog.worlds[0]);
}catch(error){loading.hidden=true;fallback.hidden=false;console.error(error);}
