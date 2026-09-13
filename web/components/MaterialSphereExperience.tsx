'use client';

import '@plumeria/core';
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { makeCoordinateRequest } from '../artwork/material-sphere-computation/dimension.mjs';
import { dispatchMaterialSphere } from '../artwork/material-sphere-renderer.mjs';
import { validateMaterialSphereControls } from '../artwork/material-sphere-controls.mjs';
import { sphereStyles, spherePlaybackStyles } from './MaterialSphere.styles';

// llm machine contract; claim UUIDv5: a54e35a6-6edb-58c1-b2a9-55477638a3e1
// execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
// transition: bounded controls -> copied checked numerical kernel -> Plumeria variable bindings.
// CSS owns continuous motion. Projection drops axes 3 and 4; time never changes spatial dimension.
const dimensions = [1, 2, 3, 4] as const;
const axisNames = ['第1軸（横）', '第2軸（縦）', '第3軸', '第4軸'] as const;
const initialCoordinates = [3, 2, 3, 4];
const serverReducedMotion = () => false;
const readReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function observeReducedMotion(notify: () => void) {
  const query = matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}
type MaterialParameters = { repeatCount: number; gridStep: number; durationMilliseconds: number;
  layerCount: number; opacityPercent: number; paletteSize: number };
type PageTool = { name: string; description: string; inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => unknown };
type ModelContext = { registerTool: (tool: PageTool, options: { signal: AbortSignal }) => void | Promise<void> };

