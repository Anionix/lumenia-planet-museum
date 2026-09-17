import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createExhibitionState, createTrace, clampPanelPosition } from './model.mjs';
import { connectOptionalPhysics } from './vendor/reference-physics-contract.mjs';
import { registerPageTools, imageExhibitionTools, createPresentationCheckpoint, communityLinks, assertPresentedState, imageConfigurationTarget } from './webmcp.mjs';

const $ = selector => document.querySelector(selector);
const canvas = $('canvas'), stage = $('.stage'), loading = $('.loading'), status = $('.interaction-status'), engineStatus = $('.engine-status');
const physicsInput = $('input[name=physics]'), gravitySelect = $('select[name=gravity]');
let renderer, controls, frameRequest = 0, state, manifest, scene, camera, trace;
let physicsEngine = null, physicsBinding = null, physicsGeneration = 0, contextAvailable = false;
let previousFrame = 0, animationTime = 0, movingUntil = 0, drag = null, lastStatusTime = 0;
const panels = [], surfaces = [], bases = [], baseRotations = [], textures = new Map(), loadingImages = new Map();
const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(), pointerPlane = new THREE.Plane(new THREE.Vector3(0,0,1),0);
const intersection = new THREE.Vector3();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const presentation = createPresentationCheckpoint();let pageTools;

// Machine contract: frozen reference data -> display meshes -> user gestures/optional physics.
// The image remains a textured plane. Movement never edits a source image or a semantic coordinate.
function renderSoon(duration = 0) {
  movingUntil = Math.max(movingUntil, performance.now()+duration);
  if (!frameRequest && contextAvailable && !document.hidden) frameRequest = requestAnimationFrame(renderFrame);
}

function renderFrame(now) {
  frameRequest = 0;
  if (!contextAvailable || document.hidden) return;
  const elapsed = previousFrame ? Math.min((now-previousFrame)/1000, .08) : 0;
  previousFrame = now;
  if (state.playing) {
    animationTime += elapsed;
    if (physicsBinding) physicsBinding.step(elapsed);
    else panels.forEach((panel,index) => {
      if (drag?.index === index) return;
      panel.position.copy(bases[index]);
      panel.position.y += Math.sin(animationTime*.38+index)*.075;
      panel.rotation.copy(baseRotations[index]);
      panel.rotation.y += Math.sin(animationTime*.24+index)*.035;
      panel.rotation.x += Math.sin(animationTime*.31+index)*.018;
    });
  }
  controls.update(elapsed);
  renderer.render(scene,camera);
  presentation.presented();
  if (now-lastStatusTime > 350) {
    canvas.dataset.renderedFrames = String(renderer.info.render.frame);
    canvas.dataset.physicsSteps = String(physicsEngine?.snapshot().stepCount ?? 0);
    lastStatusTime = now;
  }
  if (state.playing || now<movingUntil || drag) renderSoon();
  else previousFrame=0;
}

function syncControls() {
  if (!state) return;
  document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===state.mode)));
  $('[data-action=play]').textContent = state.playing ? '動きを止める' : (physicsBinding ? '動かす' : '浮かべる');
  $('[data-action=play]').setAttribute('aria-pressed',String(state.playing));
  $('[data-action=drag]').setAttribute('aria-pressed',String(state.draggingImages));
  $('[data-action=drag]').textContent = state.draggingImages ? 'つかむ：入' : '画像をつかむ';
  physicsInput.checked = state.physics === 'enabled';
  physicsInput.disabled = state.physics === 'loading';
  $('.gravity-control').hidden = !physicsBinding;
  $('[data-action=kick]').hidden = !physicsBinding;
  gravitySelect.value = state.gravity ? 'on' : 'off';
  $('.gesture-hint').textContent = state.draggingImages || physicsBinding
    ? '画像をドラッグして動かす · 空いた場所で視点を回す'
    : 'ドラッグで視点を回す · ホイールで拡大';
  canvas.dataset.physics = state.physics;
  canvas.dataset.view = state.mode;
  canvas.dataset.playing = String(state.playing);
  status.textContent = state.physics === 'loading' ? '物理演算を読み込んでいます…' : physicsBinding ? (state.playing ? `物理：入 · ${state.gravity ? '落下' : '無重力'}` : '物理：入 · 一時停止') : '物理：切';
}

