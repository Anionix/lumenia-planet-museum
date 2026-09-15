'use client';
import '@plumeria/core';
import { useEffect, useRef, useState } from 'react';
import { cosmicCatalog } from '../artwork/cosmic-catalog.generated.mjs';
import { intersectsYears } from '../artwork/cosmic-state.mjs';
import { cosmicStyles } from './CosmicExhibition.styles';

// llm machine contract; claim UUIDv5: 190fdb1a-2e41-565d-9aed-9fe5ca2179a6
// execution UUIDv7: 01a0a466-8ef5-7ceb-9da0-c6195d4d86ab
// transition: readable source list -> visible client surface -> lazily imported renderer -> released resources.
// Historical range and display clock are independent. Selecting a person pauses presentation motion.
type SceneController = ReturnType<typeof import('../artwork/cosmic-scene.mjs').createCosmicScene>;
export function CosmicExhibition() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<SceneController | null>(null);
  const [status, setStatus] = useState('waiting');
  const [selected, setSelected] = useState('');
  const [playing, setPlaying] = useState(false);
  const [startYear, setStartYear] = useState(1880);
  const [endYear, setEndYear] = useState(2020);
  const [showUnknown, setShowUnknown] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [retry, setRetry] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const current = useRef({ selected: '', playing: false, startYear: 1880, endYear: 2020, showUnknown: true });
  const person = cosmicCatalog.find(item => item.identifier === selected);
  const included = cosmicCatalog.filter(item => {
    const matched = intersectsYears(item.period, startYear, endYear);
    return matched === null ? showUnknown : matched;
  });
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update(); preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const state = { selected, playing, startYear, endYear, showUnknown };
    current.current = state;
    scene.current?.apply(state);
  }, [selected, playing, startYear, endYear, showUnknown]);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let cancelled = false, started = false, visible = false;
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      scene.current?.setVisible(visible);
      if (!visible || started) return;
      started = true; setStatus('loading');
      import('../artwork/cosmic-scene.mjs').then(module => {
        if (cancelled) return;
        const controller = module.createCosmicScene({ canvas: element,
          onSelect: identifier => { setSelected(identifier); setPlaying(false); }, onState: setStatus });
        if (cancelled) { controller.dispose(); return; }
        scene.current = controller;
        controller.apply(current.current);
        controller.setVisible(visible);
      }).catch(() => { if (!cancelled) setStatus('unavailable'); });
    }, { threshold: 0.01 });
    observer.observe(element);
    return () => { cancelled = true; observer.disconnect(); scene.current?.dispose(); scene.current = null; };
  }, [retry]);
  function selectPerson(identifier: string) { setSelected(identifier); setPlaying(false); }
  function resetRange() { setStartYear(1880); setEndYear(2020); setShowUnknown(true); }
  function changeRange(start: number, end: number) {
    setStartYear(start); setEndYear(end);
    if (person && intersectsYears(person.period, start, end) === false) setSelected('');
  }
  return <section aria-labelledby="cosmic-exhibition-title" classStyle={[cosmicStyles.section]} data-exhibition="cosmic" data-state={status}>
    <div classStyle={[cosmicStyles.heading]}>
      <h2 id="cosmic-exhibition-title" classStyle={[cosmicStyles.title]}>色とかたちの、小さな宇宙。</h2>
      <p classStyle={[cosmicStyles.subtitle]}>15人の仕事から生まれた素材天体</p>
    </div>
    <div classStyle={[cosmicStyles.surface]}>
      <div classStyle={[cosmicStyles.viewport]}>
        <canvas ref={canvas} key={retry} tabIndex={0} aria-label="15人の素材天体が並ぶ架空の宇宙展示"
          aria-describedby="cosmic-controls-help" classStyle={[cosmicStyles.canvas]}
          onKeyDown={event => {
            if (event.key === 'Escape') { setSelected(''); return; }
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); scene.current?.rotate(event.key === 'ArrowLeft' ? -0.15 : 0.15); }
            if (event.key === '+' || event.key === '=') { event.preventDefault(); scene.current?.zoom(0.85); }
            if (event.key === '-') { event.preventDefault(); scene.current?.zoom(1.15); }
          }}>下の人物一覧から資料を読むことができます。</canvas>
        <p classStyle={[cosmicStyles.status]}>{included.length} 天体 · {person ? person.name : '全体を眺める'}</p>
        {status === 'loading' && <p role="status" classStyle={[cosmicStyles.overlay]}>天体を準備しています。</p>}
        {status === 'unavailable' && <div classStyle={[cosmicStyles.overlay]}><p>この環境では立体表示を開けません。人物一覧から資料を読めます。</p>
          <button type="button" classStyle={[cosmicStyles.button]} onClick={() => setRetry(value => value + 1)}>立体表示を再試行</button></div>}
      </div>
      <aside classStyle={[cosmicStyles.panel]} aria-live="polite">
        {person ? <>
          <h3 classStyle={[cosmicStyles.personTitle]}>{person.name}</h3>
          <p classStyle={[cosmicStyles.subtitle]}>{person.period.label}</p>
          <p classStyle={[cosmicStyles.body]}>{person.work}</p>
          <p classStyle={[cosmicStyles.body]}>{person.interpretation}</p>
          <a href={`/atelier/${person.slug}/`} classStyle={[cosmicStyles.source]}>制作室を訪ねる</a>
          <ul classStyle={[cosmicStyles.sources]}>{person.sources.map(source => <li key={source.identifier}>
            <a href={source.url} target="_blank" rel="noreferrer" classStyle={[cosmicStyles.source]}>{source.title}</a>
          </li>)}</ul>
        </> : <>
          <h3 classStyle={[cosmicStyles.personTitle]}>気になる天体へ。</h3>
          <p classStyle={[cosmicStyles.body]}>天体か人物名を選ぶと、色や模様の手がかりになった仕事をたどれます。</p>
          <p classStyle={[cosmicStyles.help]}>太陽・軌道・天体の大きさは展示の演出です。人物の影響関係や実際の宇宙を表すものではありません。</p>
          <a href="/records/" classStyle={[cosmicStyles.source]}>出典と検算記録</a>
        </>}
      </aside>
    </div>
    <div classStyle={[cosmicStyles.controls]}>
      <button type="button" classStyle={[cosmicStyles.button]} aria-pressed={playing && !reducedMotion} disabled={status !== 'ready' || reducedMotion} onClick={() => { if (!playing) setSelected(''); setPlaying(value => !value); }}>{playing && !reducedMotion ? '動きを止める' : '天体を動かす'}</button>
      <button type="button" classStyle={[cosmicStyles.button]} onClick={() => { setSelected(''); setPlaying(false); }}>全体に戻る</button>
      <button type="button" aria-label="天体を拡大" classStyle={[cosmicStyles.button]} disabled={status !== 'ready'} onClick={() => scene.current?.zoom(0.8)}>＋</button>
      <button type="button" aria-label="天体を縮小" classStyle={[cosmicStyles.button]} disabled={status !== 'ready'} onClick={() => scene.current?.zoom(1.2)}>−</button>
      <label classStyle={[cosmicStyles.time]}>動きの位置
        <input aria-label="展示の経過時間" type="range" min="0" max="120" step="1" value={seconds} disabled={status !== 'ready'} classStyle={[cosmicStyles.range]}
          onChange={event => { const value = Number(event.target.value); setSeconds(value); setSelected(''); setPlaying(false); scene.current?.setSeconds(value); }} />
      </label>
      <p id="cosmic-controls-help" classStyle={[cosmicStyles.help]}>ドラッグで回転 · 指2本で拡大 · 左右キーでも回転</p>
      {reducedMotion && <p classStyle={[cosmicStyles.help]}>端末の「動きを減らす」設定に合わせて静止しています。動きの位置は手動で変えられます。</p>}
    </div>
    <div classStyle={[cosmicStyles.timeline]}>
      <h3 classStyle={[cosmicStyles.timelineHeading]}>作品の年代をたどる</h3>
      <label classStyle={[cosmicStyles.label]}>はじめの年　{startYear}年
        <input type="range" aria-label="年代のはじめ" min="1880" max="2020" step="1" value={startYear} classStyle={[cosmicStyles.range]} onChange={event => changeRange(Math.min(Number(event.target.value), endYear), endYear)} />
      </label>
      <label classStyle={[cosmicStyles.label]}>おわりの年　{endYear}年
        <input type="range" aria-label="年代のおわり" min="1880" max="2020" step="1" value={endYear} classStyle={[cosmicStyles.range]} onChange={event => changeRange(startYear, Math.max(startYear, Number(event.target.value)))} />
      </label>
      <label classStyle={[cosmicStyles.check]}><input type="checkbox" checked={showUnknown} onChange={event => { setShowUnknown(event.target.checked); if (!event.target.checked && person?.period.kind === 'unspecified') setSelected(''); }} />年が特定されていない資料も表示</label>
      <p role="status" classStyle={[cosmicStyles.help]}>{included.length}人を表示。制作年・制作期間で選びます。川久保玲は参照した展覧会の開催年です。</p>
      <div><button type="button" classStyle={[cosmicStyles.button]} onClick={resetRange}>すべての年代に戻す</button></div>
    </div>
    <div classStyle={[cosmicStyles.directory]} aria-label="天体の人物を選ぶ">
      {included.map(item => <button key={item.identifier} type="button" aria-pressed={selected === item.identifier}
        classStyle={[cosmicStyles.button, cosmicStyles.personButton, selected === item.identifier && cosmicStyles.active]} onClick={() => selectPerson(item.identifier)}>
        {item.name}<span classStyle={[cosmicStyles.note]}>{item.period.label}</span>
      </button>)}
      {included.length === 0 && <p classStyle={[cosmicStyles.body]}>この期間に該当する資料はありません。</p>}
    </div>
    <noscript><p>立体表示の操作にはJavaScriptが必要です。各人物の制作室は下の一覧から開けます。</p></noscript>
  </section>;
}
