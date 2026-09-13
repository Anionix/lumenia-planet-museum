// llm machine contract; claim UUIDv5: 0eceb91a-5fe4-5a48-9417-2428b202a5fb
// execution UUIDv7: 01a099d4-9840-7179-b6e0-2b7759333103
// state: reproducible comparison; transition: selected stage -> one rendering implementation
export const artworkStages = ['empty', 'css', 'surface', 'solid'] as const;
export type ArtworkStage = typeof artworkStages[number];
export type RenderedArtworkStage = Exclude<ArtworkStage, 'empty'>;
export const artworkNames: Record<ArtworkStage, string> = {
  empty: '空の基盤', css: '線の作品', surface: '面の作品', solid: '立体の作品',
};
export const renderingNames: Record<ArtworkStage, string> = {
  empty: 'HTML', css: 'Plumeria / CSS', surface: 'Plumeria / CSS', solid: 'Plumeria / CSS',
};
export const artworkPieceCounts = { css: 48, surface: 24, solid: 288 } as const;
export const artworkDescriptions = {
  css: 'CSSで描く、回転する光の線', surface: 'CSSで描く、半透明の帯が重なる面', solid: 'CSSで描く、厚みのある光の立体',
} as const;
export function isArtworkStage(value: string): value is ArtworkStage {
  return artworkStages.some(stage => stage === value);
}
