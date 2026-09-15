import RAPIER from './vendor/rapier.mjs';
import { createFixedStepper } from './model.mjs';

let initialization;

// Machine contract: disabled -> explicit enable -> initialized world -> fixed steps -> disposed.
// This module is dynamically imported only after the user enables physics.
// Masses, friction, restitution and metres are presentation settings, not measured artwork properties.
export async function createPhysicsEngine(identifier) {
  initialization ??= RAPIER.init();
  await initialization;
  let world = null;
  let stepper = null;
  let stepCount = 0;
  const entries = new Map();

  function requiredEntry(recordIdentifier) {
    const entry = entries.get(recordIdentifier);
    if (!world || !entry) throw new Error('Physics body is not active.');
    return entry;
  }

  const adapter = {
    identifier,
    connect(bindings) {
      if (world) throw new Error('A physics world is already connected.');
      world = new RAPIER.World({ x: 0, y: 0, z: 0 });
      for (const [index, binding] of bindings.entries()) {
        const specification = binding.specification;
        const transform = binding.readDisplayTransform();
        const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(...transform.position)
          .setRotation({ x: transform.rotation_quaternion[0], y: transform.rotation_quaternion[1], z: transform.rotation_quaternion[2], w: transform.rotation_quaternion[3] })
          .enabledTranslations(true, true, false).enabledRotations(false, false, true)
          .setLinearDamping(.12).setAngularDamping(1.8).setCcdEnabled(true));
        const collider = RAPIER.ColliderDesc.cuboid(...specification.collider.half_extents.value)
          .setMass(specification.mass.value).setFriction(specification.friction.value).setRestitution(specification.restitution.value);
        world.createCollider(collider, body);
        body.setLinvel({ x: Math.sin(index * 2.3) * .45, y: Math.cos(index * 1.7) * .35, z: 0 }, true);
        entries.set(binding.recordIdentifier, { body, binding, index });
      }
      // The four invisible boundaries confine the interactive display; they are not semantic axes.
      for (const [x,y,hx,hy] of [[-18.6,0,.1,11],[18.6,0,.1,11],[0,-10.9,19,.1],[0,10.9,19,.1]]) {
        const boundary = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x,y,0));
        world.createCollider(RAPIER.ColliderDesc.cuboid(hx,hy,2).setFriction(.32).setRestitution(.58), boundary);
      }
      stepper = createFixedStepper(interval => { world.timestep = interval; world.step(); stepCount++; });
      return {
        step(seconds) {
          if (!world) throw new Error('Physics world has been disposed.');
          stepper.advance(seconds);
          for (const { body, binding } of entries.values()) {
            const position = body.translation(), rotation = body.rotation();
            binding.writeDisplayTransform({ position: [position.x,position.y,position.z], rotation_quaternion: [rotation.x,rotation.y,rotation.z,rotation.w] });
          }
        },
        dispose() { if (world) { world.free(); world = null; entries.clear(); stepper = null; } },
      };
    },
  };
  return {
    adapter,
    hold(recordIdentifier) { requiredEntry(recordIdentifier).body.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true); },
    move(recordIdentifier, position) { requiredEntry(recordIdentifier).body.setNextKinematicTranslation({ x:position[0], y:position[1], z:0 }); },
    release(recordIdentifier, velocity = [0,0]) {
      const { body } = requiredEntry(recordIdentifier);
      const wasKinematic = body.isKinematic();
      body.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
      // Rapier 0.12 requires re-registration here to resume dynamic integration after dragging.
      // The release regression checks actual displacement, not just the reported body type.
      if (wasKinematic) { body.setEnabled(false); body.setEnabled(true); }
      body.setLinvel({ x: Math.max(-4, Math.min(4,velocity[0])), y: Math.max(-4,Math.min(4,velocity[1])), z:0 }, true);
    },
    setGravity(enabled) { if (world) { world.gravity = {x:0,y:enabled ? -4.5 : 0,z:0}; for (const {body} of entries.values()) body.wakeUp(); } },
    kick() { for (const {body,index} of entries.values()) { body.applyImpulse({x:Math.sin(index*1.9+1)*2,y:Math.cos(index*2.1)*2+1.4,z:0},true); body.applyTorqueImpulse({x:0,y:0,z:Math.sin(index+1)*.3},true); } },
    snapshot() { return { active: Boolean(world), stepCount, dynamicBodies: entries.size, transforms: Array.from(entries, ([recordIdentifier,{body}]) => ({recordIdentifier,position:{...body.translation()},rotation:{...body.rotation()}})) }; },
  };
}