function cameraForView() {
  const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
  const target = state.mode === 'single' ? panels[state.selected].position.clone() : new THREE.Vector3(0,-.2,0);
  const distance = state.mode === 'single' ? Math.max(6.8,3.8/(tangent*camera.aspect)) : Math.max(24,20/(tangent*camera.aspect));
  camera.position.set(target.x,target.y,target.z+distance);
  controls.target.copy(target); controls.update(); renderSoon(150);
}

function resize() {
  if (!renderer) return;
  const bounds = stage.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,manifest.maximum_device_pixel_ratio));
  renderer.setSize(bounds.width,bounds.height,false);
  camera.aspect = bounds.width/bounds.height; camera.updateProjectionMatrix();
  cameraForView();
}

async function ensureTexture(index) {
  if (textures.has(index)) return;
  if (loadingImages.has(index)) return loadingImages.get(index);
  const item = manifest.items[index];
  const promise = new THREE.TextureLoader().loadAsync(item.image_url).then(texture=>{
    texture.uuid=item.texture_identifier; texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    texture.generateMipmaps=true;
    textures.set(index,texture);
    const material=surfaces[index].material;
    material.map=texture; material.color.set(0xffffff); material.needsUpdate=true;
    panels[index].userData.ready=true;
    canvas.dataset.loadedImages=String(textures.size);
    if(index===state.selected || state.mode==='all') loading.hidden=true;
    engineStatus.textContent=`WebGL 2 · ${textures.size} / 15枚`;
    renderSoon();
  }).catch(error=>{
    trace.add('image_load_failed',{reference_identifier:item.artist_reference_identifier,message:String(error)});
    loading.hidden=false;loading.textContent='画像を読み込めませんでした。再読み込みでやり直せます。';
    throw error;
  }).finally(()=>loadingImages.delete(index));
  loadingImages.set(index,promise);return promise;
}

async function loadAllTextures() {
  // Four in-flight decodes bound peak work while preserving all original image files.
  let next=0;
  await Promise.all(Array.from({length:4},async()=>{while(next<manifest.items.length){const index=next++;await ensureTexture(index);}}));
}

function updateSelection() {
  const item=manifest.items[state.selected];
  $('.artist-name').textContent=item.artist_name;
  $('.selection h2').textContent=item.title;
  $('.description').textContent=item.description;
  $('.original').href=item.image_url;
  document.querySelectorAll('.artist-strip button').forEach((button,index)=>button.setAttribute('aria-pressed',String(index===state.selected)));
  panels.forEach((panel,index)=>{
    panel.visible=state.mode==='all'||index===state.selected;
    panel.userData.outline.material.color.set(index===state.selected ? '#c5b27e' : '#26343c');
    panel.userData.outline.visible=state.mode==='all';
  });
  canvas.dataset.selectedArtist=item.artist_name;
  loading.hidden=Boolean(panels[state.selected].userData.ready) || state.mode==='all';
  ensureTexture(state.selected).catch(()=>{});
  renderSoon();
}

function selectArtist(index) {
  state.selected=(index+manifest.items.length)%manifest.items.length;
  updateSelection();
  const button=document.querySelectorAll('.artist-strip button')[state.selected];
  button.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
  if(state.mode==='single') cameraForView();
  trace.add('artist_selected',{reference_identifier:manifest.items[state.selected].artist_reference_identifier});
}

function setView(mode) {
  if(mode==='single' && state.physics!=='disabled') stopPhysics();
  state.mode=mode;updateSelection();cameraForView();syncControls();
  if(mode==='all')loadAllTextures().catch(()=>{});
  trace.add('view_changed',{mode});
}

