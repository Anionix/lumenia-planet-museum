'use client';

import '@plumeria/core';
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { studioStyles } from './ArtistStudio.styles';
import { MuseumCharacter } from './MuseumCharacter';
import { CssMuseumCharacter } from './CssMuseumCharacter';
import { characterAnimationForStudioStep, characterLookDirection } from '../artwork/museum-character.mjs';
import type { MuseumCharacterAvailability } from '../artwork/museum-character-availability';

// llm machine contract; claim UUIDv5: 68d2fd0d-a670-583b-88b5-cbed5fa5ef83
// execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
// transition: visit -> material -> repetition -> sphere; scripted interpretation, not impersonated factual speech.
// No voice cloning, generated historical quotes, live model calls, or claims of an authentic studio reconstruction.
const topics = ['お邪魔します', '何を見ればいい？', 'かたちを重ねて', '球にしてみよう'] as const;
const masks = ['inset(0 100% 0 0)', 'inset(0 70% 0 0)', 'inset(0 35% 0 0)', 'inset(0 0% 0 0)'] as const;
export function ArtistStudio({ children, name, referenceWork, interpretation, morris, character }: {
  children: ReactNode; name: string; referenceWork: string; interpretation: string; morris: boolean; character: MuseumCharacterAvailability;
}) {
  const characterReady = character.ready && character.imagePath !== null;
  const [characterPresentation, setCharacterPresentation] = useState<'smooth' | 'frames'>(morris ? 'smooth' : 'frames');
  const visibleCharacter = morris || characterReady;
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState<number | null>(null);
  const current = useRef({ step, paused });
  current.current = { step, paused };
  const figure = useRef<HTMLDivElement>(null);
  function followPointer(event: PointerEvent<HTMLDivElement>) {
    if (!visibleCharacter || paused || event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = figure.current?.getBoundingClientRect();
    if (bounds) setDirection(characterLookDirection(event.clientX - bounds.left - bounds.width / 2,
      event.clientY - bounds.top - bounds.height * 0.3));
  }
  useEffect(() => {
    type PageTool = { name: string; description: string; inputSchema: object;
      annotations: { readOnlyHint: boolean }; execute: (input: unknown) => unknown };
    const context = (document as Document & { modelContext?: {
      registerTool: (tool: PageTool, options: { signal: AbortSignal }) => void | Promise<void>;
    } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const read = () => ({ ...current.current, topic: topics[current.current.step], characterReady,
      interpretation: 'fictionalReconstruction', reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches });
    const registrations: PageTool[] = [{ name: 'read_artist_studio', description: 'Read the visible scripted studio conversation and motion setting. No saved or external data.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true },
      execute: input => input && typeof input === 'object' && !Array.isArray(input) && Object.keys(input).length === 0
        ? read() : { accepted: false, failureReason: 'Expected an empty object' },
    }, { name: 'choose_artist_studio_step', description: 'Choose one of the four visible conversation buttons and the character motion setting. This does not generate historical statements or save data.',
      inputSchema: { type: 'object', properties: { step: { type: 'integer', minimum: 0, maximum: 3 }, paused: { type: 'boolean' } },
        required: ['step', 'paused'], additionalProperties: false }, annotations: { readOnlyHint: false },
      execute: raw => {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { accepted: false, failureReason: 'Expected a studio choice' };
        const input = raw as { step: number; paused: boolean };
        if (Object.keys(input).length !== 2 || !Number.isInteger(input.step) || input.step < 0 || input.step > 3 || typeof input.paused !== 'boolean')
          return { accepted: false, failureReason: 'Choice is outside the visible controls' };
        flushSync(() => { setStep(input.step); setPaused(input.paused); setDirection(null); });
        return { accepted: true, ...read() };
      },
    }];
    try { for (const tool of registrations) void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {
      lifecycle.abort(); console.warn('Studio page tools could not be registered');
    }); } catch { lifecycle.abort(); console.warn('Studio page tools could not be registered'); }
    return () => lifecycle.abort();
  }, [characterReady]);
  const speeches = morris ? [
    'ようこそ。机のそばへどうぞ。今日は、一枚の布の中に小さな庭をひらくつもりで、色とかたちを眺めていこう。',
    'まず、小さな葉の対を見てほしい。ひとつ置き、向きを変え、もうひとつ置く。どこまで続いても気持ちのよい模様になるだろうか。',
    '濃い地色に明るい葉を重ねてみよう。同じかたちでも、隣の色や向きが変わると違って見える。きみなら、どこに花を置く？',
    'さて、この部屋で見つけた模様を、球にまとわせてみよう。ここから先は新しい表現だ。動かしながら、かたちのつながりを確かめてごらん。',
  ] : [
    `ようこそ。制作の途中だけれど、そばで見ていって。今日は「${referenceWork}」を手がかりに、色とかたちを一緒に眺めてみよう。`,
    '完成した姿だけではなく、まずはひとつの形に目を向けてほしい。どこを残し、どこを変えると、見え方が変わるだろう。',
    `この展示では、こんなふうに組み立てている。${interpretation} 重なりが増えるところを、ゆっくり見てみよう。`,
    'いま見ている球は、原作の複製ではない。この仕事を手がかりに生まれた、新しい展示の試作だ。きみの手で動かしてみてほしい。',
  ];
  return <>
    <div role="img" aria-label={`${name}の資料から着想した架空の制作室。机の上で球の模様が少しずつ現れる。`}
      data-studio-step={step} classStyle={[studioStyles.scene]} onPointerMove={followPointer} onPointerLeave={() => setDirection(null)}>
      <div aria-hidden="true" classStyle={[studioStyles.window]} /><div aria-hidden="true" classStyle={[studioStyles.light]} />
      <div aria-hidden="true" classStyle={[studioStyles.rail]} />
      {visibleCharacter && <div ref={figure} classStyle={[studioStyles.figure]} data-character-presentation={characterPresentation}>
        {morris && characterPresentation === 'smooth'
          ? <CssMuseumCharacter key={step} state={characterAnimationForStudioStep(step)} paused={paused} lookDirection={direction} />
          : characterReady && <MuseumCharacter key={step} step={step} paused={paused} direction={direction}
            artifactIdentifier={character.artifactIdentifier} imagePath={character.imagePath!} />}
      </div>}
      <div aria-hidden="true" classStyle={[studioStyles.worktable]} />
      <div aria-hidden="true" classStyle={[studioStyles.sheet]} /><div aria-hidden="true" classStyle={[studioStyles.brush]} />
      <div classStyle={[studioStyles.artwork, studioStyles.reveal(masks[step])]}>{children}</div>
      <span classStyle={[studioStyles.sceneNote]}>空間・台詞は創作による再構成</span>
    </div>
    <div classStyle={[studioStyles.dialogue]}>
      <p classStyle={[studioStyles.speaker]}>{name}<span classStyle={[studioStyles.qualifier]}>人物の視点を借りた、創作の案内</span></p>
      <div><p aria-live="polite" data-testid="studio-speech" classStyle={[studioStyles.speech]}>{speeches[step]}</p>
        <div role="group" aria-label="制作室で話を聞く" classStyle={[studioStyles.choices]}>
          {topics.map((topic, index) => <button key={topic} type="button" aria-pressed={step === index} onClick={() => { setStep(index); setDirection(null); }}
            classStyle={[studioStyles.choice, step === index && studioStyles.chosen]}>{topic}</button>)}
        </div>
        {morris && characterReady && <div role="group" aria-label="人物の動き方" classStyle={[studioStyles.choices]}>
          <button type="button" aria-pressed={characterPresentation === 'smooth'}
            onClick={() => { setCharacterPresentation('smooth'); setDirection(null); }}
            classStyle={[studioStyles.choice, characterPresentation === 'smooth' && studioStyles.chosen]}>なめらかな動き</button>
          <button type="button" disabled={!characterReady} aria-pressed={characterPresentation === 'frames'}
            onClick={() => { setCharacterPresentation('frames'); setDirection(null); }}
            classStyle={[studioStyles.choice, characterPresentation === 'frames' && studioStyles.chosen]}>こま撮りの動き</button>
        </div>}
        {visibleCharacter && <button type="button" aria-pressed={paused} onClick={() => { setPaused(!paused); setDirection(null); }}
          classStyle={[studioStyles.motionControl]}>{paused ? '人物を動かす' : '人物の動きを止める'}</button>}
      </div>
    </div>
  </>;
}
