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

// llm machine contract; claim UUIDv5: 16e16f2e-b6b5-53ba-ada7-171a3974eb67
// execution UUIDv7: 01a0a324-741b-715a-be47-5cd2936becb7; transition: observed header check -> counted only with unambiguous successful evidence
const headerCheckFixture = () => {
  const capture = fixture();
  const run = capture.data.runs[0];
  const url = 'http://127.0.0.1:4173/records/';
  run.requests = [{ url, method: 'HEAD', type: 'fetch' }];
  run.initial.resources.push({ name: url, entryType: 'resource', initiatorType: 'fetch',
    transferSize: 300, responseStatus: 200, encodedBodySize: 0, decodedBodySize: 0 });
  return capture;
};

test('successful header checks and subsequent page payloads count toward metadata and core bytes', () => {
  const capture = headerCheckFixture();
  capture.data.runs[0].initial.resources.push({ name: 'http://127.0.0.1:4173/records/__next._tree.txt',
    entryType: 'resource', transferSize: 517, responseStatus: 200 });
  const result = summarizeBrowserRuns(capture);
  assert.equal(result.complete, true);
  assert.equal(result.stages[0].bytes.metadata, 817);
  assert.equal(result.stages[0].coreBytes, 2317);
  assert.equal(result.stages[0].functional, true);
});

test('header classification rejects missing, ambiguous, failed and non-header evidence', () => {
  const mutations = [
    run => delete run.requests,
    run => run.requests[0].method = 'GET',
    run => run.requests[0].type = 'document',
    run => run.requests.push({ ...run.requests[0] }),
    run => run.requests.push({ ...run.requests[0], method: 'GET' }),
    run => run.initial.resources.push({ ...run.initial.resources.at(-1) }),
    run => delete run.initial.resources.at(-1).encodedBodySize,
    run => run.initial.resources.at(-1).encodedBodySize = 1,
    run => run.initial.resources.at(-1).decodedBodySize = 1,
    run => run.initial.resources.at(-1).initiatorType = 'link',
    run => run.initial.resources.at(-1).responseStatus = 404,
    run => run.initial.resources.at(-1).responseStatus = 0,
    run => delete run.initial.resources.at(-1).responseStatus,
    run => run.initial.resources.at(-1).transferSize = 0,
    run => run.initial.resources.at(-1).name = 'https://example.com/records/',
  ];
  for (const mutate of mutations) {
    const capture = headerCheckFixture();
    mutate(capture.data.runs[0]);
    assert.equal(summarizeBrowserRuns(capture).complete, false, mutate.toString());
  }
});

test('an aborted header notification is reconciled with a uniquely matched successful response', () => {
  const capture = headerCheckFixture();
  const run = capture.data.runs[0];
  run.failedRequests.push({ url: run.requests[0].url, method: 'HEAD', error: 'net::ERR_ABORTED',phase:'initial' });
  const stage = summarizeBrowserRuns(capture).stages[0];
  assert.equal(stage.functional, true);
  assert.deepEqual(stage.reconciledRequestFailures, run.failedRequests);
});

test('actual failures, incomplete evidence and unsuccessful interactions remain nonfunctional', () => {
  const mutations = [
    run => run.failedRequests[0].phase = 'subsequent',
    run => delete run.failedRequests[0].phase,
    run => run.failedRequests[0].method = 'GET',
    run => delete run.failedRequests[0].method,
    run => run.failedRequests[0].error = 'net::ERR_FAILED',
    run => run.failedRequests[0].url += 'other/',
    run => run.failedRequests.push({ ...run.failedRequests[0] }),
    run => run.failedRequests.push({ ...run.failedRequests[0], method: 'GET' }),
    run => run.initial.resources.at(-1).responseStatus = 404,
    run => run.requests.push({ ...run.requests[0] }),
    run => delete run.requests,
    run => run.functional = false,
    run => run.errors.push('Page error'),
    run => run.failure = 'Interaction failed',
  ];
  for (const mutate of mutations) {
    const capture = headerCheckFixture();
    const run = capture.data.runs[0];
    run.failedRequests.push({ url: run.requests[0].url, method: 'HEAD', error: 'net::ERR_ABORTED',phase:'initial' });
    mutate(run);
    assert.equal(summarizeBrowserRuns(capture).stages[0].functional, false, mutate.toString());
  }
});