function endDrag(cancelled=false) {
  if(!drag)return;
  if(physicsEngine && state.physics==='enabled')physicsEngine.release(manifest.items[drag.index].record_id,cancelled?[0,0]:drag.velocity);
  try{canvas.releasePointerCapture(drag.pointerId);}catch{}
  bases[drag.index].copy(panels[drag.index].position);
  drag=null;controls.enabled=true;canvas.style.cursor='';renderSoon(180);
}

function stopPhysics() {
  physicsGeneration++;
  endDrag(true);
  physicsBinding?.dispose();physicsBinding=null;physicsEngine=null;
  panels.forEach((panel,index)=>{bases[index].copy(panel.position);baseRotations[index].copy(panel.rotation);});
  state.physics='disabled';state.playing=false;state.gravity=false;
  trace.add('physics_disabled');syncControls();renderSoon();
}

async function startPhysics() {
  if(state.physics!=='disabled')return;
  const generation=++physicsGeneration;
  state.physics='loading';syncControls();
  try {
    const {createPhysicsEngine}=await import('./physics.mjs');
    const engine=await createPhysicsEngine(manifest.physics_adapter_identifier);
    if(generation!==physicsGeneration||!contextAvailable)return;
    state.mode='all';
    panels.forEach(panel=>{panel.position.z=0;panel.rotation.set(0,0,0);panel.updateMatrix();});
    const enabledRecipes=manifest.items.map(item=>({...item,physics:{...item.physics,enabled:true}}));
    physicsBinding=connectOptionalPhysics(scene,enabledRecipes,engine.adapter);
    physicsEngine=engine;state.physics='enabled';state.playing=true;state.gravity=false;
    updateSelection();cameraForView();syncControls();
    loadAllTextures().catch(()=>{});
    trace.add('physics_enabled',{engine_version:manifest.rapier_version,body_count:manifest.items.length});renderSoon();
  } catch(error) {
    stopPhysics();status.textContent='物理演算を開始できませんでした。もう一度切り替えてください。';
    trace.add('physics_failed',{message:String(error)});console.error(error);
  }
}

function resetExhibition() {
  stopPhysics();endDrag(true);
  panels.forEach((panel,index)=>{panel.position.fromArray(state.initialPositions[index]);panel.rotation.set(0,0,0);bases[index].copy(panel.position);baseRotations[index].copy(panel.rotation);});
  animationTime=0;state.playing=false;cameraForView();syncControls();
  trace.add('display_reset',{semantic_positions_unchanged:true});renderSoon();
}

