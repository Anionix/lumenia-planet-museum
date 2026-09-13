'use client';

import '@plumeria/core';
import { useEffect, useRef, useState } from 'react';
import type { RenderedArtworkStage } from '../artwork/catalog';
import { CssArtwork } from './CssArtwork';
import { galleryStyles } from './Gallery.styles';

// llm machine contract; claim UUIDv5: 2ec9706d-6206-5de2-aaf6-542e7f336b63
// execution UUIDv7: 01a09a1a-e883-7d76-b209-e3f58830b29e
// transition: automatic CSS drawing -> user-controlled pause, speed, view and reset; no drawing loop
export function ArtworkExperience({ stage }: { stage: RenderedArtworkStage }) {
  const [playing, setPlaying] = useState<boolean | null>(null);
  const [speed, setSpeed] = useState(1);
  const [failure, setFailure] = useState<string | null>(null);
  const [view, setView] = useState({ horizontal: 0, vertical: 0 });
  const [resetSequence, setResetSequence] = useState(0);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { if (reduced.matches) setPlaying(false); };
    setPlaying(!reduced.matches); reduced.addEventListener('change', update);
    return () => reduced.removeEventListener('change', update);
  }, []);
  const reset = () => { setView({ horizontal: 0, vertical: 0 }); setSpeed(1); setResetSequence(value => value + 1); };

  return <>
    <div classStyle={[galleryStyles.viewport]} data-artwork-stage={stage}
      onPointerDown={event => { drag.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={event => {
        if (!drag.current) return;
        const horizontal = (event.clientX - drag.current.x) / 260;
        const vertical = (event.clientY - drag.current.y) / 300;
        drag.current = { x: event.clientX, y: event.clientY };
        setView(previous => ({ horizontal: previous.horizontal + horizontal, vertical: Math.max(-0.8, Math.min(0.8, previous.vertical + vertical)) }));
      }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      <CssArtwork stage={stage} playing={playing} speed={speed} horizontal={view.horizontal} vertical={view.vertical}
        resetSequence={resetSequence} onFailure={setFailure} />
      {failure && <p role="alert" classStyle={[galleryStyles.error]}>{failure}</p>}
    </div>
    <div classStyle={[galleryStyles.controls]}>
      <div classStyle={[galleryStyles.buttons]}>
        <button type="button" classStyle={[galleryStyles.button, galleryStyles.primary]} disabled={Boolean(failure)}
          onClick={() => setPlaying(value => value === false)} aria-pressed={playing === false}>{playing === false ? '再生' : '一時停止'}</button>
        <button type="button" classStyle={[galleryStyles.button]} onClick={reset} disabled={Boolean(failure)}>最初に戻す</button>
      </div>
      <label classStyle={[galleryStyles.speed]}><span>動きの速さ</span>
        <input classStyle={[galleryStyles.slider]} aria-label="動きの速さ" type="range" min="0.2" max="2" step="0.1"
          value={speed} onChange={event => setSpeed(Number(event.target.value))} />
        <output classStyle={[galleryStyles.value]}>{speed.toFixed(1)}</output>
      </label>
      <p classStyle={[galleryStyles.hint]}>ドラッグで視点を変える</p>
    </div>
  </>;
}
