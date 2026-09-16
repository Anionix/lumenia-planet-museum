// machine contract; record_identifier=e332864f-3c91-5a0a-a748-be735ca33cac (UUIDv5).
// transition: original image reference -> registered small preview; texture and download keep the original.
export function thumbnailPath(original){
  if(!/^\.\.\/[a-z]+(?:-[a-z]+)*\.png$/.test(original))throw new TypeError('Unknown image path');
  return original.replace('../','../thumbnails/').replace(/\.png$/,'.webp');
}