// machine contract; record_identifier=0557ed75-e7ec-5d1e-979b-b284003935bc (UUIDv5).
// transition: validated batch -> shared selection/view/physics handlers -> loaded textures -> rendered result.
function imageExhibitionSnapshot(){
  const item=manifest.items[state.selected];
  return {ready:contextAvailable&&canvas.dataset.exhibitionReady==='true',artistIdentifier:item.record_id,artist:item.artist_name,
    view:state.mode,playing:state.playing,physics:state.physics,gravity:state.gravity,loadedImages:textures.size,
    displayPosition:panels[state.selected].position.toArray(),sourceCoordinate:structuredClone(item.semantic_position),
    renderedFrames:renderer.info.render.frame,links:communityLinks};
}
function requireActiveImageExhibition(){if(!contextAvailable||!state||document.hidden)throw new Error('Open the image exhibition and wait for it to be ready.');}
async function presentImageExhibition(expected,resetTransforms){
  requireActiveImageExhibition();syncControls();const completed=presentation.next();renderSoon();await completed;
  requireActiveImageExhibition();const observed=imageExhibitionSnapshot();
  assertPresentedState(expected,observed);
  if(resetTransforms)assertPresentedState(resetTransforms,{positions:panels.map(panel=>panel.position.toArray()),rotations:panels.map(panel=>panel.rotation.toArray())});
  return observed;
}
function connectImageExhibitionTools(){
  pageTools?.dispose();
  pageTools=registerPageTools(document.modelContext,imageExhibitionTools({
    catalog:()=>({images:manifest.items.map(item=>({artistIdentifier:item.record_id,artist:item.artist_name,artistJapanese:item.artist_name_ja,title:item.title})),links:communityLinks}),
    snapshot:imageExhibitionSnapshot,
    async configure(input){
      requireActiveImageExhibition();
      const index=input.artist_identifier?manifest.items.findIndex(item=>item.record_id===input.artist_identifier):state.selected;
      if(index<0)throw new TypeError('Unknown artist identifier. Read the image catalogue first.');
      const desiredPhysics=input.physics_enabled??(input.view==='single'?false:state.physics==='enabled');
      if(input.gravity_enabled&&!desiredPhysics)throw new TypeError('Gravity requires physics.');
      if(state.physics==='loading'&&input.physics_enabled!==false)throw new Error('Physics is still loading.');
      const expected=imageConfigurationTarget(imageExhibitionSnapshot(),input);
      endDrag(true);
      if(input.physics_enabled===false||input.view==='single')stopPhysics();
      if(input.view!==undefined)setView(input.view);
      if(input.artist_identifier!==undefined)selectArtist(index);
      if(input.physics_enabled===true){await startPhysics();if(state.physics!=='enabled')throw new Error('Physics did not become active.');}
      if(input.gravity_enabled!==undefined){state.gravity=input.gravity_enabled;physicsEngine?.setGravity(state.gravity);}
      if(input.playing!==undefined){state.playing=input.playing;previousFrame=0;}
      if(expected.view==='all')await loadAllTextures();else await ensureTexture(index);
      return presentImageExhibition(expected);
    },
    async reset(){
      requireActiveImageExhibition();const expected=imageConfigurationTarget(imageExhibitionSnapshot(),{physics_enabled:false,playing:false,gravity_enabled:false});
      resetExhibition();
      const transforms={positions:panels.map(panel=>panel.position.toArray()),rotations:panels.map(panel=>panel.rotation.toArray())};
      return presentImageExhibition(expected,transforms);
    },
  }),{onStatus:value=>{canvas.dataset.webmcp=value;},onExecution:event=>trace.add('WebMCP action completed',event)});
}

function pointerToRay(event) {
  const bounds=canvas.getBoundingClientRect();
  pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);
  raycaster.setFromCamera(pointer,camera);
}

function hitIndex(event) {
  pointerToRay(event);
  const hits=raycaster.intersectObjects(panels.filter(panel=>panel.visible).map(panel=>panel.userData.front));
  return hits.length ? hits[0].object.userData.index : -1;
}

