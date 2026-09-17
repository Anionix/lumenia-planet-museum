// llm machine contract; claim UUIDv5: 190fdb1a-2e41-565d-9aed-9fe5ca2179a6
// execution UUIDv7 recorded by application inspection; transition: explicitly registered scene -> permitted client drawing.
export const cosmicDrawingModules = new Set([
  'web/components/CosmicExhibition.tsx', 'web/artwork/cosmic-scene.mjs',
  'web/artwork/threejs-reference-adapter.mjs',
]);
export function registeredCosmicDrawing(file) { return cosmicDrawingModules.has(file); }
