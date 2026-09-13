// llm machine contract; claim UUIDv5: b70d510f-8a47-5422-b007-5fd5d1d9a80b
// execution UUIDv7 and exact source revision are attached by the calling MCP collector.
// state: cold isolated browser contexts -> actual resources, paints, frames and interactions -> raw evidence
async (page) => {
  const browser = page.context().browser();
  const runs = [];
  const expectedCounts = { css: 48, surface: 24, solid: 288 };
  const directory = '/Users/st/.codex/.chatgpt-projects/g-p-6aa64443bd788191b78f5b5af98c1a94/reports/browser';
  const readMotion = async testedPage => testedPage.evaluate(async () => {
    const element = document.querySelector('[data-artwork-motion]');
    const animation = element?.getAnimations()[0];
    return element && animation ? { currentTime: Number(animation.currentTime), playbackRate: animation.playbackRate,
      playState: animation.playState, transform: getComputedStyle(element).transform,
      documentStructure: Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(element.outerHTML))), byte => byte.toString(16).padStart(2, '0')).join(''),
      pieceCount: element.querySelectorAll('[data-artwork-piece]').length,
      pieceTransforms: Array.from(element.querySelectorAll('[data-artwork-piece]'), ring => getComputedStyle(ring).transform),
      pieceBorder: getComputedStyle(element.querySelector('[data-artwork-piece]')).borderTopWidth,
      otherDrawingElements: document.querySelectorAll('svg, canvas, img').length,
      animationFrameRequests: window.lumeniaAnimationFrameRequests ?? null } : null;
  });
  for (const stage of ['empty', 'css', 'surface', 'solid']) {
    const context = await browser.newContext({ viewport: { width: 1499, height: 1049 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    const testedPage = await context.newPage();
    testedPage.setDefaultTimeout(5000);
    const errors = [], failedRequests = [];
    testedPage.on('pageerror', error => errors.push(error.message));
    testedPage.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    testedPage.on('requestfailed', request => failedRequests.push({ url: request.url(), reason: request.failure()?.errorText }));
    testedPage.on('response', response => { if (response.status() >= 400) failedRequests.push({ url: response.url(), status: response.status() }); });
    await testedPage.addInitScript(() => {
      window.lumeniaPaintObservations = [];
      window.lumeniaAnimationFrameRequests = 0;
      const originalFrameRequest = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = callback => { window.lumeniaAnimationFrameRequests++; return originalFrameRequest(callback); };
      if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
        new PerformanceObserver(list => window.lumeniaPaintObservations.push(...list.getEntries().map(entry => entry.toJSON())))
          .observe({ type: 'largest-contentful-paint', buffered: true });
      }
    });
    const debugging = await context.newCDPSession(testedPage);
    await debugging.send('Network.enable'); await debugging.send('Network.setCacheDisabled', { cacheDisabled: true });
    const run = { stage, route: stage === 'css' ? '/' : '/compare/' + stage + '/', errors, failedRequests, interactions: {} };
    try {
      await testedPage.bringToFront();
      await testedPage.goto('http://127.0.0.1:4173' + run.route, { waitUntil: 'networkidle' });
      if (stage !== 'empty') await testedPage.waitForFunction(() => window.lumeniaMeasurement && window.lumeniaMeasurement.state !== 'loading', null, { timeout: 10000 });
      try { await testedPage.waitForFunction(() => window.lumeniaPaintObservations.length > 0, null, { timeout: 3000 }); }
      catch { run.paintObservationFailure = 'Largest contentful paint was not observed; the timing gate must remain blocked.'; }
      run.initial = await testedPage.evaluate(() => ({
        url: location.href, title: document.title, userAgent: navigator.userAgent,
        viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
        heading: document.querySelector('h1')?.textContent, visibleText: document.body.innerText,
        bodyBackground: getComputedStyle(document.body).backgroundColor,
        htmlBackground: getComputedStyle(document.documentElement).backgroundColor,
        headingFontSize: getComputedStyle(document.querySelector('h1')).fontSize,
        overflow: document.documentElement.scrollWidth > innerWidth,
        measurement: window.lumeniaMeasurement ?? null,
        marks: performance.getEntriesByType('mark').map(entry => entry.toJSON()),
        largestContentfulPaint: window.lumeniaPaintObservations,
        navigation: performance.getEntriesByType('navigation').map(entry => entry.toJSON()),
        resources: performance.getEntriesByType('resource').map(entry => entry.toJSON()),
        vectorElements: document.querySelectorAll('svg').length,
        cssPieces: document.querySelectorAll('[data-artwork-piece]').length,
        canvasDimensions: Array.from(document.querySelectorAll('canvas')).map(canvas => [canvas.width, canvas.height]),
      }));
      if (stage !== 'empty') {
        const before = await readMotion(testedPage); await testedPage.waitForTimeout(180); const after = await readMotion(testedPage);
        run.motionObservations = { before, after };
        run.interactions.nativeMotion = before && after && after.currentTime > before.currentTime && after.transform !== before.transform;
        run.interactions.noDrawingMutations = before.documentStructure === after.documentStructure;
        run.interactions.noJavaScriptFrameLoop = typeof before.animationFrameRequests === 'number' && before.animationFrameRequests === after.animationFrameRequests;
        run.interactions.onlyCssPieces = after.pieceCount === expectedCounts[stage] && (stage !== 'css' || after.pieceBorder === '1px') && after.otherDrawingElements === 0 &&
          !after.pieceTransforms.includes('none') && new Set(after.pieceTransforms).size === expectedCounts[stage];
      }
      if (stage !== 'empty' && run.initial.measurement?.state !== 'failed') {
        await testedPage.getByRole('button', { name: '一時停止', exact: true }).click();
        await testedPage.waitForFunction(() => window.lumeniaMeasurement.state === 'paused');
        if (stage !== 'empty') await testedPage.evaluate(() => document.querySelector('[data-artwork-motion]').getAnimations()[0].ready);
        const stopped = await readMotion(testedPage);
        await testedPage.waitForTimeout(120);
        if (stage !== 'empty') {
          const after = await readMotion(testedPage); run.pauseObservations = { before: stopped, after };
          run.interactions.pauseStopsMotion = after.playState === 'paused' && after.transform === stopped.transform && Math.abs(after.currentTime - stopped.currentTime) < 1;
        }
        const slider = testedPage.getByRole('slider', { name: '動きの速さ' });
        await slider.press('ArrowRight'); run.interactions.speedChanges = await testedPage.locator('output').textContent() === '1.1';
        if (stage !== 'empty') {
          await testedPage.evaluate(() => document.querySelector('[data-artwork-motion]').getAnimations()[0].ready);
          run.speedObservation = await readMotion(testedPage);
          run.interactions.nativeSpeedChanges = Math.abs(run.speedObservation.playbackRate - 1.1) < 0.001;
        }
        await testedPage.getByRole('button', { name: '最初に戻す', exact: true }).click();
        run.interactions.resetSpeed = await testedPage.locator('output').textContent() === '1.0';
        if (stage !== 'empty') {
          run.resetObservation = await readMotion(testedPage);
          run.interactions.resetPosition = Math.abs(run.resetObservation.currentTime) < 1;
        }
        await testedPage.getByRole('heading', { name: '光のかたち', exact: true }).click();
        run.screenshot = directory + '/' + stage + '-desktop.png';
        await testedPage.screenshot({ path: run.screenshot, fullPage: true, scale: 'css' });
        const beforeDrag = await testedPage.evaluate(() => document.querySelector('[data-artwork-view]') ?
          getComputedStyle(document.querySelector('[data-artwork-view]')).transform : window.lumeniaMeasurement.renderedFrames);
        const bounds = await testedPage.locator('[data-artwork-stage]').boundingBox();
        await testedPage.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        await testedPage.mouse.down(); await testedPage.mouse.move(bounds.x + bounds.width / 2 + 70, bounds.y + bounds.height / 2 + 20, { steps: 4 }); await testedPage.mouse.up();
        await testedPage.waitForFunction(before => document.querySelector('[data-artwork-view]') ?
          getComputedStyle(document.querySelector('[data-artwork-view]')).transform !== before : window.lumeniaMeasurement.renderedFrames > before, beforeDrag);
        run.interactions.dragRedraws = true;
        await testedPage.getByRole('button', { name: '再生', exact: true }).click();
        await testedPage.waitForFunction(() => window.lumeniaMeasurement.state === 'playing'); run.interactions.resumes = true;
        if (stage !== 'empty') {
          const before = await readMotion(testedPage); await testedPage.waitForTimeout(150); const after = await readMotion(testedPage);
          run.resumeObservations = { before, after }; run.interactions.nativeResumes = after.currentTime > before.currentTime && after.transform !== before.transform;
        }
      } else if (stage === 'empty') {
        run.interactions.noArtworkOrControls = await testedPage.locator('canvas, svg, [data-css-artwork], button').count() === 0;
      }
      if (stage !== 'empty') {
        await testedPage.setViewportSize({ width: 390, height: 844 });
        await testedPage.getByRole('button', { name: '一時停止', exact: true }).click();
        await testedPage.getByRole('button', { name: '最初に戻す', exact: true }).click();
        await testedPage.getByRole('heading', { name: '光のかたち', exact: true }).click();
        run.mobile = await testedPage.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          titleSize: getComputedStyle(document.querySelector('h1')).fontSize,
          buttonHeights: Array.from(document.querySelectorAll('button')).map(button => button.getBoundingClientRect().height) }));
        run.interactions.mobileLayout = run.mobile.scrollWidth === run.mobile.width && run.mobile.titleSize === '34px' && run.mobile.buttonHeights.every(height => height >= 44);
        run.mobileScreenshot = directory + '/' + stage + '-mobile.png';
        await testedPage.screenshot({ path: run.mobileScreenshot, fullPage: true, scale: 'css' });
        await testedPage.emulateMedia({ reducedMotion: 'reduce' });
        await testedPage.reload({ waitUntil: 'networkidle' });
        await testedPage.waitForFunction(() => window.lumeniaMeasurement?.state === 'paused');
        run.reducedMotionObservation = await readMotion(testedPage);
        run.interactions.reducedMotionPauses = run.reducedMotionObservation.playState === 'paused';
        await testedPage.getByRole('button', { name: '再生', exact: true }).click();
        await testedPage.waitForFunction(() => document.querySelector('[data-artwork-motion]').getAnimations()[0].playState === 'running');
        run.interactions.explicitPlayOverridesReducedMotion = true;
        const withoutJavaScript = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'no-preference', viewport: { width: 1499, height: 1049 } });
        try {
          const staticPage = await withoutJavaScript.newPage();
          await staticPage.goto('http://127.0.0.1:4173' + run.route, { waitUntil: 'networkidle' });
          const before = await readMotion(staticPage); await staticPage.waitForTimeout(180); const after = await readMotion(staticPage);
          run.withoutJavaScript = { before, after };
          run.interactions.movesWithoutJavaScript = before && after && after.currentTime > before.currentTime && after.transform !== before.transform &&
            before.documentStructure === after.documentStructure && after.pieceCount === expectedCounts[stage] && after.otherDrawingElements === 0 &&
            !after.pieceTransforms.includes('none') && new Set(after.pieceTransforms).size === expectedCounts[stage];
          await staticPage.emulateMedia({ reducedMotion: 'reduce' }); await staticPage.waitForTimeout(100);
          run.withoutJavaScript.reducedMotion = await readMotion(staticPage);
          run.interactions.reducedMotionWithoutJavaScript = run.withoutJavaScript.reducedMotion.playState === 'paused';
        } finally { await withoutJavaScript.close(); }
        run.cssDrawing = Object.values(run.interactions).every(value => value === true) &&
          run.initial.measurement?.renderingDriver === 'browser-css' && run.initial.measurement.renderedFrames === null;
      }
      run.functional = run.initial.heading === '光のかたち' && run.initial.headingFontSize === '56px' &&
        run.initial.htmlBackground === 'rgb(17, 19, 19)' && !run.initial.overflow && errors.length === 0 && failedRequests.length === 0 &&
        (stage === 'empty' || run.cssDrawing && run.initial.measurement.failureReason === null) &&
        Object.values(run.interactions).every(value => value === true);
    } catch (error) { run.failure = error.message; run.functional = false; }
    finally { await context.close(); }
    runs.push(run);
  }
  return { browser: 'Chrome', version: browser.version(), createdAt: new Date().toISOString(),
    environment: { origin: 'http://127.0.0.1:4173', network: 'local loopback, no artificial latency', cpu: 'unthrottled',
      cache: 'fresh isolated context, browser cache disabled, server Cache-Control no-store', compression: 'Brotli quality 11',
      viewport: { width: 1499, height: 1049 }, deviceScaleFactor: 1, samplesPerStage: 1,
      limitation: 'Local diagnostic measurement, not a deployed or statistically representative performance claim' }, runs };
}