function bindInteraction() {
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    const index=hitIndex(event);
    if(index<0 || !(state.draggingImages||physicsBinding))return;
    if(!raycaster.ray.intersectPlane(pointerPlane,intersection))return;
    controls.enabled=false;
    drag={index,pointerId:event.pointerId,offset:panels[index].position.clone().sub(intersection),last:panels[index].position.clone(),lastTime:performance.now(),velocity:[0,0]};
    state.selected=index;updateSelection();
    canvas.setPointerCapture(event.pointerId);canvas.style.cursor='grabbing';
    if(physicsEngine){physicsEngine.hold(manifest.items[index].record_id);state.playing=true;syncControls();}
    trace.add('drag_started',{reference_identifier:manifest.items[index].artist_reference_identifier});renderSoon();
  },{capture:true});
  canvas.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.pointerId)return;
    pointerToRay(event);
    if(!raycaster.ray.intersectPlane(pointerPlane,intersection))return;
    const position=clampPanelPosition(intersection.x+drag.offset.x,intersection.y+drag.offset.y);
    const now=performance.now(),elapsed=Math.max((now-drag.lastTime)/1000,.008);
    drag.velocity=[(position[0]-drag.last.x)/elapsed,(position[1]-drag.last.y)/elapsed];
    drag.last.fromArray(position);drag.lastTime=now;
    if(physicsEngine)physicsEngine.move(manifest.items[drag.index].record_id,position);
    else {panels[drag.index].position.fromArray(position);bases[drag.index].fromArray(position);}
    renderSoon();
  });
  canvas.addEventListener('pointerup',()=>endDrag());canvas.addEventListener('pointercancel',()=>endDrag(true));
  canvas.addEventListener('dblclick',event=>{const index=hitIndex(event);if(index>=0){state.selected=index;setView('single');}});
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
  $('[data-action=play]').addEventListener('click',()=>{state.playing=!state.playing;previousFrame=0;syncControls();trace.add('playback_changed',{playing:state.playing});renderSoon();});
  $('[data-action=drag]').addEventListener('click',()=>{endDrag(true);state.draggingImages=!state.draggingImages;syncControls();});
  $('[data-action=reset]').addEventListener('click',resetExhibition);
  $('[data-action=previous]').addEventListener('click',()=>selectArtist(state.selected-1));
  $('[data-action=next]').addEventListener('click',()=>selectArtist(state.selected+1));
  physicsInput.addEventListener('change',()=>physicsInput.checked?startPhysics():stopPhysics());
  gravitySelect.addEventListener('change',()=>{state.gravity=gravitySelect.value==='on';physicsEngine?.setGravity(state.gravity);state.playing=true;syncControls();trace.add('gravity_changed',{enabled:state.gravity});renderSoon();});
  $('[data-action=kick]').addEventListener('click',()=>{physicsEngine?.kick();state.playing=true;syncControls();trace.add('display_impulse');renderSoon();});
  document.addEventListener('keydown',event=>{
    if(event.target!==canvas)return;
    if(event.key==='ArrowLeft'){event.preventDefault();selectArtist(state.selected-1);}
    if(event.key==='ArrowRight'){event.preventDefault();selectArtist(state.selected+1);}
    if(event.key===' '){event.preventDefault();$('[data-action=play]').click();}
    if(event.key==='Escape'){endDrag(true);state.playing=false;syncControls();}
  });
  document.addEventListener('visibilitychange',()=>{previousFrame=0;endDrag(true);if(document.hidden){cancelAnimationFrame(frameRequest);frameRequest=0;}else renderSoon();});
  reducedMotion.addEventListener('change',event=>{if(event.matches){state.playing=false;syncControls();renderSoon();}});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();contextAvailable=false;pageTools?.dispose();presentation.cancel();state.playing=false;endDrag(true);cancelAnimationFrame(frameRequest);frameRequest=0;$('.fallback').hidden=false;engineStatus.textContent='立体描画が中断しました';trace.add('webgl_context_lost');});
  canvas.addEventListener('webglcontextrestored',()=>{contextAvailable=true;$('.fallback').hidden=true;engineStatus.textContent=`WebGL 2 · ${textures.size} / 15枚`;trace.add('webgl_context_restored');syncControls();renderSoon();connectImageExhibitionTools();});
  window.addEventListener('pagehide',()=>{pageTools?.dispose();presentation.cancel();});
  window.addEventListener('pageshow',event=>{if(event.persisted&&contextAvailable)connectImageExhibitionTools();});
}

