import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { cosmicCatalog } from './cosmic-catalog.generated.mjs';
import { cosmicRecipes } from './cosmic-recipes.generated.mjs';
import { createThreeObject, disposeThreeObject } from './threejs-reference-adapter.mjs';
import { createSemanticCoordinateIndex, connectOptionalPhysics } from './reference-physics-contract.mjs';
import { advancePresentationClock, exhibitionLimits, intersectsYears, orbitPosition } from './cosmic-state.mjs';

// llm machine contract; claim UUIDv5: 190fdb1a-2e41-565d-9aed-9fe5ca2179a6
// transition: client intersection -> lazy scene -> interaction or bounded motion -> suspended -> disposed.
// Rapier is an optional injection point. This exhibition never starts a physics world.
/** @param {{canvas: HTMLCanvasElement, onSelect: (identifier: string) => void, onState: (state: string) => void, onTime?: (seconds: number) => void}} options */
export function createCosmicScene({ canvas, onSelect, onState, onTime = () => {} }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#080d1c');
  scene.fog = new THREE.FogExp2('#080d1c', 0.009);
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 200);
  camera.position.set(16, 18, 25);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, exhibitionLimits.maximumPixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.minDistance = 1.8;
  controls.maxDistance = 65;
  controls.maxPolarAngle = Math.PI * 0.91;
  controls.saveState();
  scene.add(new THREE.HemisphereLight('#b4cdf7', '#2b1626', 2.5));
  const keyLight = new THREE.DirectionalLight('#fff4d3', 3.6);
  keyLight.position.set(6, 12, 9); scene.add(keyLight);
  const sunLight = new THREE.PointLight('#ffbe7f', 18, 45, 1.2); scene.add(sunLight);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.05, 32, 16),
    new THREE.MeshBasicMaterial({ color: '#ffcc88' }));
  scene.add(sun);
  // Broad atmosphere is a small transparent mesh, not a full-screen post-processing pass.
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 12),
    new THREE.MeshBasicMaterial({ color: '#ffab64', transparent: true, opacity: 0.13,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide }));
  scene.add(atmosphere);
  const stars = new Float32Array(exhibitionLimits.starCount * 3);
  let seed = 1978;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let index = 0; index < exhibitionLimits.starCount; index++) {
    const longitude = random() * Math.PI * 2, height = random() * 2 - 1, radius = 35 + random() * 30;
    const span = Math.sqrt(1 - height * height);
    stars.set([radius * span * Math.cos(longitude), radius * height, radius * span * Math.sin(longitude)], index * 3);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3));
  scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: '#b8d6f4', size: 0.065, sizeAttenuation: true })));
  const planets = cosmicRecipes.map(recipe => { const object = createThreeObject(recipe); scene.add(object); return object; });
  const orbitMaterial = new THREE.LineBasicMaterial({ color: '#516281', transparent: true, opacity: 0.33, depthWrite: false });
  const orbits = cosmicCatalog.map(person => {
    const points = Array.from({ length: 129 }, (_, index) => new THREE.Vector3(...orbitPosition(person.orbit, person.orbit.periodSeconds * index / 128)));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), orbitMaterial);
    line.uuid = person.orbit.identifier; scene.add(line); return line;
  });
  const selectionRing = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.009, 6, 48),
    new THREE.MeshBasicMaterial({ color: '#e9efa7', depthTest: false }));
  selectionRing.visible = false; selectionRing.renderOrder = 1; scene.add(selectionRing);
  const semantics = createSemanticCoordinateIndex(cosmicRecipes);
  const physics = connectOptionalPhysics(scene, cosmicRecipes);
  let disposed = false, visible = true, playing = false, reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seconds = 0, frame = 0, previousTime = 0, dirty = true, selected = '', startYear = 1880, endYear = 2020;
  let showUnknown = true, lastFocus = '', hasSize = false;
  let lastRenderMilliseconds = -Infinity, reportedSecond = -1;
  const pointer = new THREE.Vector2(), raycaster = new THREE.Raycaster();
  const pointerStart = { x: 0, y: 0 };
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const telemetry = () => {
    canvas.dataset.renderedFrames = String(Number(canvas.dataset.renderedFrames || 0) + 1);
    canvas.dataset.drawCalls = String(renderer.info.render.calls);
    canvas.dataset.triangles = String(renderer.info.render.triangles);
    canvas.dataset.physics = 'disabled';
    canvas.dataset.people = String(planets.filter(object => object.visible).length);
    canvas.dataset.presentationSeconds = seconds.toFixed(3);
  };
  function updateBodies() {
    planets.forEach((planet, index) => {
      const person = cosmicCatalog[index], matched = intersectsYears(person.period, startYear, endYear);
      planet.visible = matched === null ? showUnknown : matched;
      orbits[index].visible = planet.visible && !selected;
      planet.position.fromArray(orbitPosition(person.orbit, seconds));
      planet.rotation.y = seconds * 0.025;
      planet.material.emissive.set(person.identifier === selected ? '#273346' : '#000000');
    });
    const index = cosmicCatalog.findIndex(person => person.identifier === selected);
    selectionRing.visible = index >= 0 && planets[index].visible;
    if (selectionRing.visible) { selectionRing.position.copy(planets[index].position); selectionRing.quaternion.copy(camera.quaternion); }
  }
  function draw(now) {
    frame = 0;
    if (disposed || !visible || document.hidden || !hasSize) { previousTime = 0; return; }
    const animate = playing && !reducedMotion;
    const elapsed = previousTime ? (now - previousTime) / 1000 : 0;
    if ((dirty || animate) && now - lastRenderMilliseconds >= 1000 / exhibitionLimits.maximumFramesPerSecond) {
      seconds = advancePresentationClock(seconds, elapsed, animate, visible, reducedMotion);
      previousTime = now; lastRenderMilliseconds = now;
      updateBodies(); renderer.render(scene, camera); telemetry(); dirty = false;
      if (Math.floor(seconds) !== reportedSecond) { reportedSecond = Math.floor(seconds); onTime(seconds); }
    }
    if (animate || dirty) frame = requestAnimationFrame(draw);
  }
  function invalidate() {
    if (disposed) return;
    dirty = true;
    if (!frame && visible && !document.hidden && hasSize) frame = requestAnimationFrame(draw);
  }
  function resize() {
    const rectangle = canvas.getBoundingClientRect();
    hasSize = rectangle.width > 0 && rectangle.height > 0;
    if (hasSize) { renderer.setSize(rectangle.width, rectangle.height, false); camera.aspect = rectangle.width / rectangle.height; camera.updateProjectionMatrix(); invalidate(); }
  }
  function onVisibility() { previousTime = 0; if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else invalidate(); }
  function onMotionPreference(event) { reducedMotion = event.matches; previousTime = 0; invalidate(); }
  function onPointerDown(event) { pointerStart.x = event.clientX; pointerStart.y = event.clientY; }
  function onPointerUp(event) {
    if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 7) return;
    const rectangle = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rectangle.left) / rectangle.width * 2 - 1, -(event.clientY - rectangle.top) / rectangle.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(planets.filter(planet => planet.visible), false)[0];
    if (hit) onSelect(cosmicCatalog[planets.indexOf(hit.object)].identifier);
  }
  function onContextLost(event) { event.preventDefault(); onState('unavailable'); dispose(); }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas);
  controls.addEventListener('change', invalidate);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('webglcontextlost', onContextLost);
  document.addEventListener('visibilitychange', onVisibility);
  media.addEventListener('change', onMotionPreference);
  resize(); onState('ready');
  function dispose() {
    if (disposed) return; disposed = true;
    cancelAnimationFrame(frame); controls.removeEventListener('change', invalidate); controls.dispose();
    resizeObserver.disconnect(); media.removeEventListener('change', onMotionPreference);
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    physics.dispose(); disposeThreeObject(scene); renderer.dispose();
  }
  return {
    /** @param {{selected: string, playing: boolean, startYear: number, endYear: number, showUnknown: boolean}} state */
    apply(state) {
      if (disposed) return;
      selected = state.selected; playing = state.playing;
      if (!playing) onTime(seconds);
      startYear = state.startYear; endYear = state.endYear; showUnknown = state.showUnknown;
      updateBodies();
      if (selected !== lastFocus) {
        if (selected) {
          const index = cosmicCatalog.findIndex(person => person.identifier === selected);
          if (index >= 0) { const position = planets[index].position; controls.target.copy(position); camera.position.copy(position).add(new THREE.Vector3(1.7, 1.1, 2.2)); }
        } else controls.reset();
        controls.update(); lastFocus = selected;
      }
      previousTime = 0; invalidate();
    },
    setVisible(value) { visible = value; previousTime = 0; if (!visible) { cancelAnimationFrame(frame); frame = 0; } else invalidate(); },
    setSeconds(value) { if (!Number.isFinite(value) || value < 0 || value > 86400) throw new RangeError('Presentation time outside [0,86400]'); seconds = value; previousTime = 0; onTime(seconds); invalidate(); },
    zoom(factor) { camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target); controls.update(); invalidate(); },
    rotate(radians) { const offset = camera.position.clone().sub(controls.target); offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), radians); camera.position.copy(controls.target).add(offset); controls.update(); invalidate(); },
    semanticDistance(first, second) { return semantics.distanceBetween(first, second); },
    dispose,
  };
}
