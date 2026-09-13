import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeBrowserRuns } from '../scripts/browser-observations.mjs';

// llm machine contract; claim UUIDv5: b70d510f-8a47-5422-b007-5fd5d1d9a80b
// execution UUIDv7 assigned by report runner; transition: measurement fixture -> counted or blocked
const fixture = () => ({ data: { runs: ['empty', 'css', 'surface', 'solid'].map(stage => ({
  stage, functional: true, errors: [], failedRequests: [], initial: {
    navigation: [{ name: 'http://127.0.0.1:4173/', entryType: 'navigation', transferSize: 1000, responseStatus: 200 }],
    resources: [{ name: 'http://127.0.0.1:4173/decoders/meshopt.wasm', transferSize: 500, responseStatus: 200 },
      { name: 'http://127.0.0.1:4173/artworks/orbit.glb', transferSize: 2000, responseStatus: 200 }],
    largestContentfulPaint: [{ startTime: 100 }], marks: [{ name: 'lumenia:artwork-ready', startTime: 200 }],
  },
})) } });
test('decoder bytes remain in core; only artwork bytes are excluded', () => {
  const result = summarizeBrowserRuns(fixture()); assert.equal(result.complete, true);
  for (const stage of result.stages) { assert.equal(stage.coreBytes, 1500); assert.equal(stage.bytes.artwork, 2000); }
});
test('missing stages, cached entries and unknown resource classes cannot pass transfer measurement', () => {
  const missing = fixture(); missing.data.runs.pop(); assert.equal(summarizeBrowserRuns(missing).complete, false);
  for (const mutate of [entry => entry.transferSize = 0, entry => entry.responseStatus = 404,
    entry => entry.name = 'https://example.com/asset.js', entry => entry.name = 'http://127.0.0.1:4173/unknown.bin']) {
    const value = fixture(); mutate(value.data.runs[0].initial.resources[0]); assert.equal(summarizeBrowserRuns(value).complete, false);
  }
});
