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
    const bytes = { html: 0, javascript: 0, style: 0, font: 0, metadata: 0, artwork: 0 };
    if (!Array.isArray(navigation) || navigation.length !== 1 || !Array.isArray(resources)) errors.push('Missing resource or navigation entries');
    for (const entry of [...(navigation ?? []), ...(resources ?? [])]) {
      if (!Number.isFinite(entry.transferSize) || entry.transferSize <= 0 || entry.responseStatus >= 400) { errors.push('Unmeasured, cached or failed resource: ' + entry.name); continue; }
      const url = new URL(entry.name);
      if (url.origin !== 'http://127.0.0.1:4173') { errors.push('Unclassified external transfer: ' + entry.name); continue; }
      let category;
      if (entry.entryType === 'navigation') category = 'html';
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
    return { stage: run.stage, route: run.route, bytes, coreBytes: bytes.html + bytes.javascript + bytes.style + bytes.font + bytes.metadata,
      largestContentfulPaint, firstUsableArtwork, decodeMilliseconds: run.initial?.measurement?.decodeMilliseconds ?? null,
      functional: run.functional === true && run.errors?.length === 0 && run.failedRequests?.length === 0 && !run.failure,
      errors };
  });
  return { complete: stages.every(stage => stage.errors.length === 0), stages };
}
