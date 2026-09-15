import { limits } from './navigation.mjs';

// llm machine contract; UUIDv5: be15d308-d6c7-5b93-aca4-32206c14ac81.
// transition: explicit collision request -> local Rapier load -> world -> disposal.
// All surfaces come from the same mesh triangles. A torus keeps its open centre.
export async function createCollisionWorld(surfaces, initialPosition) {
  const {default: RAPIER} = await import('../interactive/vendor/rapier.mjs');
  await RAPIER.init();
  const world = new RAPIER.World({x:0,y:0,z:0});
  for (const {vertices, indices} of surfaces) world.createCollider(RAPIER.ColliderDesc.trimesh(vertices, indices).setFriction(0.4).setRestitution(0));
  const observer = world.createCollider(RAPIER.ColliderDesc.ball(limits.observerRadius).setTranslation(...initialPosition));
  const controller = world.createCharacterController(limits.contactGap);
  controller.setSlideEnabled(true);
  controller.setMaxSlopeClimbAngle(Math.PI / 2);
  controller.setMinSlopeSlideAngle(Math.PI / 2);
  world.updateSceneQueries();
  let disposed = false, contacts = 0;
  return {
    move(position, delta) {
      if (disposed) throw new Error('The collision world was disposed');
      observer.setTranslation({x:position[0],y:position[1],z:position[2]});
      world.updateSceneQueries();
      controller.computeColliderMovement(observer, {x:delta[0],y:delta[1],z:delta[2]}, undefined, undefined, candidate => candidate.handle !== observer.handle);
      const moved = controller.computedMovement(); contacts += controller.numComputedCollisions();
      const next = [position[0]+moved.x, position[1]+moved.y, position[2]+moved.z];
      observer.setTranslation({x:next[0],y:next[1],z:next[2]});
      return next;
    },
    get contacts() {return contacts;},
    dispose() { if (!disposed) {disposed = true; world.free();} },
  };
}
