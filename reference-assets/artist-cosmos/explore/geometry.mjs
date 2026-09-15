import * as THREE from '../interactive/vendor/three.module.js';

// llm machine contract; UUIDv5: be15d308-d6c7-5b93-aca4-32206c14ac81.
// transition: declarative shapes -> closed meshes -> reusable collision surfaces -> disposal.
export function createWorldGeometry(recipe) {
  const group = new THREE.Group(), solids = [], geometryCache = new Map(), materialCache = new Map();
  function geometry(shape) {
    const key = JSON.stringify([shape.kind, shape.parameters]);
    if (!geometryCache.has(key)) {
      const parameters = shape.parameters;
      const factories = {
        sphere: () => new THREE.SphereGeometry(parameters[0], 40, 28),
        torus: () => new THREE.TorusGeometry(parameters[0], parameters[1], 12, 72),
        annulus: () => {
          const outline=new THREE.Shape(), hole=new THREE.Path();
          const start=parameters[3]??0,end=start+(parameters[4]??Math.PI*2);
          outline.absarc(0,0,parameters[0],start,end,false);
          if(end-start<Math.PI*2-0.001){outline.lineTo(Math.cos(end)*parameters[1],Math.sin(end)*parameters[1]);outline.absarc(0,0,parameters[1],end,start,true);outline.closePath();}
          else {hole.absarc(0,0,parameters[1],0,Math.PI*2,true);outline.holes.push(hole);}
          const result=new THREE.ExtrudeGeometry(outline,{depth:parameters[2],bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:0.04,bevelThickness:0.04,curveSegments:48});
          result.translate(0,0,-parameters[2]/2);return result;
        },
        box: () => new THREE.BoxGeometry(...parameters),
        roundedBox: () => {
          const result=new THREE.BoxGeometry(parameters[0],parameters[1],parameters[2],10,10,10);
          const positions=result.getAttribute('position'),normals=result.getAttribute('normal'),point=new THREE.Vector3(),inner=new THREE.Vector3(),direction=new THREE.Vector3();
          const radius=parameters[3];
          for(let index=0;index<positions.count;index++){
            point.fromBufferAttribute(positions,index);inner.set(...point.toArray().map((value,axis)=>Math.max(-parameters[axis]/2+radius,Math.min(parameters[axis]/2-radius,value))));
            direction.copy(point).sub(inner).normalize();point.copy(inner).addScaledVector(direction,radius);positions.setXYZ(index,point.x,point.y,point.z);normals.setXYZ(index,direction.x,direction.y,direction.z);
          }
          return result;
        },
        shell: () => {
          const profile=[],radius=parameters[0],thickness=parameters[1];
          for(let step=0;step<=24;step++){const angle=step/24*Math.PI*0.65;profile.push(new THREE.Vector2(Math.sin(angle)*radius,Math.cos(angle)*radius));}
          for(let step=24;step>=0;step--){const angle=step/24*Math.PI*0.65;profile.push(new THREE.Vector2(Math.sin(angle)*(radius-thickness),Math.cos(angle)*(radius-thickness)));}
          return new THREE.LatheGeometry(profile,56);
        },
        cylinder: () => new THREE.CylinderGeometry(parameters[0], parameters[1], parameters[2], parameters[3] ?? 40),
        tube: () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(parameters[0].map(point => new THREE.Vector3(...point))), 64, parameters[1], 8, false),
      };
      if (!factories[shape.kind]) throw new TypeError('Unknown shape: ' + shape.kind);
      geometryCache.set(key, factories[shape.kind]());
    }
    return geometryCache.get(key);
  }
  function material(shape) {
    const settings = {color:shape.color, roughness:shape.roughness ?? 0.65, metalness:shape.metalness ?? 0.08,
      emissive:shape.emissive ?? '#000000', emissiveIntensity:shape.emissive ? 0.7 : 0,
      transparent:shape.opacity !== undefined, opacity:shape.opacity ?? 1, depthWrite:shape.opacity === undefined};
    const key = JSON.stringify(settings);
    if (!materialCache.has(key)) {
      const surface=new THREE.MeshStandardMaterial(settings);
      surface.onBeforeCompile=shader=>{
        shader.vertexShader='varying vec3 materialPoint;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nmaterialPoint = position;');
        shader.fragmentShader='varying vec3 materialPoint;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\nfloat grain = fract(sin(dot(floor(materialPoint * 45.0), vec3(12.9898,78.233,37.719))) * 43758.5453); diffuseColor.rgb *= mix(0.85, 1.05, grain);');
      };
      materialCache.set(key,surface);
    }
    return materialCache.get(key);
  }
  for (const shape of recipe.shapes) {
    const mesh = new THREE.Mesh(geometry(shape), material(shape));
    mesh.position.fromArray(shape.position);
    mesh.rotation.set(...(shape.rotation ?? [0,0,0]));
    mesh.scale.fromArray(shape.scale ?? [1,1,1]);
    mesh.userData.recordIdentifier = shape.recordIdentifier;
    group.add(mesh);
    if (shape.collision !== false && (shape.opacity === undefined || shape.collision === true)) solids.push(mesh);
  }
  group.updateMatrixWorld(true);
  return {group, solids, dispose() { group.clear(); for (const item of geometryCache.values()) item.dispose(); for (const item of materialCache.values()) item.dispose(); }};
}