async function initialize() {
  manifest=await fetch('./exhibition.json').then(response=>{if(!response.ok)throw new Error('Exhibition manifest could not be loaded.');return response.json();});
  state=createExhibitionState(manifest);trace=createTrace(manifest.record_id);
  const context=canvas.getContext('webgl2',{antialias:true,powerPreference:'low-power',alpha:false});
  if(!context)throw new Error('WebGL 2 is not available.');
  renderer=new THREE.WebGLRenderer({canvas,context,antialias:true});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
  renderer.setClearColor('#0b1218');contextAvailable=true;
  canvas.dataset.contextVersion=context.getParameter(context.VERSION);
  scene=new THREE.Scene();scene.uuid=manifest.record_id;
  camera=new THREE.PerspectiveCamera(42,1,.1,220);
  controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.1;controls.minDistance=2;controls.maxDistance=110;controls.enablePan=true;
  controls.addEventListener('change',()=>renderSoon());controls.addEventListener('start',()=>renderSoon(300));controls.addEventListener('end',()=>renderSoon(900));
  scene.add(new THREE.AmbientLight('#cad7de',1.3));const light=new THREE.DirectionalLight('#f0dfb8',2);light.position.set(-8,12,15);scene.add(light);
  const geometry=new THREE.PlaneGeometry(6,4),bodyGeometry=new THREE.BoxGeometry(6,4,.12),edgeGeometry=new THREE.EdgesGeometry(bodyGeometry);
  const bodyMaterial=new THREE.MeshStandardMaterial({color:'#152029',roughness:.72,metalness:.18});
  for(const [index,item] of manifest.items.entries()) {
    const panel=new THREE.Group();panel.uuid=item.record_id;panel.name=item.artist_name;panel.position.fromArray(item.presentation_position);
    panel.userData={artistReferenceIdentifier:item.artist_reference_identifier,coordinateSpace:'presentation_only',ready:false};
    const material=new THREE.MeshBasicMaterial({color:'#13222c',toneMapped:false});material.uuid=item.material_identifier;
    const front=new THREE.Mesh(geometry,material);front.position.z=.065;front.userData.index=index;
    const back=new THREE.Mesh(geometry,material);back.rotation.y=Math.PI;back.position.z=-.065;
    const outline=new THREE.LineSegments(edgeGeometry,new THREE.LineBasicMaterial({color:'#26343c'}));
    panel.add(new THREE.Mesh(bodyGeometry,bodyMaterial),front,back,outline);panel.userData.front=front;panel.userData.outline=outline;
    scene.add(panel);panels.push(panel);surfaces.push(front);bases.push(panel.position.clone());baseRotations.push(panel.rotation.clone());
    const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`${item.artist_name_ja}を選ぶ`);button.setAttribute('aria-pressed',String(index===0));
    const image=document.createElement('img');image.src=item.image_url;image.alt='';image.width=95;image.height=63;image.loading='lazy';image.decoding='async';
    const label=document.createElement('span');label.textContent=item.artist_name_ja;button.append(image,label);button.addEventListener('click',()=>selectArtist(index));$('.artist-strip').append(button);
  }
  // Sparse stationary stars belong to the presentation scene, not the generated image pixels.
  const starPositions=[];let seed=18417;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let index=0;index<600;index++)starPositions.push((random()-.5)*160,(random()-.5)*95,-25-random()*60);
  const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));
  scene.add(new THREE.Points(starGeometry,new THREE.PointsMaterial({color:'#7f939e',size:.065,transparent:true,opacity:.55,depthWrite:false})));
  bindInteraction();new ResizeObserver(resize).observe(stage);resize();updateSelection();syncControls();
  await ensureTexture(0);loading.hidden=true;trace.add('webgl2_ready',{context:canvas.dataset.contextVersion,physics_enabled:false});
  canvas.dataset.exhibitionReady='true';
  renderSoon();
  connectImageExhibitionTools();
  // Read-only receipts are available to a host's integration checks without granting mutation authority.
  window.lumeniaExhibition=Object.freeze({snapshot:()=>({recordIdentifier:manifest.record_id,renderer:canvas.dataset.contextVersion,physics:state.physics,playing:state.playing,selectedArtist:manifest.items[state.selected].artist_name,loadedImages:textures.size,physicsState:physicsEngine?.snapshot()??null,displayPositions:panels.map(panel=>panel.position.toArray()),semanticPositions:manifest.items.map(item=>item.semantic_position?.values??null),events:trace.snapshot()})});
}

$('[data-action=reload]').addEventListener('click',()=>location.reload());
initialize().catch(error=>{console.error(error);loading.hidden=true;$('.fallback').hidden=false;engineStatus.textContent='立体表示を利用できません';document.querySelectorAll('.motion-controls button,.motion-controls input,[data-view]').forEach(control=>control.disabled=true);});
