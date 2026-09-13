// llm machine contract; claimIdentifier: 07b6fb92-8639-50e0-873d-b43d3d5c28df
// executionIdentifier: application inspection supplies a fresh UUIDv7.
// transition: source icon digest + emitted icon digest -> interface metadata admission.
// Only the existing tab icon is metadata; this never admits an SVG artwork or a renderer.
export function isRegisteredInterfaceIcon(output, sourceFiles) {
  const source = sourceFiles.find(file => file.path === 'web/public/favicon.svg');
  return output.path === 'favicon.svg' && source !== undefined &&
    /^[0-9a-f]{64}$/.test(source.sha256) && output.sha256 === source.sha256 && output.bytes > 0;
}