export function collisionSurfaces(meshes) {
  return meshes.map(mesh => {
    const position = mesh.geometry.getAttribute('position'), vertex = new THREE.Vector3();
    const vertices = new Float32Array(position.count * 3);
    for (let index = 0; index < position.count; index++) {
      vertex.fromBufferAttribute(position, index).applyMatrix4(mesh.matrixWorld);
      vertices.set(vertex.toArray(), index * 3);
    }
    const indices = mesh.geometry.index ? new Uint32Array(mesh.geometry.index.array) : Uint32Array.from({length:position.count}, (_,index) => index);
    return {vertices, indices};
  });
}

export function createStars(seed = 1) {
  let state = seed;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const positions = [], colors = [];
  for (let index = 0; index < 2200; index++) {
    const angle = random() * Math.PI * 2, height = random() * 2 - 1, radius = 140 + random() * 300;
    const horizontal = Math.sqrt(1 - height * height);
    positions.push(Math.cos(angle) * horizontal * radius, height * radius, Math.sin(angle) * horizontal * radius);
    const brightness = 0.35 + random() * 0.65; colors.push(brightness, brightness * 0.9, brightness * 0.8);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({size:0.32, vertexColors:true, transparent:true, opacity:0.85, depthWrite:false});
  const points = new THREE.Points(geometry, material);
  return {points, dispose() {geometry.dispose(); material.dispose();}};
}

export function createNebula() {
  const geometry=new THREE.SphereGeometry(700,24,16);
  const material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,
    vertexShader:'varying vec3 skyDirection; void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:`varying vec3 skyDirection;
      float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float n=dot(i,vec3(1.0,57.0,113.0));
      return mix(mix(mix(fract(sin(n)*43758.5),fract(sin(n+1.0)*43758.5),f.x),mix(fract(sin(n+57.0)*43758.5),fract(sin(n+58.0)*43758.5),f.x),f.y),mix(mix(fract(sin(n+113.0)*43758.5),fract(sin(n+114.0)*43758.5),f.x),mix(fract(sin(n+170.0)*43758.5),fract(sin(n+171.0)*43758.5),f.x),f.y),f.z);}
      void main(){vec3 direction=normalize(skyDirection);vec3 p=direction*5.0;float cloud=noise(p)*0.5+noise(p*2.1)*0.25+noise(p*4.3)*0.125+noise(p*8.4)*0.0625;
      float band=exp(-pow((direction.y+direction.x*0.4+0.1)*3.0,2.0));float glow=pow(max(0.0,cloud-0.24),2.0)*band;
      vec3 color=vec3(0.015,0.012,0.027)+mix(vec3(0.28,0.16,0.42),vec3(0.8,0.34,0.12),smoothstep(-0.2,0.6,direction.x))*glow*1.4;gl_FragColor=vec4(color,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`});
  const mesh=new THREE.Mesh(geometry,material);mesh.renderOrder=-2;
  return {mesh,dispose(){geometry.dispose();material.dispose();}};
}
