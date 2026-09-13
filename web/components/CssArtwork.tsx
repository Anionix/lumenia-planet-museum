'use client';

import '@plumeria/core';
import { useEffect, useRef } from 'react';
import { beginMeasurement, markArtworkReady, type ArtworkMeasurement } from '../artwork/measurement';
import { solidPanels } from '../artwork/css-geometry';
import { artworkPieceCounts, artworkDescriptions, type RenderedArtworkStage } from '../artwork/catalog';
import { artworkStyles, playbackStyles } from './CssArtwork.styles';

// llm machine contract; claim UUIDv5: 5cdd969e-a78b-57cd-b751-2a5178fd8bf8
// related UUIDv5: c4bcac49-0537-5c14-bd67-b86730c65e1d, cfd40913-811f-5276-bc77-f1466fdd3fdb
// execution UUIDv7: 01a09a1a-e883-7d76-b209-e3f58830b29e
// state: HTML rings, translucent ribbons or opaque panels; no SVG, Canvas or Three.js
// transition: extracted CSS -> continuous native animation
// JavaScript handles user actions and two startup presentation opportunities, never a drawing loop.
const ringAngles = Array.from({ length: 48 }, (_, index) => index * 360 / 48);
const ribbonAngles = Array.from({ length: 24 }, (_, index) => index * 360 / 24);

export function CssArtwork({ stage, playing, speed, horizontal, vertical, resetSequence, onFailure }: {
  stage: RenderedArtworkStage;
  playing: boolean | null; speed: number; horizontal: number; vertical: number;
  resetSequence: number; onFailure: (message: string) => void;
}) {
  const motion = useRef<HTMLDivElement>(null);
  const measurement = useRef<ArtworkMeasurement | null>(null);

  useEffect(() => {
    const current = beginMeasurement(stage); measurement.current = current;
    let firstPresentation = 0, secondPresentation = 0;
    const fail = (message: string) => { current.state = 'failed'; current.failureReason = message; onFailure(message); };
    if (!CSS.supports('transform-style', 'preserve-3d')) { fail('CSSの立体描画に対応したブラウザーが必要です。'); return; }
    // These callbacks end after startup; CSS animation keeps running with no JavaScript frame loop.
    firstPresentation = requestAnimationFrame(() => {
      secondPresentation = requestAnimationFrame(() => {
        const element = motion.current;
        const animations = element?.getAnimations();
        const pieceTransforms = Array.from(element?.querySelectorAll('[data-artwork-piece]') ?? [], piece => getComputedStyle(piece).transform);
        if (!element || animations?.length !== 1 || element.getBoundingClientRect().width <= 0 ||
          pieceTransforms.length !== artworkPieceCounts[stage] || pieceTransforms.includes('none') ||
          new Set(pieceTransforms).size !== artworkPieceCounts[stage]) {
          fail('CSSアニメーションを確認できませんでした。'); return;
        }
        current.initializationPaintOpportunities = 2;
        markArtworkReady(current);
        current.state = animations[0].playState === 'running' ? 'playing' : 'paused';
      });
    });
    return () => { cancelAnimationFrame(firstPresentation); cancelAnimationFrame(secondPresentation); };
  }, [stage, onFailure]);

  useEffect(() => {
    const current = measurement.current;
    if (current && current.state !== 'loading' && current.state !== 'failed') current.state = playing === false ? 'paused' : 'playing';
  }, [playing]);
  useEffect(() => { motion.current?.getAnimations().forEach(animation => animation.updatePlaybackRate(speed)); }, [speed]);
  useEffect(() => {
    if (resetSequence > 0) motion.current?.getAnimations().forEach(animation => { animation.currentTime = 0; });
  }, [resetSequence]);

  return <div role="img" aria-label={artworkDescriptions[stage]} data-css-artwork={stage}
    classStyle={[artworkStyles.scene]}>
    <div data-artwork-view="true" classStyle={[artworkStyles.space, artworkStyles.view(`${horizontal}rad`, `${vertical}rad`)]}>
      <div classStyle={[artworkStyles.space, artworkStyles.pose]}>
        <div ref={motion} data-artwork-motion="true" data-playing={playing === null ? undefined : playing}
          classStyle={[artworkStyles.space, artworkStyles.motion, playbackStyles[playing === null ? 'automatic' : playing ? 'playing' : 'paused']]}>
          {stage === 'solid' ? solidPanels.map(panel => <div key={panel.index} aria-hidden="true" data-artwork-piece="panel"
            classStyle={[artworkStyles.panel, artworkStyles.panelGeometry(panel.transform, panel.width, panel.height, panel.color)]} />) :
            (stage === 'css' ? ringAngles : ribbonAngles).map(angle => <div key={angle} aria-hidden="true" data-artwork-piece={stage === 'css' ? 'ring' : 'ribbon'}
              classStyle={[artworkStyles.ring, stage === 'surface' && artworkStyles.ribbon, artworkStyles.placement(`${angle}deg`)]} />)}
        </div>
      </div>
    </div>
  </div>;
}