export function MaterialSphereExperience({ children, artistName, profileIdentifier, parameters }: {
  children: ReactNode; artistName: string; profileIdentifier: string; parameters: MaterialParameters;
}) {
  const [spaceDimensions, setSpaceDimensions] = useState<1 | 2 | 3 | 4>(2);
  const [coordinates, setCoordinates] = useState(initialCoordinates);
  const [timeMilliseconds, setTimeMilliseconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reducedMotion = useSyncExternalStore(observeReducedMotion, readReducedMotion, serverReducedMotion);
  const current = useRef({ spaceDimensions, coordinates, timeMilliseconds, playing, reducedMotion });
  current.current = { spaceDimensions, coordinates, timeMilliseconds, playing, reducedMotion };
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const readState = () => {
      const state = current.current;
      return { profileIdentifier, components: state.coordinates.slice(0, state.spaceDimensions),
        startTimeMilliseconds: state.timeMilliseconds, playing: state.playing && !state.reducedMotion,
        reducedMotion: state.reducedMotion, renderer: 'plumeriaCss' };
    };
    const registrations: PageTool[] = [{
      name: 'read_material_sphere_state', description: 'Read the currently visible sphere coordinates, start time and effective playback state.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: input => input && typeof input === 'object' && !Array.isArray(input) && Object.keys(input).length === 0
        ? readState() : { accepted: false, failureReason: 'Expected an empty object' },
    }, {
      name: 'set_material_sphere_state', description: 'Set the same one-to-four coordinates, playback and start-time controls shown on this page. Does not save data or change artwork.',
      inputSchema: { type: 'object', properties: {
        components: { type: 'array', items: { type: 'integer', minimum: -10, maximum: 10 }, minItems: 1, maxItems: 4 },
        playing: { type: 'boolean' }, startTimeMilliseconds: { type: 'integer', minimum: 0, maximum: parameters.durationMilliseconds, multipleOf: 1000 },
      }, required: ['components', 'playing', 'startTimeMilliseconds'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: raw => {
        if (!validateMaterialSphereControls(raw, parameters.durationMilliseconds)) return { accepted: false, failureReason: 'Input exceeds the visible control bounds' };
        const input = raw as { components: number[]; playing: boolean; startTimeMilliseconds: number };
        flushSync(() => {
          setSpaceDimensions(input.components.length as 1 | 2 | 3 | 4);
          setCoordinates([...input.components, ...initialCoordinates.slice(input.components.length)]);
          setTimeMilliseconds(input.startTimeMilliseconds); setPlaying(input.playing);
        });
        return { accepted: true, ...readState() };
      },
    }];
    try { for (const tool of registrations) void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {
      lifecycle.abort(); console.warn('Material Sphere page tools could not be registered');
    }); } catch { lifecycle.abort(); console.warn('Material Sphere page tools could not be registered'); }
    return () => lifecycle.abort();
  }, [parameters.durationMilliseconds, profileIdentifier]);
  const request = makeCoordinateRequest(coordinates.slice(0, spaceDimensions), { timeMilliseconds });
  const rendering = dispatchMaterialSphere({ profileIdentifier, parameters, coordinates: request, playing, reducedMotion }, 'plumeriaCss');
  if (rendering.state !== 'ready' || !rendering.plan?.accepted || !rendering.output) throw new Error('Material Sphere control boundary rejected input');
  const result = rendering.plan.coordinates;
  if (!result) throw new Error('Missing checked coordinate result');
  const quarterTurnComponents = result.quarterTurnComponents;
  const isPlaying = rendering.plan.playing;

  function rotateFirstPlane() {
    const rotated = quarterTurnComponents;
    if (rotated) setCoordinates(previous => [...rotated, ...previous.slice(spaceDimensions)]);
  }
  function reset() { setCoordinates(initialCoordinates); setSpaceDimensions(2); setTimeMilliseconds(0); setPlaying(false); }

  return <>
    <div id="artwork" classStyle={[sphereStyles.artworkArea]}>
      <div role="img" aria-label={`${artistName}の資料から考えたMaterial Sphere`} classStyle={[sphereStyles.scene]}>
        <div data-material-placement="true" data-coordinate-result={JSON.stringify(result)}
          classStyle={[sphereStyles.projected(rendering.output.placementTransform)]}>
          <div classStyle={[sphereStyles.magnification]}>
            <div key={timeMilliseconds} data-material-playback={isPlaying ? 'playing' : 'paused'}
              classStyle={[sphereStyles.timing(rendering.output.duration, rendering.output.delay),
                spherePlaybackStyles[isPlaying ? 'playing' : 'paused']]}>{children}</div>
          </div>
        </div>
      </div>
      <p classStyle={[sphereStyles.note]}>球の陰影と模様はCSS。1目盛りは画面上の4ピクセルです。</p>
    </div>
    <section aria-label="球を操作する" classStyle={[sphereStyles.controls]}>
      <div>
        <h3 classStyle={[sphereStyles.controlHeading]}>空間の次元</h3>
        <div role="group" aria-label="空間の次元" classStyle={[sphereStyles.dimensions]}>
          {dimensions.map(dimension => <button key={dimension} type="button" aria-pressed={spaceDimensions === dimension}
            onClick={() => setSpaceDimensions(dimension)}
            classStyle={[sphereStyles.dimension, spaceDimensions === dimension && sphereStyles.chosenDimension]}>{dimension}次元</button>)}
        </div>
        {axisNames.slice(0, spaceDimensions).map((name, index) => <label key={name} classStyle={[sphereStyles.axis]}>
          <span>{name}</span><input aria-label={name} type="range" min="-10" max="10" step="1" value={coordinates[index]}
            onChange={event => { const value = Number(event.target.value); setCoordinates(previous => previous.map((coordinate, axis) => axis === index ? value : coordinate)); }}
            classStyle={[sphereStyles.range]} /><output classStyle={[sphereStyles.numeric]}>{coordinates[index]}</output>
        </label>)}
        <output aria-live="polite" data-testid="coordinate-projection" classStyle={[sphereStyles.equation]}>
          入力 ({result.components?.join(', ')})<br />画面 ({result.projectedComponents?.join(', ')})
        </output>
        <p classStyle={[sphereStyles.note]}>{spaceDimensions > 2
          ? '第3軸・第4軸の数値は保持し、画面には第1軸と第2軸だけを写します。奥行きや第4軸を変えても、この投影では位置は変わりません。'
          : spaceDimensions === 1 ? '1次元は横の位置だけ。縦の位置には0を補います。' : '横・縦の2つの値を、そのまま画面へ写します。'}</p>
        <div classStyle={[sphereStyles.buttons]}>
          <button type="button" disabled={spaceDimensions === 1} onClick={rotateFirstPlane} classStyle={[sphereStyles.button]}>90度回す</button>
          <button type="button" onClick={reset} classStyle={[sphereStyles.button]}>初期値に戻す</button>
        </div>
      </div>
      <div classStyle={[sphereStyles.motionSection]}>
        <h3 classStyle={[sphereStyles.controlHeading]}>模様の動き</h3>
        <button type="button" disabled={reducedMotion} aria-pressed={isPlaying} onClick={() => setPlaying(rendering.plan!.nextPlaying!)}
          classStyle={[sphereStyles.button, sphereStyles.primary]}>{isPlaying ? '止める' : '動かす'}</button>
        <label classStyle={[sphereStyles.axis]}><span>開始位置（秒）</span>
          <input aria-label="動きの開始位置（秒）" type="range" min="0" max={parameters.durationMilliseconds / 1000} step="1"
            value={timeMilliseconds / 1000} disabled={reducedMotion} onChange={event => setTimeMilliseconds(Number(event.target.value) * 1000)}
            classStyle={[sphereStyles.range]} /><output classStyle={[sphereStyles.numeric]}>{timeMilliseconds / 1000}</output>
        </label>
        <p classStyle={[sphereStyles.note]}>{reducedMotion ? '端末の「動きを減らす」設定を優先して停止しています。' : '時間は空間の軸とは別です。開始位置からCSSが模様を動かします。'}<br />4次元空間と「3次元＋時間」を混同しません。</p>
      </div>
    </section>
  </>;
}
