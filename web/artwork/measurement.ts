import type { ArtworkStage } from './catalog';

// llm machine contract; claim UUIDv5: b70d510f-8a47-5422-b007-5fd5d1d9a80b
// execution UUIDv7 is generated below for each browser run.
// state: loading; transitions: loading -> ready | failed; ready -> playing | paused
export type ArtworkMeasurement = {
  executionIdentifier: string;
  stage: ArtworkStage;
  state: 'loading' | 'ready' | 'playing' | 'paused' | 'failed';
  renderingDriver: 'browser-css';
  renderedFrames: null;
  initializationPaintOpportunities: number;
  failureReason: string | null;
  decodeMilliseconds: null;
  gpuMemoryBytes: null;
};
declare global { interface Window { lumeniaMeasurement?: ArtworkMeasurement } }

function executionIdentifier() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let timestamp = Date.now();
  for (let index = 5; index >= 0; index--) { bytes[index] = timestamp % 256; timestamp = Math.floor(timestamp / 256); }
  bytes[6] = (bytes[6] & 15) | 112;
  bytes[8] = (bytes[8] & 63) | 128;
  const hexadecimal = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return [hexadecimal.slice(0, 8), hexadecimal.slice(8, 12), hexadecimal.slice(12, 16),
    hexadecimal.slice(16, 20), hexadecimal.slice(20)].join('-');
}

export function beginMeasurement(stage: ArtworkStage) {
  const measurement: ArtworkMeasurement = {
    executionIdentifier: executionIdentifier(), stage, state: 'loading',
    renderingDriver: 'browser-css', renderedFrames: null, initializationPaintOpportunities: 0,
    failureReason: null, decodeMilliseconds: null, gpuMemoryBytes: null,
  };
  window.lumeniaMeasurement = measurement;
  performance.clearMarks('lumenia:artwork-ready');
  return measurement;
}

export function markArtworkReady(measurement: ArtworkMeasurement) {
  if (measurement.state !== 'loading') return;
  measurement.state = 'ready';
  performance.mark('lumenia:artwork-ready');
}
