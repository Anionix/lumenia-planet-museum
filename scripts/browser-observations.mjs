// llm machine contract; claim UUIDv5: 16e16f2e-b6b5-53ba-ada7-171a3974eb67
// execution UUIDv7: 01a0a324-741b-715a-be47-5cd2936becb7; transition: request trace + successful header-only response -> classified transfer
function isConfirmedHeaderCheck(entry, resources, requests) {
  if (entry.entryType !== 'resource' || entry.initiatorType !== 'fetch'
    || !Number.isInteger(entry.responseStatus) || entry.responseStatus < 200 || entry.responseStatus >= 300
    || entry.encodedBodySize !== 0 || entry.decodedBodySize !== 0 || !Array.isArray(requests)) return false;
  const matchingRequests = requests.filter(request => request.url === entry.name);
  return matchingRequests.length === 1 && matchingRequests[0].method === 'HEAD' && matchingRequests[0].type === 'fetch'
    && resources.filter(resource => resource.name === entry.name).length === 1;
}

// llm machine contract; claim UUIDv5: b70d510f-8a47-5422-b007-5fd5d1d9a80b
// execution UUIDv7 inherited from the measurement collector; transition: complete cold runs -> measured values
export function summarizeBrowserRuns(capture) {
  const expectedStages = ['empty', 'css', 'surface', 'solid'];
  const runs = capture?.data?.runs;
  if (!Array.isArray(runs) || runs.length !== 4 || expectedStages.some(stage => runs.filter(run => run.stage === stage).length !== 1))
    return { complete: false, reason: 'All four independent rendering stages are required', stages: [] };
  const stages = runs.map(run => {
    const navigation = run.initial?.navigation;
    const resources = run.initial?.resources;
    const errors = [];
    const confirmedHeaderChecks = new Set();
    const bytes = { html: 0, javascript: 0, style: 0, font: 0, metadata: 0, artwork: 0 };
    if (!Array.isArray(navigation) || navigation.length !== 1 || !Array.isArray(resources)) errors.push('Missing resource or navigation entries');
    for (const entry of [...(navigation ?? []), ...(resources ?? [])]) {
      if (!Number.isFinite(entry.transferSize) || entry.transferSize <= 0 || entry.responseStatus >= 400) { errors.push('Unmeasured, cached or failed resource: ' + entry.name); continue; }
      const url = new URL(entry.name);
      if (url.origin !== 'http://127.0.0.1:4173') { errors.push('Unclassified external transfer: ' + entry.name); continue; }
      let category;
      if (entry.entryType === 'navigation') category = 'html';
      else if (isConfirmedHeaderCheck(entry, resources, run.requests)) {
        category = 'metadata';
        confirmedHeaderChecks.add(entry.name);
      }
      else if (/\.(js|wasm)$/.test(url.pathname)) category = 'javascript'; // All decoder code belongs to the core budget.
      else if (/\.css$/.test(url.pathname)) category = 'style';
      else if (/\.(woff2?|ttf|otf)$/.test(url.pathname)) category = 'font';
      else if (/^\/artworks\/[a-z0-9-]+\.(glb|ktx2)$/.test(url.pathname)) category = 'artwork';
      else if (/\.(json|txt|ico|svg)$/.test(url.pathname)) category = 'metadata';
      else { errors.push('Unclassified transfer: ' + entry.name); continue; }
      bytes[category] += entry.transferSize;
    }
    const paints = run.initial?.largestContentfulPaint;
    const largestContentfulPaint = Array.isArray(paints) && paints.length ? Math.max(...paints.map(entry => entry.startTime)) : null;
    const firstUsableArtwork = run.initial?.marks?.find(entry => entry.name === 'lumenia:artwork-ready')?.startTime ?? null;
    // Preserve the browser notification as evidence; only a unique, successful HEAD response can reconcile its abort.
    const failedRequests = Array.isArray(run.failedRequests) ? run.failedRequests : [];
    const reconciledRequestFailures = failedRequests.filter(failure => failure.phase === 'initial' && failure.method === 'HEAD'
      && failure.error === 'net::ERR_ABORTED' && confirmedHeaderChecks.has(failure.url)
      && failedRequests.filter(other => other.url === failure.url).length === 1);
    return { stage: run.stage, route: run.route, bytes, coreBytes: bytes.html + bytes.javascript + bytes.style + bytes.font + bytes.metadata,
      largestContentfulPaint, firstUsableArtwork, decodeMilliseconds: run.initial?.measurement?.decodeMilliseconds ?? null,
      functional: run.functional === true && run.errors?.length === 0 && Array.isArray(run.failedRequests)
        && failedRequests.length === reconciledRequestFailures.length && !run.failure,
      reconciledRequestFailures, errors };
  });
  return { complete: stages.every(stage => stage.errors.length === 0), stages };
}
