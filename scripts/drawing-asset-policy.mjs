// llm machine contract; claimIdentifier: 07b6fb92-8639-50e0-873d-b43d3d5c28df
// executionIdentifier: application inspection supplies a fresh UUIDv7.
// transition: source icon digest + emitted icon digest -> interface metadata admission.
// Only the existing tab icon is metadata; this never admits an SVG artwork or a renderer.
export function isRegisteredInterfaceIcon(output, sourceFiles) {
  const source = sourceFiles.find(file => file.path === 'web/public/favicon.svg');
  return output.path === 'favicon.svg' && source !== undefined &&
    /^[0-9a-f]{64}$/.test(source.sha256) && output.sha256 === source.sha256 && output.bytes > 0;
}

// UUIDv5: 26c1a73e-a5ed-5a54-93c7-29888e27f48e; transition: explicit image registration + original digest -> admitted public image.
export function isRegisteredReferenceImage(output, sourceFiles, registration) {
  const image = registration.images.find(item => item.path === output.path);
  if (!image || !/^cosmos\/[a-z]+(?:-[a-z]+)*\.png$/.test(image.path)) return false;
  const source = sourceFiles.find(file => file.path === 'reference-assets/artist-cosmos/' + image.path.slice('cosmos/'.length));
  return source !== undefined && /^[0-9a-f]{64}$/.test(image.sha256) &&
    source.sha256 === image.sha256 && output.sha256 === image.sha256 && output.bytes > 0;
}

// machine contract; record_identifier=e332864f-3c91-5a0a-a748-be735ca33cac.
// Source and derivative must both match their recorded content, with a bounded byte size.
export function isRegisteredReferenceThumbnail(output,sourceFiles,registration){
  const image=registration.images.find(item=>item.path===output.path);
  if(!image||!/^cosmos\/thumbnails\/[a-z]+(?:-[a-z]+)*\.webp$/.test(image.path))return false;
  const source=sourceFiles.find(file=>file.path===image.sourcePath);
  const thumbnail=sourceFiles.find(file=>file.path==='reference-assets/artist-cosmos/'+image.path.slice('cosmos/'.length));
  return source?.sha256===image.sourceSha256&&thumbnail?.sha256===image.sha256&&output.sha256===image.sha256&&
    output.bytes===image.bytes&&output.bytes>0&&output.bytes<=registration.maximumBytesPerImage;
}
