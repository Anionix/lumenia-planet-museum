// llm machine contract; claim UUIDv5: cfd40913-811f-5276-bc77-f1466fdd3fdb
// execution UUIDv7: 01a09a1a-e883-7d76-b209-e3f58830b29e
// transition: finite torus parameters -> static CSS panel placement; no runtime drawing or lighting loop
export const majorSegments = 24;
export const minorSegments = 12;
export const radiusRatio = 0.7 / 1.62;
const radius = 'clamp(105px, 17vw, 230px)';
const length = (coefficient: number) => `calc(${radius} * ${coefficient.toFixed(8)})`;

export const solidPanels = Array.from({ length: majorSegments * minorSegments }, (_, index) => {
  const major = Math.floor(index / minorSegments) * 2 * Math.PI / majorSegments;
  const minor = index % minorSegments * 2 * Math.PI / minorSegments;
  const radial = 1 + radiusRatio * Math.cos(minor);
  const depth = radiusRatio * Math.sin(minor);
  const normal = [Math.cos(major) * Math.cos(minor), Math.sin(major) * Math.cos(minor), Math.sin(minor)];
  const light = Math.max(0, normal[0] * -0.4 + normal[1] * -0.3 + normal[2] * 0.8660254);
  const brightness = 0.28 + 0.72 * light;
  const color = `rgb(${[208, 235, 134].map(channel => Math.round(channel * brightness)).join(', ')})`;
  // Cover the outer edge of the minor-angle cell, not only its center.
  // A small overlap hides rasterization seams; this remains a finite-panel approximation.
  const outerEdge = radial + Math.abs(Math.sin(minor)) * radiusRatio * Math.tan(Math.PI / minorSegments);
  return { index, radial, depth, normal, color,
    width: length(2 * outerEdge * Math.tan(Math.PI / majorSegments) * 1.025),
    height: length(2 * radiusRatio * Math.tan(Math.PI / minorSegments) * 1.025),
    transform: `translate(-50%, -50%) rotateZ(${major * 180 / Math.PI}deg) translateX(${length(radial)}) translateZ(${length(depth)}) rotateY(${90 - minor * 180 / Math.PI}deg) rotateZ(90deg)`,
  };
});
